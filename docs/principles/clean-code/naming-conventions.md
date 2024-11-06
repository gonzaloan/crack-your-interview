---
sidebar_position: 2
title: "Naming Conventions"
description: "Guidelines for creating meaningful and clear names in your code"
---

# Naming Conventions

## Variables and Properties
```java
// Bad
int d; // elapsed time in days
String s; // customer name
List<Integer> l; // list of user IDs

// Good
int elapsedDays;
String customerName;
List<Integer> userIds;
```

## Functions and Methods

```java
// Bad
void process() // Too vague
void processTheOrderAndSendEmailAndUpdateInventory() // Too long

// Good
void processOrder()
void sendOrderConfirmation()
void updateInventory()
```

## Classes

```java
// Bad
class Data // Too vague
class CustomerDataManagerServiceImpl // Too long

// Good
class Customer
class OrderProcessor
class PaymentGateway
```

## Best Practices

- Use intention-revealing names
- Avoid abbreviations
- Be consistent across the codebase
- Use domain terminology