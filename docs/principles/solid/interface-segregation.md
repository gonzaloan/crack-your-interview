---
sidebar_position: 4
title: Interface Segregation Principle (ISP)
description: Interfaces are your friend!
---

# Interface Segregation Principle (ISP)

## Core Understanding

- Clients should not be forced to depend on interfaces they don't use
- Favor many small, specific interfaces over large, monolithic ones
- Each interface should serve a specific purpose
- Classes should implement only the methods they truly need

## ❌ Bad Example

```java
// Large, monolithic interface that forces unnecessary implementations
public interface WorkerInterface {
    void work();
    void eat();
    void sleep();
    void receivePayment();
    void takeBreak();
    void requestVacation();
    void attendMeeting();
    void submitTimesheet();
    void requestResources();
    void reportToManager();
}

// Class forced to implement unnecessary methods
public class Robot implements WorkerInterface {
    @Override
    public void work() {
        // Actual implementation
    }

    @Override
    public void eat() {
        throw new UnsupportedOperationException("Robots don't eat");
    }

    @Override
    public void sleep() {
        throw new UnsupportedOperationException("Robots don't sleep");
    }
    // ... more unnecessary implementations
}
```
**Why it's bad**: Forces classes to implement methods they don't need, violating ISP and leading to fragile code.

## ✅ Good Example
Let's fix this:
```java
public interface Workable {
    void work();
    void requestResources();
}

public interface Manageable {
    void reportToManager();
    void attendMeeting();
}

public interface Payable {
    void receivePayment();
    void submitTimesheet();
}

public interface HumanWorker extends Workable, Manageable, Payable {
    void eat();
    void sleep();
    void takeBreak();
    void requestVacation();
}

// Robot only implements what it needs
public class Robot implements Workable {
    @Override
    public void work() {
        // Work implementation
    }

    @Override
    public void requestResources() {
        // Resource request implementation
    }
}

// Human implements all necessary interfaces
public class Employee implements HumanWorker {
    // Implement all methods relevant for human workers
}
```
**Why it's good**: Classes only implement interfaces relevant to their behavior, reducing coupling and increasing cohesion.

## Best Practices

- Role-Based Interface Segregation
```java
public interface Readable {
    byte[] read();
}

public interface Writable {
    void write(byte[] data);
}

public class File implements Readable, Writable {
    // Implement both interfaces for full file operations
}

public class ReadOnlyFile implements Readable {
    // Implement only read operations
}
```
- Client-Specific Interfaces
  - Design interfaces based on client needs
  - Keep interfaces focused and cohesive
  - Use composition of interfaces when needed

- Interface Cohesion
  - Methods in an interface should be related
  - Group methods by their purpose
  - Consider the "reason to change" for each interface

## Use Cases

- Repository Pattern
```java
public interface ReadOnlyRepository<T> {
    Optional<T> findById(Long id);
    List<T> findAll();
}

public interface WriteOnlyRepository<T> {
    T save(T entity);
    void delete(T entity);
} 
```
  - Separate read and write operations
  - Clients only depend on needed operations

- Payment Processing

```java
public interface PaymentProcessor {
    PaymentResult process(Payment payment);
}

public interface RefundProcessor {
    RefundResult refund(Payment payment);
}
```
  - Different payment providers might support different operations

- Document Management

  - Separate interfaces for reading, writing, and metadata operations
  - Support for different levels of access and functionality


## Anti-patterns to Avoid

- Fat interfaces

```java
// Avoid this
public interface UserService {
    User findUser(Long id);
    void updateUser(User user);
    void sendEmail(User user);
    void generateReport(User user);
    void validateCredentials(String username, String password);
}
```
- Interface Pollution
  - Adding methods "just in case"
  - Mixing unrelated operations
  - One-size-fits-all interfaces

- Forced Implementation
  - Empty method implementations
  - Throwing UnsupportedOperationException
