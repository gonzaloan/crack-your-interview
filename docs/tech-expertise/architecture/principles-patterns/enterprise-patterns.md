---
sidebar_position: 2
title: "Enterprise Patterns"
description: "Enterprise Patterns"
---
# 🏢 Microservices Enterprise Patterns

## 1. 🎯 Service Decomposition Patterns

### 1.1 Strangler Fig Pattern

**Concept**: Gradually migrate a monolithic application to microservices by intercepting and redirecting requests.

**When to Use**:
- Legacy system modernization
- Risk-averse transitions
- Phased migrations

**Implementation Strategy**:
```java
@Configuration
public class StranglerConfig {
    @Bean
    public RouteLocator stranglerRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            // New microservice handling orders
            .route("new-orders", r -> r
                .path("/api/v2/orders/**")
                .uri("lb://order-service"))
            // Legacy system fallback
            .route("legacy-orders", r -> r
                .path("/api/orders/**")
                .uri("http://legacy-system/orders"))
            .build();
    }
}
```

### 1.2 Domain-Driven Decomposition

**Concept**: Break down services based on business domain boundaries.

**Key Principles**:
- Bounded Contexts
- Ubiquitous Language
- Context Mapping

**Example**:
```java
// Order Bounded Context
@DomainService
public class OrderService {
    @Aggregate
    public class Order {
        private OrderId id;
        private CustomerId customerId;
        private Money totalAmount;
        private OrderStatus status;

        public void process() {
            validateOrder();
            calculateTotal();
            updateStatus(OrderStatus.PROCESSING);
            publishEvent(new OrderProcessedEvent(this));
        }
    }
}

// Shipping Bounded Context
@DomainService
public class ShippingService {
    @Aggregate
    public class Shipment {
        private ShipmentId id;
        private OrderId orderId;
        private Address destination;
        private ShipmentStatus status;

        public void dispatch() {
            validateAddress();
            assignCarrier();
            updateStatus(ShipmentStatus.DISPATCHED);
            publishEvent(new ShipmentDispatchedEvent(this));
        }
    }
}
```

## 2. 🔄 Integration Patterns

### 2.1 Saga Pattern

**Concept**: Manage distributed transactions across multiple services.

**Types**:
1. Choreography-based Saga
2. Orchestration-based Saga

**Choreography Example**:
```java
@Service
public class OrderSaga {
    @Transactional
    public void createOrder(OrderCreateCommand cmd) {
        // Local transaction
        Order order = orderRepository.save(new Order(cmd));
        
        // Publish event for payment service
        eventPublisher.publish(new OrderCreatedEvent(order));
    }

    @EventHandler
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        Order order = orderRepository.findById(event.getOrderId());
        order.markAsPaid();
        
        // Publish event for inventory service
        eventPublisher.publish(new OrderPaidEvent(order));
    }

    @EventHandler
    public void onInventoryReserved(InventoryReservedEvent event) {
        Order order = orderRepository.findById(event.getOrderId());
        order.markAsReady();
        
        // Publish event for shipping service
        eventPublisher.publish(new OrderReadyForShipmentEvent(order));
    }
}
```

**Orchestration Example**:
```java
@Service
public class OrderOrchestrator {
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final ShippingService shippingService;

    @Transactional
    public OrderResult processOrder(OrderCommand cmd) {
        try {
            // Create order
            Order order = orderService.createOrder(cmd);
            
            // Process payment
            PaymentResult payment = paymentService.processPayment(
                new PaymentCommand(order));
            
            if (!payment.isSuccessful()) {
                return compensateOrder(order);
            }
            
            // Reserve inventory
            InventoryResult inventory = inventoryService.reserve(
                new InventoryCommand(order));
                
            if (!inventory.isSuccessful()) {
                paymentService.refund(payment);
                return compensateOrder(order);
            }
            
            // Create shipment
            ShipmentResult shipment = shippingService.createShipment(
                new ShipmentCommand(order));
                
            return new OrderResult(order, payment, inventory, shipment);
            
        } catch (Exception e) {
            return handleError(e);
        }
    }
}
```

