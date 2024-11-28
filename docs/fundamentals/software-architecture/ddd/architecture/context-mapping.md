---
sidebar_position: 2
title: "DDD Context Mapping"
description: "DDD Context Mapping"
---
# Context Mapping in Domain-Driven Design 🗺️

## Overview and Problem Statement

In real-world software systems, different parts of the application often need to work together while maintaining their own distinct models and languages. For example, a shipping system might view an order very differently from how the sales system sees it. Without a clear way to manage these relationships, teams end up with confusing integrations and brittle dependencies.

Context Mapping addresses this challenge by explicitly documenting and managing the relationships between different bounded contexts in a system. Think of it as creating a map that shows how different territories (bounded contexts) in your software landscape relate to and interact with each other. This map helps teams understand their responsibilities, dependencies, and integration patterns.

The business impact of effective context mapping includes:
- Clearer team boundaries and responsibilities
- More maintainable integrations between systems
- Better understanding of system dependencies
- Reduced communication overhead between teams
- More flexible and evolvable system architecture

## Core Concepts and Implementation 🏗️

Let's explore how to implement context mapping patterns effectively, starting with a common relationship between Sales and Shipping contexts:

```java
// Sales Context - Upstream
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> orderLines;
    private OrderStatus status;
    
    public ShippingOrder translateToShipping() {
        // Translate to downstream context's model
        return new ShippingOrder(
            this.id.toString(),
            this.getDeliveryAddress(),
            this.orderLines.stream()
                .map(this::toShippingItem)
                .collect(toList())
        );
    }
    
    private ShippingItem toShippingItem(OrderLine line) {
        return new ShippingItem(
            line.getProductId().toString(),
            line.getQuantity(),
            line.getProduct().getWeight(),
            line.getProduct().getDimensions()
        );
    }
}

// Shipping Context - Downstream
public class ShippingOrder {
    private final String orderReference;
    private final DeliveryAddress address;
    private final List<ShippingItem> items;
    private ShippingStatus status;
    
    public void schedule() {
        // Shipping context's own logic
        validateDeliveryAddress();
        calculateOptimalRoute();
        assignToCarrier();
        this.status = ShippingStatus.SCHEDULED;
    }
}

// Anti-corruption Layer
public class ShippingOrderTranslator {
    public ShippingOrder translateFromSales(Order salesOrder) {
        // Protect shipping context from sales context changes
        return new ShippingOrder(
            createOrderReference(salesOrder),
            translateAddress(salesOrder.getDeliveryAddress()),
            translateItems(salesOrder.getOrderLines())
        );
    }
    
    private DeliveryAddress translateAddress(SalesAddress address) {
        return new DeliveryAddress(
            address.getStreetLine1(),
            address.getStreetLine2(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            translateCountryCode(address.getCountry())
        );
    }
    
    private String translateCountryCode(Country salesCountry) {
        // Convert from sales context's country format to shipping's
        return countryCodeMapper.toShippingFormat(salesCountry);
    }
}
```

Let's examine another common pattern - the Conformist relationship between Analytics and Sales contexts:

```java
// Sales Context - Upstream
public class OrderCompleted {
    private final OrderId orderId;
    private final CustomerId customerId;
    private final Money totalAmount;
    private final LocalDateTime completedAt;
    private final List<OrderLineItem> items;
    
    // This event format dictates how downstream contexts will see the data
    public record OrderLineItem(
        String productId,
        int quantity,
        Money unitPrice,
        Money totalPrice
    ) {}
}

// Analytics Context - Downstream (Conformist)
public class OrderAnalytics {
    private final String orderId;
    private final String customerId;
    private final BigDecimal totalAmount;
    private final LocalDateTime completedAt;
    private final List<OrderLineAnalytics> items;
    
    // Conforms exactly to upstream's model
    public record OrderLineAnalytics(
        String productId,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
    ) {}
    
    public void processForAnalytics() {
        // Analytics specific processing
        updateDailyRevenue(this.totalAmount);
        updateProductSales(this.items);
        updateCustomerMetrics(this.customerId, this.totalAmount);
    }
}
```

Now let's look at a Partnership pattern between Inventory and Shipping contexts:

```java
// Shared Kernel between partners
public interface WarehouseLocation {
    String getWarehouseId();
    GeoCoordinate getCoordinates();
    List<StorageZone> getZones();
    boolean hasCapacityFor(Volume volume);
}

// Inventory Context
public class InventoryWarehouse implements WarehouseLocation {
    private final String warehouseId;
    private final GeoCoordinate location;
    private final List<StorageZone> zones;
    private final InventoryManager inventoryManager;
    
    @Override
    public boolean hasCapacityFor(Volume volume) {
        return zones.stream()
            .filter(StorageZone::isAvailable)
            .mapToDouble(StorageZone::getAvailableVolume)
            .sum() >= volume.getValue();
    }
    
    public void allocateInventory(OrderAllocation allocation) {
        // Coordinate with shipping partner
        ShippingDock dock = shippingContext.reserveDock(
            this.warehouseId,
            allocation.getRequiredDockTime()
        );
        
        // Proceed with allocation
        inventoryManager.allocate(allocation, dock);
    }
}

// Shipping Context
public class ShippingWarehouse implements WarehouseLocation {
    private final String warehouseId;
    private final GeoCoordinate location;
    private final List<StorageZone> zones;
    private final DockManager dockManager;
    
    public void scheduleDockTime(DockingRequest request) {
        // Coordinate with inventory partner
        InventoryAllocation allocation = 
            inventoryContext.checkAllocation(
                request.getOrderId(),
                this.warehouseId
            );
        
        // Schedule dock time based on allocation
        dockManager.schedule(request, allocation);
    }
}
```

