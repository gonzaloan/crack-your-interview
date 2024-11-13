---
sidebar_position: 6
title: "Saga"
description: "Distributed Patterns - Saga"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Saga Pattern

## Overview

The Saga pattern manages distributed transactions by breaking them into a sequence of local transactions, each with a corresponding compensating transaction for rollback. If any step fails, the saga executes compensating transactions in reverse order to maintain data consistency.

### Real-World Analogy
Think of planning a vacation: you book a flight, hotel, and car rental. If the hotel booking fails, you need to cancel the flight. If the car rental fails, you need to cancel both the hotel and flight. Each booking is a separate transaction, and each cancellation is a compensating transaction.

## 🔑 Key Concepts

### Components
1. **Saga Orchestrator**: Coordinates the entire saga sequence
2. **Local Transactions**: Individual steps in the saga
3. **Compensating Transactions**: Rollback actions
4. **Event Bus**: Communication channel
5. **State Tracker**: Monitors saga progress

### Types of Sagas
1. **Choreography**: Services communicate directly through events
2. **Orchestration**: Central coordinator manages the workflow

## 💻 Implementation

### Saga Pattern Implementation with Orchestration

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.*;
    import java.util.concurrent.*;
    import java.util.function.Function;

    public class SagaOrchestrator {
        private final Map<String, SagaStep> steps;
        private final ExecutorService executor;
        private final ConcurrentMap<String, SagaState> sagaStates;

        public SagaOrchestrator() {
            this.steps = new LinkedHashMap<>();
            this.executor = Executors.newCachedThreadPool();
            this.sagaStates = new ConcurrentHashMap<>();
        }

        public record SagaStep(
            Function<SagaContext, Boolean> action,
            Function<SagaContext, Boolean> compensation
        ) {}

        public class SagaState {
            private final String sagaId;
            private final List<String> completedSteps;
            private SagaStatus status;

            public SagaState(String sagaId) {
                this.sagaId = sagaId;
                this.completedSteps = new ArrayList<>();
                this.status = SagaStatus.STARTED;
            }
        }

        public enum SagaStatus {
            STARTED, COMPLETED, FAILED, COMPENSATING, COMPENSATED
        }

        public class SagaContext {
            private final String sagaId;
            private final Map<String, Object> data;

            public SagaContext(String sagaId) {
                this.sagaId = sagaId;
                this.data = new ConcurrentHashMap<>();
            }

            public void putData(String key, Object value) {
                data.put(key, value);
            }

            public Object getData(String key) {
                return data.get(key);
            }
        }

        public void addStep(String stepId, SagaStep step) {
            steps.put(stepId, step);
        }

        public CompletableFuture<Boolean> executeSaga(String sagaId) {
            SagaContext context = new SagaContext(sagaId);
            SagaState state = new SagaState(sagaId);
            sagaStates.put(sagaId, state);

            return CompletableFuture.supplyAsync(() -> {
                try {
                    for (Map.Entry<String, SagaStep> entry : steps.entrySet()) {
                        String stepId = entry.getKey();
                        SagaStep step = entry.getValue();

                        try {
                            boolean success = step.action().apply(context);
                            if (!success) {
                                compensate(context, state);
                                return false;
                            }
                            state.completedSteps.add(stepId);
                        } catch (Exception e) {
                            compensate(context, state);
                            return false;
                        }
                    }

                    state.status = SagaStatus.COMPLETED;
                    return true;
                } catch (Exception e) {
                    state.status = SagaStatus.FAILED;
                    return false;
                }
            }, executor);
        }

        private void compensate(SagaContext context, SagaState state) {
            state.status = SagaStatus.COMPENSATING;
            
            ListIterator<String> iterator = 
                state.completedSteps.listIterator(state.completedSteps.size());

            while (iterator.hasPrevious()) {
                String stepId = iterator.previous();
                SagaStep step = steps.get(stepId);
                
                try {
                    step.compensation().apply(context);
                    iterator.remove();
                } catch (Exception e) {
                    // Log compensation failure
                }
            }

            state.status = SagaStatus.COMPENSATED;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package saga

    import (
        "context"
        "errors"
        "sync"
    )

    type SagaStatus int

    const (
        Started SagaStatus = iota
        Completed
        Failed
        Compensating
        Compensated
    )

    type SagaStep struct {
        Action        func(context.Context, *SagaContext) error
        Compensation  func(context.Context, *SagaContext) error
    }

    type SagaContext struct {
        ID    string
        Data  map[string]interface{}
        mutex sync.RWMutex
    }

    type SagaState struct {
        ID             string
        CompletedSteps []string
        Status         SagaStatus
        mutex          sync.RWMutex
    }

    type SagaOrchestrator struct {
        steps      map[string]SagaStep
        states     map[string]*SagaState
        stepOrder  []string
        mutex      sync.RWMutex
    }

    func NewSagaOrchestrator() *SagaOrchestrator {
        return &SagaOrchestrator{
            steps:      make(map[string]SagaStep),
            states:     make(map[string]*SagaState),
            stepOrder:  make([]string, 0),
        }
    }

    func (s *SagaOrchestrator) AddStep(stepID string, step SagaStep) {
        s.mutex.Lock()
        defer s.mutex.Unlock()

        s.steps[stepID] = step
        s.stepOrder = append(s.stepOrder, stepID)
    }

    func (s *SagaOrchestrator) ExecuteSaga(ctx context.Context, sagaID string) error {
        sagaContext := &SagaContext{
            ID:   sagaID,
            Data: make(map[string]interface{}),
        }

        state := &SagaState{
            ID:     sagaID,
            Status: Started,
        }

        s.mutex.Lock()
        s.states[sagaID] = state
        s.mutex.Unlock()

        for _, stepID := range s.stepOrder {
            step := s.steps[stepID]

            if err := step.Action(ctx, sagaContext); err != nil {
                s.compensate(ctx, sagaContext, state)
                return err
            }

            state.mutex.Lock()
            state.CompletedSteps = append(state.CompletedSteps, stepID)
            state.mutex.Unlock()
        }

        state.mutex.Lock()
        state.Status = Completed
        state.mutex.Unlock()

        return nil
    }

    func (s *SagaOrchestrator) compensate(
        ctx context.Context,
        sagaContext *SagaContext,
        state *SagaState,
    ) error {
        state.mutex.Lock()
        state.Status = Compensating
        state.mutex.Unlock()

        // Reverse through completed steps
        for i := len(state.CompletedSteps) - 1; i >= 0; i-- {
            stepID := state.CompletedSteps[i]
            step := s.steps[stepID]

            if err := step.Compensation(ctx, sagaContext); err != nil {
                return errors.New("compensation failed: " + err.Error())
            }
        }

        state.mutex.Lock()
        state.Status = Compensated
        state.CompletedSteps = []string{}
        state.mutex.Unlock()

        return nil
    }

    func (c *SagaContext) SetData(key string, value interface{}) {
        c.mutex.Lock()
        defer c.mutex.Unlock()
        c.Data[key] = value
    }

    func (c *SagaContext) GetData(key string) (interface{}, bool) {
        c.mutex.RLock()
        defer c.mutex.RUnlock()
        value, exists := c.Data[key]
        return value, exists
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

1. **Event Sourcing Pattern**
    - Records state changes as events
    - Complements Saga's transaction management

2. **CQRS Pattern**
    - Separates read and write operations
    - Helps manage complex data consistency

3. **Message Queue Pattern**
    - Provides reliable messaging
    - Ensures saga step communication

## 🎯 Best Practices

### Configuration
- Define clear compensation actions
- Set appropriate timeouts
- Configure retry policies
- Implement idempotency

### Monitoring
- Track saga completion rates
- Monitor compensation triggers
- Log saga state transitions
- Alert on stuck sagas

### Testing
- Test compensation flows
- Verify concurrent sagas
- Simulate partial failures
- Check idempotency

## ⚠️ Common Pitfalls

1. **Incomplete Compensation**
    - *Problem*: Missing or incorrect compensation logic
    - *Solution*: Test all compensation paths

2. **Saga Timeouts**
    - *Problem*: Long-running sagas
    - *Solution*: Implement timeout handling

3. **Data Consistency**
    - *Problem*: Inconsistent states during compensation
    - *Solution*: Ensure atomic operations

## 🎉 Use Cases

### 1. E-Commerce Order Processing
- Steps: Inventory, Payment, Shipping
- Compensations: Refund, Restock, Cancel Delivery

### 2. Travel Booking System
- Steps: Flight, Hotel, Car Rental
- Compensations: Cancel each booking

### 3. Bank Money Transfer
- Steps: Debit, Credit, Notification
- Compensations: Reverse transactions

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent saga execution
- Safe state management
- Thread-safe compensation

### Distributed Systems Considerations
- Cross-service coordination
- Network partition handling
- Eventual consistency

### Performance Optimization
- Parallel step execution
- Efficient state tracking
- Resource management

## 📚 Additional Resources

### References
1. "Microservices Patterns" by Chris Richardson
2. "Domain-Driven Design" by Eric Evans
3. "Enterprise Integration Patterns" by Hohpe and Woolf

### Tools
- Axon Framework
- Eventuate Tram Sagas
- Apache Camel

## ❓ FAQs

**Q: When should I use Sagas vs. 2PC (Two-Phase Commit)?**
A: Use Sagas for long-living transactions across microservices. Use 2PC for short-lived transactions within a single database.

**Q: How do I handle concurrent Sagas?**
A: Implement proper isolation and use unique saga IDs to track and manage concurrent executions.

**Q: What happens if compensation fails?**
A: Implement retry mechanisms and manual intervention procedures for failed compensations.

**Q: How do I maintain data consistency?**
A: Use eventual consistency and ensure all steps are idempotent.

**Q: Should I use choreography or orchestration?**
A: Use orchestration for complex workflows and choreography for simple, loosely coupled services.