### 2.2 API Composition Pattern

**Concept**: Aggregate data from multiple services to fulfill a client request.

**Implementation**:
```java
@Service
public class OrderDetailsCompositionService {
    private final OrderService orderService;
    private final CustomerService customerService;
    private final PaymentService paymentService;
    private final ShippingService shippingService;

    public OrderDetailsDTO getOrderDetails(String orderId) {
        CompletableFuture<Order> orderFuture = 
            CompletableFuture.supplyAsync(() -> 
                orderService.getOrder(orderId));

        CompletableFuture<CustomerInfo> customerFuture = 
            orderFuture.thenCompose(order ->
                CompletableFuture.supplyAsync(() ->
                    customerService.getCustomer(order.getCustomerId())));

        CompletableFuture<PaymentInfo> paymentFuture = 
            CompletableFuture.supplyAsync(() ->
                paymentService.getPaymentInfo(orderId));

        CompletableFuture<ShipmentInfo> shipmentFuture = 
            CompletableFuture.supplyAsync(() ->
                shippingService.getShipmentInfo(orderId));

        return CompletableFuture.allOf(
            orderFuture, customerFuture, paymentFuture, shipmentFuture)
            .thenApply(v -> new OrderDetailsDTO(
                orderFuture.join(),
                customerFuture.join(),
                paymentFuture.join(),
                shipmentFuture.join()))
            .join();
    }
}
```

## 3. 🛡️ Reliability Patterns

### 3.1 Bulkhead Pattern

**Concept**: Isolate service dependencies to prevent cascading failures.

**Implementation**:
```java
@Configuration
public class BulkheadConfig {
    @Bean
    public ThreadPoolBulkhead orderServiceBulkhead() {
        ThreadPoolBulkheadConfig config = ThreadPoolBulkheadConfig.custom()
            .maxThreadPoolSize(10)
            .coreThreadPoolSize(5)
            .queueCapacity(100)
            .build();
            
        return ThreadPoolBulkhead.of("orderService", config);
    }

    @Bean
    public ThreadPoolBulkhead paymentServiceBulkhead() {
        ThreadPoolBulkheadConfig config = ThreadPoolBulkheadConfig.custom()
            .maxThreadPoolSize(5)
            .coreThreadPoolSize(3)
            .queueCapacity(50)
            .build();
            
        return ThreadPoolBulkhead.of("paymentService", config);
    }
}

@Service
public class OrderService {
    @Bulkhead(name = "orderService", type = Bulkhead.Type.THREADPOOL)
    public CompletableFuture<Order> processOrder(OrderRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            // Process order
            return orderProcessor.process(request);
        });
    }
}
```

### 3.2 Rate Limiter Pattern

**Concept**: Control the rate of requests to protect services from overload.

**Implementation**:
```java
@Configuration
public class RateLimitConfig {
    @Bean
    public RateLimiter orderRateLimiter() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitForPeriod(100)
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .timeoutDuration(Duration.ofMillis(500))
            .build();
            
        return RateLimiter.of("orderService", config);
    }
}

@RestController
public class OrderController {
    @RateLimiter(name = "orderService")
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }
}
```

## 4. 📡 Communication Patterns

### 4.1 Event Sourcing Pattern

**Concept**: Store state changes as a sequence of events.

