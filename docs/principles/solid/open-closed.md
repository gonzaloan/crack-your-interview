---
sidebar_position: 2
title: Open Closed Principle (OCP)
description: Open to Extension but Closed for modification
---

# Open Closed Principle (OCP)

## Core Understanding

The Open/Closed Principle states that software entities should be open for extension but closed for modification. This principle is fundamental for creating maintainable and scalable software.

Key Benefits:
- Reduce bugs.
- Promotes code reusability
- Facilitates Maintenance
- Supports Backwards compatibility


### ❌ Bad Practice

```java
// Violating OCP - Need to modify class for new payment types
public class PaymentProcessor {
    public void processPayment(Payment payment) {
        if (payment.getType().equals("CREDIT_CARD")) {
            processCreditCardPayment(payment);
        } else if (payment.getType().equals("PAYPAL")) {
            processPayPalPayment(payment);
        } else if (payment.getType().equals("CRYPTO")) {
            processCryptoPayment(payment);
        }
        // Need to add more if-else statements for new payment types
    }

    private void processCreditCardPayment(Payment payment) {
        // Credit card specific logic
    }

    private void processPayPalPayment(Payment payment) {
        // PayPal specific logic
    }

    private void processCryptoPayment(Payment payment) {
        // Crypto specific logic
    }
}
```

Problems with this implementation?

- Issues:
    - Hard to maintain.
    - Hard to test
    - Hard to read.
    - Hard to add new features. 

### ✅ Good Practice

Let's fix this

```java
public interface PaymentStrategy {
    PaymentResult process(Payment payment);
    boolean supports(PaymentType type);
}

@Service
public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(Payment payment) {
        // Credit card specific logic
        return new PaymentResult(/* ... */);
    }

    @Override
    public boolean supports(PaymentType type) {
        return PaymentType.CREDIT_CARD.equals(type);
    }
}

@Service
public class PayPalPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(Payment payment) {
        // PayPal specific logic
        return new PaymentResult(/* ... */);
    }

    @Override
    public boolean supports(PaymentType type) {
        return PaymentType.PAYPAL.equals(type);
    }
}

@Service
public class PaymentProcessor {
    private final List<PaymentStrategy> paymentStrategies;

    public PaymentProcessor(List<PaymentStrategy> paymentStrategies) {
        this.paymentStrategies = paymentStrategies;
    }

    public PaymentResult processPayment(Payment payment) {
        return paymentStrategies.stream()
            .filter(strategy -> strategy.supports(payment.getType()))
            .findFirst()
            .orElseThrow(() -> new UnsupportedPaymentTypeException(payment.getType()))
            .process(payment);
    }
}
```

Improvements:
- Easy to read.
- Easy to maintain.
- Easy to test.
- Easy to extend. 

## Best Practices

1. Use Strategy Pattern
   1. Encapsulate algorithms in separate classes.
   2. Makes it easy to add new strategies without modifying existing code.
2. Interface-based design
   1. Use interfaces
```java
public interface PaymentProcessor {
    PaymentResult process(Payment payment);
    boolean supports(PaymentMethod method);
}
```
3. Factory Pattern Integration
   1. Create objects without exposing creation logic.
   2. Manage object creation through a central point.
4. Dependency Injection
   1. Inject dependencies rather than creating them.
   2. Makes code more testable and flexible. 


## Common Anti Patterns to Avoid

1. Type Checking with if/switch

```java
if (payment instanceof CreditCardPayment) {
    // Credit card logic
} else if (payment instanceof PayPalPayment) {
    // PayPal logic
}
```

2. Modifying existing classes:
- Don't add new code to existing classes for new features.
- Instead, create new classes that implement existing interfaces.

3. Hardcoding Dependencies
- Avoid instantiation of dependent classes.
- Use Dependency Injection instead.

4. Giant Switch Statements
- Replace with polymorphism.
- Use Strategy Pattern or Command pattern.
