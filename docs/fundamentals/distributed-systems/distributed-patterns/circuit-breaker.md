---
sidebar_position: 2
title: "Circuit Breaker"
description: "Distributed Patterns - Circuit Beaker"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔌 Circuit Breaker Pattern

## Overview

The Circuit Breaker pattern prevents system failures by detecting failing remote service calls and stopping further calls to failing components. Like an electrical circuit breaker that protects your home from power surges, this pattern protects your distributed system from cascading failures.

### Real-World Analogy
Imagine a crowd control system at a theme park. When a ride experiences technical issues, staff immediately stop letting new people join the queue (circuit "opens"). After a set time, they let a few people in to test if the ride is working (half-open state). If successful, they fully reopen the queue (circuit "closes"); if not, they continue blocking new entries.

## 🔑 Key Concepts

### States
1. **Closed**: Normal operation, requests flow through
2. **Open**: Requests fail fast, no remote calls made
3. **Half-Open**: Limited requests allowed to test system

### Components
- **Failure Counter**: Tracks failed requests
- **Threshold Detector**: Monitors failure thresholds
- **State Machine**: Manages circuit breaker states
- **Timer**: Controls reset/recovery timing
- **Fallback Handler**: Provides alternative responses

## 💻 Implementation

### Basic Circuit Breaker Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.time.LocalDateTime;
    import java.util.concurrent.atomic.AtomicInteger;
    import java.util.concurrent.atomic.AtomicReference;

    public class CircuitBreaker {
        private final AtomicReference<State> state = new AtomicReference<>(State.CLOSED);
        private final AtomicInteger failureCount = new AtomicInteger(0);
        private final AtomicReference<LocalDateTime> lastFailureTime = new AtomicReference<>();
        
        private final int failureThreshold;
        private final int resetTimeout;
        
        public enum State {
            CLOSED, OPEN, HALF_OPEN
        }
        
        public CircuitBreaker(int failureThreshold, int resetTimeout) {
            this.failureThreshold = failureThreshold;
            this.resetTimeout = resetTimeout;
        }
        
        public <T> T execute(ServiceCall<T> serviceCall) throws Exception {
            if (shouldAllowExecution()) {
                try {
                    T result = serviceCall.execute();
                    onSuccess();
                    return result;
                } catch (Exception e) {
                    onFailure();
                    throw e;
                }
            }
            return handleFailedCircuit();
        }
        
        private boolean shouldAllowExecution() {
            State currentState = state.get();
            if (currentState == State.CLOSED) {
                return true;
            }
            
            if (currentState == State.OPEN) {
                LocalDateTime lastFailure = lastFailureTime.get();
                if (lastFailure != null && 
                    LocalDateTime.now().minusSeconds(resetTimeout).isAfter(lastFailure)) {
                    state.compareAndSet(State.OPEN, State.HALF_OPEN);
                    return true;
                }
                return false;
            }
            
            return true; // HALF_OPEN state allows one test request
        }
        
        private void onSuccess() {
            failureCount.set(0);
            state.set(State.CLOSED);
        }
        
        private void onFailure() {
            lastFailureTime.set(LocalDateTime.now());
            if (failureCount.incrementAndGet() >= failureThreshold) {
                state.set(State.OPEN);
            }
        }
        
        private <T> T handleFailedCircuit() throws Exception {
            throw new CircuitBreakerException("Circuit breaker is open");
        }
    }

    @FunctionalInterface
    interface ServiceCall<T> {
        T execute() throws Exception;
    }

    class CircuitBreakerException extends Exception {
        public CircuitBreakerException(String message) {
            super(message);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package circuitbreaker

    import (
        "errors"
        "sync"
        "sync/atomic"
        "time"
    )

    type State int32

    const (
        StateClosed State = iota
        StateOpen
        StateHalfOpen
    )

    type CircuitBreaker struct {
        state         State
        mutex         sync.RWMutex
        failureCount  int32
        lastFailure   time.Time
        
        failureThreshold int32
        resetTimeout     time.Duration
    }

    func NewCircuitBreaker(failureThreshold int32, resetTimeout time.Duration) *CircuitBreaker {
        return &CircuitBreaker{
            state:            StateClosed,
            failureThreshold: failureThreshold,
            resetTimeout:     resetTimeout,
        }
    }

    func (cb *CircuitBreaker) Execute(operation func() (interface{}, error)) (interface{}, error) {
        if !cb.shouldAllowExecution() {
            return nil, errors.New("circuit breaker is open")
        }

        result, err := operation()
        if err != nil {
            cb.onFailure()
            return nil, err
        }

        cb.onSuccess()
        return result, nil
    }

    func (cb *CircuitBreaker) shouldAllowExecution() bool {
        cb.mutex.RLock()
        defer cb.mutex.RUnlock()

        switch cb.state {
        case StateClosed:
            return true
        case StateOpen:
            if time.Since(cb.lastFailure) > cb.resetTimeout {
                cb.mutex.RUnlock()
                cb.mutex.Lock()
                cb.state = StateHalfOpen
                cb.mutex.Unlock()
                cb.mutex.RLock()
                return true
            }
            return false
        case StateHalfOpen:
            return true
        default:
            return false
        }
    }

    func (cb *CircuitBreaker) onSuccess() {
        cb.mutex.Lock()
        defer cb.mutex.Unlock()

        atomic.StoreInt32(&cb.failureCount, 0)
        cb.state = StateClosed
    }

    func (cb *CircuitBreaker) onFailure() {
        cb.mutex.Lock()
        defer cb.mutex.Unlock()

        cb.lastFailure = time.Now()
        if atomic.AddInt32(&cb.failureCount, 1) >= cb.failureThreshold {
            cb.state = StateOpen
        }
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

1. **Retry Pattern**
   - Works with Circuit Breaker to attempt failed operations
   - Circuit Breaker prevents unnecessary retries

2. **Bulkhead Pattern**
   - Isolates components to prevent cascade failures
   - Complements Circuit Breaker's failure isolation

3. **Fallback Pattern**
   - Provides alternative service when circuit is open
   - Ensures system degradation is graceful

## 🎯 Best Practices

### Configuration
- Set appropriate thresholds based on service SLAs
- Configure timeouts based on operation complexity
- Use different thresholds for different types of failures

### Monitoring
- Track circuit state changes
- Monitor failure rates and patterns
- Log circuit breaker events for analysis

### Testing
- Test all state transitions
- Simulate various failure scenarios
- Verify fallback behavior

## ⚠️ Common Pitfalls

1. **Incorrect Thresholds**
   - *Problem*: Too low/high failure thresholds
   - *Solution*: Tune based on actual service behavior

2. **Missing Fallbacks**
   - *Problem*: No alternative when circuit opens
   - *Solution*: Implement meaningful fallback logic

3. **Race Conditions**
   - *Problem*: Inconsistent state transitions
   - *Solution*: Use proper synchronization

## 🎉 Use Cases

### 1. Payment Processing
- Protects against payment gateway failures
- Prevents customer transaction timeouts
- Provides graceful degradation options

### 2. API Gateway
- Manages multiple downstream services
- Prevents cascade failures
- Enables granular service monitoring

### 3. Microservices Communication
- Handles inter-service communication
- Protects against slow services
- Maintains system stability

## 🔍 Deep Dive Topics

### Thread Safety
- Use atomic operations for counters
- Implement proper state synchronization
- Handle concurrent state transitions

### Distributed Systems Integration
- Consider network latency in timeouts
- Handle distributed state management
- Implement cross-node circuit breaker states

### Performance Considerations
- Minimize synchronization overhead
- Optimize state checks
- Use efficient failure detection

## 📚 Additional Resources

### References
1. "Release It!" by Michael Nygard
2. "Building Microservices" by Sam Newman
3. Netflix Tech Blog - Hystrix Circuit Breaker

### Tools
- Resilience4j
- Hystrix (Netflix)
- Microsoft's Polly

## ❓ FAQs

**Q: How do I choose the right threshold values?**
A: Start with historical error rates and adjust based on monitoring data. Consider service SLAs and acceptable failure rates.

**Q: Should I use a single circuit breaker for all operations?**
A: No, use separate circuit breakers for different operations or dependencies to prevent unrelated failures from affecting each other.

**Q: How does Circuit Breaker handle slow responses?**
A: Implement timeouts in combination with Circuit Breaker to handle slow responses as failures.

**Q: Can Circuit Breaker work across multiple instances?**
A: Yes, using distributed state management systems or service meshes for coordination.

**Q: How do I test Circuit Breaker behavior?**
A: Use chaos engineering tools and fault injection to simulate failures and verify Circuit Breaker behavior.