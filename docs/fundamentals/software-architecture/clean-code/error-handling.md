---
sidebar_position: 5
title: "Error Handling"
description: "Clean approaches to error handling and exception management"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🚫 Clean Code Error Handling

## Overview

Clean error handling is crucial for building robust and maintainable software. Just as a well-designed safety system in a factory prevents accidents and handles emergencies effectively, proper error handling ensures your application gracefully manages unexpected situations.

### Real-World Analogy
Think of error handling like a hospital's emergency response system. Different types of emergencies (errors) require different responses, each with clear protocols (error handling strategies) and appropriate escalation paths (error propagation).

## 🔑 Key Concepts

### Error Types
1. **Recoverable Errors**: Application can continue running
2. **Unrecoverable Errors**: Application must terminate
3. **Programming Errors**: Bugs that need fixing
4. **Operational Errors**: External system failures

### Error Handling Strategies
1. **Return Error Values**: Explicit error checking
2. **Exceptions**: For exceptional conditions
3. **Panic/Recovery**: For unrecoverable situations
4. **Result Types**: For expected failure cases

## 💻 Implementation

### Basic Error Handling Patterns

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.io.IOException;
    import java.util.Optional;
    import java.util.logging.Logger;

    public class UserService {
        private static final Logger logger = Logger.getLogger(UserService.class.getName());

        // Result class for handling expected failures
        public class Result<T> {
            private final T value;
            private final String error;
            
            private Result(T value, String error) {
                this.value = value;
                this.error = error;
            }
            
            public static <T> Result<T> success(T value) {
                return new Result<>(value, null);
            }
            
            public static <T> Result<T> failure(String error) {
                return new Result<>(null, error);
            }
            
            public boolean isSuccess() {
                return error == null;
            }
            
            public Optional<T> getValue() {
                return Optional.ofNullable(value);
            }
            
            public Optional<String> getError() {
                return Optional.ofNullable(error);
            }
        }

        // Example of handling different error cases
        public Result<User> createUser(UserRequest request) {
            try {
                // Validation
                if (!isValidRequest(request)) {
                    return Result.failure("Invalid request");
                }

                // Business logic that might throw
                User user = userRepository.save(request.toUser());
                return Result.success(user);

            } catch (DatabaseException e) {
                // Log technical details
                logger.severe("Database error: " + e.getMessage());
                // Return user-friendly message
                return Result.failure("Unable to create user");

            } catch (Exception e) {
                // Unexpected error
                logger.severe("Unexpected error: " + e.getMessage());
                throw new SystemException("Critical error occurred", e);
            }
        }

        // Custom exception for domain-specific errors
        public class UserValidationException extends RuntimeException {
            private final String userId;
            
            public UserValidationException(String message, String userId) {
                super(message);
                this.userId = userId;
            }
            
            public String getUserId() {
                return userId;
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package user

    import (
        "fmt"
        "log"
    )

    // Result type for handling expected failures
    type Result[T any] struct {
        Value T
        Error error
    }

    // Custom error types
    type ValidationError struct {
        Field string
        Msg   string
    }

    func (e *ValidationError) Error() string {
        return fmt.Sprintf("validation error: %s - %s", e.Field, e.Msg)
    }

    type UserService struct {
        logger *log.Logger
        repo   UserRepository
    }

    // Example of handling different error cases
    func (s *UserService) CreateUser(request *UserRequest) (*Result[*User], error) {
        // Validation
        if err := validateRequest(request); err != nil {
            return &Result[*User]{
                Error: &ValidationError{
                    Field: "request",
                    Msg:   err.Error(),
                },
            }, nil
        }

        // Business logic with error handling
        user, err := s.repo.Save(request.ToUser())
        if err != nil {
            // Log technical details
            s.logger.Printf("Database error: %v", err)
            
            // Return user-friendly error
            return &Result[*User]{
                Error: fmt.Errorf("unable to create user"),
            }, nil
        }

        return &Result[*User]{Value: user}, nil
    }

    // Recovery middleware
    func RecoveryMiddleware(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            defer func() {
                if err := recover(); err != nil {
                    log.Printf("panic recovered: %v", err)
                    http.Error(w, "Internal Server Error", http.StatusInternalServerError)
                }
            }()
            next.ServeHTTP(w, r)
        })
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

- **Circuit Breaker**: Handles failures in distributed systems
- **Retry Pattern**: Automatically retries failed operations
- **Fallback Pattern**: Provides alternative when operation fails
- **Bulkhead Pattern**: Isolates failures to prevent system-wide issues

## ✨ Best Practices

### Error Design Principles
1. **Be Specific**
    - Use custom error types
    - Include relevant context
    - Maintain error hierarchies

2. **Error Propagation**
    - Handle errors at appropriate levels
    - Don't swallow errors
    - Log with proper context

3. **User Experience**
    - Provide user-friendly messages
    - Hide technical details
    - Maintain security

### Implementation Examples

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class OrderProcessor {
        private static final Logger logger = Logger.getLogger(OrderProcessor.class.getName());

        // Good: Custom exception with context
        public class InsufficientInventoryException extends BusinessException {
            private final String productId;
            private final int requested;
            private final int available;

            public InsufficientInventoryException(String productId, int requested, int available) {
                super(String.format("Insufficient inventory for product %s", productId));
                this.productId = productId;
                this.requested = requested;
                this.available = available;
            }

            // Getters for additional context
        }

        public Order processOrder(OrderRequest request) throws OrderProcessingException {
            try {
                validateInventory(request);
                return createOrder(request);
            } catch (InsufficientInventoryException e) {
                // Log technical details
                logger.warning(String.format(
                    "Inventory check failed - Product: %s, Requested: %d, Available: %d",
                    e.getProductId(), e.getRequested(), e.getAvailable()
                ));
                // Throw user-friendly exception
                throw new OrderProcessingException("Some items are out of stock");
            } catch (Exception e) {
                logger.severe("Order processing failed: " + e.getMessage());
                throw new OrderProcessingException("Unable to process order");
            }
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package order

    import (
        "fmt"
        "log"
    )

    // Good: Custom error type with context
    type InsufficientInventoryError struct {
        ProductID string
        Requested int
        Available int
    }

    func (e *InsufficientInventoryError) Error() string {
        return fmt.Sprintf(
            "insufficient inventory for product %s (requested: %d, available: %d)",
            e.ProductID, e.Requested, e.Available,
        )
    }

    type OrderProcessor struct {
        logger *log.Logger
    }

    func (p *OrderProcessor) ProcessOrder(request *OrderRequest) (*Order, error) {
        if err := p.validateInventory(request); err != nil {
            var inventoryErr *InsufficientInventoryError
            if errors.As(err, &inventoryErr) {
                // Log technical details
                p.logger.Printf(
                    "Inventory check failed - Product: %s, Requested: %d, Available: %d",
                    inventoryErr.ProductID,
                    inventoryErr.Requested,
                    inventoryErr.Available,
                )
                // Return user-friendly error
                return nil, fmt.Errorf("some items are out of stock")
            }
            return nil, fmt.Errorf("unable to process order")
        }

        return p.createOrder(request)
    }
    ```
  </TabItem>
</Tabs>

## ⚠️ Common Pitfalls

1. **Ignoring Errors**
```java
// Bad
try {
    doSomething();
} catch (Exception e) {
    // Do nothing
}

// Good
try {
    doSomething();
} catch (Exception e) {
    logger.error("Operation failed", e);
    throw new ServiceException("Unable to complete operation", e);
}
```

2. **Generic Error Messages**
```java
// Bad
throw new Exception("Error occurred");

// Good
throw new OrderValidationException(
    "Invalid order total: must be greater than zero",
    orderId,
    total
);
```

3. **Exposing Technical Details**
```java
// Bad
return new ApiError("SQL error: table users not found");

// Good
logger.error("Database error: {}", technicalMessage);
return new ApiError("Unable to process request");
```

## 🎯 Use Cases

### 1. Payment Processing
```java
public class PaymentProcessor {
    public PaymentResult processPayment(PaymentRequest request) {
        try {
            validateRequest(request);
            
            PaymentGatewayResponse response = gateway.process(request);
            if (!response.isSuccessful()) {
                return PaymentResult.failure(
                    "Payment declined: " + getCustomerFriendlyMessage(response)
                );
            }
            
            return PaymentResult.success(response.getTransactionId());
            
        } catch (PaymentValidationException e) {
            logger.info("Payment validation failed: {}", e.getMessage());
            return PaymentResult.failure(e.getUserMessage());
            
        } catch (PaymentGatewayException e) {
            logger.error("Payment gateway error: {}", e.getMessage());
            return PaymentResult.failure("Unable to process payment");
            
        } catch (Exception e) {
            logger.error("Unexpected error in payment processing", e);
            return PaymentResult.failure("A system error occurred");
        }
    }
}
```

### 2. File Processing
```java
public class FileProcessor {
    public ProcessingResult processFile(String filePath) {
        try {
            validateFile(filePath);
            
            List<Record> records = readRecords(filePath);
            return ProcessingResult.success(records);
            
        } catch (FileNotFoundException e) {
            logger.warn("File not found: {}", filePath);
            return ProcessingResult.failure("File not found");
            
        } catch (InvalidFormatException e) {
            logger.warn("Invalid file format: {}", e.getMessage());
            return ProcessingResult.failure("Invalid file format");
            
        } catch (IOException e) {
            logger.error("Error reading file", e);
            return ProcessingResult.failure("Unable to process file");
        }
    }
}
```

### 3. API Integration
```java
public class ExternalServiceClient {
    public ApiResult callExternalService(ServiceRequest request) {
        try {
            validateRequest(request);
            
            Response response = httpClient.send(request);
            return handleResponse(response);
            
        } catch (ConnectionException e) {
            logger.error("Connection failed: {}", e.getMessage());
            return ApiResult.failure("Service temporarily unavailable");
            
        } catch (TimeoutException e) {
            logger.error("Request timed out", e);
            return ApiResult.failure("Request timed out");
            
        } catch (Exception e) {
            logger.error("External service error", e);
            return ApiResult.failure("Unable to complete request");
        }
    }
}
```

## 🔍 Deep Dive Topics

### Thread Safety
```java
public class ThreadSafeErrorHandler {
    private final ConcurrentMap<String, AtomicInteger> errorCounts = new ConcurrentHashMap<>();
    private final CircuitBreaker circuitBreaker;

    public void handleError(String operationType, Exception e) {
        // Thread-safe error counting
        AtomicInteger count = errorCounts.computeIfAbsent(
            operationType,
            k -> new AtomicInteger(0)
        );
        
        if (count.incrementAndGet() > threshold) {
            circuitBreaker.tripBreaker(operationType);
        }
    }
}
```

### Performance
```java
public class HighPerformanceErrorHandler {
    private final ErrorBuffer errorBuffer;
    
    public void handleError(Exception e) {
        // Use object pooling for common errors
        ErrorContext context = errorContextPool.borrow();
        try {
            context.setException(e);
            errorBuffer.record(context);
        } finally {
            errorContextPool.return(context);
        }
    }
}
```

### Distributed Systems
```java
public class DistributedErrorHandler {
    public void handleDistributedError(SystemError error) {
        // Propagate errors to other nodes
        messageQueue.broadcast(new ErrorEvent(error));
        
        // Update global error state
        errorStateManager.updateState(error);
        
        // Trigger recovery procedures
        recoveryCoordinator.initiateRecovery(error);
    }
}
```

## 📚 Additional Resources

### Tools
- Error tracking: Sentry, Rollbar
- Logging: Log4j, Zap
- Monitoring: Prometheus, Grafana
- Testing: JUnit, Testify

### References
- "Clean Code" by Robert C. Martin
- "Release It!" by Michael Nygard
- "Effective Java" by Joshua Bloch
- "Go Programming Language" by Alan A. A. Donovan

## ❓ FAQs

### Q: When should I use exceptions vs. return values?
A: Use exceptions for unexpected conditions and return values for expected failures.

### Q: How detailed should error messages be?
A: Technical details in logs, user-friendly messages in responses.

### Q: Should I create custom exceptions?
A: Yes, when they provide meaningful context about the error.

### Q: How to handle errors in async operations?
A: Use promises/futures with proper error callbacks and propagation.

### Q: What about retry logic?
A: Implement for transient failures, with exponential backoff and maximum attempts.