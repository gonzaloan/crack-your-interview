---
sidebar_position: 3
title: "Bulkhead"
description: "Distributed Patterns - Bulkhead"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🚢 Bulkhead Pattern

## Overview

The Bulkhead pattern isolates components of an application into pools so that if one fails, the others will continue to function. The name comes from ships' bulkheads - the watertight compartments that prevent a ship from sinking if one section is breached.

### Real-World Analogy
Think of an apartment building with multiple elevators. If one elevator breaks down, others continue operating, ensuring residents can still move between floors. Similarly, bulkheads in applications isolate failures to prevent system-wide outages.

## 🔑 Key Concepts

### Components
1. **Resource Pools**: Isolated groups of resources
2. **Thread Pools**: Dedicated threading for different services
3. **Connection Pools**: Segregated connection management
4. **Isolation Boundaries**: Clear separation between components
5. **Resource Limits**: Caps on resource usage per pool

### Types of Bulkheads
1. **Thread Pool Isolation**: Separate thread pools per component
2. **Process Isolation**: Different processes for critical services
3. **Connection Pool Isolation**: Separate connection pools per service
4. **Tenant Isolation**: Resources segregated by customer/tenant

## 💻 Implementation

### Thread Pool Bulkhead Example

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.function.Supplier;

    public class BulkheadExecutor {
        private final Map<String, ExecutorService> executors;
        private final Map<String, Semaphore> semaphores;
        
        public static class BulkheadConfig {
            private final int maxConcurrentCalls;
            private final int maxThreadPoolSize;
            private final int queueCapacity;
            
            public BulkheadConfig(int maxConcurrentCalls, int maxThreadPoolSize, int queueCapacity) {
                this.maxConcurrentCalls = maxConcurrentCalls;
                this.maxThreadPoolSize = maxThreadPoolSize;
                this.queueCapacity = queueCapacity;
            }
        }
        
        public BulkheadExecutor() {
            this.executors = new ConcurrentHashMap<>();
            this.semaphores = new ConcurrentHashMap<>();
        }
        
        public void createBulkhead(String name, BulkheadConfig config) {
            ExecutorService executor = new ThreadPoolExecutor(
                config.maxThreadPoolSize,
                config.maxThreadPoolSize,
                0L,
                TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(config.queueCapacity),
                new ThreadPoolExecutor.CallerRunsPolicy()
            );
            
            Semaphore semaphore = new Semaphore(config.maxConcurrentCalls);
            
            executors.put(name, executor);
            semaphores.put(name, semaphore);
        }
        
        public <T> CompletableFuture<T> execute(String bulkheadName, 
                                               Supplier<T> task) {
            ExecutorService executor = executors.get(bulkheadName);
            Semaphore semaphore = semaphores.get(bulkheadName);
            
            if (executor == null || semaphore == null) {
                throw new IllegalArgumentException("Bulkhead not found: " + bulkheadName);
            }
            
            return CompletableFuture.supplyAsync(() -> {
                try {
                    if (!semaphore.tryAcquire(1, TimeUnit.SECONDS)) {
                        throw new BulkheadException("Bulkhead capacity full");
                    }
                    
                    try {
                        return task.get();
                    } finally {
                        semaphore.release();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new BulkheadException("Operation interrupted");
                }
            }, executor);
        }
        
        public void shutdown() {
            executors.values().forEach(ExecutorService::shutdown);
        }
    }

    class BulkheadException extends RuntimeException {
        public BulkheadException(String message) {
            super(message);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package bulkhead

    import (
        "context"
        "errors"
        "sync"
        "time"
    )

    type Bulkhead struct {
        name            string
        maxConcurrent   int
        maxWaitTime     time.Duration
        semaphore       chan struct{}
        executionCount  int64
        mutex          sync.RWMutex
    }

    type BulkheadConfig struct {
        Name           string
        MaxConcurrent  int
        MaxWaitTime    time.Duration
    }

    func NewBulkhead(config BulkheadConfig) *Bulkhead {
        return &Bulkhead{
            name:          config.Name,
            maxConcurrent: config.MaxConcurrent,
            maxWaitTime:   config.MaxWaitTime,
            semaphore:     make(chan struct{}, config.MaxConcurrent),
        }
    }

    func (b *Bulkhead) Execute(ctx context.Context, task func() (interface{}, error)) (interface{}, error) {
        select {
        case b.semaphore <- struct{}{}:
            defer func() { <-b.semaphore }()
            
            b.mutex.Lock()
            b.executionCount++
            b.mutex.Unlock()
            
            return task()
            
        case <-time.After(b.maxWaitTime):
            return nil, errors.New("bulkhead capacity full")
            
        case <-ctx.Done():
            return nil, ctx.Err()
        }
    }

    func (b *Bulkhead) GetExecutionCount() int64 {
        b.mutex.RLock()
        defer b.mutex.RUnlock()
        return b.executionCount
    }

    func (b *Bulkhead) GetAvailablePermits() int {
        return b.maxConcurrent - len(b.semaphore)
    }

    // BulkheadManager manages multiple bulkheads
    type BulkheadManager struct {
        bulkheads map[string]*Bulkhead
        mutex     sync.RWMutex
    }

    func NewBulkheadManager() *BulkheadManager {
        return &BulkheadManager{
            bulkheads: make(map[string]*Bulkhead),
        }
    }

    func (bm *BulkheadManager) CreateBulkhead(config BulkheadConfig) error {
        bm.mutex.Lock()
        defer bm.mutex.Unlock()

        if _, exists := bm.bulkheads[config.Name]; exists {
            return errors.New("bulkhead already exists")
        }

        bm.bulkheads[config.Name] = NewBulkhead(config)
        return nil
    }

    func (bm *BulkheadManager) Execute(ctx context.Context, 
                                     bulkheadName string, 
                                     task func() (interface{}, error)) (interface{}, error) {
        bm.mutex.RLock()
        bulkhead, exists := bm.bulkheads[bulkheadName]
        bm.mutex.RUnlock()

        if !exists {
            return nil, errors.New("bulkhead not found")
        }

        return bulkhead.Execute(ctx, task)
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

1. **Circuit Breaker Pattern**
    - Complements Bulkhead by preventing cascading failures
    - Works together for robust failure isolation

2. **Rate Limiter Pattern**
    - Controls resource consumption rate
    - Helps prevent bulkhead overflow

3. **Retry Pattern**
    - Can be used within bulkhead compartments
    - Manages failed operations within isolation boundaries

## 🎯 Best Practices

### Configuration
- Size pools based on resource capacity
- Configure timeouts per bulkhead
- Set appropriate queue sizes
- Monitor and adjust limits based on usage

### Monitoring
- Track resource usage per bulkhead
- Monitor rejection rates
- Alert on capacity thresholds
- Measure response times per pool

### Testing
- Load test each bulkhead independently
- Verify isolation under failure
- Test overflow scenarios
- Simulate resource exhaustion

## ⚠️ Common Pitfalls

1. **Incorrect Pool Sizing**
    - *Problem*: Pools too large or small
    - *Solution*: Size based on resource capacity and usage patterns

2. **Missing Timeout Configuration**
    - *Problem*: Infinite wait times
    - *Solution*: Implement appropriate timeouts

3. **Resource Leaks**
    - *Problem*: Not releasing resources
    - *Solution*: Use try-finally blocks and proper cleanup

## 🎉 Use Cases

### 1. Multi-tenant Applications
- Isolate resources per tenant
- Prevent noisy neighbor problems
- Guarantee service levels

### 2. API Gateway Services
- Separate pools for different backend services
- Protect against downstream failures
- Manage varied load patterns

### 3. Database Connections
- Isolate connection pools by service
- Manage different database workloads
- Prevent connection exhaustion

## 🔍 Deep Dive Topics

### Thread Safety
- Use thread-safe collections
- Implement proper synchronization
- Handle concurrent resource allocation

### Distributed Systems Considerations
- Coordinate across multiple instances
- Handle distributed state
- Manage cross-node resources

### Performance Optimization
- Minimize synchronization overhead
- Optimize resource allocation
- Monitor and tune pool sizes

## 📚 Additional Resources

### References
1. "Release It!" by Michael Nygard
2. Netflix Tech Blog - Fault Tolerance
3. Microsoft Azure Architecture Guide

### Tools
- Resilience4j Bulkhead
- Hystrix Threading Isolation
- Azure App Service deployment slots

## ❓ FAQs

**Q: How do I determine the right pool sizes?**
A: Start with (N × CPU cores) for compute-bound tasks, and higher for I/O-bound tasks. Monitor and adjust based on metrics.

**Q: Should I use thread or semaphore isolation?**
A: Use thread isolation for CPU-bound tasks and semaphore isolation for I/O-bound operations.

**Q: How do bulkheads affect system resources?**
A: Each bulkhead consumes memory and some CPU overhead. Size them appropriately for your system's capacity.

**Q: Can bulkheads work with async operations?**
A: Yes, modern implementations support both synchronous and asynchronous operations.

**Q: How do I handle bulkhead overflow?**
A: Implement fallback mechanisms, queue requests, or gracefully reject excess load.