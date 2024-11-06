---
sidebar_position: 4
title: "Advanced Polymorphism"
description: "Master polymorphic behavior and patterns in Java"
---

# Polymorphism in Java

## Core Understanding

Polymorphism allows objects to take multiple forms, enabling:
- Runtime method selection based on actual object type
- Compile-time method selection based on parameters
- Interface-based programming
- Behavior customization without changing calling code
- Flexible and extensible designs

Types of Polymorphism:
- Runtime (Dynamic) Polymorphism: Method overriding
- Compile-time (Static) Polymorphism: Method overloading
- Parametric Polymorphism: Generics
- Ad-hoc Polymorphism: Method overloading

## ❌ Bad Example

```java
public class PaymentProcessor {
    public void processPayment(String paymentType, double amount) {
        if (paymentType.equals("CREDIT_CARD")) {
            processCreditCardPayment(amount);
        } else if (paymentType.equals("PAYPAL")) {
            processPayPalPayment(amount);
        } else if (paymentType.equals("CRYPTO")) {
            processCryptoPayment(amount);
        }
    }
    
    private void processCreditCardPayment(double amount) {
        // Credit card specific logic
    }
    
    private void processPayPalPayment(double amount) {
        // PayPal specific logic
    }
    
    private void processCryptoPayment(double amount) {
        // Crypto specific logic
    }
}

// Usage
processor.processPayment("CREDIT_CARD", 100.00);
```
**Why it's bad**:

- Switch/if-else based on type
- Hard to extend with new payment types
- Violates Open-Closed Principle
- Type safety issues
- Duplicate code structure

## ✅ Good Example
Let's fix this:
```java
public interface PaymentProcessor {
    PaymentResult process(Payment payment);
    boolean supports(PaymentMethod method);
}

@Service
public class CreditCardProcessor implements PaymentProcessor {
    private final CreditCardGateway gateway;
    private final TransactionLogger logger;
    
    @Override
    public PaymentResult process(Payment payment) {
        logger.logAttempt(payment);
        
        try {
            CreditCardDetails details = payment.getDetails();
            TransactionResult result = gateway.charge(details, payment.getAmount());
            
            logger.logResult(result);
            return PaymentResult.from(result);
        } catch (GatewayException e) {
            return PaymentResult.failure(e.getMessage());
        }
    }
    
    @Override
    public boolean supports(PaymentMethod method) {
        return PaymentMethod.CREDIT_CARD.equals(method);
    }
}

@Service
public class PaymentService {
    private final List<PaymentProcessor> processors;
    
    public PaymentResult processPayment(Payment payment) {
        return processors.stream()
            .filter(processor -> processor.supports(payment.getMethod()))
            .findFirst()
            .orElseThrow(() -> new UnsupportedPaymentMethodException(payment.getMethod()))
            .process(payment);
    }
}
```
**Why it's good**:
- Type-safe
- Easy to extend
- Clear separation of concerns
- Follows Open-Closed Principle
- Runtime polymorphism through interfaces
## Best Practices

- Use Interface-based Programming
```java
public interface NotificationSender {
    void send(Notification notification);
}

@Service
public class NotificationService {
    private final Map<NotificationType, NotificationSender> senders;
    
    public void notify(Notification notification) {
        senders.get(notification.getType()).send(notification);
    }
}
```

- Leverage Generics for Type Safety

```java
public interface Repository<T, ID> {
    Optional<T> findById(ID id);
    T save(T entity);
    void delete(ID id);
}

public class JpaUserRepository implements Repository<User, Long> {
    @Override
    public Optional<User> findById(Long id) {
        // Implementation
    }
}
```

- Use Method Overloading Judiciously

```java
public class EmailBuilder {
    public EmailBuilder withSubject(String subject) {
        // Set subject
        return this;
    }
    
    public EmailBuilder withTemplate(String template, Map<String, Object> params) {
        // Set template with parameters
        return this;
    }
    
    public EmailBuilder withTemplate(String template) {
        // Set template without parameters
        return this;
    }
}
```

## Use Cases
- Plugin Systems
  - Dynamic loading of implementations
  - Feature extensions
  - Custom handlers
- Strategy Pattern  
  - Payment processing 
  - Sorting algorithms
  - Validation strategies
- Event Handling
  - GUI event listeners
  - Message processors
  - Event-driven systems
## Anti-patterns to Avoid

- Type Checking with instanceof
```java
// Avoid
public void process(Object obj) {
    if (obj instanceof String) {
        // Handle String
    } else if (obj instanceof Integer) {
        // Handle Integer
    }
}

// Better
public interface Processable {
    void process();
}
```

- Overloading with Similar Parameters

```java
// Avoid confusing overloads
public void save(String data) { }
public void save(String info) { }  // Confusing!

// Better
public void saveData(String data) { }
public void saveInfo(String info) { }
```

- Breaking Method Contract in Overrides
```java
class Parent {
    public List<String> process() { return new ArrayList<>(); }
}

class Child extends Parent {
    @Override
    public List<String> process() {
        return null; // Breaking contract!
    }
}
```

