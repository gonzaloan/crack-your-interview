---
sidebar_position: 3
title: "Completable Future"
description: "Completable Future"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 Java CompletableFuture

## Overview 🎯

CompletableFuture is a powerful Java class introduced in Java 8 that enables asynchronous computation and composition of operations. It combines the Future interface's asynchronous execution capabilities with a rich set of methods for chaining and combining asynchronous operations.

### Real-World Analogy
Think of CompletableFuture like ordering food delivery:
- **Asynchronous Order**: Place order and continue doing other things
- **Chaining Operations**: Order → Cook → Deliver → Eat
- **Combining Results**: Multiple orders arriving together
- **Error Handling**: Dealing with delayed or wrong orders
- **Callbacks**: Getting notified when food arrives

## Key Concepts 🔑

### Core Components

1. **Creation Methods**
    - supplyAsync()
    - runAsync()
    - completedFuture()

2. **Transformation Operations**
    - thenApply()
    - thenCompose()
    - thenCombine()

3. **Execution Types**
    - Asynchronous
    - Synchronous
    - Mixed execution

4. **Error Handling**
    - exceptionally()
    - handle()
    - whenComplete()

## Implementation Examples 💻

### Basic CompletableFuture Usage

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.function.*;

    public class CompletableFutureBasics {
        private final ExecutorService executor = 
            Executors.newFixedThreadPool(4);
            
        public CompletableFuture<String> fetchData(String id) {
            return CompletableFuture.supplyAsync(() -> {
                // Simulate API call
                try {
                    Thread.sleep(1000);
                    return "Data for ID: " + id;
                } catch (InterruptedException e) {
                    throw new CompletionException(e);
                }
            }, executor);
        }
        
        public CompletableFuture<String> processData(String data) {
            return CompletableFuture.supplyAsync(() -> {
                return data.toUpperCase();
            }, executor);
        }
        
        public CompletableFuture<String> fetchAndProcess(String id) {
            return fetchData(id)
                .thenCompose(this::processData)
                .exceptionally(ex -> "Error: " + ex.getMessage());
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "strings"
        "time"
    )

    type Future struct {
        done chan struct{}
        result interface{}
        err error
    }

    func newFuture() *Future {
        return &Future{
            done: make(chan struct{}),
        }
    }

    func (f *Future) complete(result interface{}, err error) {
        f.result = result
        f.err = err
        close(f.done)
    }

    func fetchData(id string) *Future {
        f := newFuture()
        go func() {
            // Simulate API call
            time.Sleep(time.Second)
            f.complete(fmt.Sprintf("Data for ID: %s", id), nil)
        }()
        return f
    }

    func processData(data string) *Future {
        f := newFuture()
        go func() {
            f.complete(strings.ToUpper(data), nil)
        }()
        return f
    }

    func fetchAndProcess(id string) *Future {
        f := newFuture()
        go func() {
            dataFuture := fetchData(id)
            <-dataFuture.done
            
            if dataFuture.err != nil {
                f.complete(nil, dataFuture.err)
                return
            }
            
            processFuture := processData(dataFuture.result.(string))
            <-processFuture.done
            f.complete(processFuture.result, processFuture.err)
        }()
        return f
    }
    ```
  </TabItem>
</Tabs>

### Advanced CompletableFuture Operations

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.stream.*;
    import java.util.*;

    public class AdvancedCompletableFuture {
        
        // Combining multiple futures
        public CompletableFuture<List<String>> fetchAllData(
            List<String> ids
        ) {
            List<CompletableFuture<String>> futures = ids.stream()
                .map(id -> fetchData(id))
                .collect(Collectors.toList());
                
            return CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0])
            ).thenApply(v -> 
                futures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList())
            );
        }
        
        // Timeout handling
        public CompletableFuture<String> fetchWithTimeout(
            String id, 
            long timeout, 
            TimeUnit unit
        ) {
            CompletableFuture<String> future = fetchData(id);
            
            CompletableFuture<String> timeoutFuture = 
                timeoutAfter(timeout, unit);
                
            return future.applyToEither(
                timeoutFuture,
                Function.identity()
            );
        }
        
        private <T> CompletableFuture<T> timeoutAfter(
            long timeout, 
            TimeUnit unit
        ) {
            CompletableFuture<T> result = new CompletableFuture<>();
            Executors.newSingleThreadScheduledExecutor()
                .schedule(
                    () -> result.completeExceptionally(
                        new TimeoutException()
                    ),
                    timeout,
                    unit
                );
            return result;
        }
        
        // Retrying failed operations
        public CompletableFuture<String> fetchWithRetry(
            String id, 
            int maxRetries
        ) {
            return CompletableFuture.supplyAsync(() -> {
                for (int i = 0; i < maxRetries; i++) {
                    try {
                        return fetchData(id).get();
                    } catch (Exception e) {
                        if (i == maxRetries - 1) {
                            throw new CompletionException(e);
                        }
                        try {
                            Thread.sleep(1000 * (i + 1));
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new CompletionException(ie);
                        }
                    }
                }
                throw new CompletionException(
                    new RuntimeException("Max retries exceeded")
                );
            });
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "errors"
        "sync"
        "time"
    )

    type AdvancedFutures struct{}

    // Combining multiple futures
    func (af *AdvancedFutures) fetchAllData(ids []string) *Future {
        f := newFuture()
        
        go func() {
            var wg sync.WaitGroup
            results := make([]string, len(ids))
            
            for i, id := range ids {
                wg.Add(1)
                go func(index int, id string) {
                    defer wg.Done()
                    future := fetchData(id)
                    <-future.done
                    if future.err == nil {
                        results[index] = future.result.(string)
                    }
                }(i, id)
            }
            
            wg.Wait()
            f.complete(results, nil)
        }()
        
        return f
    }

    // Timeout handling
    func (af *AdvancedFutures) fetchWithTimeout(
        id string, 
        timeout time.Duration,
    ) *Future {
        f := newFuture()
        
        go func() {
            dataFuture := fetchData(id)
            
            select {
            case <-dataFuture.done:
                f.complete(dataFuture.result, dataFuture.err)
            case <-time.After(timeout):
                f.complete(nil, errors.New("timeout"))
            }
        }()
        
        return f
    }

    // Retrying failed operations
    func (af *AdvancedFutures) fetchWithRetry(
        id string, 
        maxRetries int,
    ) *Future {
        f := newFuture()
        
        go func() {
            var lastError error
            
            for i := 0; i < maxRetries; i++ {
                dataFuture := fetchData(id)
                <-dataFuture.done
                
                if dataFuture.err == nil {
                    f.complete(dataFuture.result, nil)
                    return
                }
                
                lastError = dataFuture.err
                time.Sleep(time.Second * time.Duration(i+1))
            }
            
            f.complete(nil, lastError)
        }()
        
        return f
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Configuration

1. **Executor Selection**
```java
// Good: Custom executor for I/O operations
ExecutorService ioExecutor = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors() * 2
);

