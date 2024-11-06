---
sidebar_position: 4
title: "Clean Comments"
description: "Writing meaningful and necessary comments"
---

# Clean Comments

## When to Comment
- Explain complex business rules
- Document public APIs
- Clarify non-obvious decisions
- Legal requirements

## When Not to Comment
- Don't explain the obvious
- Don't comment out code
- Don't compensate for bad names
- Don't track changes (use version control)

## Examples
```java
// Bad Comments
// Get user by ID
public User getUser(String id) { ... }

// Check if user is valid
if (user.isValid()) { ... }

// Good Comments
/**
 * Retrieves user information applying the following business rules:
 * - Inactive users are not returned
 * - Premium users get additional profile data
 * - GDPR compliance filters are applied
 */
public User getUser(String id) { ... }

// Complex business rule explanation
if (order.getTotal() > DISCOUNT_THRESHOLD && 
    !order.hasPromotionalItems() &&
    customer.isPreferred()) {
    // Apply platinum customer discount only if order doesn't
    // contain promotional items and total exceeds threshold
    applyPlatinumDiscount(order);
}