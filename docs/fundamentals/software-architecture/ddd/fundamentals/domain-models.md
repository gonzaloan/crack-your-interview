---
sidebar_position: 3
title: "Domain Models"
description: "DDD Domain Models"
---

# Domain Models in Domain-Driven Design 🧩

## Overview and Problem Statement

Software systems often struggle to accurately represent complex business domains, leading to implementations that drift from business requirements over time. This disconnect happens when technical implementation details overshadow the actual business rules and processes that the software should model.

Domain Models address this challenge by creating a software representation that closely mirrors the business domain. Rather than focusing first on database tables or UI screens, Domain-Driven Design emphasizes building a model that domain experts would recognize and understand.

The business impact of well-crafted domain models includes:
- Reduced maintenance costs through better alignment with business needs
- Faster feature development due to clearer understanding of business rules
- Improved communication between technical and business teams
- More flexible and adaptable systems that can evolve with the business
- Fewer bugs related to misunderstood business rules

## Detailed Solution/Architecture 🏛️

### Core Concepts

Domain Models consist of several key building blocks that work together to represent the business domain:

1. Entities: Objects with a distinct identity that runs through time and different states
2. Value Objects: Objects that describe characteristics of a thing
3. Aggregates: Clusters of related entities and value objects
4. Domain Events: Records of something significant that happened in the domain
5. Services: Operations that don't naturally belong to any entity or value object

Let's explore each of these concepts with practical examples:

### Entities

An entity is an object defined primarily by its identity, rather than its attributes. Here's how to implement an entity in a banking domain:

```java
public class Account {
    private final AccountId id;  // Identity stays constant even as other attributes change
    private Money balance;
    private AccountStatus status;
    private List<Transaction> transactions;

    public void deposit(Money amount) {
        // Domain logic ensures business rules are enforced
        if (status != AccountStatus.ACTIVE) {
            throw new DomainException("Cannot deposit to a non-active account");
        }
        
        // Create and record the transaction
        Transaction deposit = Transaction.forDeposit(this.id, amount);
        transactions.add(deposit);
        
        // Update the balance
        balance = balance.add(amount);
        
        // If this was an important business event, we might publish a domain event
        DomainEvents.publish(new DepositCompletedEvent(this.id, amount));
    }

    public void withdraw(Money amount) {
        validateWithdrawal(amount);
        
        Transaction withdrawal = Transaction.forWithdrawal(this.id, amount);
        transactions.add(withdrawal);
        balance = balance.subtract(amount);
    }

    private void validateWithdrawal(Money amount) {
        if (status != AccountStatus.ACTIVE) {
            throw new DomainException("Cannot withdraw from a non-active account");
        }
        
        if (balance.isLessThan(amount)) {
            throw new InsufficientFundsException(id, amount, balance);
        }
    }
}
```

### Value Objects

Value objects represent concepts that we care about only for what they are, not who or which they are. Here's an example from the same banking domain:

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        // Validate invariants in constructor
        if (amount.scale() > currency.getDefaultFractionDigits()) {
            throw new DomainException("Amount has too many decimal places for currency");
        }
        
        this.amount = amount;
        this.currency = currency;
    }

    // Value objects should be immutable - operations return new instances
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new DomainException("Cannot add money of different currencies");
        }
        
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new DomainException("Cannot subtract money of different currencies");
        }
        
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    // Value objects are equal if all their attributes are equal
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.equals(money.amount) && 
               currency.equals(money.currency);
    }
}
```

### Aggregates

Aggregates group related entities and value objects into a cohesive unit with clear boundaries. Here's an example of an Order aggregate:

```java
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private OrderStatus status;
    private List<OrderLine> orderLines;
    private ShippingAddress shippingAddress;
    private Money totalAmount;

    // The aggregate root controls all access to its members
    public void addProduct(Product product, int quantity) {
        validateCanModifyOrder();
        
        OrderLine line = new OrderLine(product, quantity);
        orderLines.add(line);
        recalculateTotal();
    }

    public void submit() {
        validateCanSubmitOrder();
        
        this.status = OrderStatus.SUBMITTED;
        DomainEvents.publish(new OrderSubmittedEvent(this.id));
    }

    // Private methods handle internal consistency
    private void validateCanModifyOrder() {
        if (status != OrderStatus.DRAFT) {
            throw new DomainException("Can only modify orders in DRAFT status");
        }
    }

    private void validateCanSubmitOrder() {
        if (orderLines.isEmpty()) {
            throw new DomainException("Cannot submit empty order");
        }
        
        if (status != OrderStatus.DRAFT) {
            throw new DomainException("Order can only be submitted from DRAFT status");
        }
    }

    private void recalculateTotal() {
        this.totalAmount = orderLines.stream()
            .map(OrderLine::getLineTotal)
            .reduce(Money.zero(Currency.USD), Money::add);
    }
}
```

### Domain Events

Domain events capture the fact that something important has happened in the domain. Here's how to implement them:

```java
public class OrderSubmittedEvent extends DomainEvent {
    private final OrderId orderId;
    private final LocalDateTime submittedAt;
    private final Money totalAmount;
    private final int numberOfItems;

    public OrderSubmittedEvent(Order order) {
        this.orderId = order.getId();
        this.submittedAt = LocalDateTime.now();
        this.totalAmount = order.getTotalAmount();
        this.numberOfItems = order.getNumberOfItems();
    }
}

