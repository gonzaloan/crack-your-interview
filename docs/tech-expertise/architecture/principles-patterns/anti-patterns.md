---
sidebar_position: 3
title: "Anti Patterns"
description: "Anti Patterns"
---
# 🚫 Microservices Anti-Patterns and Solutions

## 1. 🏗️ Architectural Anti-Patterns

### 1.1 Distributed Monolith

**What It Is**: Services that are deployed independently but are so tightly coupled that they must be deployed together.

**Signs You Have This**:
- Changes in one service require changes in other services
- Services share databases
- Synchronous communication chains
- Tight deployment coupling

**Example of the Problem**:
```java
// Anti-pattern example
@Service
public class OrderService {
    @Autowired
    private CustomerService customerService;  // Direct service dependency
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private InventoryService inventoryService;
    
    public Order createOrder(OrderRequest request) {
        // Synchronous calls creating a chain of dependencies
        Customer customer = customerService.getCustomer(request.getCustomerId());
        Payment payment = paymentService.processPayment(request.getPayment());
        inventoryService.reserveItems(request.getItems());
        
        return orderRepository.save(new Order(customer, payment));
    }
}
```

**Solution**:
```java
@Service
public class OrderService {
    private final EventPublisher eventPublisher;
    private final CustomerClient customerClient;
    
    public Order createOrder(OrderRequest request) {
        // Verify customer exists with circuit breaker
        CustomerDTO customer = customerClient.getCustomerBasicInfo(
            request.getCustomerId());
        
        // Create order in pending state
        Order order = orderRepository.save(
            new Order(request, OrderStatus.PENDING));
        
        // Publish event for async processing
        eventPublisher.publish(new OrderCreatedEvent(
            order.getId(), 
            request.getPayment(),
            request.getItems()
        ));
        
        return order;
    }
    
    @EventListener
    public void onPaymentProcessed(PaymentProcessedEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
                                   .orElseThrow();
        order.updatePaymentStatus(event.getStatus());
        orderRepository.save(order);
    }
}
```

### 1.2 Data Lake Anti-Pattern

**What It Is**: Multiple services sharing the same database.

**Signs You Have This**:
- Multiple services accessing same tables
- Cross-service transactions
- Schema changes affect multiple services

**Problem Example**:
```java
// Anti-pattern: Multiple services sharing database access
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Used by both CustomerService and OrderService
    @Query("SELECT c FROM Customer c WHERE c.id = ?1")
    Customer findCustomerById(Long id);
}

@Service
public class OrderService {
    @Autowired
    private CustomerRepository customerRepository; // Direct database access
    
    public Order createOrder(OrderRequest request) {
        Customer customer = customerRepository.findCustomerById(
            request.getCustomerId());
        // Process order using customer data
    }
}
```

**Solution**:
```java
// Each service has its own database
@Configuration
public class OrderDatabaseConfig {
    @Bean
    @ConfigurationProperties(prefix = "order.datasource")
    public DataSource orderDataSource() {
        return DataSourceBuilder.create().build();
    }
}

// Service uses API calls
@Service
public class OrderService {
    private final CustomerClient customerClient;
    
    public Order createOrder(OrderRequest request) {
        CustomerDTO customer = customerClient.getCustomer(
            request.getCustomerId());
            
        // Store only necessary customer data
        OrderCustomer orderCustomer = new OrderCustomer(
            customer.getId(),
            customer.getName(),
            customer.getShippingAddress()
        );
        
        return orderRepository.save(new Order(orderCustomer));
    }
}
```

## 2. 🔄 Communication Anti-Patterns

### 2.1 Chatty Communication

**What It Is**: Services making excessive API calls to each other.

**Problem Example**:
```java
// Anti-pattern: Multiple calls for related data
@Service
public class ProductCatalogService {
    private final PriceService priceService;
    private final InventoryService inventoryService;
    private final ReviewService reviewService;
    
    public ProductDetails getProductDetails(String productId) {
        Product product = repository.findById(productId);
        Price price = priceService.getPrice(productId);  // API call 1
        Integer stock = inventoryService.getStock(productId);  // API call 2
        List<Review> reviews = reviewService.getReviews(productId);  // API call 3
        
        return new ProductDetails(product, price, stock, reviews);
    }
}
```

