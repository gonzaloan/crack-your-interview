---
sidebar_position: 2
title: "MicroServices"
description: "Clean Architecture Examples - Web Application"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🏛️ Clean Architecture in Microservices

## Overview

Clean Architecture in microservices is an architectural pattern that emphasizes separation of concerns and independence from external frameworks and tools. Think of it like a well-organized city: just as a city has distinct zones (residential, commercial, industrial) with clear boundaries and responsibilities, Clean Architecture organizes code into concentric layers, each with specific responsibilities and dependencies pointing inward.

### Real-World Analogy
Imagine a large corporate office building:
- The lobby (Controllers/API) handles incoming visitors
- The reception desk (Use Cases) processes and validates requests
- The department offices (Entities) contain core business operations
- The building infrastructure (Frameworks) supports everything but can be upgraded without affecting the offices

## 🔑 Key Concepts

### Core Principles
1. **Independence from Frameworks**: The architecture doesn't depend on the existence of some framework
2. **Testability**: Business rules can be tested without UI, database, web server, or any external element
3. **Independence from UI**: The UI can change without changing the rest of the system
4. **Independence from Database**: Business rules aren't bound to the database
5. **Independence from External Agency**: Business rules don't know anything about outside interfaces

### Architectural Layers

1. **Entities Layer** (innermost)
    - Contains enterprise-wide business rules
    - Pure business logic
    - No dependencies on outer layers

2. **Use Cases Layer**
    - Application-specific business rules
    - Orchestrates data flow to and from entities
    - Contains interfaces that outer layers must implement

3. **Interface Adapters Layer**
    - Converts data between use cases and external formats
    - Contains controllers, presenters, and gateways

4. **Frameworks & Drivers Layer** (outermost)
    - Contains frameworks and tools
    - Database, web framework, devices
    - Glues all other layers together

## 💻 Implementation

Let's implement a simple order processing microservice using Clean Architecture.

