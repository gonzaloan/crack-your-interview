---
sidebar_position: 1
title: "DDD Entities"
description: "DDD Entities"
---
# Entities in Domain-Driven Design 🎯

## Overview and Problem Statement

When modeling real-world business domains, we often need to track objects that maintain their identity even as their attributes change over time. Think of a person who changes their name and address but remains the same individual, or a bank account that keeps its account number even as its balance fluctuates.

Traditional data-centric approaches often fail to capture this concept of identity, leading to bugs and confusion when the same "thing" exists in multiple states or versions. Entities in Domain-Driven Design solve this problem by focusing on object identity rather than attributes, ensuring that business objects maintain their continuity and integrity throughout their lifecycle.

The business impact of properly implementing entities includes:
- Accurate tracking of business objects across time and state changes
- Reduced data inconsistencies and reconciliation issues
- Better alignment with how business stakeholders think about their domain
- Improved data integrity and audit capabilities
- More reliable business operations and reporting

## Core Concepts and Implementation 🏗️

Let's explore how to implement entities effectively, starting with a fundamental example:

```java
public class Customer {
    private final CustomerId id;  // Identity field
    private CustomerProfile profile;  // Mutable attributes
    private CustomerStatus status;
    private List<Order> orders;
    
    // Constructor ensures identity is set
    public Customer(CustomerId id, CustomerProfile profile) {
        // Guard against null identity
        this.id = Objects.requireNonNull(id, "Customer ID cannot be null");
        this.profile = Objects.requireNonNull(profile, "Customer profile cannot be null");
        this.status = CustomerStatus.NEW;
        this.orders = new ArrayList<>();
    }
    
    // Identity-based equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return id.equals(customer.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    // Business behavior that modifies state
    public void updateProfile(CustomerProfile newProfile) {
        this.profile = Objects.requireNonNull(newProfile, "New profile cannot be null");
        // Might publish a domain event here
    }
    
    public void placeOrder(Order order) {
        validateOrderPlacement(order);
        orders.add(order);
        updateCustomerStatus();
    }
    
    private void validateOrderPlacement(Order order) {
        if (status == CustomerStatus.BLACKLISTED) {
            throw new OrderPlacementException("Blacklisted customers cannot place orders");
        }
    }
    
    private void updateCustomerStatus() {
        if (calculateTotalOrderValue().compareTo(Money.of(1000)) > 0) {
            status = CustomerStatus.PREMIUM;
        }
    }
}
```

Let's analyze the key aspects of this implementation:

### Identity Implementation

The identity of an entity should be:
1. Immutable
2. Unique within the system
3. Persistent throughout the entity's lifecycle

Here's how to implement identity properly:

```java
public final class CustomerId {
    private final UUID value;
    
    private CustomerId(UUID value) {
        this.value = Objects.requireNonNull(value);
    }
    
    public static CustomerId generate() {
        return new CustomerId(UUID.randomUUID());
    }
    
    public static CustomerId fromString(String value) {
        return new CustomerId(UUID.fromString(value));
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
    
    // Proper equals and hashCode implementation
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerId that = (CustomerId) o;
        return value.equals(that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
```

### Life Cycle Management

Entities have a lifecycle that needs to be managed. Here's an example with an Order entity:

```java
public class Order {
    private final OrderId id;
    private OrderStatus status;
    private final List<OrderLine> lines;
    private final CustomerId customerId;
    private Money totalAmount;
    
    // Factory method for creating new orders
    public static Order create(CustomerId customerId) {
        Order order = new Order(OrderId.generate(), customerId);
        order.addDomainEvent(new OrderCreatedEvent(order.getId()));
        return order;
    }
    
    // State transitions with business rules
    public void submit() {
        validateCanSubmit();
        this.status = OrderStatus.SUBMITTED;
        addDomainEvent(new OrderSubmittedEvent(this.id));
    }
    
    public void cancel(String reason) {
        validateCanCancel();
        this.status = OrderStatus.CANCELLED;
        addDomainEvent(new OrderCancelledEvent(this.id, reason));
    }
    
    private void validateCanSubmit() {
        if (status != OrderStatus.DRAFT) {
            throw new InvalidOrderStateException("Only draft orders can be submitted");
        }
        if (lines.isEmpty()) {
            throw new InvalidOrderStateException("Cannot submit empty order");
        }
    }
    
    private void validateCanCancel() {
        if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cannot cancel order in state: " + status);
        }
    }
}
```

### Entity Relationships

Entities often relate to other entities. Here's how to manage these relationships:

```java
public class OrderLine {
    private final OrderLineId id;
    private final ProductId productId;
    private Quantity quantity;
    private Money unitPrice;
    private final OrderId orderId;  // Back reference to parent
    
    public OrderLine(OrderId orderId, ProductId productId, Quantity quantity, Money unitPrice) {
        this.id = OrderLineId.generate();
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    public Money calculateTotal() {
        return unitPrice.multiply(quantity.getValue());
    }
    
    public void updateQuantity(Quantity newQuantity) {
        // Validate business rules
        if (newQuantity.getValue() <= 0) {
            throw new InvalidQuantityException("Quantity must be positive");
        }
        this.quantity = newQuantity;
    }
}
```

