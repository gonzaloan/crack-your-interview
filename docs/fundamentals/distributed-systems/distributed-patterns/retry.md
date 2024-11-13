---
sidebar_position: 4
title: "Retry"
description: "Distributed Patterns - Retry"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Retry Pattern

## Overview

The Retry pattern enables an application to handle transient failures when it tries to connect to a service or network resource by transparently retrying a failed operation. This pattern provides stability and resilience in distributed systems where temporary failures are common.

### Real-World Analogy
Think of trying to make a phone call in an area with poor reception. If the call fails, you naturally try again after a short wait, maybe moving to a better location. If it still fails, you might wait longer before trying again. This is exactly how the Retry pattern works - attempting operations again with increasing delays between attempts.

## 🔑 Key Concepts

### Components
1. **Retry Strategy**: Logic determining when and how to retry
2. **Backoff Policy**: Time delay between retry attempts
3. **Retry Count**: Maximum number of retry attempts
4. **Failure Detection**: Logic to identify retryable failures
5. **Success Criteria**: Conditions for successful operation

### Types of Retry Policies
1. **Immediate Retry**: Retry immediately after failure
2. **Fixed Delay**: Constant time between retries
3. **Exponential Backoff**: Increasing delay between retries
4. **Exponential Backoff with Jitter**: Random variation in delays

## 💻 Implementation

