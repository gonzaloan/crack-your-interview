---
sidebar_position: 1
title: "Architectural Principles"
description: "Architectural Principles"
---

# 🏗️ Microservices Distributed: Architectural Principles & Patterns

## 1. 🎯 Core Architectural Principles

### 1.1 Single Responsibility

**Concept**: Each microservice should focus on a single business capability.

**Key Aspects**:
- One service = one business capability
- Independent lifecycle
- Clear boundaries
- Autonomous teams

**Example Implementation**:
```java
// Good: Order Service focusing only on order management
@Service
public class OrderService {
    public Order createOrder(OrderRequest request) {...}
    public Order updateOrder(String orderId, OrderUpdate update) {...}
    public void cancelOrder(String orderId) {...}
}

// Bad: Mixing different business capabilities
@Service
public class OrderAndInventoryService {
    public Order createOrder(OrderRequest request) {...}
    public void updateInventory(String productId, int quantity) {...} // Should be in separate service
}
```

### 1.2 Service Autonomy 🔓

**Concept**: Services should be able to operate independently.

**Implementation Aspects**:
- Private databases
- Independent deployment
- Asynchronous communication
- Local transactions

**Example**:
```java
@Service
public class CustomerService {
    private final CustomerRepository customerRepository; // Private database
    private final EventPublisher eventPublisher;

    public Customer updateCustomer(CustomerUpdate update) {
        // Local transaction
        @Transactional
        Customer customer = customerRepository.update(update);
        
        // Async communication
        eventPublisher.publish(new CustomerUpdatedEvent(customer));
        
        return customer;
    }
}
```

## 2. 🌟 Essential Distributed Patterns

### 2.1 Service Discovery Pattern

**Concept**: Enables services to find and communicate with each other dynamically.

**Components**:
- Service Registry
- Service Registration
- Service Discovery Client

**Implementation Using Netflix Eureka**:
```java
@EnableEurekaServer
@SpringBootApplication
public class ServiceRegistryApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceRegistryApplication.class, args);
    }
}

// Client Service Registration
@EnableDiscoveryClient
@SpringBootApplication
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

### 2.2 Circuit Breaker Pattern 🔌

**Concept**: Prevents cascading failures by failing fast when a service is unavailable.

**States**:
1. Closed (normal operation)
2. Open (failure state)
3. Half-Open (testing recovery)

**Implementation Using Resilience4j**:
```java
@Service
public class OrderService {
    private final PaymentServiceClient paymentClient;
    
    @CircuitBreaker(name = "paymentService", 
                    fallbackMethod = "paymentFallback")
    public PaymentResponse processPayment(OrderPayment payment) {
        return paymentClient.processPayment(payment);
    }
    
    private PaymentResponse paymentFallback(OrderPayment payment, 
                                          Exception e) {
        // Fallback logic
        return new PaymentResponse.offline()
                   .withOrderId(payment.getOrderId())
                   .withStatus(PENDING);
    }
}
```

### 2.3 Event-Driven Communication Pattern 📨

**Concept**: Services communicate through events, enabling loose coupling.

**Types**:
1. Domain Events
2. Integration Events
3. Command Events

**Implementation Using Apache Kafka**:
```java
@Service
public class OrderEventHandler {
    @KafkaListener(topics = "order-events")
    public void handleOrderEvent(OrderEvent event) {
        switch (event.getType()) {
            case ORDER_CREATED:
                processNewOrder(event);
                break;
            case ORDER_CANCELLED:
                handleCancellation(event);
                break;
            case ORDER_UPDATED:
                updateOrderStatus(event);
                break;
        }
    }
    