## Best Practices & Guidelines 🎯

### 1. Identity Generation

Choose the right identity generation strategy:

```java
public abstract class EntityId {
    // Natural key example
    public static OrderId fromPurchaseOrder(String purchaseOrderNumber) {
        return new OrderId("PO-" + purchaseOrderNumber);
    }
    
    // Synthetic key example
    public static CustomerId generate() {
        return new CustomerId(UUID.randomUUID());
    }
    
    // Sequential key example
    public static InvoiceId nextInvoiceNumber(String prefix, int sequence) {
        return new InvoiceId(prefix + "-" + String.format("%06d", sequence));
    }
}
```

### 2. State Management

Implement clear state transitions:

```java
public class Invoice {
    private final InvoiceId id;
    private InvoiceStatus status;
    private Money totalAmount;
    private LocalDate dueDate;
    
    public void markAsPaid(Payment payment) {
        validatePayment(payment);
        
        if (status != InvoiceStatus.PENDING) {
            throw new InvalidInvoiceStateException("Only pending invoices can be marked as paid");
        }
        
        this.status = InvoiceStatus.PAID;
        addDomainEvent(new InvoicePaidEvent(this.id, payment.getId()));
    }
    
    private void validatePayment(Payment payment) {
        if (!payment.getAmount().equals(this.totalAmount)) {
            throw new InvalidPaymentException("Payment amount must match invoice total");
        }
    }
}
```

### 3. Validation and Invariants

Protect entity invariants:

```java
public class BankAccount {
    private final BankAccountId id;
    private Money balance;
    private AccountStatus status;
    
    public void withdraw(Money amount) {
        validateWithdrawal(amount);
        
        this.balance = this.balance.subtract(amount);
        
        if (balance.isLessThan(Money.ZERO)) {
            status = AccountStatus.OVERDRAWN;
            addDomainEvent(new AccountOverdrawnEvent(this.id, balance));
        }
    }
    
    private void validateWithdrawal(Money amount) {
        if (status == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Cannot withdraw from frozen account");
        }
        
        if (amount.isLessThanOrEqualTo(Money.ZERO)) {
            throw new InvalidAmountException("Withdrawal amount must be positive");
        }
        
        if (balance.subtract(amount).isLessThan(Money.of(-1000))) {
            throw new InsufficientFundsException("Withdrawal would exceed overdraft limit");
        }
    }
}
```

## Testing Entities 🧪

Entities should be thoroughly tested:

```java
class CustomerTest {
    private Customer customer;
    private CustomerId id;
    
    @BeforeEach
    void setUp() {
        id = CustomerId.generate();
        customer = new Customer(id, new CustomerProfile("John Doe"));
    }
    
    @Test
    void shouldMaintainIdentityWhenAttributesChange() {
        // Given
        Customer sameCustomer = new Customer(id, new CustomerProfile("Jane Doe"));
        
        // When/Then
        assertEquals(customer, sameCustomer);
        assertEquals(customer.hashCode(), sameCustomer.hashCode());
    }
    
    @Test
    void shouldPreventInvalidStateTransitions() {
        // Given
        customer.blacklist("Fraud detected");
        
        // When/Then
        assertThrows(OrderPlacementException.class, () -> {
            customer.placeOrder(new Order());
        });
    }
    
    @Test
    void shouldUpgradeStatusBasedOnOrders() {
        // Given
        Order bigOrder = new Order();
        bigOrder.addItem(new Product("Premium Item"), Money.of(1500));
        
        // When
        customer.placeOrder(bigOrder);
        
        // Then
        assertEquals(CustomerStatus.PREMIUM, customer.getStatus());
    }
}
```

## Real-world Use Cases 🌍

### E-commerce System

Here's how entities work together in an e-commerce system:

```java
public class OrderProcessor {
    public void processOrder(Order order) {
        // Load related entities
        Customer customer = customerRepository.findById(order.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(order.getCustomerId()));
            
        // Validate business rules
        customer.validateCanPlaceOrder(order);
        
        // Process the order
        order.submit();
        customer.addOrder(order);
        
        // Update inventory
        for (OrderLine line : order.getLines()) {
            Product product = productRepository.findById(line.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(line.getProductId()));
                
            product.reduceStock(line.getQuantity());
        }
        
        // Save updated entities
        orderRepository.save(order);
        customerRepository.save(customer);
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Entities)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Patterns, Principles, and Practices of Domain-Driven Design" by Scott Millett

The effective implementation of entities is crucial for maintaining data integrity and accurately representing business concepts in your domain model. Remember that entities are defined by their identity and continuity, and their implementation should reflect this fundamental characteristic while enforcing business rules and maintaining invariants.