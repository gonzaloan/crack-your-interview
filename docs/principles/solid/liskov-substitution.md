---
sidebar_position: 3
title: Liskov Substitution Principle (LSP)
description: Objects of a superclass can be replaced with objects of its subclass without altering the program's behavior or introducing errors
---

# Liskov Substitution Principle (LSP)

## Core Understanding

The Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of its subclasses without affecting the correctness of the program. In other words:

- Objects of a superclass should be replaceable with objects of its subclasses without breaking the application
- Subclasses must honor the promises made by the base class contract
- Method signatures and behavior in subclasses must be compatible with the base class
- Essential for maintaining code reliability and predictability

## ❌ Bad Example

```java
// Base class defines a contract for birds
public class Bird {
    public void fly() {
        // Flying implementation
    }
}

// Violates LSP because penguins can't fly!
public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly!");
    }
}
```
Why it's bad: This breaks the contract established by the base class. Any code using Bird would break when it receives a Penguin.

## ✅ Good Example
Let's fix this:
```java
// Better modeling of capabilities
public interface Moveable {
    void move();
}

public interface Flyable extends Moveable {
    void fly();
}

public class Bird implements Moveable {
    @Override
    public void move() {
        // Basic movement implementation
    }
}

public class FlyingBird extends Bird implements Flyable {
    @Override
    public void fly() {
        // Flying implementation
    }
}

public class Penguin extends Bird {
    @Override
    public void move() {
        // Penguin-specific movement
    }
}
```
Why it's good: Each class only promises what it can deliver. Code using Flyable will only get birds that can actually fly.

## Best Practices

- Use Contract-Based Programming
  - Define clear contracts in base classes/interfaces
  - Document preconditions and postconditions
  - Ensure invariants are maintained

- Favor Composition Over Inheritance
  - Use interfaces to define contracts
  - Compose behavior instead of inheriting when possible
- Use Factory Methods
  - Create objects ensuring LSP compliance
  - Handle object creation complexity

## Use Cases

- Collections Framework
  - ArrayList/LinkedList both implements List
  - Different implementations can be used interchangeably

- Payment Processing
  - Different payment methods implementing same interface
  - Systems can process any payment type without changes
```java
public interface PaymentProcessor {
    PaymentResult process(Payment payment);
}
```
- File Systems
  - Reading/writing to different storage types
  - Consistent interface for different storage implementations

- Database Access
  - Different database providers using same interface
  - Switching databases without changing application code
 
## Anti-patterns to Avoid

- Violating Contract
  - Adding preconditions to classes
  - Throwing unexpected exceptions
  - Changing behavior guarantees.
- Type Checking
```java
// Avoid this
if (account instanceof SavingsAccount) {
    // Special handling
}
```
- Empty Methods
```java
// Avoid implementing methods that do nothing
@Override
public void someOperation() {
    // Do nothing or throw exception
}
```


## Interview Questions & Answers

Q1: "What are the key indicators that LSP is being violated?"
Answer:

- Type Checking
  - Using instanceof or type checking in code
  - Switching behavior based on concrete types

- Exception Handling
  - Unexpected exceptions from subclasses
  - Different error handling in subclasses

- Method Behavior
  - Subclass methods not fulfilling base class contracts
  - Inconsistent behavior across inheritance hierarchy

- Client Code Modifications
  - Need to modify client code for different subtypes
  - Special cases for specific implementations

Example of violation:
```java
// Violation
public void processShape(Shape shape) {
if (shape instanceof Circle) {
// Special handling for circles
} else if (shape instanceof Rectangle) {
  // Special handling for rectangles
}
}

// Correct approach
public void processShape(Shape shape) {
// Handle all shapes uniformly
shape.draw();
shape.calculateArea();
}
```

Q2: "How would you refactor a violation of LSP?"

Answer: Start by identifying the contract violation, then:

```java
// Before
class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        super.setWidth(width);
        super.setHeight(width); // Violates LSP
    }
}

// After
interface Shape {
    double getArea();
}

class Rectangle implements Shape {
    private int width, height;
}

class Square implements Shape {
    private int side;
}
```