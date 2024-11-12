---
sidebar_position: 3
title: "Interface Adapters"
description: "Clean Architecture Layers - Interfaces"
---
# 🔌 Clean Architecture: Interface Adapters Layer

## Overview

Interface Adapters (also known as the Interface or Adapter layer) convert data between the format most convenient for use cases and entities, and the format most convenient for external systems such as databases, web frameworks, or any external agency. This layer acts as a set of adapters between the inner layers (Entities and Use Cases) and the outer layers (Infrastructure).

### Real-World Analogy
Think of Interface Adapters like power adapters used when traveling internationally. Just as a power adapter converts electricity from one voltage/plug format to another without changing the fundamental electricity, Interface Adapters convert data between the formats needed by different parts of the system without changing the core business logic.

## Key Concepts 🔑

### Core Components

1. **Controllers**
   - Handle incoming requests
   - Input validation
   - Use case orchestration
   - Response formatting

2. **Presenters**
   - Format data for output
   - Handle view logic
   - Error presentation
   - Response transformation

3. **Gateways**
   - Database abstraction
   - External service interfaces
   - Infrastructure communication
   - Protocol adaptation

## Implementation 💻

### Controller Implementation Example

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.interfaces.controllers;

    import java.math.BigDecimal;
    import java.util.UUID;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/v1/transfers")
    public class MoneyTransferController {
        private final TransferMoneyUseCase transferMoneyUseCase;
        private final TransferMoneyPresenter presenter;

        public MoneyTransferController(
            TransferMoneyUseCase transferMoneyUseCase,
            TransferMoneyPresenter presenter
        ) {
            this.transferMoneyUseCase = transferMoneyUseCase;
            this.presenter = presenter;
        }

        @PostMapping
        public ResponseEntity<TransferResponseDTO> transferMoney(
            @RequestBody TransferRequestDTO request
        ) {
            try {
                // Convert DTO to Use Case Request
                TransferMoneyRequest useCaseRequest = new TransferMoneyRequest(
                    UUID.fromString(request.getSourceAccountId()),
                    UUID.fromString(request.getTargetAccountId()),
                    new BigDecimal(request.getAmount())
                );

                // Execute Use Case
                TransferMoneyResponse useCaseResponse = 
                    transferMoneyUseCase.execute(useCaseRequest);

                // Present Response
                return ResponseEntity.ok(
                    presenter.present(useCaseResponse)
                );
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                    .body(presenter.presentError(e));
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                    .body(presenter.presentError(e));
            }
        }
    }

    // DTOs
    public class TransferRequestDTO {
        private String sourceAccountId;
        private String targetAccountId;
        private String amount;

        // Getters and setters
    }

    public class TransferResponseDTO {
        private boolean success;
        private String message;
        private String sourceBalance;
        private String targetBalance;

        // Getters and setters
    }

    // Presenter
    @Component
    public class TransferMoneyPresenter {
        public TransferResponseDTO present(TransferMoneyResponse response) {
            TransferResponseDTO dto = new TransferResponseDTO();
            dto.setSuccess(response.isSuccess());
            dto.setMessage(response.getMessage());
            dto.setSourceBalance(response.getSourceBalance().toString());
            dto.setTargetBalance(response.getTargetBalance().toString());
            return dto;
        }

        public TransferResponseDTO presentError(Exception e) {
            TransferResponseDTO dto = new TransferResponseDTO();
            dto.setSuccess(false);
            dto.setMessage(e.getMessage());
            return dto;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package interfaces

    import (
        "encoding/json"
        "net/http"
        "github.com/gin-gonic/gin"
        "github.com/google/uuid"
    )

    // DTOs
    type TransferRequestDTO struct {
        SourceAccountID string  `json:"sourceAccountId"`
        TargetAccountID string  `json:"targetAccountId"`
        Amount         string  `json:"amount"`
    }

    type TransferResponseDTO struct {
        Success       bool    `json:"success"`
        Message      string  `json:"message"`
        SourceBalance string  `json:"sourceBalance"`
        TargetBalance string  `json:"targetBalance"`
    }

    // Controller
    type MoneyTransferController struct {
        useCase   *usecases.TransferMoneyUseCase
        presenter *TransferMoneyPresenter
    }

    func NewMoneyTransferController(
        useCase *usecases.TransferMoneyUseCase,
        presenter *TransferMoneyPresenter,
    ) *MoneyTransferController {
        return &MoneyTransferController{
            useCase:   useCase,
            presenter: presenter,
        }
    }

    func (c *MoneyTransferController) TransferMoney(ctx *gin.Context) {
        var req TransferRequestDTO
        if err := ctx.ShouldBindJSON(&req); err != nil {
            ctx.JSON(http.StatusBadRequest, c.presenter.PresentError(err))
            return
        }

        sourceID, err := uuid.Parse(req.SourceAccountID)
        if err != nil {
            ctx.JSON(http.StatusBadRequest, c.presenter.PresentError(err))
            return
        }

        targetID, err := uuid.Parse(req.TargetAccountID)
        if err != nil {
            ctx.JSON(http.StatusBadRequest, c.presenter.PresentError(err))
            return
        }

        amount, ok := new(big.Float).SetString(req.Amount)
        if !ok {
            ctx.JSON(http.StatusBadRequest, c.presenter.PresentError(
                errors.New("invalid amount format"),
            ))
            return
        }

        // Execute use case
        useCaseReq := usecases.TransferMoneyRequest{
            SourceAccountID: sourceID,
            TargetAccountID: targetID,
            Amount:         amount,
        }

        response, err := c.useCase.Execute(ctx, useCaseReq)
        if err != nil {
            ctx.JSON(http.StatusInternalServerError, c.presenter.PresentError(err))
            return
        }

        // Present response
        ctx.JSON(http.StatusOK, c.presenter.Present(response))
    }

    // Presenter
    type TransferMoneyPresenter struct{}

    func NewTransferMoneyPresenter() *TransferMoneyPresenter {
        return &TransferMoneyPresenter{}
    }

    func (p *TransferMoneyPresenter) Present(
        response *usecases.TransferMoneyResponse,
    ) TransferResponseDTO {
        return TransferResponseDTO{
            Success:       response.Success,
            Message:      response.Message,
            SourceBalance: response.SourceBalance.String(),
            TargetBalance: response.TargetBalance.String(),
        }
    }

    func (p *TransferMoneyPresenter) PresentError(err error) TransferResponseDTO {
        return TransferResponseDTO{
            Success: false,
            Message: err.Error(),
        }
    }
    ```
  </TabItem>
</Tabs>

### Gateway Implementation Example

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.interfaces.gateways;

    import java.util.UUID;
    import org.springframework.stereotype.Repository;
    import javax.persistence.EntityManager;

    @Repository
    public class JpaAccountRepository implements AccountRepository {
        private final EntityManager entityManager;
        private final AccountMapper mapper;

        public JpaAccountRepository(
            EntityManager entityManager,
            AccountMapper mapper
        ) {
            this.entityManager = entityManager;
            this.mapper = mapper;
        }

        @Override
        public Account findById(UUID id) {
            AccountEntity entity = entityManager.find(AccountEntity.class, id);
            return entity != null ? mapper.toDomain(entity) : null;
        }

        @Override
        public void save(Account account) {
            AccountEntity entity = mapper.toEntity(account);
            entityManager.merge(entity);
        }
    }

    // Entity
    @Entity
    @Table(name = "accounts")
    public class AccountEntity {
        @Id
        private UUID id;
        private String ownerName;
        private BigDecimal balance;
        private LocalDateTime createdAt;

        // Getters and setters
    }

    // Mapper
    @Component
    public class AccountMapper {
        public Account toDomain(AccountEntity entity) {
            return new Account(
                entity.getId(),
                entity.getOwnerName(),
                entity.getBalance(),
                entity.getCreatedAt()
            );
        }

        public AccountEntity toEntity(Account domain) {
            AccountEntity entity = new AccountEntity();
            entity.setId(domain.getId());
            entity.setOwnerName(domain.getOwnerName());
            entity.setBalance(domain.getBalance());
            entity.setCreatedAt(domain.getCreatedAt());
            return entity;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package interfaces

    import (
        "context"
        "database/sql"
        "github.com/google/uuid"
    )

    type AccountEntity struct {
        ID        uuid.UUID
        OwnerName string
        Balance   *big.Float
        CreatedAt time.Time
    }

    type PostgresAccountRepository struct {
        db     *sql.DB
        mapper *AccountMapper
    }

    func NewPostgresAccountRepository(
        db *sql.DB,
        mapper *AccountMapper,
    ) *PostgresAccountRepository {
        return &PostgresAccountRepository{
            db:     db,
            mapper: mapper,
        }
    }

    func (r *PostgresAccountRepository) FindByID(
        ctx context.Context,
        id uuid.UUID,
    ) (*domain.Account, error) {
        query := `
            SELECT id, owner_name, balance, created_at
            FROM accounts
            WHERE id = $1
        `

        var entity AccountEntity
        err := r.db.QueryRowContext(ctx, query, id).Scan(
            &entity.ID,
            &entity.OwnerName,
            &entity.Balance,
            &entity.CreatedAt,
        )

        if err == sql.ErrNoRows {
            return nil, nil
        }
        if err != nil {
            return nil, err
        }

        return r.mapper.ToDomain(&entity), nil
    }

    func (r *PostgresAccountRepository) Save(
        ctx context.Context,
        account *domain.Account,
    ) error {
        entity := r.mapper.ToEntity(account)
        query := `
            INSERT INTO accounts (id, owner_name, balance, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
            SET owner_name = EXCLUDED.owner_name,
                balance = EXCLUDED.balance
        `

        _, err := r.db.ExecContext(ctx,
            query,
            entity.ID,
            entity.OwnerName,
            entity.Balance,
            entity.CreatedAt,
        )
        return err
    }

    // Mapper
    type AccountMapper struct{}

    func NewAccountMapper() *AccountMapper {
        return &AccountMapper{}
    }

    func (m *AccountMapper) ToDomain(entity *AccountEntity) *domain.Account {
        return domain.NewAccount(
            entity.ID,
            entity.OwnerName,
            entity.Balance,
            entity.CreatedAt,
        )
    }

    func (m *AccountMapper) ToEntity(domain *domain.Account) *AccountEntity {
        return &AccountEntity{
            ID:        domain.ID(),
            OwnerName: domain.OwnerName(),
            Balance:   domain.Balance(),
            CreatedAt: domain.CreatedAt(),
        }
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Adapter Pattern**
   - Core pattern for interface adapters
   - Converts interfaces
   - Enables loose coupling

2. **Facade Pattern**
   - Simplifies complex subsystems
   - Provides unified interface
   - Reduces coupling

3. **DTO Pattern**
   - Transfers data between layers
   - Reduces network calls
   - Encapsulates serialization

## Best Practices ✨

### Configuration
1. Use dependency injection
2. Implement proper error handling
3. Configure timeouts
4. Use appropriate serialization formats

### Monitoring
1. Log adapter operations
2. Track response times
3. Monitor error rates
4. Implement health checks

### Testing
1. Unit test adapters independently
2. Mock external dependencies
3. Test error scenarios
4. Verify data transformations

## Common Pitfalls 🚫

1. **Leaking Domain Logic**
   - Solution: Keep business logic in use cases
   - Adapters should only transform data

2. **Tight Coupling**
   - Solution: Use interfaces
   - Implement dependency injection

3. **Inconsistent Error Handling**
   - Solution: Standardize error responses
   - Implement proper error mapping

4. **Missing Validation**
   - Solution: Validate input/output
   - Implement proper data sanitization

## Use Cases 🎯

### 1. Web API
- REST controllers
- GraphQL resolvers
- WebSocket handlers
- API versioning

### 2. Database Integration
- ORM adapters
- NoSQL adapters
- Cache adapters
- Query builders

### 3. External Services
- Payment gateways
- Email services
- Message queues
- Third-party APIs

## Deep Dive Topics 🤿

### Thread Safety
1. **Concurrency**
   - Thread-safe adapters
   - Connection pooling
   - Resource management

### Distributed Systems
1. **Communication**
   - Protocol buffers
   - API versioning
   - Service discovery

### Performance
1. **Optimization**
   - Caching strategies
   - Connection pooling
   - Batch operations

## Additional Resources 📚

### References
1. [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. [Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
3. [REST in Practice](https://www.amazon.com/REST-Practice-Hypermedia-Systems-Architecture/dp/0596805829)

### Tools
1. [MapStruct](https://mapstruct.org/) - Java bean mapping
2. [GORM](https://gorm.io/) - Go ORM
3. [Swagger/OpenAPI](https://swagger.io/) - API documentation

## FAQs ❓

### Q: How do I handle API versioning in adapters?
A: Use proper versioning strategies (URI, header, content type) and implement separate adapters for each version.

### Q: Should adapters handle authentication/authorization?
A: Yes, adapters should handle security concerns before passing requests to use cases.

### Q: How to manage complex data transformations?
A: Use dedicated mapper classes and consider using mapping frameworks.

### Q: How to handle different data formats?
A: Implement separate presenters for each format (JSON, XML, etc.) while keeping the core logic the same.

### Q: Should adapters implement caching?
A: Yes, adapters can implement caching strategies appropriate for their specific interface needs.