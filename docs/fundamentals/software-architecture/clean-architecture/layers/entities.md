---
sidebar_position: 1
title: "Entities"
description: "Clean Architecture Layers - Entities"
---

# 🏛️ Clean Architecture: Entities Layer

## Overview

Entities (also known as Enterprise Business Rules) represent the core business objects of your application. They encapsulate the most general and high-level rules that define your business. These objects are the least likely to change when something external changes.

### Real-World Analogy
Think of entities like the fundamental laws of physics - they remain constant regardless of how we measure or observe them. In a banking system, concepts like "Account" and "Transaction" are entities because their core rules (like "accounts must maintain a non-negative balance") remain true regardless of how the application is delivered or what database is used.

## Key Concepts 🔑

### Core Components

1. **Business Objects**
   - Pure domain objects
   - Independent of frameworks
   - No external dependencies
   - Contains business rules

2. **Business Rules**
   - Validation rules
   - Calculation methods
   - Domain-specific logic
   - State management rules

3. **Entity States**
   - Creation
   - Validation
   - Modification
   - Business rule execution

## Implementation 💻

### Basic Entity Implementation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.domain.entities;

    import java.math.BigDecimal;
    import java.time.LocalDateTime;
    import java.util.UUID;

    public class Account {
        private final UUID id;
        private String ownerName;
        private BigDecimal balance;
        private final LocalDateTime createdAt;
        
        public Account(String ownerName, BigDecimal initialBalance) {
            this.id = UUID.randomUUID();
            this.ownerName = ownerName;
            this.balance = initialBalance;
            this.createdAt = LocalDateTime.now();
            
            validateState();
        }
        
        public void deposit(BigDecimal amount) {
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Deposit amount must be positive");
            }
            this.balance = this.balance.add(amount);
        }
        
        public void withdraw(BigDecimal amount) {
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Withdrawal amount must be positive");
            }
            
            if (balance.subtract(amount).compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException("Insufficient funds");
            }
            
            this.balance = this.balance.subtract(amount);
        }
        
        private void validateState() {
            if (ownerName == null || ownerName.trim().isEmpty()) {
                throw new IllegalStateException("Owner name cannot be empty");
            }
            
            if (balance == null || balance.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException("Balance cannot be negative");
            }
        }
        
        // Getters (no setters to ensure immutability)
        public UUID getId() { return id; }
        public String getOwnerName() { return ownerName; }
        public BigDecimal getBalance() { return balance; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package entities

    import (
        "errors"
        "math/big"
        "time"

        "github.com/google/uuid"
    )

    type Account struct {
        id        uuid.UUID
        ownerName string
        balance   *big.Float
        createdAt time.Time
    }

    func NewAccount(ownerName string, initialBalance *big.Float) (*Account, error) {
        account := &Account{
            id:        uuid.New(),
            ownerName: ownerName,
            balance:   initialBalance,
            createdAt: time.Now(),
        }
        
        if err := account.validateState(); err != nil {
            return nil, err
        }
        
        return account, nil
    }

    func (a *Account) Deposit(amount *big.Float) error {
        if amount.Cmp(big.NewFloat(0)) <= 0 {
            return errors.New("deposit amount must be positive")
        }
        
        a.balance.Add(a.balance, amount)
        return nil
    }

    func (a *Account) Withdraw(amount *big.Float) error {
        if amount.Cmp(big.NewFloat(0)) <= 0 {
            return errors.New("withdrawal amount must be positive")
        }
        
        newBalance := new(big.Float).Sub(a.balance, amount)
        if newBalance.Cmp(big.NewFloat(0)) < 0 {
            return errors.New("insufficient funds")
        }
        
        a.balance = newBalance
        return nil
    }

    func (a *Account) validateState() error {
        if a.ownerName == "" {
            return errors.New("owner name cannot be empty")
        }
        
        if a.balance == nil || a.balance.Cmp(big.NewFloat(0)) < 0 {
            return errors.New("balance cannot be negative")
        }
        
        return nil
    }

    // Getters
    func (a *Account) ID() uuid.UUID { return a.id }
    func (a *Account) OwnerName() string { return a.ownerName }
    func (a *Account) Balance() *big.Float { return a.balance }
    func (a *Account) CreatedAt() time.Time { return a.createdAt }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Domain-Driven Design (DDD)**
   - Entities in Clean Architecture align with DDD's concept of entities
   - Both emphasize business rules and domain logic
   - Can be used together for complex domain modeling

2. **Value Objects**
   - Complement entities by representing immutable values
   - Used within entities to represent attributes
   - Help maintain invariants

3. **Aggregate Pattern**
   - Groups related entities
   - Maintains consistency boundaries
   - Enforces business rules across multiple entities

## Best Practices ✨

### Configuration
1. Keep entities framework-independent
2. Use immutable properties where possible
3. Implement validation in constructors
4. Use factory methods for complex creation logic

### Monitoring
1. Log business rule violations
2. Track entity state changes
3. Monitor performance metrics
4. Implement auditing capabilities

### Testing
1. Unit test all business rules
2. Use property-based testing for invariants
3. Test edge cases extensively
4. Implement integration tests for entity relationships

## Common Pitfalls 🚫

1. **Adding Infrastructure Dependencies**
   - Solution: Keep entities pure and independent
   - Move infrastructure concerns to outer layers

2. **Exposing Internal State**
   - Solution: Use immutable properties
   - Implement behavior-rich methods instead of getters/setters

3. **Missing Validation**
   - Solution: Validate in constructors
   - Implement invariant checks in state-changing methods

4. **Anemic Domain Model**
   - Solution: Include business logic in entities
   - Don't treat entities as data containers

## Use Cases 🎯

### 1. Financial System
- Account management
- Transaction processing
- Balance calculations
- Audit trail maintenance

### 2. E-commerce Platform
- Product catalog
- Order processing
- Inventory management
- Pricing rules

### 3. Healthcare System
- Patient records
- Medical history
- Treatment plans
- Prescription management

## Deep Dive Topics 🤿

### Thread Safety
1. **Immutability**
   - Design entities to be immutable where possible
   - Use thread-safe collections
   - Implement copy-on-write when needed

### Distributed Systems
1. **Consistency**
   - Implement version control
   - Handle concurrent modifications
   - Use event sourcing when appropriate

### Performance
1. **Optimization**
   - Lazy loading of heavy properties
   - Efficient validation strategies
   - Caching mechanisms

## Additional Resources 📚

### References
1. [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/)
3. [Patterns of Enterprise Application Architecture by Martin Fowler](https://martinfowler.com/books/eaa.html)

### Tools
1. [PlantUML](https://plantuml.com/) - For entity relationship diagrams
2. [JaCoCo](https://www.jacoco.org/jacoco/) - Code coverage for entity testing
3. [GoDoc](https://pkg.go.dev/) - Documentation generator for Go entities

## FAQs ❓

### Q: Should entities contain database annotations?
A: No, entities should be pure domain objects. Database mapping should be handled in the infrastructure layer.

### Q: How do I handle complex business rules?
A: Break them down into smaller, composable rules within the entity or create separate policy objects.

### Q: Can entities reference other entities?
A: Yes, but consider using aggregate patterns and maintaining proper boundaries.

### Q: How do I handle validation across multiple entities?
A: Use domain services or aggregate roots to coordinate multi-entity validation.

### Q: Should I use inheritance in entities?
A: Use it sparingly and prefer composition over inheritance. Consider interfaces for polymorphic behavior.