**Solution**:
```java
// Solution 1: API Composition
@Service
public class ProductCatalogService {
    public ProductDetails getProductDetails(String productId) {
        CompletableFuture<Price> priceFuture = 
            CompletableFuture.supplyAsync(() -> 
                priceService.getPrice(productId));
                
        CompletableFuture<Integer> stockFuture = 
            CompletableFuture.supplyAsync(() -> 
                inventoryService.getStock(productId));
                
        CompletableFuture<List<Review>> reviewsFuture = 
            CompletableFuture.supplyAsync(() -> 
                reviewService.getReviews(productId));
        
        return CompletableFuture.allOf(
            priceFuture, stockFuture, reviewsFuture)
            .thenApply(v -> new ProductDetails(
                product,
                priceFuture.join(),
                stockFuture.join(),
                reviewsFuture.join()))
            .join();
    }
}

// Solution 2: Event-Driven Approach
@Service
public class ProductEventHandler {
    @EventListener
    public void onProductUpdated(ProductUpdatedEvent event) {
        ProductDetails details = cache.get(event.getProductId());
        switch(event.getType()) {
            case PRICE_UPDATED:
                details.updatePrice(event.getNewPrice());
                break;
            case STOCK_CHANGED:
                details.updateStock(event.getNewStock());
                break;
            case REVIEW_ADDED:
                details.addReview(event.getNewReview());
                break;
        }
        cache.put(event.getProductId(), details);
    }
}
```

### 2.2 Synchronous Chain Calls

**What It Is**: Long chain of synchronous service calls.

**Problem Example**:
```java
// Anti-pattern: Chain of synchronous calls
@Service
public class OrderProcessor {
    public OrderResult processOrder(OrderRequest request) {
        // Synchronous chain
        Customer customer = customerService.validate(request.getCustomerId());
        Payment payment = paymentService.process(request.getPayment());
        Inventory inventory = inventoryService.reserve(request.getItems());
        Shipment shipment = shippingService.schedule(
            customer.getAddress(), inventory.getItems());
        
        return new OrderResult(customer, payment, inventory, shipment);
    }
}
```

**Solution**:
```java
// Choreography-based solution
@Service
public class OrderProcessor {
    public OrderResult processOrder(OrderRequest request) {
        // Validate customer synchronously (essential)
        customerService.validateCustomer(request.getCustomerId());
        
        // Create order in pending state
        Order order = orderRepository.save(
            new Order(request, OrderStatus.PENDING));
        
        // Publish event for async processing
        eventPublisher.publish(new OrderCreatedEvent(order));
        
        return new OrderResult(order.getId(), OrderStatus.PENDING);
    }
    
    @EventListener
    public void onPaymentProcessed(PaymentProcessedEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
                                   .orElseThrow();
        
        if (event.isSuccessful()) {
            order.setStatus(OrderStatus.PAYMENT_COMPLETED);
            eventPublisher.publish(new OrderPaidEvent(order));
        } else {
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            eventPublisher.publish(new OrderFailedEvent(order));
        }
        
        orderRepository.save(order);
    }
}
```

## 3. 🧱 Design Anti-Patterns

### 3.1 Wrong Service Boundaries

**What It Is**: Services that don't align with business domains.

**Problem Example**:
```java
// Anti-pattern: Technical rather than business boundaries
@Service
public class DatabaseService {
    public void saveCustomer(Customer customer) { ... }
    public void saveOrder(Order order) { ... }
    public void savePayment(Payment payment) { ... }
}

@Service
public class ValidationService {
    public void validateCustomer(Customer customer) { ... }
    public void validateOrder(Order order) { ... }
    public void validatePayment(Payment payment) { ... }
}
```

**Solution**:
```java
// Domain-driven service boundaries
@Service
public class CustomerService {
    public Customer createCustomer(CustomerRequest request) {
        validateCustomerData(request);
        Customer customer = new Customer(request);
        customerRepository.save(customer);
        eventPublisher.publish(new CustomerCreatedEvent(customer));
        return customer;
    }
}

@Service
public class OrderService {
    public Order createOrder(OrderRequest request) {
        validateOrderData(request);
        Order order = new Order(request);
        orderRepository.save(order);
        eventPublisher.publish(new OrderCreatedEvent(order));
        return order;
    }
}
```