### Core Entities

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Domain/Entity/Order.java
    package com.example.domain.entity;

    import java.math.BigDecimal;
    import java.util.UUID;

    public class Order {
        private final UUID id;
        private final String customerNumber;
        private final BigDecimal amount;
        private OrderStatus status;

        public Order(String customerNumber, BigDecimal amount) {
            this.id = UUID.randomUUID();
            this.customerNumber = customerNumber;
            this.amount = amount;
            this.status = OrderStatus.CREATED;
        }

        public void processOrder() {
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException("Invalid order amount");
            }
            this.status = OrderStatus.PROCESSING;
        }

        // Getters
        public UUID getId() { return id; }
        public String getCustomerNumber() { return customerNumber; }
        public BigDecimal getAmount() { return amount; }
        public OrderStatus getStatus() { return status; }
    }

    enum OrderStatus {
        CREATED, PROCESSING, COMPLETED, FAILED
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // domain/entity/order.go
    package entity

    import (
        "errors"
        "github.com/google/uuid"
        "math/big"
    )

    type OrderStatus string

    const (
        Created    OrderStatus = "CREATED"
        Processing OrderStatus = "PROCESSING"
        Completed  OrderStatus = "COMPLETED"
        Failed     OrderStatus = "FAILED"
    )

    type Order struct {
        ID             uuid.UUID
        CustomerNumber string
        Amount        *big.Float
        Status        OrderStatus
    }

    func NewOrder(customerNumber string, amount *big.Float) *Order {
        return &Order{
            ID:             uuid.New(),
            CustomerNumber: customerNumber,
            Amount:        amount,
            Status:        Created,
        }
    }

    func (o *Order) ProcessOrder() error {
        if o.Amount.Cmp(big.NewFloat(0)) <= 0 {
            return errors.New("invalid order amount")
        }
        o.Status = Processing
        return nil
    }
    ```
  </TabItem>
</Tabs>

### Use Cases

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Application/UseCase/ProcessOrderUseCase.java
    package com.example.application.usecase;

    import com.example.domain.entity.Order;
    import com.example.application.port.OrderRepository;
    import com.example.application.port.OrderNotifier;

    public class ProcessOrderUseCase {
        private final OrderRepository orderRepository;
        private final OrderNotifier orderNotifier;

        public ProcessOrderUseCase(OrderRepository orderRepository, OrderNotifier orderNotifier) {
            this.orderRepository = orderRepository;
            this.orderNotifier = orderNotifier;
        }

        public void execute(Order order) {
            order.processOrder();
            orderRepository.save(order);
            orderNotifier.notifyOrderProcessing(order);
        }
    }

    // Application/Port/OrderRepository.java
    package com.example.application.port;

    public interface OrderRepository {
        void save(Order order);
        Order findById(UUID id);
    }

    // Application/Port/OrderNotifier.java
    package com.example.application.port;

    public interface OrderNotifier {
        void notifyOrderProcessing(Order order);
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // application/usecase/process_order.go
    package usecase

    import (
        "github.com/example/domain/entity"
    )

    type OrderRepository interface {
        Save(order *entity.Order) error
        FindById(id uuid.UUID) (*entity.Order, error)
    }

    type OrderNotifier interface {
        NotifyOrderProcessing(order *entity.Order) error
    }

    type ProcessOrderUseCase struct {
        orderRepository OrderRepository
        orderNotifier   OrderNotifier
    }

    func NewProcessOrderUseCase(repo OrderRepository, notifier OrderNotifier) *ProcessOrderUseCase {
        return &ProcessOrderUseCase{
            orderRepository: repo,
            orderNotifier:   notifier,
        }
    }

    func (uc *ProcessOrderUseCase) Execute(order *entity.Order) error {
        if err := order.ProcessOrder(); err != nil {
            return err
        }

        if err := uc.orderRepository.Save(order); err != nil {
            return err
        }

        return uc.orderNotifier.NotifyOrderProcessing(order)
    }
    ```
  </TabItem>
</Tabs>

### Interface Adapters

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Infrastructure/Controller/OrderController.java
    package com.example.infrastructure.controller;

    import com.example.application.usecase.ProcessOrderUseCase;
    import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/orders")
    public class OrderController {
        private final ProcessOrderUseCase processOrderUseCase;

        public OrderController(ProcessOrderUseCase processOrderUseCase) {
            this.processOrderUseCase = processOrderUseCase;
        }

        @PostMapping
        public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
            Order order = new Order(request.getCustomerNumber(), request.getAmount());
            processOrderUseCase.execute(order);
            return ResponseEntity.ok(new OrderResponse(order));
        }
    }

    // Infrastructure/Repository/JpaOrderRepository.java
    @Repository
    public class JpaOrderRepository implements OrderRepository {
        private final OrderJpaRepository jpaRepository;

        public JpaOrderRepository(OrderJpaRepository jpaRepository) {
            this.jpaRepository = jpaRepository;
        }

        @Override
        public void save(Order order) {
            OrderEntity entity = OrderEntity.fromDomain(order);
            jpaRepository.save(entity);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // infrastructure/controller/order_controller.go
    package controller

    import (
        "github.com/gin-gonic/gin"
        "github.com/example/application/usecase"
    )

    type OrderController struct {
        processOrderUseCase *usecase.ProcessOrderUseCase
    }

    func NewOrderController(useCase *usecase.ProcessOrderUseCase) *OrderController {
        return &OrderController{
            processOrderUseCase: useCase,
        }
    }

    func (c *OrderController) CreateOrder(ctx *gin.Context) {
        var request OrderRequest
        if err := ctx.ShouldBindJSON(&request); err != nil {
            ctx.JSON(400, gin.H{"error": err.Error()})
            return
        }

        order := entity.NewOrder(request.CustomerNumber, request.Amount)
        if err := c.processOrderUseCase.Execute(order); err != nil {
            ctx.JSON(500, gin.H{"error": err.Error()})
            return
        }

        ctx.JSON(200, OrderResponse{Order: order})
    }

    // infrastructure/repository/postgres_order_repository.go
    type PostgresOrderRepository struct {
        db *sql.DB
    }

    func (r *PostgresOrderRepository) Save(order *entity.Order) error {
        _, err := r.db.Exec(
            "INSERT INTO orders (id, customer_number, amount, status) VALUES ($1, $2, $3, $4)",
            order.ID, order.CustomerNumber, order.Amount, order.Status,
        )
        return err
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Hexagonal Architecture (Ports & Adapters)**
    - Complementary to Clean Architecture
    - Focuses on ports (interfaces) and adapters (implementations)
    - Similar emphasis on separation of concerns

2. **Domain-Driven Design (DDD)**
    - Natural fit with Clean Architecture
    - Provides tactical patterns for entity design
    - Helps define bounded contexts for microservices

3. **CQRS (Command Query Responsibility Segregation)**
    - Can be implemented within Clean Architecture
    - Separates read and write operations
    - Fits well with event-driven microservices

## ✅ Best Practices

### Configuration
1. Use dependency injection for all layer dependencies
2. Keep configuration separate from business logic
3. Use environment variables for external configurations
4. Implement feature flags at the infrastructure layer

### Monitoring
1. Implement health checks at infrastructure layer
2. Add logging at each layer boundary
3. Use correlation IDs across microservice calls
4. Monitor use case execution times

### Testing
1. Unit test entities without dependencies
2. Use mock repositories in use case tests
3. Implement integration tests at controller level
4. Use contract tests between microservices

## ⚠️ Common Pitfalls

1. **Mixing Concerns**
    - Solution: Strictly enforce layer boundaries
    - Use linting tools to prevent dependency violations

2. **Complex DTOs**
    - Solution: Keep DTOs simple and focused
    - Don't leak domain concepts through DTOs

3. **Anemic Domain Model**
    - Solution: Put business logic in entities
    - Don't treat entities as data containers

4. **Framework Lock-in**
    - Solution: Use abstractions for framework dependencies
    - Keep framework code at the edges

## 🎯 Use Cases

### 1. E-commerce Order Processing
- Multiple payment methods
- Inventory verification
- Shipping calculation
- Order status tracking

### 2. Banking Transaction System
- Account balance verification
- Transaction processing
- Fraud detection
- Audit logging

### 3. Healthcare Patient Management
- Patient registration
- Appointment scheduling
- Medical record management
- Insurance verification

## 🔍 Deep Dive Topics

### Thread Safety
- Entities should be immutable where possible
- Use thread-safe collections in repositories
- Implement proper transaction boundaries
- Consider using reactive programming for async operations

### Distributed Systems
- Implement proper error handling
- Use circuit breakers for external services
- Implement distributed tracing
- Handle eventual consistency

### Performance
- Implement caching strategies
- Use connection pooling
- Optimize database queries
- Consider bulk operations

## 📚 Additional Resources

### References
1. Clean Architecture by Robert C. Martin
2. Building Microservices by Sam Newman
3. Domain-Driven Design by Eric Evans

### Tools
1. ArchUnit - Architecture testing tool
2. Spring Boot - Application framework
3. Jaeger - Distributed tracing
4. Prometheus - Monitoring

## ❓ FAQs

**Q: How do I handle transactions across multiple microservices?**  
A: Use the Saga pattern for distributed transactions, implementing either choreography or orchestration approaches.

**Q: Should every microservice have all Clean Architecture layers?**  
A: Yes, each microservice should be self-contained with its own clean architecture implementation.

**Q: How do I handle shared domain logic between microservices?**  
A: Extract shared logic into a common library, but keep it minimal and focused on truly shared concepts.

**Q: How do I maintain consistency between microservices?**  
A: Use event-driven architecture and implement eventual consistency patterns.

**Q: What's the recommended way to handle validation?**  
A: Implement domain validation in entities, input validation in controllers, and business rule validation in use cases.