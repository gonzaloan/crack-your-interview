---
sidebar_position: 3
title: "Clean Functions"
description: "Writing clean and maintainable functions"
---

# Clean Functions

## Characteristics of Clean Functions
- Small and focused
- Do one thing well
- Have descriptive names
- Few parameters
- No side effects

## Examples and Best Practices
```java
// Bad Example
public void process(Order order) {
    // Validate
    if (order == null) throw new IllegalArgumentException("Order cannot be null");
    if (order.getItems().isEmpty()) throw new IllegalArgumentException("Order must have items");
    
    // Calculate totals
    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice();
    }
    
    // Apply discount
    if (total > 100) {
        total = total * 0.9;
    }
    
    // Save
    orderRepository.save(order);
    
    // Send email
    emailService.sendOrderConfirmation(order);
}

// Good Example
public void processOrder(Order order) {
    validateOrder(order);
    double total = calculateTotal(order);
    applyDiscounts(order, total);
    saveOrder(order);
    notifyCustomer(order);
}

private void validateOrder(Order order) {
    requireNonNull(order, "Order cannot be null");
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order must have items");
    }
}

private double calculateTotal(Order order) {
    return order.getItems().stream()
        .mapToDouble(Item::getPrice)
        .sum();
}