---
sidebar_position: 5
title: "DDD Domain Events"
description: "DDD Domain Events"
---

# Domain Events in Domain-Driven Design 📢

## Overview and Problem Statement

In complex business systems, important things happen that other parts of the system need to know about. For example, when an order is placed, the inventory system needs to reserve stock, the shipping system needs to plan delivery, and the notification system needs to email the customer. Without a proper way to handle these notifications, we often end up with tightly coupled components and scattered, hard-to-maintain code.

Domain Events solve this problem by capturing these important business occurrences as first-class objects in our domain model. They represent something meaningful that has happened in the domain, allowing different parts of the system to react to these events in a decoupled way. Think of them as announcements that say "Hey, this important thing just happened!" to anyone who might be interested.

The business impact of properly implementing domain events includes:
- Looser coupling between different parts of the system
- Better audit trails of business activities
- Easier implementation of business processes that span multiple bounded contexts
- More scalable and maintainable systems
- Clearer representation of business workflows

## Core Concepts and Implementation 🏗️

Let's explore how to implement domain events effectively, starting with a typical event in an e-commerce system:

```java
public class OrderPlacedEvent implements DomainEvent {
    private final OrderId orderId;
    private final CustomerId customerId;
    private final Money totalAmount;
    private final LocalDateTime occurredOn;
    private final List<OrderLineItem> items;
    private final ShippingAddress shippingAddress;
    
    public OrderPlacedEvent(Order order) {
        // Capture all relevant information at the time the event occurred
        this.orderId = order.getId();
        this.customerId = order.getCustomerId();
        this.totalAmount = order.getTotalAmount();
        this.occurredOn = LocalDateTime.now();
        this.items = order.getOrderLines()
            .stream()
            .map(OrderLineItem::from)
            .collect(toList());
        this.shippingAddress = order.getShippingAddress();
    }
    
    // Events should be immutable - provide only getters
    public OrderId getOrderId() {
        return orderId;
    }
    
    // Value object to represent event data
    @Value
    public static class OrderLineItem {
        ProductId productId;
        int quantity;
        Money unitPrice;
        
        public static OrderLineItem from(Order.OrderLine line) {
            return new OrderLineItem(
                line.getProductId(),
                line.getQuantity(),
                line.getUnitPrice()
            );
        }
    }
}
```

Now let's look at how to publish and handle these events:

```java
public class Order {
    private final OrderId id;
    private OrderStatus status;
    private final List<OrderLine> orderLines;
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    
    public void place() {
        validateCanBePlaced();
        this.status = OrderStatus.PLACED;
        
        // Record that this significant thing happened
        domainEvents.add(new OrderPlacedEvent(this));
    }
    
    public void cancel(String reason) {
        validateCanBeCancelled();
        this.status = OrderStatus.CANCELLED;
        
        // Record the cancellation event
        domainEvents.add(new OrderCancelledEvent(this.id, reason));
    }
    
    // Allow infrastructure to collect events
    public List<DomainEvent> getDomainEvents() {
        return new ArrayList<>(domainEvents);
    }
    
    public void clearDomainEvents() {
        domainEvents.clear();
    }
}

// Event handling infrastructure
public class DomainEventPublisher {
    private final List<DomainEventHandler<?>> handlers = new ArrayList<>();
    
    public <T extends DomainEvent> void subscribe(
            Class<T> eventType,
            DomainEventHandler<T> handler) {
        handlers.add(handler);
    }
    
    public void publish(DomainEvent event) {
        handlers.stream()
            .filter(handler -> handler.canHandle(event))
            .forEach(handler -> handler.handle(event));
    }
}

// Event handlers for different concerns
@Component
public class InventoryHandler implements DomainEventHandler<OrderPlacedEvent> {
    private final InventoryService inventoryService;
    
    @Override
    public void handle(OrderPlacedEvent event) {
        // Reserve inventory for the order
        for (OrderLineItem item : event.getItems()) {
            inventoryService.reserveStock(
                item.getProductId(),
                item.getQuantity()
            );
        }
    }
}

@Component
public class NotificationHandler implements DomainEventHandler<OrderPlacedEvent> {
    private final EmailService emailService;
    
    @Override
    public void handle(OrderPlacedEvent event) {
        // Send order confirmation email
        emailService.sendOrderConfirmation(
            event.getCustomerId(),
            event.getOrderId(),
            event.getTotalAmount()
        );
    }
}
```

Let's examine a more complex example involving event sourcing:

```java
public class ShoppingCart {
    private CartId id;
    private CartStatus status;
    private List<CartItem> items;
    private List<DomainEvent> changes = new ArrayList<>();
    
    // Event sourcing - rebuild state from events
    public static ShoppingCart reconstitute(List<DomainEvent> events) {
        ShoppingCart cart = new ShoppingCart();
        events.forEach(cart::apply);
        return cart;
    }
    
    public void addItem(Product product, int quantity) {
        validateCanModify();
        
        CartItemAddedEvent event = new CartItemAddedEvent(
            this.id,
            product.getId(),
            quantity,
            LocalDateTime.now()
        );
        
        apply(event);
        changes.add(event);
    }
    
    private void apply(DomainEvent event) {
        if (event instanceof CartItemAddedEvent) {
            applyItemAdded((CartItemAddedEvent) event);
        } else if (event instanceof CartCheckedOutEvent) {
            applyCheckedOut((CartCheckedOutEvent) event);
        }
        // ... handle other event types
    }
    
    private void applyItemAdded(CartItemAddedEvent event) {
        CartItem existing = findItem(event.getProductId());
        if (existing != null) {
            existing.increaseQuantity(event.getQuantity());
        } else {
            items.add(new CartItem(
                event.getProductId(),
                event.getQuantity()
            ));
        }
    }
}
```

