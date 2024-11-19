---
sidebar_position: 3
title: "Data Management"
description: "Data Management"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📊 Data Management in Microservices

## Overview
Data management in microservices architecture focuses on handling data storage, consistency, and sharing across distributed services. Each microservice manages its own data independently while maintaining consistency across the system.

**Real-world Analogy**: Think of a large corporation where each department maintains its own records (HR, Finance, Operations). Each department has complete control over its data but needs to share information through well-defined protocols while maintaining consistency across the organization.

## 🔑 Key Concepts

### Core Components

1. **Database Per Service**
    - Private data storage
    - Data autonomy
    - Schema independence

2. **Data Consistency Patterns**
    - Eventual consistency
    - SAGA pattern
    - Event sourcing

3. **Data Sharing Patterns**
    - API composition
    - CQRS
    - Event-driven updates

4. **Data Replication**
    - Synchronous replication
    - Asynchronous replication
    - Read replicas

## 💻 Implementation Examples

### Database Per Service Pattern

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Order Service
    @Entity
    public class Order {
        @Id
        private String id;
        private String customerId;
        private OrderStatus status;
        @OneToMany(cascade = CascadeType.ALL)
        private List<OrderItem> items;
    }

    @Service
    public class OrderService {
        private final OrderRepository orderRepository;
        private final OrderEventPublisher eventPublisher;
        private final CustomerClient customerClient;

        @Transactional
        public Order createOrder(OrderRequest request) {
            // Validate customer exists
            CustomerDTO customer = customerClient.getCustomer(request.getCustomerId());
            if (customer == null) {
                throw new CustomerNotFoundException();
            }

            // Create order
            Order order = new Order();
            order.setCustomerId(request.getCustomerId());
            order.setItems(request.getItems());
            order.setStatus(OrderStatus.PENDING);

            // Save and publish event
            Order savedOrder = orderRepository.save(order);
            eventPublisher.publish(new OrderCreatedEvent(savedOrder));
            
            return savedOrder;
        }
    }

    // Event Publishing
    @Service
    public class OrderEventPublisher {
        private final KafkaTemplate<String, Event> kafkaTemplate;

        public void publish(OrderCreatedEvent event) {
            kafkaTemplate.send("order-events", event.getOrderId(), event);
        }
    }

    // Data Consistency with Saga Pattern
    @Service
    public class OrderSaga {
        private final OrderRepository orderRepository;
        private final PaymentClient paymentClient;
        private final InventoryClient inventoryClient;

        @Transactional
        public void processOrder(Order order) {
            try {
                // Reserve inventory
                inventoryClient.reserve(order);
                // Process payment
                paymentClient.process(order);
                // Complete order
                order.setStatus(OrderStatus.COMPLETED);
                orderRepository.save(order);
            } catch (Exception e) {
                // Compensating transactions
                compensate(order);
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // Order Service
    type Order struct {
        ID         string       `json:"id"`
        CustomerID string       `json:"customer_id"`
        Status     OrderStatus  `json:"status"`
        Items      []OrderItem  `json:"items"`
    }

    type OrderService struct {
        repo           OrderRepository
        eventPublisher EventPublisher
        customerClient CustomerClient
    }

    func (s *OrderService) CreateOrder(ctx context.Context, request OrderRequest) (*Order, error) {
        // Validate customer exists
        customer, err := s.customerClient.GetCustomer(ctx, request.CustomerID)
        if err != nil {
            return nil, fmt.Errorf("customer not found: %w", err)
        }

        // Create order
        order := &Order{
            ID:         uuid.New().String(),
            CustomerID: request.CustomerID,
            Items:     request.Items,
            Status:    OrderStatusPending,
        }

        // Start transaction
        tx := s.repo.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
            }
        }()

        // Save order
        if err := tx.Create(order).Error; err != nil {
            tx.Rollback()
            return nil, err
        }

        // Publish event
        event := OrderCreatedEvent{
            OrderID:    order.ID,
            CustomerID: order.CustomerID,
            Timestamp:  time.Now(),
        }
        
        if err := s.eventPublisher.Publish(ctx, event); err != nil {
            tx.Rollback()
            return nil, err
        }

        if err := tx.Commit().Error; err != nil {
            return nil, err
        }

        return order, nil
    }

    // Event Publishing
    type EventPublisher struct {
        kafka *kafka.Writer
    }

    func (p *EventPublisher) Publish(ctx context.Context, event Event) error {
        message := kafka.Message{
            Key:   []byte(event.GetEventID()),
            Value: event.ToJSON(),
        }
        return p.kafka.WriteMessages(ctx, message)
    }

    // Data Consistency with Saga Pattern
    type OrderSaga struct {
        orderRepo      OrderRepository
        paymentClient  PaymentClient
        inventoryClient InventoryClient
    }

    func (s *OrderSaga) ProcessOrder(ctx context.Context, order *Order) error {
        // Reserve inventory
        if err := s.inventoryClient.Reserve(ctx, order); err != nil {
            return s.compensate(ctx, order)
        }

        // Process payment
        if err := s.paymentClient.Process(ctx, order); err != nil {
            return s.compensate(ctx, order)
        }

        // Complete order
        order.Status = OrderStatusCompleted
        return s.orderRepo.Save(ctx, order)
    }
    ```
  </TabItem>
</Tabs>

### CQRS Implementation Example

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Command Side
    @Service
    public class OrderCommandService {
        private final OrderRepository repository;
        private final EventPublisher eventPublisher;

        @Transactional
        public String createOrder(CreateOrderCommand command) {
            Order order = new Order(command);
            Order savedOrder = repository.save(order);
            eventPublisher.publish(new OrderCreatedEvent(savedOrder));
            return savedOrder.getId();
        }
    }

    // Query Side
    @Service
    public class OrderQueryService {
        private final OrderReadRepository readRepository;

        public OrderDTO getOrder(String orderId) {
            return readRepository.findById(orderId)
                .map(OrderDTO::fromOrder)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        }

        public List<OrderDTO> getOrdersByCustomer(String customerId) {
            return readRepository.findByCustomerId(customerId)
                .stream()
                .map(OrderDTO::fromOrder)
                .collect(Collectors.toList());
        }
    }

    // Event Handler
    @Service
    public class OrderEventHandler {
        private final OrderReadRepository readRepository;

        @EventHandler
        public void on(OrderCreatedEvent event) {
            OrderReadModel readModel = new OrderReadModel(event);
            readRepository.save(readModel);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // Command Side
    type OrderCommandService struct {
        repo           OrderRepository
        eventPublisher EventPublisher
    }

    func (s *OrderCommandService) CreateOrder(ctx context.Context, cmd CreateOrderCommand) (string, error) {
        order := NewOrder(cmd)
        
        if err := s.repo.Save(ctx, order); err != nil {
            return "", err
        }
        
        event := NewOrderCreatedEvent(order)
        if err := s.eventPublisher.Publish(ctx, event); err != nil {
            return "", err
        }
        
        return order.ID, nil
    }

    // Query Side
    type OrderQueryService struct {
        readRepo OrderReadRepository
    }

    func (s *OrderQueryService) GetOrder(ctx context.Context, orderID string) (*OrderDTO, error) {
        order, err := s.readRepo.FindByID(ctx, orderID)
        if err != nil {
            return nil, err
        }
        return OrderDTOFromOrder(order), nil
    }

    func (s *OrderQueryService) GetOrdersByCustomer(ctx context.Context, customerID string) ([]OrderDTO, error) {
        orders, err := s.readRepo.FindByCustomerID(ctx, customerID)
        if err != nil {
            return nil, err
        }
        
        dtos := make([]OrderDTO, len(orders))
        for i, order := range orders {
            dtos[i] = OrderDTOFromOrder(order)
        }
        return dtos, nil
    }

    // Event Handler
    type OrderEventHandler struct {
        readRepo OrderReadRepository
    }

    func (h *OrderEventHandler) HandleOrderCreated(ctx context.Context, event OrderCreatedEvent) error {
        readModel := NewOrderReadModel(event)
        return h.readRepo.Save(ctx, readModel)
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Event Sourcing**
    - Store state changes as events
    - Event replay capability
    - Audit trail

2. **SAGA Pattern**
    - Distributed transactions
    - Compensation handling
    - Eventual consistency

3. **API Composition**
    - Data aggregation
    - Cross-service queries
    - Response composition

4. **Materialized View**
    - Denormalized views
    - Read optimization
    - Cache synchronization

## ⚙️ Best Practices

### Configuration
- Use database-specific configurations
- Implement connection pooling
- Configure retry policies
- Set up monitoring alerts

### Monitoring
- Track database metrics
- Monitor replication lag
- Watch transaction rates
- Audit data access

### Testing
- Integration testing
- Data consistency testing
- Performance testing
- Chaos engineering

## ❌ Common Pitfalls

1. **Shared Databases**
    - Problem: Multiple services sharing database
    - Solution: Database per service

2. **Inconsistent Data**
    - Problem: Data synchronization issues
    - Solution: Event-driven updates

3. **N+1 Query Problem**
    - Problem: Excessive database queries
    - Solution: Batch loading, caching

## 🎯 Use Cases

### 1. E-commerce Platform
Problem: Order management across services
Solution: SAGA pattern with event sourcing

### 2. Financial System
Problem: Transaction consistency
Solution: Two-phase commit with compensation

### 3. Social Media Platform
Problem: High-read operations
Solution: CQRS with read replicas

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent transactions
- Lock strategies
- Connection pooling
- Race condition prevention

### Distributed Systems
- CAP theorem
- Eventual consistency
- Distributed transactions
- Data replication

### Performance
- Query optimization
- Caching strategies
- Connection pooling
- Batch processing

## 📚 Additional Resources

### Tools
- Database: MongoDB, PostgreSQL
- Message Brokers: Kafka, RabbitMQ
- Caching: Redis, Memcached
- Monitoring: Prometheus, Grafana

### References
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Microservices Patterns" by Chris Richardson
- "Domain-Driven Design" by Eric Evans

## ❓ FAQ

1. **Q: How do I ensure data consistency across services?**
   A: Use eventual consistency with event-driven updates or SAGA pattern for transactions.

2. **Q: Should each service have its own database?**
   A: Yes, to maintain service independence and data encapsulation.

3. **Q: How do I handle distributed transactions?**
   A: Implement SAGA pattern with compensating transactions.

4. **Q: When should I use CQRS?**
   A: When read and write workloads have different requirements or scaling needs.

5. **Q: How do I manage database migrations?**
   A: Use versioned migrations and coordinate deployments carefully.