// Event handler in another bounded context
public class InventoryEventHandler {
    @EventHandler
    public void on(OrderSubmittedEvent event) {
        // Handle the event by allocating inventory
        inventoryService.allocateInventory(
            new InventoryAllocationRequest(
                event.getOrderId(),
                event.getItems()
            )
        );
    }
}
```

### Domain Services

When an operation doesn't naturally belong to an entity or value object, we use domain services:

```java
public class TransferService {
    private final AccountRepository accounts;
    private final TransactionLogger logger;

    public void transferMoney(AccountId fromId, AccountId toId, Money amount) {
        // Load the accounts
        Account from = accounts.findById(fromId)
            .orElseThrow(() -> new AccountNotFoundException(fromId));
        Account to = accounts.findById(toId)
            .orElseThrow(() -> new AccountNotFoundException(toId));

        // Perform the transfer
        from.withdraw(amount);
        to.deposit(amount);

        // Save the updated state
        accounts.save(from);
        accounts.save(to);

        // Log the transfer
        logger.logTransfer(fromId, toId, amount);
    }
}
```

## Best Practices & Guidelines 🎯

### Rich Domain Models

Always favor rich domain models over anemic ones. Here's an example:

```java
// Anemic domain model - avoid this!
public class Customer {
    private CustomerId id;
    private String name;
    private CustomerStatus status;
    private List<Order> orders;

    // Only getters and setters, no business logic
    public void setStatus(CustomerStatus status) {
        this.status = status;
    }
}

// Rich domain model - prefer this!
public class Customer {
    private final CustomerId id;
    private CustomerProfile profile;
    private CustomerStatus status;
    private List<Order> orders;

    public void placeOrder(Order order) {
        validateCanPlaceOrder(order);
        
        orders.add(order);
        updateCustomerStatus();
        
        DomainEvents.publish(new OrderPlacedEvent(id, order));
    }

    private void validateCanPlaceOrder(Order order) {
        if (status == CustomerStatus.BLACKLISTED) {
            throw new DomainException("Blacklisted customers cannot place orders");
        }
        
        if (hasOutstandingBalance() && order.getTotal().isGreaterThan(Money.of(100))) {
            throw new DomainException("Customers with outstanding balance cannot place large orders");
        }
    }

    private void updateCustomerStatus() {
        if (orders.size() >= 10) {
            status = CustomerStatus.PREFERRED;
        }
    }
}
```

### Invariant Enforcement

Always enforce domain invariants at the domain model level:

```java
public class Product {
    private final ProductId id;
    private String name;
    private Money price;
    private int stockLevel;
    private int reorderPoint;

    public void adjustPrice(Money newPrice) {
        validatePriceChange(newPrice);
        this.price = newPrice;
    }

    public void removeFromStock(int quantity) {
        if (quantity > stockLevel) {
            throw new InsufficientStockException(id, quantity, stockLevel);
        }
        
        stockLevel -= quantity;
        
        if (stockLevel <= reorderPoint) {
            DomainEvents.publish(new StockLevelBelowReorderPointEvent(id));
        }
    }

    private void validatePriceChange(Money newPrice) {
        if (newPrice.isLessThanOrEqualTo(Money.zero(newPrice.getCurrency()))) {
            throw new DomainException("Product price must be positive");
        }
        
        if (newPrice.isGreaterThan(this.price.multiply(2))) {
            throw new DomainException("Price increase cannot be more than 100%");
        }
    }
}
```

## Testing Domain Models 🧪

Domain models should be thoroughly tested to ensure they correctly implement business rules:

```java
public class OrderTest {
    private Order order;
    private Product product;

    @BeforeEach
    void setUp() {
        order = new Order(CustomerId.generate());
        product = new Product("Test Product", Money.of(10.00));
    }

    @Test
    void shouldNotAllowEmptyOrderSubmission() {
        // When trying to submit an empty order
        assertThrows(DomainException.class, () -> {
            order.submit();
        });
    }

    @Test
    void shouldCalculateTotalCorrectly() {
        // Given an order with multiple items
        order.addProduct(product, 2);
        order.addProduct(new Product("Another Product", Money.of(20.00)), 1);

        // When calculating the total
        Money total = order.getTotalAmount();

        // Then it should equal the sum of all items
        assertEquals(Money.of(40.00), total);
    }

    @Test
    void shouldNotAllowModificationAfterSubmission() {
        // Given a submitted order
        order.addProduct(product, 1);
        order.submit();

        // When trying to modify it
        assertThrows(DomainException.class, () -> {
            order.addProduct(product, 1);
        });
    }
}
```

## Real-world Use Cases 🌍

### E-commerce Order Processing

Here's how domain models work together in a real e-commerce system:

```java
public class OrderProcessor {
    public void processOrder(Order order) {
        // Validate inventory
        inventoryService.validateStock(order.getItems());

        // Calculate shipping
        ShippingRate rate = shippingService.calculateRate(
            order.getShippingAddress(),
            order.getTotalWeight()
        );

        // Apply discounts
        DiscountService.applyDiscounts(order);

        // Process payment
        paymentService.processPayment(
            order.getCustomerId(),
            order.getTotalAmount()
        );

        // Submit order
        order.submit();
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design Distilled" by Vaughn Vernon

Community resources:
- DDD Community Discord
- Domain-Driven Design Weekly Newsletter
- Example repositories on GitHub

Remember that domain models are at the heart of Domain-Driven Design. They capture the essential business concepts and rules in a way that both technical and domain experts can understand and validate. Through careful modeling and constant refinement based on new insights, domain models help create software that truly serves the business needs.