**Implementation**:
```java
@Aggregate
public class OrderAggregate {
    private OrderState state;
    private List<OrderEvent> changes = new ArrayList<>();

    public void process(CreateOrderCommand cmd) {
        // Business logic validation
        validateOrder(cmd);
        
        // Apply event
        OrderCreatedEvent event = new OrderCreatedEvent(
            cmd.getOrderId(),
            cmd.getCustomerId(),
            cmd.getItems()
        );
        
        apply(event);
        changes.add(event);
    }

    public void markAsPaid(ProcessPaymentCommand cmd) {
        validatePayment(cmd);
        
        OrderPaidEvent event = new OrderPaidEvent(
            cmd.getOrderId(),
            cmd.getPaymentId(),
            cmd.getAmount()
        );
        
        apply(event);
        changes.add(event);
    }

    private void apply(OrderCreatedEvent event) {
        this.state = new OrderState(event.getOrderId());
        this.state.setStatus(OrderStatus.CREATED);
    }

    private void apply(OrderPaidEvent event) {
        this.state.setStatus(OrderStatus.PAID);
        this.state.setPaymentId(event.getPaymentId());
    }

    public List<OrderEvent> getUncommittedChanges() {
        return new ArrayList<>(changes);
    }

    public void markChangesAsCommitted() {
        changes.clear();
    }
}
```

### 4.2 CQRS Pattern

**Concept**: Separate read and write operations for better scalability.

**Implementation**:
```java
// Write Model
@Service
public class OrderCommandService {
    private final EventStore eventStore;
    
    @Transactional
    public void createOrder(CreateOrderCommand cmd) {
        OrderAggregate aggregate = new OrderAggregate();
        aggregate.process(cmd);
        
        eventStore.saveEvents(cmd.getOrderId(), 
                            aggregate.getUncommittedChanges());
    }
}

// Read Model
@Service
public class OrderQueryService {
    private final OrderReadRepository repository;
    
    public OrderDTO getOrder(String orderId) {
        return repository.findById(orderId)
                        .map(this::toDTO)
                        .orElseThrow(() -> 
                            new OrderNotFoundException(orderId));
    }
    
    @EventHandler
    public void on(OrderCreatedEvent event) {
        OrderReadModel order = new OrderReadModel();
        order.setId(event.getOrderId());
        order.setStatus(OrderStatus.CREATED);
        repository.save(order);
    }
    
    @EventHandler
    public void on(OrderPaidEvent event) {
        OrderReadModel order = repository.findById(event.getOrderId())
                                       .orElseThrow();
        order.setStatus(OrderStatus.PAID);
        order.setPaymentId(event.getPaymentId());
        repository.save(order);
    }
}
```

## 5. 📊 Monitoring and Observability

### 5.1 Log Aggregation Pattern

**Implementation**:
```java
@Aspect
@Component
public class LoggingAspect {
    private static final String CORRELATION_ID = "correlationId";
    
    @Around("@annotation(LogOperation)")
    public Object logOperation(ProceedingJoinPoint joinPoint) 
            throws Throwable {
        String correlationId = MDC.get(CORRELATION_ID);
        if (correlationId == null) {
            correlationId = generateCorrelationId();
            MDC.put(CORRELATION_ID, correlationId);
        }
        
        try {
            log.info("Starting operation: {}", 
                    joinPoint.getSignature().getName());
            Object result = joinPoint.proceed();
            log.info("Completed operation: {}", 
                    joinPoint.getSignature().getName());
            return result;
        } catch (Exception e) {
            log.error("Operation failed: {}", 
                    joinPoint.getSignature().getName(), e);
            throw e;
        } finally {
            MDC.remove(CORRELATION_ID);
        }
    }
}
```

## 6. 🔍 Best Practices

1. **Service Independence**
    - Avoid shared databases
    - Use asynchronous communication
    - Implement proper service boundaries

2. **Data Consistency**
    - Use eventual consistency where possible
    - Implement compensation logic
    - Handle partial failures gracefully

3. **Security**
    - Implement authentication at the gateway
    - Use service-to-service authentication
    - Encrypt sensitive data

4. **Performance**
    - Use caching strategically
    - Implement proper timeout handling
    - Monitor service metrics

## 7. 📚 References

- "Microservices Patterns" by Chris Richardson
- "Building Microservices" by Sam Newman
- "Domain-Driven Design" by Eric Evans
- "Enterprise Integration Patterns" by Gregor Hohpe