### Retry Pattern Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.time.Duration;
    import java.util.concurrent.CompletableFuture;
    import java.util.function.Supplier;
    import java.util.Random;

    public class RetryExecutor {
        private final int maxAttempts;
        private final Duration initialDelay;
        private final Duration maxDelay;
        private final Random random;

        public RetryExecutor(int maxAttempts, Duration initialDelay, Duration maxDelay) {
            this.maxAttempts = maxAttempts;
            this.initialDelay = initialDelay;
            this.maxDelay = maxDelay;
            this.random = new Random();
        }

        public <T> CompletableFuture<T> executeWithRetry(Supplier<CompletableFuture<T>> operation) {
            return executeWithRetry(operation, 1);
        }

        private <T> CompletableFuture<T> executeWithRetry(
                Supplier<CompletableFuture<T>> operation, 
                int attempt) {
            return operation.get()
                .thenApply(result -> {
                    logSuccess(attempt);
                    return result;
                })
                .exceptionally(error -> {
                    if (attempt >= maxAttempts || !isRetryable(error)) {
                        throw new RetryException("Max attempts reached or non-retryable error", error);
                    }
                    
                    Duration delay = calculateDelay(attempt);
                    logRetry(attempt, delay, error);
                    
                    return waitAndRetry(operation, attempt + 1, delay);
                });
        }

        private <T> T waitAndRetry(
                Supplier<CompletableFuture<T>> operation, 
                int nextAttempt, 
                Duration delay) {
            try {
                Thread.sleep(delay.toMillis());
                return executeWithRetry(operation, nextAttempt).join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RetryException("Retry interrupted", e);
            }
        }

        private Duration calculateDelay(int attempt) {
            long exponentialDelay = initialDelay.toMillis() * (long) Math.pow(2, attempt - 1);
            long jitter = (long) (random.nextDouble() * initialDelay.toMillis());
            
            return Duration.ofMillis(Math.min(
                exponentialDelay + jitter, 
                maxDelay.toMillis()
            ));
        }

        private boolean isRetryable(Throwable error) {
            return error instanceof RetryableException;
        }

        private void logSuccess(int attempt) {
            System.out.printf("Operation succeeded on attempt %d%n", attempt);
        }

        private void logRetry(int attempt, Duration delay, Throwable error) {
            System.out.printf("Attempt %d failed, retrying in %dms. Error: %s%n",
                attempt, delay.toMillis(), error.getMessage());
        }
    }

    class RetryException extends RuntimeException {
        public RetryException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    class RetryableException extends RuntimeException {
        public RetryableException(String message) {
            super(message);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package retry

    import (
        "context"
        "errors"
        "math"
        "math/rand"
        "time"
    )

    type RetryConfig struct {
        MaxAttempts  int
        InitialDelay time.Duration
        MaxDelay     time.Duration
        OnRetry      func(attempt int, err error)
    }

    type RetryableOperation func(ctx context.Context) (interface{}, error)

    type Retrier struct {
        config RetryConfig
    }

    func NewRetrier(config RetryConfig) *Retrier {
        return &Retrier{
            config: config,
        }
    }

    func (r *Retrier) Execute(ctx context.Context, operation RetryableOperation) (interface{}, error) {
        var lastErr error

        for attempt := 1; attempt <= r.config.MaxAttempts; attempt++ {
            result, err := operation(ctx)
            if err == nil {
                return result, nil
            }

            lastErr = err
            if !isRetryable(err) {
                return nil, err
            }

            if attempt == r.config.MaxAttempts {
                break
            }

            delay := r.calculateDelay(attempt)
            
            if r.config.OnRetry != nil {
                r.config.OnRetry(attempt, err)
            }

            select {
            case <-ctx.Done():
                return nil, ctx.Err()
            case <-time.After(delay):
                continue
            }
        }

        return nil, errors.New("max retry attempts reached: " + lastErr.Error())
    }

    func (r *Retrier) calculateDelay(attempt int) time.Duration {
        exponentialDelay := float64(r.config.InitialDelay) * math.Pow(2, float64(attempt-1))
        jitter := rand.Float64() * float64(r.config.InitialDelay)
        
        delay := time.Duration(exponentialDelay + jitter)
        if delay > r.config.MaxDelay {
            delay = r.config.MaxDelay
        }
        
        return delay
    }

    func isRetryable(err error) bool {
        var retryableErr interface {
            Retryable() bool
        }
        
        if errors.As(err, &retryableErr) {
            return retryableErr.Retryable()
        }
        
        return false
    }

    // RetryableError implements retryable error interface
    type RetryableError struct {
        err error
    }

    func NewRetryableError(err error) *RetryableError {
        return &RetryableError{err: err}
    }

    func (e *RetryableError) Error() string {
        return e.err.Error()
    }

    func (e *RetryableError) Retryable() bool {
        return true
    }

    // Usage example:
    // retrier := NewRetrier(RetryConfig{
    //     MaxAttempts:  3,
    //     InitialDelay: time.Second,
    //     MaxDelay:     time.Second * 10,
    //     OnRetry: func(attempt int, err error) {
    //         log.Printf("Retry attempt %d failed: %v", attempt, err)
    //     },
    // })
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

1. **Circuit Breaker Pattern**
    - Prevents retries when service is down
    - Works with Retry to handle temporary failures

2. **Fallback Pattern**
    - Provides alternative when retries fail
    - Ensures graceful degradation

3. **Timeout Pattern**
    - Sets boundaries for retry attempts
    - Prevents infinite retry loops

## 🎯 Best Practices

### Configuration
- Set appropriate retry counts
- Use exponential backoff with jitter
- Configure reasonable timeout values
- Define clear retry criteria

### Monitoring
- Log retry attempts and failures
- Track retry success rates
- Monitor overall latency
- Alert on excessive retries

### Testing
- Test various failure scenarios
- Verify backoff behavior
- Simulate transient failures
- Check timeout handling

## ⚠️ Common Pitfalls

1. **Infinite Retries**
    - *Problem*: No maximum retry limit
    - *Solution*: Always set max retry count

2. **Retry Storms**
    - *Problem*: Many services retrying simultaneously
    - *Solution*: Use jitter in backoff

3. **Retrying Non-Retryable Errors**
    - *Problem*: Retrying permanent failures
    - *Solution*: Properly categorize errors

## 🎉 Use Cases

### 1. Database Operations
- Handle temporary connection losses
- Manage deadlocks
- Deal with transient failures

### 2. Network Requests
- Handle network timeouts
- Manage service unavailability
- Deal with rate limiting

### 3. Message Queue Processing
- Handle queue connectivity issues
- Manage message processing failures
- Deal with temporary service outages

## 🔍 Deep Dive Topics

### Thread Safety
- Ensure thread-safe retry counters
- Handle concurrent retries
- Manage shared resources

### Distributed Systems Considerations
- Consider cascading failures
- Handle distributed timeouts
- Manage cross-service dependencies

### Performance Optimization
- Minimize retry overhead
- Optimize backoff strategies
- Balance retry attempts with system load

## 📚 Additional Resources

### References
1. "Patterns of Enterprise Application Architecture" by Martin Fowler
2. AWS Well-Architected Framework
3. Microsoft Azure Architecture Guide

### Tools
- Resilience4j Retry module
- Spring Retry
- Go-Retry library

## ❓ FAQs

**Q: How many retry attempts should I configure?**
A: Start with 3-5 attempts. Adjust based on operation criticality and failure patterns.

**Q: When should I not use retries?**
A: Don't retry on validation errors, authentication failures, or other permanent errors.

**Q: How do I handle partial success scenarios?**
A: Implement idempotency and track operation state to handle partial completions.

**Q: Should I use the same retry policy for all operations?**
A: No, customize retry policies based on operation characteristics and requirements.

**Q: How do I prevent retry storms?**
A: Use exponential backoff with jitter and consider circuit breakers for widespread issues.