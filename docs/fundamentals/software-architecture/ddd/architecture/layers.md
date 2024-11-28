---
sidebar_position: 1
title: "DDD Layers"
description: "DDD Layers"
---

# Layered Architecture in Domain-Driven Design 🏗️

## Overview and Problem Statement

Software systems often become tangled over time, with business logic mixed with technical concerns, making them difficult to maintain and evolve. For example, code handling HTTP requests might directly manipulate databases, or business rules might be scattered across UI components. This leads to rigid, fragile systems that resist change.

Layered Architecture in DDD solves this by organizing code into distinct layers, each with a specific responsibility. Think of it like a well-organized kitchen: ingredients storage (data) is separate from food preparation (business logic) which is separate from serving (presentation). Each layer focuses on what it does best while collaborating with others through clear interfaces.

The business impact of a well-structured layered architecture includes:
- Easier maintenance through separation of concerns
- More flexible systems that can adapt to changing requirements
- Better testability of business logic in isolation
- Clearer boundaries between different types of code
- Improved ability to modify one aspect without affecting others

## Core Concepts and Implementation 🏗️

Let's explore how to implement a layered architecture effectively. DDD typically uses four main layers:

1. Presentation Layer (UI/API)
2. Application Layer (Use Cases)
3. Domain Layer (Business Logic)
4. Infrastructure Layer (Technical Details)

Here's a complete example showing how these layers work together in an order processing system:

```java
// Presentation Layer - REST Controller
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderApplicationService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestBody PlaceOrderRequest request) {
        try {
            // Convert API request to application command
            PlaceOrderCommand command = new PlaceOrderCommand(
                request.getCustomerId(),
                request.getItems(),
                request.getShippingAddress()
            );
            
            // Execute use case
            OrderId orderId = orderService.placeOrder(command);
            
            // Convert domain result to API response
            return ResponseEntity.ok(new OrderResponse(orderId));
            
        } catch (CustomerNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (InvalidOrderException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse(e.getMessage())
            );
        }
    }
}

// Application Layer - Use Case Handler
@Service
public class OrderApplicationService {
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;
    
    @Transactional
    public OrderId placeOrder(PlaceOrderCommand command) {
        // Load required entities
        Customer customer = customerRepository.findById(command.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.getCustomerId()));
            
        // Create domain objects
        Order order = new Order(customer.getId());
        
        // Add items to order
        for (OrderItemRequest item : command.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(item.getProductId()));
                
            order.addItem(product, item.getQuantity());
        }
        
        // Set shipping details
        order.setShippingAddress(
            ShippingAddress.from(command.getShippingAddress())
        );
        
        // Execute domain logic
        order.place();
        
        // Persist changes
        orderRepository.save(order);
        
        // Publish domain events
        order.getDomainEvents().forEach(eventPublisher::publish);
        
        return order.getId();
    }
}

// Domain Layer - Core Business Logic
public class Order {
    private final OrderId id;
    private OrderStatus status;
    private final List<OrderLine> orderLines;
    private ShippingAddress shippingAddress;
    private final List<DomainEvent> domainEvents;
    
    public void addItem(Product product, int quantity) {
        validateCanAddItems();
        
        OrderLine line = new OrderLine(
            this,
            product.getId(),
            new Quantity(quantity),
            product.getPrice()
        );
        
        orderLines.add(line);
        recalculateTotal();
    }
    
    public void place() {
        validateCanBePlaced();
        
        this.status = OrderStatus.PLACED;
        domainEvents.add(new OrderPlacedEvent(this));
    }
    
    private void validateCanBePlaced() {
        if (orderLines.isEmpty()) {
            throw new InvalidOrderException("Order must have at least one item");
        }
        if (shippingAddress == null) {
            throw new InvalidOrderException("Shipping address is required");
        }
    }
}

// Infrastructure Layer - Technical Implementation
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final OrderJpaRepository jpaRepository;
    private final OrderMapper mapper;
    
    @Override
    public Order save(Order order) {
        // Convert domain object to JPA entity
        OrderEntity entity = mapper.toEntity(order);
        
        // Save to database
        OrderEntity saved = jpaRepository.save(entity);
        
        // Convert back to domain object
        return mapper.toDomain(saved);
    }
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
}

@Component
public class RabbitMQEventPublisher implements DomainEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    
    @Override
    public void publish(DomainEvent event) {
        String exchange = determineExchange(event);
        String routingKey = determineRoutingKey(event);
        
        // Convert domain event to message
        Message message = createMessage(event);
        
        // Publish to message broker
        rabbitTemplate.send(exchange, routingKey, message);
    }
}
```

## Best Practices & Guidelines 🎯

### 1. Maintain Layer Independence

Each layer should depend only on the layer directly beneath it:

```java
// Good: Application layer depends on domain layer
public class CustomerApplicationService {
    private final CustomerRepository customerRepository;  // Domain interface
    
    public void updateCustomerAddress(
            CustomerId id,
            AddressUpdateCommand command) {
        // Load domain object
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));
            
        // Execute domain logic
        customer.updateAddress(
            new Address(
                command.getStreet(),
                command.getCity(),
                command.getCountry()
            )
        );
        
        // Persist changes
        customerRepository.save(customer);
    }
}

// Bad: Application layer bypassing domain layer
public class CustomerApplicationService {
    private final CustomerJpaRepository customerJpaRepository;  // Direct infrastructure dependency
    
    public void updateCustomerAddress(
            CustomerId id,
            AddressUpdateCommand command) {
        // Directly updating database
        customerJpaRepository.updateAddress(
            id.getValue(),
            command.getStreet(),
            command.getCity(),
            command.getCountry()
        );
    }
}
```

