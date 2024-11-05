---
sidebar_position: 1
title: DRY Implementation
description: Dont repeat yourself.
---

# Don't Repeat Yourself (DRY )

## Core Understanding

- DRY states that "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system"
- Focuses on avoiding duplication of logic, not just code
- Applies to database schemas, test plans, build systems, even documentation
- Goal is to reduce maintenance overhead and potential for errors
- Important: DRY is about knowledge duplication, not code duplication
## ❌ Bad Example

```java
public class OrderService {
    public Order processRetailOrder(Order order) {
        // Validation
        if (order.getCustomerId() == null) {
            throw new ValidationException("Customer ID is required");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ValidationException("Order must have items");
        }
        if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Order total must be positive");
        }

        // Calculate tax
        BigDecimal tax = order.getTotal().multiply(new BigDecimal("0.10"));
        order.setTax(tax);

        // Save order
        orderRepository.save(order);
        
        // Send notification
        emailService.sendOrderConfirmation(order);
        
        return order;
    }

    public Order processWholesaleOrder(Order order) {
        // Same validation repeated
        if (order.getCustomerId() == null) {
            throw new ValidationException("Customer ID is required");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ValidationException("Order must have items");
        }
        if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Order total must be positive");
        }

        // Different tax calculation but same structure
        BigDecimal tax = order.getTotal().multiply(new BigDecimal("0.05"));
        order.setTax(tax);

        // Save order - repeated
        orderRepository.save(order);
        
        // Send notification - repeated
        emailService.sendOrderConfirmation(order);
        
        return order;
    }
}
```
**Why it's bad**: Logic for validation, tax calculation, saving, and notification is duplicated, making maintenance difficult and error-prone.

## ✅ Good Example
Let's fix this:
```java
@Service
public class OrderService {
    private final OrderValidator validator;
    private final TaxCalculator taxCalculator;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public Order processOrder(Order order, CustomerType customerType) {
        // Single validation logic
        validator.validate(order);

        // Tax calculation based on customer type
        BigDecimal tax = taxCalculator.calculateTax(order, customerType);
        order.setTax(tax);

        // Unified order processing
        processOrderInternal(order);

        return order;
    }

    private void processOrderInternal(Order order) {
        orderRepository.save(order);
        notificationService.notifyOrderCreation(order);
    }
}

@Component
public class OrderValidator {
    public void validate(Order order) {
        List<String> errors = new ArrayList<>();
        
        if (order.getCustomerId() == null) {
            errors.add("Customer ID is required");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            errors.add("Order must have items");
        }
        if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Order total must be positive");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(String.join(", ", errors));
        }
    }
}

@Component
public class TaxCalculator {
    private final Map<CustomerType, BigDecimal> taxRates = Map.of(
        CustomerType.RETAIL, new BigDecimal("0.10"),
        CustomerType.WHOLESALE, new BigDecimal("0.05")
    );

    public BigDecimal calculateTax(Order order, CustomerType customerType) {
        return order.getTotal().multiply(taxRates.get(customerType));
    }
}
```
**Why it's good**:
- Each piece of business logic has a single representation
- Easy to modify validation rules, tax rates, or notification logic
- Clear separation of concerns
- Reusable components

## Best Practices

- Extract Reusable Components
```java
@Component
public class ValidationUtils {
    public static <T> void validateNotNull(T value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }
}
```
- Use Templates for Common Patterns

```java
@Component
public abstract class BaseRepository<T, ID> {
    private final JdbcTemplate jdbcTemplate;
    
    protected abstract String getTableName();
    protected abstract T mapRow(ResultSet rs) throws SQLException;

    public Optional<T> findById(ID id) {
        String sql = String.format("SELECT * FROM %s WHERE id = ?", getTableName());
        return jdbcTemplate.query(sql, this::mapRow, id).stream().findFirst();
    }
}
```


## Use Cases

- Validation Logic
  - Centralize validation rules
  - Reuse across different services
  - Easy to maintain and modify
- Error Handling
  - Common error handling strategies
  - Centralized error messages
  - Consistent error responses
- Business Rules
  - Single source of truth for business logic
  - Easy to update and maintain
  - Consistent application across system
## Anti-patterns to Avoid

- Copy-Paste Programming

```java
// Don't do this
public class UserService {
    public void createUser() {
        // 100 lines of user creation logic
    }
    
    public void createAdmin() {
        // Same 100 lines copied with slight modifications
    }
}
```
- Configuration Duplication

```java
// Don't duplicate configuration
@Service
public class ServiceA {
    @Value("${app.common.config}") // Duplicated
    private String config;
}

@Service
public class ServiceB {
    @Value("${app.common.config}") // Duplicated
    private String config;
}
```

- Multiple Sources of Truth

```java
// Don't maintain same information in multiple places
public class OrderConstants {
    public static final String STATUS_PENDING = "PENDING";
}

public class PaymentConstants {
    public static final String ORDER_STATUS_PENDING = "PENDING"; // Duplicated
}
```

## Interview Questions & Answers

Q: "How do you apply DRY in a microservices architecture?"

Answer: Through

- Shared libraries for common functionality
- API gateways for cross-cutting concerns
- Event-driven patterns for shared business processes

