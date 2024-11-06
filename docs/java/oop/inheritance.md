---
sidebar_position: 3
title: "Inheritance"
description: "Master class inheritance and its advanced patterns in Java"
---

# Inheritance in Java

## Core Understanding

Inheritance is a mechanism that allows a class to inherit attributes and methods from another class. In Java:
- Extends functionality of existing classes
- Promotes code reuse
- Supports method overriding and polymorphism
- Enables "is-a" relationships between classes
- Can be used with abstract classes and interfaces

## ❌ Bad Example

```java
// Violating LSP and forcing inheritance for code reuse
public class Bird {
    public void fly() {
        System.out.println("Flying high!");
    }
    
    public void makeSound() {
        System.out.println("Tweet tweet!");
    }
}

public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly!");
    }
}

// Usage leads to runtime errors
Bird bird = new Penguin();
bird.fly(); // Throws exception!
```
**Why it's bad**:

- Forces inheritance for code reuse
- Violates Liskov Substitution Principle
- Creates fragile hierarchies
- Makes code harder to maintain
- Runtime errors instead of compile-time safety

## ✅ Good Example
Let's fix this:
```java
public interface Movable {
    void move();
}

public interface Flyable extends Movable {
    void fly();
}

public abstract class Bird implements Movable {
    private final String species;
    
    protected Bird(String species) {
        this.species = species;
    }
    
    @Override
    public void move() {
        System.out.println(species + " is moving");
    }
    
    public abstract void makeSound();
}

public class FlyingBird extends Bird implements Flyable {
    public FlyingBird(String species) {
        super(species);
    }
    
    @Override
    public void fly() {
        System.out.println("Flying through the air");
    }
    
    @Override
    public void makeSound() {
        System.out.println("Tweet!");
    }
}

public class Penguin extends Bird {
    public Penguin() {
        super("Penguin");
    }
    
    @Override
    public void move() {
        System.out.println("Waddling and swimming");
    }
    
    @Override
    public void makeSound() {
        System.out.println("Squawk!");
    }
}
```
**Why it's good**:
- Clear separation of capabilities
- Follows Interface Segregation Principle
- Compile-time safety
- Flexible and extensible design
- Respects LSP
## Best Practices

- Favor Composition Over Inheritance
```java
public class EmailService {
    private final EmailValidator validator;
    private final EmailSender sender;
    private final EmailTemplateEngine templateEngine;
    
    public void sendEmail(Email email) {
        validator.validate(email);
        String content = templateEngine.generateContent(email);
        sender.send(email.getTo(), content);
    }
}
```

- Use Abstract Classes for Template Method Pattern

```java
public abstract class PaymentProcessor {
    public final PaymentResult process(Payment payment) {
        if (!validatePayment(payment)) {
            return PaymentResult.invalid();
        }
        
        PaymentResult result = doProcess(payment);
        notifyComplete(result);
        return result;
    }
    
    protected abstract boolean validatePayment(Payment payment);
    protected abstract PaymentResult doProcess(Payment payment);
    protected abstract void notifyComplete(PaymentResult result);
}
```

- Design for Inheritance or Prohibit it

```java
// Designed for inheritance
public abstract class AbstractAuditLogger {
    protected abstract void writeLog(String message);
    
    public final void logEvent(String event) {
        String timestamp = LocalDateTime.now().toString();
        writeLog(timestamp + ": " + event);
    }
}

// Prohibited from inheritance
public final class StringUtils {
    private StringUtils() {} // Prevent instantiation
    
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}
```

## Use Cases
- Framework Development
  - Abstract base classes for common functionality
  - Plugin systems
  - Extension points

- Template Method Implementations
  - Document processors
  - Payment handling
  - Request processing pipelines

- Domain Model Hierarchies
  - Account types in banking
  - Employee types in HR systems
  - Product categories in e-commerce


## Anti-patterns to Avoid

- Deep Inheritance Hierarchies
```java
// Avoid deep hierarchies
class Vehicle extends Transport {}
class Car extends Vehicle {}
class RaceCar extends Car {}
class FormulaOneCar extends RaceCar {} // Too deep!
```

- Inheritance for Code Reuse Only

```java
// Avoid inheritance just for code reuse
class ArrayList extends Stack {} // Wrong relationship!
```

- Breaking LSP
```java
// Violating LSP
class Rectangle {
    protected int width;
    protected int height;
    
    public void setWidth(int width) {
        this.width = width;
    }
}

class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // Violates LSP
    }
}
```
## Interview Questions & Answers

Q1: "When would you choose abstract class over interface?"

Answer: 

```java
// Abstract class when you have:
public abstract class PaymentGateway {
    // 1. Common state
    protected final String apiKey;
    
    // 2. Constructor
    protected PaymentGateway(String apiKey) {
        this.apiKey = apiKey;
    }
    
    // 3. Common implementation
    protected final String generateRequestId() {
        return UUID.randomUUID().toString();
    }
    
    // 4. Abstract methods
    protected abstract PaymentResult processPayment(Payment payment);
}
```

Q3: "How do you design inheritance for thread-safe classes?"
A:

```java
public abstract class ThreadSafeProcessor {
    private final Lock lock = new ReentrantLock();
    
    public final void process(Request request) {
        lock.lock();
        try {
            validateRequest(request);
            doProcess(request);
        } finally {
            lock.unlock();
        }
    }
    
    // Template methods
    protected abstract void validateRequest(Request request);
    protected abstract void doProcess(Request request);
}
```
