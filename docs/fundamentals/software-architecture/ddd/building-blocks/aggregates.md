---
sidebar_position: 3
title: "DDD Aggregates"
description: "DDD Aggregates"
---
# Aggregates in Domain-Driven Design 🎯

## Overview and Problem Statement

As domain models grow in complexity, maintaining consistency between related objects becomes increasingly challenging. Without clear boundaries and rules for object modification, systems can end up in inconsistent states, leading to data corruption and business rule violations.

Aggregates solve this problem by defining clear boundaries around related objects, treating them as a single unit for data changes. An aggregate is a cluster of domain objects that can be treated as a single unit, with one entity designated as the aggregate root. The aggregate root enforces invariants for all objects within its boundary and serves as the only entry point for modifications to any objects within the aggregate.

The business impact of properly implementing aggregates includes:
- Guaranteed data consistency within business rule boundaries
- Clearer modification paths that prevent invalid states
- Simplified business logic by grouping related behaviors
- Better scalability through well-defined transaction boundaries
- Reduced bugs from inconsistent object modifications

## Core Concepts and Implementation 🏗️

Let's explore how to implement aggregates effectively, starting with a classic example - an Order aggregate:

```java
public class Order {
    private final OrderId id;
    private CustomerId customerId;
    private OrderStatus status;
    private final List<OrderLine> orderLines;
    private ShippingAddress shippingAddress;
    private Money totalAmount;
    
    // Constructor ensures valid initial state
    public Order(OrderId id, CustomerId customerId, ShippingAddress shippingAddress) {
        this.id = Objects.requireNonNull(id, "Order ID cannot be null");
        this.customerId = Objects.requireNonNull(customerId, "Customer ID cannot be null");
        this.shippingAddress = Objects.requireNonNull(shippingAddress, "Shipping address cannot be null");
        this.orderLines = new ArrayList<>();
        this.status = OrderStatus.DRAFT;
        this.totalAmount = Money.zero(Currency.getInstance("USD"));
    }
    
    // Public methods enforce invariants
    public void addOrderLine(Product product, Quantity quantity) {
        // Validate business rules
        validateOrderCanBeModified();
        validateProduct(product);
        validateQuantity(quantity);
        
        // Create and add the order line
        OrderLine line = new OrderLine(this, product.getId(), quantity, product.getPrice());
        orderLines.add(line);
        
        // Maintain aggregate consistency
        recalculateTotal();
    }
    
    public void removeOrderLine(OrderLine line) {
        validateOrderCanBeModified();
        
        orderLines.remove(line);
        recalculateTotal();
    }
    
    public void submit() {
        validateCanSubmit();
        
        this.status = OrderStatus.SUBMITTED;
        addDomainEvent(new OrderSubmittedEvent(this.id));
    }
    
    // Private methods handle internal consistency
    private void validateOrderCanBeModified() {
        if (status != OrderStatus.DRAFT) {
            throw new OrderModificationException(
                "Only draft orders can be modified"
            );
        }
    }
    
    private void validateCanSubmit() {
        if (status != OrderStatus.DRAFT) {
            throw new InvalidOrderStateException(
                "Only draft orders can be submitted"
            );
        }
        
        if (orderLines.isEmpty()) {
            throw new InvalidOrderStateException(
                "Cannot submit empty order"
            );
        }
    }
    
    private void recalculateTotal() {
        this.totalAmount = orderLines.stream()
            .map(OrderLine::getLineTotal)
            .reduce(Money.zero(Currency.getInstance("USD")), Money::add);
    }
    
    // OrderLine is contained within the Order aggregate
    public class OrderLine {
        private final OrderLineId id;
        private final ProductId productId;
        private Quantity quantity;
        private Money unitPrice;
        private final Order order;  // Back reference to aggregate root
        
        private OrderLine(Order order, ProductId productId, Quantity quantity, Money unitPrice) {
            this.id = OrderLineId.generate();
            this.order = order;
            this.productId = productId;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
        
        public Money getLineTotal() {
            return unitPrice.multiply(quantity.getValue());
        }
        
        // Changes must go through aggregate root
        void updateQuantity(Quantity newQuantity) {
            this.quantity = newQuantity;
        }
    }
}
```

Let's look at another example - a Customer aggregate that manages the lifecycle of addresses and contact information:

```java
public class Customer {
    private final CustomerId id;
    private CustomerProfile profile;
    private final Set<Address> addresses;
    private final Set<ContactMethod> contactMethods;
    private CustomerStatus status;
    
    public void addAddress(Address address) {
        validateNewAddress(address);
        
        if (address.isDefault()) {
            // Maintain invariant: only one default address
            addresses.stream()
                .filter(Address::isDefault)
                .forEach(a -> a.setDefault(false));
        }
        
        addresses.add(address);
        addDomainEvent(new CustomerAddressAddedEvent(this.id, address));
    }
    
    public void setDefaultAddress(AddressId addressId) {
        Address newDefault = findAddress(addressId);
        
        // Maintain invariant: only one default address
        addresses.stream()
            .filter(Address::isDefault)
            .forEach(a -> a.setDefault(false));
            
        newDefault.setDefault(true);
    }
    
    public void addContactMethod(ContactMethod contactMethod) {
        validateContactMethod(contactMethod);
        
        if (contactMethod.isPrimary()) {
            ContactMethod.Type type = contactMethod.getType();
            // Maintain invariant: only one primary contact per type
            contactMethods.stream()
                .filter(cm -> cm.getType() == type && cm.isPrimary())
                .forEach(cm -> cm.setPrimary(false));
        }
        
        contactMethods.add(contactMethod);
    }
    
    private void validateNewAddress(Address address) {
        if (addresses.size() >= 5) {
            throw new TooManyAddressesException(
                "Customer cannot have more than 5 addresses"
            );
        }
        
        // Validate address doesn't already exist
        if (addresses.stream().anyMatch(a -> a.equals(address))) {
            throw new DuplicateAddressException(
                "This address is already registered"
            );
        }
    }
}
```

