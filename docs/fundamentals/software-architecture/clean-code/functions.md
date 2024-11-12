---
sidebar_position: 3
title: "Clean Functions"
description: "Writing clean and maintainable functions"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔧 Clean Code Functions

## Overview

Clean code functions are the building blocks of maintainable software. Like well-designed tools, they should do one thing well and be easy to use. Think of functions as recipes in a cookbook - they should have clear ingredients (parameters), a single purpose (responsibility), and produce consistent results (output).

### Real-World Analogy
Consider a professional chef's kitchen. Each station has a specific purpose: one for chopping vegetables, another for grilling meat, etc. Similarly, clean functions should have a single, well-defined responsibility and work together seamlessly to create the final product.

## 🔑 Key Concepts

### Core Principles
1. **Single Responsibility**: One function, one task
2. **Small Size**: Functions should be concise
3. **Clear Intent**: Name should describe what it does
4. **Abstraction Level**: Consistent within the function
5. **Pure Functions**: Predictable output for same input
6. **Command Query Separation**: Either do something or answer something

### Function Categories
- **Commands**: Perform actions, void return type
- **Queries**: Return data, no side effects
- **Transformers**: Convert input to output
- **Predicates**: Return boolean conditions

## 💻 Implementation

### Basic Function Structure

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.List;
    import java.util.ArrayList;
    import java.util.stream.Collectors;

    public class OrderProcessor {
        // Bad: Function does too many things
        public void processSalesOrder(Order order) {
            validateOrder(order);
            calculateTotal(order);
            updateInventory(order);
            notifyCustomer(order);
            updateAccountingSystem(order);
        }

        // Good: Single responsibility functions
        public void processOrder(Order order) {
            if (isValidOrder(order)) {
                submitOrderForProcessing(order);
            }
        }

        private boolean isValidOrder(Order order) {
            return order != null && 
                   !order.getItems().isEmpty() && 
                   order.getCustomer() != null;
        }

        private void submitOrderForProcessing(Order order) {
            OrderProcessor processor = new OrderProcessor();
            processor.processValidatedOrder(order);
        }

        // Example of a pure function
        public double calculateOrderTotal(List<OrderItem> items) {
            return items.stream()
                       .mapToDouble(item -> item.getPrice() * item.getQuantity())
                       .sum();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package order

    import (
        "errors"
        "time"
    )

    type OrderProcessor struct {
        repository OrderRepository
    }

    // Bad: Function does too many things
    func (p *OrderProcessor) ProcessSalesOrder(order Order) error {
        if err := p.validateOrder(order); err != nil {
            return err
        }
        p.calculateTotal(&order)
        p.updateInventory(order)
        p.notifyCustomer(order)
        return p.updateAccountingSystem(order)
    }

    // Good: Single responsibility functions
    func (p *OrderProcessor) ProcessOrder(order Order) error {
        if !p.isValidOrder(order) {
            return errors.New("invalid order")
        }
        return p.submitOrderForProcessing(order)
    }

    func (p *OrderProcessor) isValidOrder(order Order) bool {
        return order.Items != nil && 
               len(order.Items) > 0 && 
               order.Customer != nil
    }

    func (p *OrderProcessor) submitOrderForProcessing(order Order) error {
        return p.processValidatedOrder(order)
    }

    // Example of a pure function
    func CalculateOrderTotal(items []OrderItem) float64 {
        var total float64
        for _, item := range items {
            total += item.Price * float64(item.Quantity)
        }
        return total
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

- **Command Pattern**: Encapsulates method calls as objects
- **Strategy Pattern**: Enables swapping function implementations
- **Template Method**: Defines function skeleton with customizable steps
- **Chain of Responsibility**: Chains function calls in a sequence

## ✨ Best Practices

### Function Design
1. **Keep Functions Small**
    - Ideal: 20 lines or less
    - Single level of abstraction
    - Clear purpose

2. **Parameter Management**
    - Limit parameters (ideally ≤ 3)
    - Use objects for multiple parameters
    - Avoid boolean flags

3. **Error Handling**
    - Separate error handling from main logic
    - Use exceptions/errors appropriately
    - Maintain clean error handling paths

### Testing Best Practices

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import org.junit.jupiter.api.Test;
    import static org.junit.jupiter.api.Assertions.*;

    class OrderProcessorTest {
        @Test
        void calculateOrderTotal_WithValidItems_ReturnsCorrectSum() {
            // Arrange
            List<OrderItem> items = Arrays.asList(
                new OrderItem("Item1", 10.0, 2),
                new OrderItem("Item2", 15.0, 1)
            );
            
            // Act
            double total = new OrderProcessor().calculateOrderTotal(items);
            
            // Assert
            assertEquals(35.0, total, 0.001);
        }

        @Test
        void isValidOrder_WithEmptyOrder_ReturnsFalse() {
            Order emptyOrder = new Order();
            assertFalse(new OrderProcessor().isValidOrder(emptyOrder));
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package order

    import "testing"

    func TestCalculateOrderTotal(t *testing.T) {
        // Arrange
        items := []OrderItem{
            {Price: 10.0, Quantity: 2},
            {Price: 15.0, Quantity: 1},
        }
        
        // Act
        total := CalculateOrderTotal(items)
        
        // Assert
        expected := 35.0
        if total != expected {
            t.Errorf("Expected %.2f but got %.2f", expected, total)
        }
    }

    func TestIsValidOrder_EmptyOrder(t *testing.T) {
        processor := &OrderProcessor{}
        emptyOrder := Order{}
        if processor.isValidOrder(emptyOrder) {
            t.Error("Expected false for empty order")
        }
    }
    ```
  </TabItem>
</Tabs>

## ⚠️ Common Pitfalls

1. **Function Bloat**
    - Symptom: Functions growing too large
    - Solution: Break into smaller, focused functions

2. **Side Effects**
    - Symptom: Unexpected state changes
    - Solution: Make side effects explicit in function names

3. **Parameter Explosion**
    - Symptom: Too many parameters
    - Solution: Use parameter objects

4. **Mixing Abstraction Levels**
    - Symptom: High and low-level operations mixed
    - Solution: Maintain consistent abstraction levels

## 🎯 Use Cases

### 1. Payment Processing System
```java
public class PaymentProcessor {
    public PaymentResult processPayment(Payment payment) {
        if (!validatePayment(payment)) {
            return PaymentResult.invalid();
        }
        
        try {
            TransactionResult result = submitToPaymentGateway(payment);
            return createPaymentResult(result);
        } catch (PaymentException e) {
            return handlePaymentError(e);
        }
    }
}
```

### 2. User Authentication
```java
public class AuthenticationService {
    public AuthResult authenticate(Credentials credentials) {
        if (!validateCredentials(credentials)) {
            return AuthResult.invalidCredentials();
        }
        
        User user = findUser(credentials.getUsername());
        if (user == null) {
            return AuthResult.userNotFound();
        }
        
        return verifyPassword(user, credentials.getPassword())
            ? AuthResult.success(user)
            : AuthResult.wrongPassword();
    }
}
```

### 3. Report Generation
```java
public class ReportGenerator {
    public Report generateReport(ReportRequest request) {
        validateRequest(request);
        
        Data data = fetchData(request);
        List<ReportSection> sections = processData(data);
        
        return assembleReport(sections);
    }
}
```

## 🔍 Deep Dive Topics

### Thread Safety

```java
public class ThreadSafeCounter {
    private final AtomicInteger count = new AtomicInteger(0);
    
    // Thread-safe increment function
    public int incrementAndGet() {
        return count.incrementAndGet();
    }
    
    // Thread-safe conditional update
    public boolean compareAndSet(int expected, int newValue) {
        return count.compareAndSet(expected, newValue);
    }
}
```

### Performance Optimization
1. **Memoization**
```java
public class MemoizedFunction {
    private final Map<String, BigInteger> cache = new ConcurrentHashMap<>();
    
    public BigInteger expensiveCalculation(String input) {
        return cache.computeIfAbsent(input, this::compute);
    }
}
```

### Distributed Systems
```java
public class DistributedProcessor {
    public CompletableFuture<Result> processAsync(Request request) {
        return CompletableFuture
            .supplyAsync(() -> validateRequest(request))
            .thenCompose(this::processValidRequest)
            .exceptionally(this::handleProcessingError);
    }
}
```

## 📚 Additional Resources

### Tools
- SonarQube: Code quality analysis
- JaCoCo: Code coverage for Java
- go-critic: Go code linter
- PMD: Static code analyzer

### References
- "Clean Code" by Robert C. Martin
- "Refactoring" by Martin Fowler
- "Code Complete" by Steve McConnell
- "Effective Java" by Joshua Bloch

## ❓ FAQs

### Q: What's the ideal function length?
A: Functions should be small enough to fit on a screen (typically 20-30 lines). Focus on doing one thing well.

### Q: How do I handle multiple return values?
A: Use result objects or tuples (in languages that support them) rather than out parameters.

### Q: Should I always write pure functions?
A: Pure functions are ideal for testability and reasoning, but some side effects are necessary. Make them explicit when needed.

### Q: How do I handle complex validation logic?
A: Break it into smaller, focused validation functions and compose them. Consider using the Specification pattern.

### Q: When should I refactor a function?
A: When it violates single responsibility, becomes too long, has too many parameters, or mixes abstraction levels.