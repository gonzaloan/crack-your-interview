---
sidebar_position: 5
title: Dependency Inversion Principle (DIP)
description: The DIP states that high-level modules should not depend on low-level modules
---

# Dependency Inversion Principle (DIP)

## Core Understanding

- High-level modules should not depend on low-level modules; both should depend on abstractions
- Abstractions should not depend on details; details should depend on abstractions
- Promotes loose coupling between software modules
- Enables easier testing, maintenance, and modification of systems
- Facilitates plug-and-play architecture

## ❌ Bad Example

```java
// High-level module directly depending on low-level modules
public class OrderProcessor {
    private MySQLDatabase database = new MySQLDatabase();
    private EmailService emailService = new EmailService();

    public void processOrder(Order order) {
        // Direct dependency on concrete implementations
        database.save(order);
        emailService.sendOrderConfirmation(order);
    }
}
```
**Why it's bad**: Tightly coupled to specific implementations, hard to test, can't change database or email provider without modifying code.

## ✅ Good Example
Let's fix this:
```java
// Abstractions
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(String id);
}

public interface NotificationService {
    void sendOrderConfirmation(Order order);
}

// High-level module depending on abstractions
@Service
public class OrderProcessor {
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public OrderProcessor(
            OrderRepository orderRepository,
            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    public void processOrder(Order order) {
        orderRepository.save(order);
        notificationService.sendOrderConfirmation(order);
    }
}

// Low-level modules implementing abstractions
@Repository
public class MySQLOrderRepository implements OrderRepository {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void save(Order order) {
        // MySQL specific implementation
    }
}

@Service
public class EmailNotificationService implements NotificationService {
    private final EmailClient emailClient;

    @Override
    public void sendOrderConfirmation(Order order) {
        // Email specific implementation
    }
}
```
**Why it's good**: Decoupled, testable, and flexible to change implementations.

## Best Practices

- Constructor Injection

```java
@Service
public class PaymentService {
    private final PaymentGateway paymentGateway;
    private final TransactionLogger logger;

    // Constructor injection is preferred over field injection
    public PaymentService(
            PaymentGateway paymentGateway,
            TransactionLogger logger) {
        this.paymentGateway = paymentGateway;
        this.logger = logger;
    }
}
```
- Use Spring's DI Container
  - Let Spring manage dependencies
  - Use appropriate annotations (@Service, @Repository, etc.)
  - Configure beans when needed

- Interface-First Design
  - Define interfaces before implementations
  - Keep interfaces focused and cohesive
  - Use dependency injection with interfaces
## Use Cases

- Database Access
```java
public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
}
```
  - Allows switching between different database implementations
  - Enables easy testing with in-memory databases

- External Services Integration
  - Payment gateways
  - Email services
  - Third-party APIs
  - Enables easy provider switching

- Cross-Cutting Concerns
  - Logging
  - Caching
  - Security
  - Monitoring
## Anti-patterns to Avoid

- Service Locator Pattern:

```java
// Avoid this
public class OrderService {
    public void processOrder(Order order) {
        DatabaseService db = ServiceLocator.getDatabaseService();
        EmailService email = ServiceLocator.getEmailService();
    }
}
```
- Concrete Class Dependencies

```java
// Avoid this
public class UserService {
    private MySQLUserRepository repository; // Concrete class dependency
}
```

- New Operator in Constructors/Methods
```java
// Avoid this
public class PaymentProcessor {
    private PaymentGateway gateway = new StripePaymentGateway();
} 
```

## Interview Questions & Answers

Q1: "How do you handle optional dependencies with DIP?"

Answer: Use Optional or feature toggles:

```java
public class EnhancedService {
    private final CoreService coreService;
    private final Optional<EnhancementService> enhancementService;

    public EnhancedService(
            CoreService coreService,
            @Nullable EnhancementService enhancementService) {
        this.coreService = coreService;
        this.enhancementService = Optional.ofNullable(enhancementService);
    }

    public void process() {
        coreService.process();
        enhancementService.ifPresent(EnhancementService::enhance);
    }
}
```
