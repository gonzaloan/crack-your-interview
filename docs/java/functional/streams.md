---
sidebar_position: 2
title: "Java Streams"
description: "Advanced Stream operations and patterns in Java"
---

# Java Streams

## Core Understanding
A Stream in Java is a sequence of elements supporting sequential and parallel aggregate operations. Streams provide a high-level abstraction for processing sequences of data in a declarative way.

### Stream Types
1. **Sequential Streams**
    - Regular stream processing
    - Maintains element order
    - Single-threaded execution

2. **Parallel Streams**
    - Concurrent processing
    - Potentially unordered
    - Uses ForkJoinPool

### Stream Operations
1. **Intermediate Operations**
    - `filter(Predicate<T>)`: Filters elements based on a predicate
    - `map(Function<T,R>)`: Transforms elements
    - `flatMap(Function<T,Stream<R>>)`: One-to-many transformation
    - `sorted()`: Sorts elements
    - `distinct()`: Removes duplicates
    - `peek(Consumer<T>)`: Debug operations

2. **Terminal Operations**
    - `collect(Collector<T,A,R>)`: Mutable reduction
    - `reduce(BinaryOperator<T>)`: Immutable reduction
    - `forEach(Consumer<T>)`: Iteration
    - `count()`: Count elements
    - `anyMatch(Predicate<T>)`: Check condition
    - `findFirst()`: Find first element

### Important Collectors
```java
// Key Collectors to know
Collectors.toList()               // Convert stream to List
Collectors.toSet()               // Convert stream to Set
Collectors.toMap()               // Convert stream to Map
Collectors.groupingBy()          // Group elements
Collectors.partitioningBy()      // Partition elements
Collectors.joining()             // Join strings
Collectors.summarizingDouble()   // Statistics for doubles
```

### Special Stream Types

- IntStream
```java
IntStream.range(1, 100)              // Create number range
IntStream.of(1, 2, 3)                // Create from values
list.stream().mapToInt(Integer::intValue) // Convert to IntStream
```

- LongStream

```java
LongStream.rangeClosed(1, 100)       // Inclusive range
array.stream().mapToLong(Long::valueOf)
```

- DoubleStream
```java
DoubleStream.generate(Math::random)   // Infinite stream
list.stream().mapToDouble(Double::valueOf)
```

## ❌ Bad Example

```java
public class OrderProcessor {
    public double calculateTotal(List<Order> orders) {
        // Bad practices:
        double total = 0; // Mutable state
        for (Order order : orders) {
            if (order.getStatus() == Status.COMPLETED) {
                for (OrderItem item : order.getItems()) {
                    total += item.getPrice(); // Multiple iterations
                }
            }
        }
        return total;
    }
}
```
**Why it's bad**:

- Uses mutable state
- Multiple nested loops
- Mixed responsibilities
- Not composable
- Hard to parallelize

## ✅ Good Example
Let's fix this:
```java
public class OrderProcessor {
    public OrderSummary processOrders(List<Order> orders) {
        return orders.stream()
            .filter(order -> order.getStatus() == Status.COMPLETED)
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.teeing(
                Collectors.summarizingDouble(OrderItem::getPrice),
                Collectors.counting(),
                (stats, count) -> new OrderSummary(
                    stats.getSum(),
                    stats.getAverage(),
                    count
                )
            ));
    }

    public Map<Customer, List<Order>> groupOrdersByCustomer(List<Order> orders) {
        return orders.stream()
            .collect(Collectors.groupingBy(
                Order::getCustomer,
                Collectors.mapping(
                    Function.identity(),
                    Collectors.toList()
                )
            ));
    }
}
```
**Why it's good**:
- Declarative style
- Single responsibility
- Composable operations
- No mutable state
- Easy to understand and maintain


## Best Practices

- Use Appropriate Stream Type
```java
// For primitives, use specialized streams
IntStream.range(0, 100)
    .filter(n -> n % 2 == 0)
    .sum();
```

- Leverage Collectors for Complex Operations

```java
public class OrderAnalyzer {
    public Map<Customer, List<Order>> groupOrdersByCustomer(List<Order> orders) {
        return orders.stream()
            .collect(Collectors.groupingBy(
                Order::getCustomer,
                Collectors.mapping(
                    order -> order,
                    Collectors.toList()
                )
            ));
    }
}
```

- Use Custom Collectors for Specific Needs

```java
public class CustomCollectors {
    public static <T> Collector<T, ?, ImmutableList<T>> toImmutableList() {
        return Collector.of(
            ImmutableList::builder,
            ImmutableList.Builder::add,
            (b1, b2) -> b1.addAll(b2.build()),
            ImmutableList.Builder::build
        );
    }
}
```

## Use Cases
- Data Transformation Pipelines
```java
public List<ProductDTO> transformProducts(List<Product> products) {
    return products.stream()
        .filter(Product::isActive)
        .map(this::enrichProduct)
        .map(productMapper::toDTO)
        .collect(Collectors.toList());
}
```
- Complex Aggregations
```java
public Map<Category, DoubleSummaryStatistics> analyzeCategories(List<Product> products) {
    return products.stream()
        .collect(Collectors.groupingBy(
            Product::getCategory,
            Collectors.summarizingDouble(Product::getPrice)
        ));
}
```

- Parallel Processing
```java
public class DataProcessor {
    public <T> List<T> processLargeDataset(List<T> data, Predicate<T> filter) {
        return data.parallelStream()
            .filter(filter)
            .collect(Collectors.toList());
    }
}
```


## Anti-patterns to Avoid

- Stream Over-use
```java
// Bad
list.stream().forEach(System.out::println);
// Good
list.forEach(System.out::println);
```

- Stateful Operations

```java
// Bad - shared mutable state
List<String> collected = new ArrayList<>();
stream.forEach(collected::add);

// Good - use collectors
List<String> collected = stream.collect(Collectors.toList());
```

- Multiple Terminal Operations
```java
// Bad - stream is closed after first terminal operation
Stream<String> stream = list.stream();
long count = stream.count();
List<String> collected = stream.collect(Collectors.toList()); // Throws exception

// Good - create new stream for each terminal operation
long count = list.stream().count();
List<String> collected = list.stream().collect(Collectors.toList());
```
## Interview Questions & Answers

Q1: "How would you optimize stream operations for large datasets?"
Answer:

```java
public class StreamOptimizer {
    public List<Transaction> processLargeTransactions(List<Transaction> transactions) {
        return transactions.parallelStream()
            .filter(tx -> tx.getAmount().compareTo(threshold) > 0)
            .sorted(Comparator.comparing(Transaction::getAmount))
            .collect(Collectors.toCollection(ArrayList::new));
    }
    
    // Consider data size for parallelization
    public <T> Stream<T> createAppropriateStream(List<T> data) {
        return data.size() > 10000 ? data.parallelStream() : data.stream();
    }
}
```

Q2: "What's the difference between intermediate and terminal operations?"
Answer:
- Intermediate operations (like map, filter) are lazy and return a new Stream
- Terminal operations (like collect, reduce) are eager and produce a result
- Intermediate operations won't execute until a terminal operation is called

Q3: "How do you handle exceptions in streams?"
A:

```java
public class StreamExceptionHandler {
    private static <T> Function<T, Optional<T>> wrap(ThrowingFunction<T, T> function) {
        return t -> {
            try {
                return Optional.of(function.apply(t));
            } catch (Exception e) {
                log.error("Error processing: {}", t, e);
                return Optional.empty();
            }
        };
    }

    // Usage
    public List<ProcessedData> processData(List<RawData> data) {
        return data.stream()
            .map(wrap(this::processItem))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
}
```