## Best Practices & Guidelines 🎯

### 1. Event Design

Events should be named in the past tense and capture the complete state needed:

```java
public class CustomerRegisteredEvent implements DomainEvent {
    private final CustomerId customerId;
    private final LocalDateTime registeredAt;
    private final String email;
    private final CustomerProfile profile;
    private final String registrationSource;
    
    // Constructor captures complete snapshot
    public CustomerRegisteredEvent(
            Customer customer,
            String registrationSource) {
        this.customerId = customer.getId();
        this.registeredAt = LocalDateTime.now();
        this.email = customer.getEmail();
        this.profile = customer.getProfile();
        this.registrationSource = registrationSource;
    }
}
```

### 2. Event Handling

Implement handlers that focus on single responsibilities:

```java
public class LoyaltyProgramHandler 
        implements DomainEventHandler<OrderCompletedEvent> {
    private final LoyaltyService loyaltyService;
    
    @Override
    public void handle(OrderCompletedEvent event) {
        // Calculate and award loyalty points
        int points = calculateLoyaltyPoints(event.getTotalAmount());
        loyaltyService.awardPoints(
            event.getCustomerId(),
            points,
            "Order " + event.getOrderId()
        );
    }
    
    private int calculateLoyaltyPoints(Money amount) {
        return amount.getAmount()
            .divide(BigDecimal.TEN, RoundingMode.FLOOR)
            .intValue();
    }
}
```

### 3. Event Publishing

Ensure reliable event publishing:

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    
    @Transactional
    public void placeOrder(Order order) {
        // Execute the domain logic
        order.place();
        
        // Save the order
        orderRepository.save(order);
        
        // Publish events after successful save
        order.getDomainEvents().forEach(eventPublisher::publish);
        order.clearDomainEvents();
    }
}
```

## Testing Domain Events 🧪

Test both event generation and handling:

```java
class OrderTest {
    private Order order;
    
    @BeforeEach
    void setUp() {
        order = new Order(CustomerId.generate());
    }
    
    @Test
    void shouldPublishOrderPlacedEvent() {
        // Given
        order.addItem(new Product("Test Product"), 1);
        
        // When
        order.place();
        
        // Then
        List<DomainEvent> events = order.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof OrderPlacedEvent);
        
        OrderPlacedEvent event = (OrderPlacedEvent) events.get(0);
        assertEquals(order.getId(), event.getOrderId());
    }
}

class InventoryHandlerTest {
    @Mock
    private InventoryService inventoryService;
    
    private InventoryHandler handler;
    
    @BeforeEach
    void setUp() {
        handler = new InventoryHandler(inventoryService);
    }
    
    @Test
    void shouldReserveInventoryForOrder() {
        // Given
        OrderPlacedEvent event = createTestEvent();
        
        // When
        handler.handle(event);
        
        // Then
        verify(inventoryService).reserveStock(
            event.getItems().get(0).getProductId(),
            event.getItems().get(0).getQuantity()
        );
    }
}
```

## Real-world Use Cases 🌍

Here's how domain events enable complex business processes:

```java
public class OrderProcessor {
    @Transactional
    public void processOrder(Order order) {
        try {
            // Execute primary business logic
            order.place();
            orderRepository.save(order);
            
            // Publish events for side effects
            DomainEvent orderPlacedEvent = new OrderPlacedEvent(order);
            eventPublisher.publish(orderPlacedEvent);
            
        } catch (Exception e) {
            // Publish failure event
            eventPublisher.publish(new OrderFailedEvent(
                order.getId(),
                e.getMessage()
            ));
            throw e;
        }
    }
}

// Different bounded contexts handle the event
public class InventoryContext {
    @EventHandler
    public void on(OrderPlacedEvent event) {
        // Reserve inventory
        try {
            inventoryService.reserveInventory(event.getItems());
            eventPublisher.publish(new InventoryReservedEvent(
                event.getOrderId(),
                event.getItems()
            ));
        } catch (InsufficientInventoryException e) {
            eventPublisher.publish(new InventoryReservationFailedEvent(
                event.getOrderId(),
                e.getMessage()
            ));
        }
    }
}

public class ShippingContext {
    @EventHandler
    public void on(OrderPlacedEvent event) {
        // Plan delivery
        DeliverySchedule schedule = planDelivery(event);
        eventPublisher.publish(new DeliveryScheduledEvent(
            event.getOrderId(),
            schedule
        ));
    }
}

public class NotificationContext {
    @EventHandler
    public void on(OrderPlacedEvent event) {
        // Send confirmation
        notificationService.sendOrderConfirmation(event);
    }
    
    @EventHandler
    public void on(InventoryReservationFailedEvent event) {
        // Send out-of-stock notification
        notificationService.sendOutOfStockNotification(event);
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Domain Events)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Event-Driven Architecture" by Vaughn Vernon

Community resources:
- DDD Community Discord
- Event Storming Community
- Domain-Driven Design Weekly Newsletter

Domain Events are a powerful tool for modeling complex business processes and maintaining loose coupling between different parts of a system. When used effectively, they enable scalable, maintainable applications that accurately reflect business workflows and requirements. Remember that events should capture meaningful business occurrences and include all the information that downstream consumers might need.