### 3.2 No API Versioning

**What It Is**: Lack of API versioning strategy leading to breaking changes.

**Problem Example**:
```java
// Anti-pattern: No versioning
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @PostMapping
    public Order createOrder(OrderRequest request) {
        // Breaking changes affect all clients
        return orderService.createOrder(request);
    }
}
```

**Solution**:
```java
@RestController
public class OrderController {
    @PostMapping("/api/v1/orders")
    public OrderV1Response createOrderV1(OrderV1Request request) {
        return orderService.createOrderV1(request);
    }
    
    @PostMapping("/api/v2/orders")
    public OrderV2Response createOrderV2(OrderV2Request request) {
        return orderService.createOrderV2(request);
    }
}

// API Version mapping
@Configuration
public class ApiVersionConfig {
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("orders-v1", r -> r
                .path("/api/v1/orders/**")
                .uri("lb://order-service-v1"))
            .route("orders-v2", r -> r
                .path("/api/v2/orders/**")
                .uri("lb://order-service-v2"))
            .build();
    }
}
```

## 4. 📈 Scalability Anti-Patterns

### 4.1 No Caching Strategy

**What It Is**: Missing or improper caching leading to unnecessary service calls.

**Solution**:
```java
@Service
public class ProductCatalogService {
    private final CacheManager cacheManager;
    
    public ProductDetails getProductDetails(String productId) {
        return cacheManager.getCache("products")
            .get(productId, () -> {
                // Fetch from service only if not in cache
                return fetchProductDetails(productId);
            });
    }
    
    @CacheEvict(value = "products", key = "#productId")
    public void updateProduct(String productId, ProductUpdate update) {
        // Update product and invalidate cache
        productRepository.update(productId, update);
    }
}
```

### 4.2 No Circuit Breaker

**What It Is**: Missing fault tolerance in service communications.

**Solution**:
```java
@Service
public class OrderService {
    @CircuitBreaker(name = "paymentService",
                    fallbackMethod = "paymentFallback")
    @RateLimiter(name = "paymentService")
    @Bulkhead(name = "paymentService")
    public PaymentResponse processPayment(OrderPayment payment) {
        return paymentClient.processPayment(payment);
    }
    
    private PaymentResponse paymentFallback(OrderPayment payment,
                                          Exception e) {
        // Fallback logic
        return PaymentResponse.builder()
            .orderId(payment.getOrderId())
            .status(PaymentStatus.PENDING)
            .message("Payment processing delayed")
            .build();
    }
}
```

## 5. 🔍 Monitoring Anti-Patterns

### 5.1 Insufficient Monitoring

**Solution**:
```java
@Aspect
@Component
public class ServiceMonitoringAspect {
    private final MeterRegistry registry;
    
    @Around("@annotation(Monitor)")
    public Object monitorOperation(ProceedingJoinPoint joinPoint) 
            throws Throwable {
        Timer.Sample sample = Timer.start(registry);
        
        try {
            Object result = joinPoint.proceed();
            sample.stop(Timer.builder("service.operation")
                .tag("method", joinPoint.getSignature().getName())
                .tag("status", "success")
                .register(registry));
            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("service.operation")
                .tag("method", joinPoint.getSignature().getName())
                .tag("status", "error")
                .tag("error.type", e.getClass().getSimpleName())
                .register(registry));
            throw e;
        }
    }
}
```

## 6. 📝 Best Practices to Avoid Anti-Patterns

1. **Design Principles**
    - Follow Domain-Driven Design
    - Use Bounded Contexts
    - Implement proper service boundaries
    - Design for failure

2. **Communication Guidelines**
    - Prefer asynchronous communication
    - Use event-driven architecture
    - Implement proper error handling
    - Use circuit breakers

3. **Data Management**
    - Maintain data independence
    - Use event sourcing when appropriate
    - Implement proper caching strategies
    - Handle data consistency

4. **Monitoring and Observability**
    - Implement comprehensive logging
    - Use distributed tracing
    - Monitor service health
    - Track business metrics

## 7. 📚 References

- "Microservices Anti-patterns and Pitfalls" by Mark Richards
- "Building Microservices" by Sam Newman
- "Release It!" by Michael Nygard
- "Designing Distributed Systems" by Brendan Burns