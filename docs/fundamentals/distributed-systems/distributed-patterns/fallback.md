---
sidebar_position: 5
title: "Fallback"
description: "Distributed Patterns - Fallback"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Fallback Pattern

## Overview

The Fallback pattern provides alternative functionality when a service fails. Instead of failing completely, the system degrades gracefully by executing alternative logic or returning cached/default data.

### Real-World Analogy
Think of a vending machine that accepts both card and cash payments. If the card reader fails, it falls back to accepting cash only. Similarly, if a GPS navigation system loses satellite signal, it falls back to using cellular towers for approximate location. These are real-world examples of fallback mechanisms ensuring continuous service, albeit with reduced functionality.

## 🔑 Key Concepts

### Components
1. **Primary Service**: Main functionality provider
2. **Fallback Service**: Alternative functionality
3. **Failure Detector**: Identifies service failures
4. **Fallback Strategy**: Logic for choosing alternatives
5. **Recovery Monitor**: Tracks primary service status

### Fallback Types
1. **Static Fallback**: Returns predefined default values
2. **Cache Fallback**: Returns cached previous results
3. **Alternative Service**: Uses different service implementation
4. **Degraded Operation**: Provides limited functionality

## 💻 Implementation

### Fallback Pattern Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.Optional;
    import java.util.function.Supplier;
    import java.util.concurrent.ConcurrentHashMap;
    import java.util.concurrent.TimeUnit;

    public class FallbackHandler<T> {
        private final ConcurrentHashMap<String, CacheEntry<T>> cache;
        private final long cacheExpirationTime;
        
        public FallbackHandler(long cacheExpirationTime, TimeUnit timeUnit) {
            this.cache = new ConcurrentHashMap<>();
            this.cacheExpirationTime = timeUnit.toMillis(cacheExpirationTime);
        }
        
        public T execute(String key, 
                        Supplier<T> primaryOperation,
                        Supplier<T> fallbackOperation,
                        FallbackStrategy strategy) {
            try {
                T result = primaryOperation.get();
                updateCache(key, result);
                return result;
            } catch (Exception e) {
                return handleFailure(key, fallbackOperation, strategy, e);
            }
        }
        
        private T handleFailure(String key,
                              Supplier<T> fallbackOperation,
                              FallbackStrategy strategy,
                              Exception error) {
            switch (strategy) {
                case CACHE:
                    return getCachedValue(key)
                        .orElseThrow(() -> new FallbackException("No cached value available", error));
                
                case ALTERNATIVE:
                    try {
                        T result = fallbackOperation.get();
                        updateCache(key, result);
                        return result;
                    } catch (Exception fallbackError) {
                        throw new FallbackException("Fallback operation failed", fallbackError);
                    }
                
                case CACHE_THEN_ALTERNATIVE:
                    return getCachedValue(key)
                        .orElseGet(() -> {
                            try {
                                T result = fallbackOperation.get();
                                updateCache(key, result);
                                return result;
                            } catch (Exception fallbackError) {
                                throw new FallbackException("All fallback options failed", fallbackError);
                            }
                        });
                
                default:
                    throw new IllegalStateException("Unknown fallback strategy: " + strategy);
            }
        }
        
        private void updateCache(String key, T value) {
            cache.put(key, new CacheEntry<>(value, System.currentTimeMillis()));
        }
        
        private Optional<T> getCachedValue(String key) {
            CacheEntry<T> entry = cache.get(key);
            if (entry != null && !entry.isExpired(cacheExpirationTime)) {
                return Optional.of(entry.getValue());
            }
            return Optional.empty();
        }
        
        private static class CacheEntry<T> {
            private final T value;
            private final long timestamp;
            
            CacheEntry(T value, long timestamp) {
                this.value = value;
                this.timestamp = timestamp;
            }
            
            T getValue() {
                return value;
            }
            
            boolean isExpired(long expirationTime) {
                return System.currentTimeMillis() - timestamp > expirationTime;
            }
        }
    }

    enum FallbackStrategy {
        CACHE,
        ALTERNATIVE,
        CACHE_THEN_ALTERNATIVE
    }

    class FallbackException extends RuntimeException {
        public FallbackException(String message, Throwable cause) {
            super(message, cause);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package fallback

    import (
        "context"
        "errors"
        "sync"
        "time"
    )

    type FallbackStrategy int

    const (
        StrategyCache FallbackStrategy = iota
        StrategyAlternative
        StrategyCacheThenAlternative
    )

    type Operation[T any] func(ctx context.Context) (T, error)

    type CacheEntry[T any] struct {
        Value     T
        Timestamp time.Time
    }

    type FallbackHandler[T any] struct {
        cache             map[string]CacheEntry[T]
        mutex            sync.RWMutex
        cacheExpiration time.Duration
    }

    func NewFallbackHandler[T any](cacheExpiration time.Duration) *FallbackHandler[T] {
        return &FallbackHandler[T]{
            cache:           make(map[string]CacheEntry[T]),
            cacheExpiration: cacheExpiration,
        }
    }

    func (h *FallbackHandler[T]) Execute(
        ctx context.Context,
        key string,
        primary Operation[T],
        fallback Operation[T],
        strategy FallbackStrategy,
    ) (T, error) {
        // Try primary operation
        result, err := primary(ctx)
        if err == nil {
            h.updateCache(key, result)
            return result, nil
        }

        // Handle failure with fallback strategy
        return h.handleFailure(ctx, key, fallback, strategy, err)
    }

    func (h *FallbackHandler[T]) handleFailure(
        ctx context.Context,
        key string,
        fallback Operation[T],
        strategy FallbackStrategy,
        primaryErr error,
    ) (T, error) {
        var zero T

        switch strategy {
        case StrategyCache:
            if value, ok := h.getCachedValue(key); ok {
                return value, nil
            }
            return zero, errors.New("no cached value available")

        case StrategyAlternative:
            result, err := fallback(ctx)
            if err != nil {
                return zero, errors.New("fallback operation failed")
            }
            h.updateCache(key, result)
            return result, nil

        case StrategyCacheThenAlternative:
            if value, ok := h.getCachedValue(key); ok {
                return value, nil
            }
            result, err := fallback(ctx)
            if err != nil {
                return zero, errors.New("all fallback options failed")
            }
            h.updateCache(key, result)
            return result, nil

        default:
            return zero, errors.New("unknown fallback strategy")
        }
    }

    func (h *FallbackHandler[T]) updateCache(key string, value T) {
        h.mutex.Lock()
        defer h.mutex.Unlock()
        
        h.cache[key] = CacheEntry[T]{
            Value:     value,
            Timestamp: time.Now(),
        }
    }

    func (h *FallbackHandler[T]) getCachedValue(key string) (T, bool) {
        h.mutex.RLock()
        defer h.mutex.RUnlock()

        entry, exists := h.cache[key]
        if !exists {
            var zero T
            return zero, false
        }

        if time.Since(entry.Timestamp) > h.cacheExpiration {
            var zero T
            return zero, false
        }

        return entry.Value, true
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

1. **Circuit Breaker Pattern**
    - Triggers fallback when circuit opens
    - Works together to handle failures gracefully

2. **Cache-Aside Pattern**
    - Provides data caching mechanism
    - Can serve as fallback data source

3. **Bulkhead Pattern**
    - Isolates failures
    - Can trigger fallbacks per compartment

## 🎯 Best Practices

### Configuration
- Define clear fallback hierarchies
- Set appropriate cache timeouts
- Configure monitoring thresholds
- Implement graceful degradation

### Monitoring
- Track fallback invocations
- Monitor fallback success rates
- Alert on excessive fallbacks
- Measure performance impact

### Testing
- Test all fallback scenarios
- Verify cache behavior
- Simulate various failures
- Check degraded operations

## ⚠️ Common Pitfalls

1. **Stale Fallback Data**
    - *Problem*: Using outdated cached data
    - *Solution*: Implement cache expiration

2. **Cascading Fallbacks**
    - *Problem*: Fallbacks triggering more fallbacks
    - *Solution*: Limit fallback chains

3. **Silent Failures**
    - *Problem*: Masking critical errors
    - *Solution*: Proper error logging

## 🎉 Use Cases

### 1. Payment Processing
- Primary: Real-time payment
- Fallback: Offline transaction processing
- Cache: Previous authorization status

### 2. Product Recommendations
- Primary: Personalized recommendations
- Fallback: Popular items list
- Cache: Recent recommendations

### 3. Authentication Service
- Primary: OAuth service
- Fallback: Local authentication
- Cache: Session tokens

## 🔍 Deep Dive Topics

### Thread Safety
- Thread-safe cache access
- Concurrent fallback execution
- Safe state transitions

### Distributed Systems Considerations
- Cross-service fallbacks
- Distributed cache consistency
- Network partition handling

### Performance Optimization
- Cache hit ratios
- Fallback response times
- Resource utilization

## 📚 Additional Resources

### References
1. "Release It!" by Michael Nygard
2. "Building Microservices" by Sam Newman
3. Netflix Tech Blog - Fault Tolerance

### Tools
- Resilience4j Fallback
- Hystrix Fallback Handler
- Spring Cloud Circuit Breaker

## ❓ FAQs

**Q: When should I use caching vs. alternative service fallbacks?**
A: Use caching for read operations where slightly stale data is acceptable, and alternative services for write operations or when fresh data is critical.

**Q: How do I handle fallback failures?**
A: Implement multiple fallback levels and ensure proper error handling and logging at each level.

**Q: What's the best way to test fallback behavior?**
A: Use chaos engineering principles to simulate various failure scenarios and verify fallback behavior.

**Q: How do I ensure fallbacks don't mask serious issues?**
A: Implement proper monitoring, alerting, and logging for all fallback scenarios.

**Q: Should fallbacks be automatic or manual?**
A: Implement automatic fallbacks for known, recoverable failures, but allow manual intervention for critical operations.