## Context Mapping Patterns 🎯

### 1. Customer-Supplier

When one context (customer) depends on another (supplier):

```java
// Supplier Context (Orders)
public interface OrderFacade {
    OrderDetails getOrder(String orderId);
    List<OrderDetails> getOrdersForCustomer(String customerId);
}

// Customer Context (Billing)
public class BillingService {
    private final OrderFacade orderFacade;
    
    public Invoice createInvoice(String orderId) {
        OrderDetails order = orderFacade.getOrder(orderId);
        return new Invoice(
            InvoiceId.generate(),
            order.getCustomerId(),
            order.getItems().stream()
                .map(this::toInvoiceLine)
                .collect(toList()),
            order.getTotalAmount()
        );
    }
}
```

### 2. Anti-corruption Layer

Protecting a context from external models:

```java
// Legacy System Integration
public class LegacyOrderTranslator {
    public ModernOrder translateFromLegacy(LegacyOrderDTO legacyOrder) {
        return new ModernOrder(
            new OrderId(legacyOrder.getOrderNumber()),
            translateCustomer(legacyOrder.getCustomerInfo()),
            translateItems(legacyOrder.getOrderItems()),
            translateStatus(legacyOrder.getStatusCode())
        );
    }
    
    private OrderStatus translateStatus(String legacyStatus) {
        return switch(legacyStatus) {
            case "N" -> OrderStatus.NEW;
            case "P" -> OrderStatus.PROCESSING;
            case "S" -> OrderStatus.SHIPPED;
            default -> throw new UnknownStatusException(legacyStatus);
        };
    }
}
```

### 3. Shared Kernel

When contexts share some common models:

```java
// Shared Kernel
public module shared.kernel {
    // Common value objects
    public record Money(BigDecimal amount, Currency currency) {}
    public record CustomerId(UUID value) {}
    public record OrderId(UUID value) {}
    
    // Shared rules
    public interface PricingRules {
        Money calculateDiscount(Money amount, CustomerType type);
        boolean isValidAmount(Money amount);
    }
}

// Usage in different contexts
public class SalesOrder {
    private final OrderId id;  // From shared kernel
    private final Money totalAmount;  // From shared kernel
    
    public void applyDiscount(CustomerType customerType) {
        this.totalAmount = pricingRules.calculateDiscount(
            totalAmount,
            customerType
        );
    }
}
```

## Testing Context Mappings 🧪

Each type of relationship needs specific testing approaches:

```java
// Testing an Anti-corruption Layer
class OrderTranslatorTest {
    private LegacyOrderTranslator translator;
    
    @Test
    void shouldProtectFromLegacyChanges() {
        // Given
        LegacyOrderDTO legacyOrder = createLegacyOrder();
        legacyOrder.setStatusCode("X");  // Invalid legacy status
        
        // When/Then
        assertThrows(UnknownStatusException.class, () -> {
            translator.translateFromLegacy(legacyOrder);
        });
    }
}

// Testing a Conformist Relationship
class AnalyticsConformanceTest {
    @Test
    void shouldConformToUpstreamModel() {
        // Given
        OrderCompleted upstreamEvent = createUpstreamEvent();
        
        // When
        OrderAnalytics analytics = OrderAnalytics.from(upstreamEvent);
        
        // Then
        assertThat(analytics.getOrderId())
            .isEqualTo(upstreamEvent.getOrderId().toString());
        assertThat(analytics.getTotalAmount())
            .isEqualTo(upstreamEvent.getTotalAmount().getAmount());
    }
}
```

## Real-world Use Cases 🌍

Here's how context mapping patterns work in a complete e-commerce system:

```java
public class OrderProcessor {
    private final OrderRepository orderRepository;
    private final InventoryFacade inventoryFacade;
    private final ShippingTranslator shippingTranslator;
    private final PaymentGateway paymentGateway;
    
    @Transactional
    public void processOrder(OrderId orderId) {
        // Load from Sales context
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // Check inventory (Customer-Supplier)
        InventoryCheckResult inventory = 
            inventoryFacade.checkAvailability(
                order.getOrderLines()
            );
            
        if (!inventory.isAvailable()) {
            throw new InsufficientInventoryException(inventory.getMissingItems());
        }
        
        // Create shipping order (Anti-corruption Layer)
        ShippingOrder shippingOrder = 
            shippingTranslator.translateFromSales(order);
            
        // Process payment (Shared Kernel)
        PaymentResult payment = paymentGateway.processPayment(
            order.getId(),  // Shared ID type
            order.getTotalAmount()  // Shared Money type
        );
        
        if (payment.isSuccessful()) {
            order.markAsPaid(payment.getTransactionId());
            orderRepository.save(order);
        }
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Context Mapping)
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Strategic Domain-Driven Design with Context Mapping" by Nick Tune

Community resources:
- DDD Community Discord
- Context Mapping Pattern Repository
- Domain-Driven Design Weekly Newsletter

Context Mapping is a crucial strategic tool in Domain-Driven Design that helps teams manage the relationships between different parts of their system. By understanding and explicitly designing these relationships, teams can create more maintainable and evolving systems that better serve their business needs. Remember that context maps should be living documents that evolve as your understanding of the domain and system relationships grows.
