---
sidebar_position: 2
title: "Use Cases"
description: "Clean Architecture Layers - Use Cases"
---
# 🔄 Clean Architecture: Use Cases Layer

## Overview

Use Cases (also known as Interactors) represent application-specific business rules. They orchestrate the flow of data to and from entities and implement the application-specific business rules. Use Cases encapsulate and implement all of the use cases of the system.

### Real-World Analogy
Think of Use Cases as conductors in an orchestra. While individual musicians (entities) know how to play their instruments, the conductor (use case) coordinates them to create a complete performance. Similarly, Use Cases coordinate entities and orchestrate business flows to accomplish specific application tasks.

## Key Concepts 🔑

### Core Components

1. **Input Ports (Request Models)**
   - Data structures for incoming requests
   - Validation rules
   - Parameter mapping

2. **Output Ports (Response Models)**
   - Data structures for responses
   - Success/failure states
   - Error handling

3. **Business Flow**
   - Orchestration logic
   - Transaction management
   - Entity coordination

4. **Boundaries**
   - Interface definitions
   - Port specifications
   - Gateway abstractions

## Implementation 💻

### Basic Use Case Implementation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    package com.example.application.usecases;

    import java.math.BigDecimal;
    import java.util.UUID;

    // Input port (Request Model)
    public class TransferMoneyRequest {
        private final UUID sourceAccountId;
        private final UUID targetAccountId;
        private final BigDecimal amount;

        public TransferMoneyRequest(UUID sourceAccountId, UUID targetAccountId, BigDecimal amount) {
            this.sourceAccountId = sourceAccountId;
            this.targetAccountId = targetAccountId;
            this.amount = amount;
        }

        // Getters
        public UUID getSourceAccountId() { return sourceAccountId; }
        public UUID getTargetAccountId() { return targetAccountId; }
        public BigDecimal getAmount() { return amount; }
    }

    // Output port (Response Model)
    public class TransferMoneyResponse {
        private final boolean success;
        private final String message;
        private final BigDecimal sourceBalance;
        private final BigDecimal targetBalance;

        public TransferMoneyResponse(boolean success, String message, 
                                   BigDecimal sourceBalance, BigDecimal targetBalance) {
            this.success = success;
            this.message = message;
            this.sourceBalance = sourceBalance;
            this.targetBalance = targetBalance;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public BigDecimal getSourceBalance() { return sourceBalance; }
        public BigDecimal getTargetBalance() { return targetBalance; }
    }

    // Repository interface
    public interface AccountRepository {
        Account findById(UUID id);
        void save(Account account);
    }

    // Use Case implementation
    public class TransferMoneyUseCase {
        private final AccountRepository accountRepository;
        private final TransactionManager transactionManager;

        public TransferMoneyUseCase(AccountRepository accountRepository, 
                                  TransactionManager transactionManager) {
            this.accountRepository = accountRepository;
            this.transactionManager = transactionManager;
        }

        public TransferMoneyResponse execute(TransferMoneyRequest request) {
            return transactionManager.executeInTransaction(() -> {
                // Input validation
                if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalArgumentException("Transfer amount must be positive");
                }

                // Retrieve entities
                Account sourceAccount = accountRepository.findById(request.getSourceAccountId());
                Account targetAccount = accountRepository.findById(request.getTargetAccountId());

                if (sourceAccount == null || targetAccount == null) {
                    throw new IllegalArgumentException("Account not found");
                }

                // Execute business logic
                sourceAccount.withdraw(request.getAmount());
                targetAccount.deposit(request.getAmount());

                // Save changes
                accountRepository.save(sourceAccount);
                accountRepository.save(targetAccount);

                // Return response
                return new TransferMoneyResponse(
                    true,
                    "Transfer completed successfully",
                    sourceAccount.getBalance(),
                    targetAccount.getBalance()
                );
            });
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package usecases

    import (
        "context"
        "errors"
        "math/big"

        "github.com/google/uuid"
    )

    // Input port (Request Model)
    type TransferMoneyRequest struct {
        SourceAccountID uuid.UUID
        TargetAccountID uuid.UUID
        Amount         *big.Float
    }

    // Output port (Response Model)
    type TransferMoneyResponse struct {
        Success       bool
        Message       string
        SourceBalance *big.Float
        TargetBalance *big.Float
    }

    // Repository interface
    type AccountRepository interface {
        FindByID(ctx context.Context, id uuid.UUID) (*Account, error)
        Save(ctx context.Context, account *Account) error
    }

    // Transaction manager interface
    type TransactionManager interface {
        ExecuteInTransaction(ctx context.Context, fn func(ctx context.Context) error) error
    }

    // Use Case implementation
    type TransferMoneyUseCase struct {
        accountRepo AccountRepository
        txManager  TransactionManager
    }

    func NewTransferMoneyUseCase(repo AccountRepository, txManager TransactionManager) *TransferMoneyUseCase {
        return &TransferMoneyUseCase{
            accountRepo: repo,
            txManager:  txManager,
        }
    }

    func (uc *TransferMoneyUseCase) Execute(ctx context.Context, req TransferMoneyRequest) (*TransferMoneyResponse, error) {
        var response *TransferMoneyResponse

        err := uc.txManager.ExecuteInTransaction(ctx, func(ctx context.Context) error {
            // Input validation
            if req.Amount.Cmp(big.NewFloat(0)) <= 0 {
                return errors.New("transfer amount must be positive")
            }

            // Retrieve entities
            sourceAccount, err := uc.accountRepo.FindByID(ctx, req.SourceAccountID)
            if err != nil {
                return err
            }

            targetAccount, err := uc.accountRepo.FindByID(ctx, req.TargetAccountID)
            if err != nil {
                return err
            }

            // Execute business logic
            if err := sourceAccount.Withdraw(req.Amount); err != nil {
                return err
            }

            if err := targetAccount.Deposit(req.Amount); err != nil {
                return err
            }

            // Save changes
            if err := uc.accountRepo.Save(ctx, sourceAccount); err != nil {
                return err
            }

            if err := uc.accountRepo.Save(ctx, targetAccount); err != nil {
                return err
            }

            // Create response
            response = &TransferMoneyResponse{
                Success:       true,
                Message:      "Transfer completed successfully",
                SourceBalance: sourceAccount.Balance(),
                TargetBalance: targetAccount.Balance(),
            }

            return nil
        })

        if err != nil {
            return nil, err
        }

        return response, nil
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Command Pattern**
   - Similar structure to use cases
   - Encapsulates request as an object
   - Supports undo operations

2. **Mediator Pattern**
   - Coordinates between components
   - Reduces coupling
   - Centralizes control

3. **Repository Pattern**
   - Provides data access abstraction
   - Supports persistence ignorance
   - Enables testability

## Best Practices ✨

### Configuration
1. Use dependency injection
2. Configure timeouts and retries
3. Implement circuit breakers
4. Use feature flags for complex flows

### Monitoring
1. Log use case execution metrics
2. Track success/failure rates
3. Monitor execution times
4. Implement business metrics

### Testing
1. Write unit tests for business logic
2. Use mocks for external dependencies
3. Implement integration tests
4. Test error scenarios

## Common Pitfalls 🚫

1. **Breaking Single Responsibility**
   - Solution: Split complex use cases
   - Create separate use cases for different flows

2. **Direct Infrastructure Access**
   - Solution: Use interfaces and ports
   - Inject dependencies

3. **Business Logic Leaks**
   - Solution: Keep business rules in entities
   - Use cases should orchestrate, not implement rules

4. **Missing Error Handling**
   - Solution: Define clear error states
   - Implement comprehensive error handling

## Use Cases 🎯

### 1. Financial Services
- Money transfers
- Payment processing
- Account reconciliation
- Fraud detection

### 2. E-commerce
- Order processing
- Inventory management
- Price calculation
- Shipping coordination

### 3. Healthcare
- Appointment scheduling
- Patient registration
- Medical record updates
- Insurance verification

## Deep Dive Topics 🤿

### Thread Safety
1. **Concurrency Control**
   - Transaction isolation levels
   - Optimistic/pessimistic locking
   - Thread-safe implementations

### Distributed Systems
1. **Coordination**
   - Distributed transactions
   - Eventual consistency
   - Saga pattern implementation

### Performance
1. **Optimization**
   - Caching strategies
   - Batch processing
   - Asynchronous execution

## Additional Resources 📚

### References
1. [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2. [Implementing Domain-Driven Design](https://vaughnvernon.co/?page_id=168)
3. [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)

### Tools
1. [Spring Framework](https://spring.io/) - Dependency injection and transaction management
2. [Go Context Package](https://golang.org/pkg/context/) - Context management
3. [OpenTelemetry](https://opentelemetry.io/) - Monitoring and tracing

## FAQs ❓

### Q: When should I create a new use case vs. extending an existing one?
A: Create a new use case when the business flow is significantly different or when it violates the Single Responsibility Principle.

### Q: How should I handle cross-cutting concerns?
A: Use decorators or aspect-oriented programming for logging, security, and other cross-cutting concerns.

### Q: Should use cases be reusable across different applications?
A: Use cases are application-specific, but you can share common patterns and base classes.

### Q: How do I handle long-running operations?
A: Consider using async/await patterns, background jobs, or the Saga pattern for distributed transactions.

### Q: What's the difference between use cases and services?
A: Use cases represent specific business flows, while services typically provide reusable functionality across multiple use cases.