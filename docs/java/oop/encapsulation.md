---
sidebar_position: 2
title: "Encapsulation"
description: "Advanced techniques and patterns for effective encapsulation in Java"
---

# Encapsulation

## Core Understanding

Encapsulation is the bundling of data and the methods that operate on that data within a single unit (class), restricting direct access to some of an object's components. It's about:
- Hiding internal state and requiring all interaction to be performed through an object's methods
- Protecting the integrity of an object's data
- Reducing coupling between different parts of an application
- Providing a clear and controlled interface for object interaction

## ❌ Bad Example

```java
public class BankAccount {
    // Public fields expose internal state
    public double balance;
    public List<Transaction> transactions;
    public String accountNumber;

    public void deposit(double amount) {
        balance += amount;
        transactions.add(new Transaction(amount));
    }

    public void withdraw(double amount) {
        // No validation
        balance -= amount;
        transactions.add(new Transaction(-amount));
    }
}

// Usage
BankAccount account = new BankAccount();
account.balance = 1000; // Direct manipulation of state
account.transactions.clear(); // Can corrupt the transaction history
```
**Why it's bad**: 

- Public fields allow direct state manipulation
- No validation of data
- No protection against corruption
- Breaks data integrity
- Difficult to modify implementation

## ✅ Good Example
Let's fix this:
```java
public class BankAccount {
    private final String accountNumber;
    private BigDecimal balance;
    private final List<Transaction> transactions;
    private final TransactionValidator validator;
    private final TransactionLogger logger;

    public BankAccount(String accountNumber, TransactionValidator validator,
                      TransactionLogger logger) {
        this.accountNumber = accountNumber;
        this.balance = BigDecimal.ZERO;
        this.transactions = new ArrayList<>();
        this.validator = validator;
        this.logger = logger;
    }

    public TransactionResult deposit(BigDecimal amount) {
        try {
            validator.validateDeposit(amount);
            balance = balance.add(amount);
            Transaction transaction = new Transaction(TransactionType.DEPOSIT, amount);
            transactions.add(transaction);
            logger.logTransaction(accountNumber, transaction);
            return TransactionResult.success(balance);
        } catch (ValidationException e) {
            return TransactionResult.failure(e.getMessage());
        }
    }

    public TransactionResult withdraw(BigDecimal amount) {
        try {
            validator.validateWithdrawal(amount, balance);
            balance = balance.subtract(amount);
            Transaction transaction = new Transaction(TransactionType.WITHDRAWAL, amount);
            transactions.add(transaction);
            logger.logTransaction(accountNumber, transaction);
            return TransactionResult.success(balance);
        } catch (ValidationException e) {
            return TransactionResult.failure(e.getMessage());
        }
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public List<Transaction> getTransactionHistory() {
        return Collections.unmodifiableList(transactions);
    }
}
```
**Why it's good**:
- Private fields protect internal state
- Immutable where possible
- Validates all operations
- Provides controlled access through methods
- Logs operations for audit
- Returns defensive copies
## Best Practices

- Use Private Fields with Getters/Setters When Needed
```java
public class User {
    private String password;
    
    public void setPassword(String newPassword) {
        validatePassword(newPassword);
        this.password = hashPassword(newPassword);
    }
    
    // No getter for password - information hiding
} 
```

- Implement Immutable Objects When Possible

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(amount.add(other.amount), currency);
    }
}
```

- Use Builder Pattern for Complex Object Creation

```java
public class Order {
    private final String id;
    private final Customer customer;
    private final List<OrderItem> items;
    
    private Order(Builder builder) {
        this.id = builder.id;
        this.customer = builder.customer;
        this.items = builder.items;
    }
    
    public static class Builder {
        // Builder implementation
    }
}
```

## Use Cases

- Financial Systems
  - Bank accounts
  - Payment processing
  - Transaction management

- Security-Critical Applications
  - User credentials
  - Authentication tokens
  - Access control

- Data Integrity Systems
  - Audit logs
  - Medical records
  - Legal documents

## Anti-patterns to Avoid

- Public Fields
```java
// Avoid
public class User {
    public String password; // Never expose sensitive data
} 
```

- Getter/Setter for Every Field

```java
// Avoid automatic getter/setter generation without consideration
@Data // Lombok annotation that generates everything
public class SensitiveData {
    private String secretKey;
    private String internalState;
}
```

- Exposing Internal Collections
```java
// Avoid
public List<Transaction> getTransactions() {
    return transactions; // Returns reference to internal list
}

// Better
public List<Transaction> getTransactions() {
    return Collections.unmodifiableList(transactions);
} 
```
## Interview Questions & Answers

Q1: "How would you implement encapsulation in a thread-safe manner?"

Answer: Using a lock. 

```java
public class ThreadSafeAccount {
    private final Lock lock = new ReentrantLock();
    private BigDecimal balance;

    public TransactionResult withdraw(BigDecimal amount) {
        lock.lock();
        try {
            if (balance.compareTo(amount) < 0) {
                return TransactionResult.failure("Insufficient funds");
            }
            balance = balance.subtract(amount);
            return TransactionResult.success(balance);
        } finally {
            lock.unlock();
        }
    }
}
```

Q2: "How do you handle encapsulation with JPA entities?"
A: 

```java
@Entity
public class Customer {
    @Id
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Order> orders = new HashSet<>();
    
    public void addOrder(Order order) {
        orders.add(order);
        order.setCustomer(this);
    }
    
    public void removeOrder(Order order) {
        orders.remove(order);
        order.setCustomer(null);
    }
    
    // Getter for orders returns unmodifiable view
    public Set<Order> getOrders() {
        return Collections.unmodifiableSet(orders);
    }
}
```