    private void processNewOrder(OrderEvent event) {
        // Business logic for new orders
        OrderProcessor.createNewOrder(event.getOrderDetails());
        // Emit subsequent events
        eventPublisher.publish(new InventoryCheckEvent(event.getOrderId()));
    }
}
```

### 2.4 API Gateway Pattern 🚪

**Concept**: Single entry point for all client-to-microservice communications.

**Responsibilities**:
- Request routing
- Authentication
- Load balancing
- Response aggregation
- Circuit breaking

**Implementation Using Spring Cloud Gateway**:
```java
@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(
            RouteLocatorBuilder builder) {
        return builder.routes()
            .route("order_service", r -> r
                .path("/api/orders/**")
                .filters(f -> f
                    .circuitBreaker(config -> config
                        .setName("orderServiceCircuitBreaker")
                        .setFallbackUri("forward:/fallback"))
                    .retry(config -> config
                        .setRetries(3)
                        .setStatuses(HttpStatus.BAD_GATEWAY)))
                .uri("lb://order-service"))
            .build();
    }
}
```

## 3. 🛠️ Implementation Best Practices

### 3.1 Data Management

**Principles**:
- Database per service
- Event sourcing for data consistency
- CQRS when needed
- Local transactions only

**Example of Database per Service**:
```java
// Order Service Database Configuration
@Configuration
@EnableJpaRepositories(
    basePackages = "com.company.orderservice.repository",
    entityManagerFactoryRef = "orderEntityManager"
)
public class OrderDatabaseConfig {
    @Bean
    @ConfigurationProperties(prefix="spring.datasource.orders")
    public DataSource orderDataSource() {
        return DataSourceBuilder.create().build();
    }
}

// Customer Service Database Configuration
@Configuration
@EnableJpaRepositories(
    basePackages = "com.company.customerservice.repository",
    entityManagerFactoryRef = "customerEntityManager"
)
public class CustomerDatabaseConfig {
    @Bean
    @ConfigurationProperties(prefix="spring.datasource.customers")
    public DataSource customerDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

### 3.2 Resilience Patterns

**Key Patterns**:
1. Retry Pattern
2. Bulkhead Pattern
3. Timeout Pattern
4. Circuit Breaker Pattern

**Implementation Example**:
```java
@Service
public class ResilientService {
    @Retry(name = "serviceA")
    @Bulkhead(name = "serviceA")
    @TimeLimiter(name = "serviceA")
    @CircuitBreaker(name = "serviceA")
    public CompletableFuture<Response> resilientCall() {
        return CompletableFuture.supplyAsync(() -> {
            // Service call
            return externalService.call();
        });
    }
}
```

## 4. 🎯 Anti-Patterns to Avoid

### 4.1 Distributed Monolith

**What It Is**: Microservices that are tightly coupled and must be deployed together.

**How to Avoid**:
- Maintain service independence
- Use asynchronous communication
- Implement proper service boundaries
- Avoid shared databases

### 4.2 Direct Database Access

**What It Is**: Services accessing other services' databases directly.

**How to Fix**:
```java
// BAD
@Service
public class OrderService {
    @Autowired
    CustomerRepository customerRepo; // Directly accessing Customer DB
    
    public Order createOrder(OrderRequest request) {
        Customer customer = customerRepo.findById(request.getCustomerId());
        // Process order...
    }
}

// GOOD
@Service
public class OrderService {
    private final CustomerClient customerClient;
    
    public Order createOrder(OrderRequest request) {
        CustomerDTO customer = customerClient.getCustomer(request.getCustomerId());
        // Process order...
    }
}
```

## 5. 📊 Monitoring and Observability

### 5.1 Distributed Tracing

**Implementation Using Spring Cloud Sleuth and Zipkin**:
```java
@RestController
public class OrderController {
    private final Tracer tracer;
    
    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable String id) {
        Span span = tracer.currentSpan();
        span.tag("orderId", id);
        
        // Process request
        Order order = orderService.findById(id);
        
        span.tag("orderStatus", order.getStatus());
        return order;
    }
}
```

### 5.2 Health Checks

**Implementation**:
```java
@Component
public class OrderServiceHealthIndicator implements HealthIndicator {
    private final OrderRepository repository;
    
    @Override
    public Health health() {
        try {
            repository.checkConnection();
            return Health.up()
                       .withDetail("database", "responsive")
                       .build();
        } catch (Exception e) {
            return Health.down()
                       .withException(e)
                       .build();
        }
    }
}
```

## 6. 📚 Further Reading

- "Building Microservices" by Sam Newman
- "Microservices Patterns" by Chris Richardson
- "Domain-Driven Design" by Eric Evans
- Spring Cloud Documentation
- Netflix OSS Documentation