CompletableFuture.supplyAsync(
    () -> fetchDataFromDB(), 
    ioExecutor
);

// Bad: Default executor for I/O operations
CompletableFuture.supplyAsync(() -> fetchDataFromDB());
```

2. **Error Handling**
```java
// Good: Comprehensive error handling
completableFuture
    .thenApply(this::processData)
    .handle((result, ex) -> {
        if (ex != null) {
            log.error("Error processing data", ex);
            return fallbackValue;
        }
        return result;
    });

// Bad: No error handling
completableFuture.thenApply(this::processData);
```

### Testing

```java
@Test
void testAsyncOperation() {
    CompletableFuture<String> future = service.asyncOperation();
    
    String result = future
        .get(5, TimeUnit.SECONDS); // Use timeout
        
    assertEquals("expected", result);
}
```

## Common Pitfalls 🚨

1. **Blocking Operations**
```java
// Wrong: Blocking in async operation
CompletableFuture.supplyAsync(() -> {
    return future.get(); // Blocks thread
});

// Correct: Using thenCompose
CompletableFuture.supplyAsync(() -> "data")
    .thenCompose(data -> anotherFuture);
```

2. **Exception Handling**
```java
// Wrong: Lost exceptions
future.thenApply(this::riskyOperation);

// Correct: Handling exceptions
future
    .thenApply(this::riskyOperation)
    .exceptionally(ex -> {
        log.error("Operation failed", ex);
        return fallbackValue;
    });