## Aggregate Design Principles 🎯

### 1. Choose Aggregate Boundaries

Aggregates should be designed around true invariants. Here's an example showing why an Order and its Payment should be separate aggregates:

```java
// Wrong: Payment as part of Order aggregate
public class Order {
    private List<Payment> payments;  // Don't do this!
    
    public void addPayment(Payment payment) {
        payments.add(payment);
        recalculateBalance();
    }
}

// Correct: Payment as separate aggregate
public class Payment {
    private final PaymentId id;
    private final OrderId orderId;  // Reference to Order
    private final Money amount;
    private PaymentStatus status;
    
    public void process() {
        // Payment has its own lifecycle and consistency rules
        validatePaymentCanBeProcessed();
        // Process payment logic
        this.status = PaymentStatus.PROCESSED;
        addDomainEvent(new PaymentProcessedEvent(this.id));
    }
}
```

### 2. Maintain Consistency

Ensure all modifications maintain aggregate consistency:

```java
public class ShoppingCart {
    private final CartId id;
    private CustomerId customerId;
    private final List<CartItem> items;
    private Money totalAmount;
    private int itemCount;
    
    public void addItem(Product product, Quantity quantity) {
        validateProductCanBeAdded(product, quantity);
        
        CartItem item = new CartItem(product.getId(), quantity, product.getPrice());
        items.add(item);
        
        // Maintain aggregate consistency
        updateTotals();
    }
    
    private void updateTotals() {
        this.totalAmount = items.stream()
            .map(CartItem::getLineTotal)
            .reduce(Money.zero(Currency.getInstance("USD")), Money::add);
            
        this.itemCount = items.stream()
            .mapToInt(item -> item.getQuantity().getValue())
            .sum();
    }
    
    private void validateProductCanBeAdded(Product product, Quantity quantity) {
        int newItemCount = itemCount + quantity.getValue();
        if (newItemCount > 100) {
            throw new CartLimitExceededException(
                "Cart cannot contain more than 100 items"
            );
        }
    }
}
```

### 3. Reference Other Aggregates by Identity

When referencing other aggregates, only store their identity:

```java
public class Order {
    private final OrderId id;
    private final CustomerId customerId;  // Reference to Customer aggregate
    private final List<OrderLine> orderLines;
    
    public class OrderLine {
        private final ProductId productId;  // Reference to Product aggregate
        private Quantity quantity;
        private Money unitPrice;
    }
}
```

## Testing Aggregates 🧪

Aggregates should be thoroughly tested to ensure they maintain consistency:

```java
class OrderTest {
    private Order order;
    private Product product;
    
    @BeforeEach
    void setUp() {
        order = new Order(
            OrderId.generate(),
            CustomerId.generate(),
            new ShippingAddress("123 Main St")
        );
        product = new Product(
            ProductId.generate(),
            "Test Product",
            Money.of(10.00)
        );
    }
    
    @Test
    void shouldMaintainTotalWhenAddingItems() {
        // When
        order.addOrderLine(product, new Quantity(2));
        
        // Then
        assertEquals(Money.of(20.00), order.getTotalAmount());
    }
    
    @Test
    void shouldPreventModificationOfSubmittedOrder() {
        // Given
        order.addOrderLine(product, new Quantity(1));
        order.submit();
        
        // When/Then
        assertThrows(OrderModificationException.class, () -> {
            order.addOrderLine(product, new Quantity(1));
        });
    }
    
    @Test
    void shouldEnforceBusinessRules() {
        // When/Then
        assertThrows(InvalidOrderStateException.class, () -> {
            order.submit(); // Empty order cannot be submitted
        });
    }
}
```

## Real-world Use Cases 🌍

### E-commerce System

Here's how aggregates work together in a complete e-commerce system:

```java
public class OrderProcessor {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PaymentService paymentService;
    
    @Transactional
    public OrderResult processOrder(OrderId orderId) {
        // Load aggregates
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
            
        Customer customer = customerRepository.findById(order.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(order.getCustomerId()));
            
        // Validate business rules across aggregates
        if (!customer.canPlaceOrders()) {
            return OrderResult.rejected("Customer account is suspended");
        }
        
        // Process the order
        try {
            // Create payment (separate aggregate)
            Payment payment = paymentService.createPayment(
                order.getId(),
                order.getTotalAmount()
            );
            
            // Process payment
            PaymentResult paymentResult = paymentService.processPayment(payment);
            if (paymentResult.isSuccessful()) {
                order.markAsPaid();
                orderRepository.save(order);
                return OrderResult.success();
            } else {
                return OrderResult.rejected(paymentResult.getFailureReason());
            }
        } catch (Exception e) {
            return OrderResult.failed("Order processing failed: " + e.getMessage());
        }
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Aggregates)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Effective Aggregate Design" by Vaughn Vernon

Community resources:
- DDD Community Discord
- Aggregate Pattern Repository
- Domain-Driven Design Weekly Newsletter

Aggregates are one of the most crucial building blocks in Domain-Driven Design, as they ensure consistency in complex domain models while providing clear boundaries for transactions and concurrent modifications. Well-designed aggregates protect business rules, simplify the domain model, and make systems more maintainable and scalable.