### 2. Use Layer-Appropriate Types

Each layer should use types appropriate to its concerns:

```java
// Presentation Layer - DTOs
public class CreateCustomerRequest {
    private String name;
    private String email;
    private AddressDTO address;
}

// Application Layer - Commands
public class CreateCustomerCommand {
    private final String name;
    private final Email email;  // Value object
    private final Address address;  // Value object
}

// Domain Layer - Entities and Value Objects
public class Customer {
    private final CustomerId id;
    private Name name;
    private Email email;
    private Address address;
}

// Infrastructure Layer - Database Entities
@Entity
@Table(name = "customers")
public class CustomerEntity {
    @Id
    private UUID id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "email")
    private String email;
    
    @Embedded
    private AddressEmbeddable address;
}
```

### 3. Implement Clean Interfaces

Define clear contracts between layers:

```java
// Domain Layer - Repository Interface
public interface ProductRepository {
    Optional<Product> findById(ProductId id);
    Product save(Product product);
    void delete(ProductId id);
}

// Infrastructure Layer - Implementation
@Repository
public class PostgresProductRepository implements ProductRepository {
    private final ProductJpaRepository jpaRepository;
    private final ProductMapper mapper;
    
    @Override
    public Optional<Product> findById(ProductId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
    
    @Override
    public Product save(Product product) {
        ProductEntity entity = mapper.toEntity(product);
        ProductEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

## Testing the Layers 🧪

Each layer should be testable in isolation:

```java
// Presentation Layer Test
class OrderControllerTest {
    @MockBean
    private OrderApplicationService orderService;
    
    @Test
    void shouldReturnCreatedOrderId() {
        // Given
        PlaceOrderRequest request = createTestRequest();
        OrderId expectedId = OrderId.generate();
        when(orderService.placeOrder(any())).thenReturn(expectedId);
        
        // When
        ResponseEntity<OrderResponse> response = 
            controller.placeOrder(request);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getOrderId()).isEqualTo(expectedId);
    }
}

// Application Layer Test
class OrderApplicationServiceTest {
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderRepository orderRepository;
    
    @Test
    void shouldPlaceOrderSuccessfully() {
        // Given
        PlaceOrderCommand command = createTestCommand();
        Customer customer = createTestCustomer();
        when(customerRepository.findById(any())).thenReturn(Optional.of(customer));
        
        // When
        OrderId orderId = service.placeOrder(command);
        
        // Then
        verify(orderRepository).save(any(Order.class));
        assertThat(orderId).isNotNull();
    }
}

// Domain Layer Test
class OrderTest {
    private Order order;
    
    @BeforeEach
    void setUp() {
        order = new Order(CustomerId.generate());
    }
    
    @Test
    void shouldNotAllowPlacingEmptyOrder() {
        assertThrows(InvalidOrderException.class, () -> {
            order.place();
        });
    }
}

// Infrastructure Layer Test
class JpaOrderRepositoryTest {
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    void shouldSaveAndRetrieveOrder() {
        // Given
        Order order = createTestOrder();
        
        // When
        Order saved = orderRepository.save(order);
        Optional<Order> found = orderRepository.findById(saved.getId());
        
        // Then
        assertThat(found).isPresent();
        assertThat(found.get()).isEqualTo(saved);
    }
}
```

## Real-world Use Cases 🌍

Here's how the layers work together in a complete e-commerce system:

```java
// API Gateway (Presentation Layer)
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutApplicationService checkoutService;
    
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request) {
        CheckoutCommand command = mapToCommand(request);
        CheckoutResult result = checkoutService.checkout(command);
        return ResponseEntity.ok(mapToResponse(result));
    }
}

// Use Case Handler (Application Layer)
@Service
public class CheckoutApplicationService {
    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    
    @Transactional
    public CheckoutResult checkout(CheckoutCommand command) {
        // Load aggregates
        Cart cart = cartRepository.findById(command.getCartId())
            .orElseThrow(() -> new CartNotFoundException(command.getCartId()));
            
        Customer customer = customerRepository.findById(command.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.getCustomerId()));
            
        // Execute domain logic
        Order order = cart.checkout(customer);
        
        // Process payment
        PaymentResult payment = paymentService.processPayment(
            order,
            command.getPaymentDetails()
        );
        
        if (payment.isSuccessful()) {
            order.confirmPayment(payment.getTransactionId());
            orderRepository.save(order);
            return CheckoutResult.success(order.getId());
        } else {
            return CheckoutResult.failed(payment.getFailureReason());
        }
    }
}
```

## References and Additional Resources 📚

Essential reading materials:
- "Domain-Driven Design" by Eric Evans (Chapter on Architecture)
- "Clean Architecture" by Robert C. Martin
- "Implementing Domain-Driven Design" by Vaughn Vernon

Community resources:
- DDD Community Discord
- Architecture Weekly Newsletter
- Clean Architecture Blog

A well-structured layered architecture is fundamental to implementing Domain-Driven Design effectively. By maintaining clear separation between layers while ensuring they can collaborate effectively, we create systems that are both maintainable and flexible. Remember that layers are not just about organizing code—they're about creating boundaries that help manage complexity and enable change.