```

## Use Cases 🎯

### 1. API Aggregation Service
```java
public class ApiAggregator {
    private final WebClient webClient;
    
    public CompletableFuture<AggregatedData> fetchAggregatedData(
        String userId
    ) {
        CompletableFuture<UserData> userData = 
            fetchUserData(userId);
        CompletableFuture<List<Order>> orders = 
            fetchOrders(userId);
        CompletableFuture<List<Review>> reviews = 
            fetchReviews(userId);
            
        return CompletableFuture.allOf(
            userData, 
            orders, 
            reviews
        ).thenApply(v -> new AggregatedData(
            userData.join(),
            orders.join(),
            reviews.join()
        ));
    }
}
```

### 2. Async Cache Service
```java
public class AsyncCache<K, V> {
    private final ConcurrentMap<K, CompletableFuture<V>> cache = 
        new ConcurrentHashMap<>();
        
    public CompletableFuture<V> get(K key, Function<K, V> loader) {
        return cache.computeIfAbsent(key, k ->
            CompletableFuture.supplyAsync(() -> loader.apply(k))
                .whenComplete((v, ex) -> {
                    if (ex != null) {
                        cache.remove(k);
                    }
                })
        );
    }
}
```

### 3. Parallel Task Processor
```java
public class ParallelProcessor<T, R> {
    private final ExecutorService executor;
    
    public CompletableFuture<List<R>> processItems(
        List<T> items,
        Function<T, R> processor
    ) {
        return CompletableFuture.supplyAsync(() ->
            items.parallelStream()
                .map(processor)
                .collect(Collectors.toList()),
            executor
        );
    }
}
```

## Deep Dive Topics 🔍

### CompletableFuture Internals

```java
public class CustomCompletableFuture<T> {
    private volatile Object result;
    private volatile Executor executor;
    private List<Consumer<T>> callbacks = new ArrayList<>();
    
    public void complete(T value) {
        synchronized (this) {
            if (result != null) {
                return;
            }
            result = value;
            notifyCallbacks();
        }
    }
    
    private void notifyCallbacks() {
        callbacks.forEach(callback -> 
            executor.execute(() -> callback.accept((T) result))
        );
    }
}
```

### Performance Optimization

```java
public class OptimizedFutures {
    // Batch processing with size control
    public <T> CompletableFuture<List<T>> processBatch(
        List<CompletableFuture<T>> futures,
        int batchSize
    ) {
        return CompletableFuture.supplyAsync(() ->
            futures.stream()
                .collect(Collectors.groupingBy(f -> 
                    futures.indexOf(f) / batchSize))
                .values()
                .stream()
                .map(batch -> 
                    CompletableFuture.allOf(
                        batch.toArray(new CompletableFuture[0])
                    ).thenApply(v -> 
                        batch.stream()
                            .map(CompletableFuture::join)
                            .collect(Collectors.toList())
                    )
                )
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList())
        );
    }
}
```

## Additional Resources 📚

### Documentation
- [CompletableFuture JavaDoc](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html)
- [Java Concurrency in Practice](https://jcip.net/)

### Tools
- [Java VisualVM](https://visualvm.github.io/)
- [Async Profiler](https://github.com/jvm-profiling-tools/async-profiler)