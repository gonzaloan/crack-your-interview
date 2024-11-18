---
sidebar_position: 3
title: "Streams"
description: "Streams"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌊 Java Streams

## Overview 🎯

Java Streams provide a declarative approach to processing sequences of elements. Introduced in Java 8, streams enable functional-style operations on collections and other data sources. They support both sequential and parallel execution of operations.

### Real-World Analogy
Think of streams like an assembly line in a factory:
- **Source**: Raw materials (collection or data source)
- **Intermediate Operations**: Workers performing different tasks (filter, map, sort)
- **Terminal Operation**: Final product assembly (collect, reduce, count)

## Key Concepts 🔑

### Core Components

1. **Stream Creation**
    - From Collections
    - From Arrays
    - From values
    - Infinite/finite streams

2. **Operation Types**
    - Intermediate Operations (lazy)
        - filter
        - map
        - flatMap
        - sorted
        - peek
    - Terminal Operations (eager)
        - collect
        - reduce
        - forEach
        - count
        - findFirst/findAny

3. **Stream Characteristics**
    - Sequential vs Parallel
    - Ordered vs Unordered
    - Sized vs Unsized
    - Distinct vs Non-distinct

## Implementation Examples 💻

### Basic Stream Operations

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.stream.*;
    import java.util.*;

    public class StreamBasics {
        public List<Integer> processNumbers(List<Integer> numbers) {
            return numbers.stream()
                .filter(n -> n > 0)         // Keep positive numbers
                .map(n -> n * 2)            // Double each number
                .sorted()                    // Sort the results
                .collect(Collectors.toList()); // Collect to list
        }
        
        public double calculateAverage(List<Integer> numbers) {
            return numbers.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
        }
        
        public List<String> filterAndUpperCase(List<String> strings) {
            return strings.stream()
                .filter(s -> !s.isEmpty())
                .map(String::toUpperCase)
                .collect(Collectors.toList());
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sort"
        "strings"
    )

    type StreamBasics struct{}

    func (s *StreamBasics) ProcessNumbers(numbers []int) []int {
        // Filter positive numbers
        positive := make([]int, 0)
        for _, n := range numbers {
            if n > 0 {
                positive = append(positive, n*2)
            }
        }
        
        // Sort the results
        sort.Ints(positive)
        return positive
    }

    func (s *StreamBasics) CalculateAverage(numbers []int) float64 {
        if len(numbers) == 0 {
            return 0.0
        }
        
        sum := 0
        for _, n := range numbers {
            sum += n
        }
        return float64(sum) / float64(len(numbers))
    }

    func (s *StreamBasics) FilterAndUpperCase(strs []string) []string {
        result := make([]string, 0)
        for _, s := range strs {
            if s != "" {
                result = append(result, strings.ToUpper(s))
            }
        }
        return result
    }
    ```
  </TabItem>
</Tabs>

### Advanced Stream Operations

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.stream.*;
    import java.util.*;
    import java.util.function.Function;

    public class AdvancedStreams {
        public <T> Map<T, Long> frequencyCount(List<T> items) {
            return items.stream()
                .collect(Collectors.groupingBy(
                    Function.identity(),
                    Collectors.counting()
                ));
        }
        
        public List<String> flatMapExample(List<List<String>> nestedLists) {
            return nestedLists.stream()
                .flatMap(List::stream)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        }
        
        public Map<Boolean, List<Integer>> partitionByPrime(List<Integer> numbers) {
            return numbers.stream()
                .collect(Collectors.partitioningBy(this::isPrime));
        }
        
        private boolean isPrime(int number) {
            if (number <= 1) return false;
            return IntStream.rangeClosed(2, (int) Math.sqrt(number))
                .noneMatch(i -> number % i == 0);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "math"
        "sort"
    )

    type AdvancedStreams struct{}

    func (s *AdvancedStreams) FrequencyCount(items []interface{}) map[interface{}]int64 {
        freq := make(map[interface{}]int64)
        for _, item := range items {
            freq[item]++
        }
        return freq
    }

    func (s *AdvancedStreams) FlatMapExample(nestedLists [][]string) []string {
        // Flatten and deduplicate
        seen := make(map[string]bool)
        result := make([]string, 0)
        
        for _, list := range nestedLists {
            for _, str := range list {
                if !seen[str] {
                    seen[str] = true
                    result = append(result, str)
                }
            }
        }
        
        sort.Strings(result)
        return result
    }

    func (s *AdvancedStreams) PartitionByPrime(numbers []int) map[bool][]int {
        partition := make(map[bool][]int)
        for _, n := range numbers {
            isPrime := s.isPrime(n)
            partition[isPrime] = append(partition[isPrime], n)
        }
        return partition
    }

    func (s *AdvancedStreams) isPrime(number int) bool {
        if number <= 1 {
            return false
        }
        sqrt := int(math.Sqrt(float64(number)))
        for i := 2; i <= sqrt; i++ {
            if number%i == 0 {
                return false
            }
        }
        return true
    }
    ```
  </TabItem>
</Tabs>

### Parallel Stream Processing

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.stream.*;
    import java.util.*;
    import java.util.concurrent.*;

    public class ParallelStreams {
        public double parallelSum(List<Double> numbers) {
            return numbers.parallelStream()
                .reduce(0.0, Double::sum);
        }
        
        public <T> List<T> parallelSort(List<T> items, Comparator<? super T> comparator) {
            return items.parallelStream()
                .sorted(comparator)
                .collect(Collectors.toList());
        }
        
        public <T> List<T> parallelFilter(List<T> items, Predicate<T> predicate) {
            return items.parallelStream()
                .filter(predicate)
                .collect(Collectors.toList());
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sort"
        "sync"
    )

    type ParallelStreams struct{}

    func (s *ParallelStreams) ParallelSum(numbers []float64) float64 {
        if len(numbers) == 0 {
            return 0.0
        }

        // Split the work into chunks
        numGoroutines := 4
        chunkSize := (len(numbers) + numGoroutines - 1) / numGoroutines
        
        var wg sync.WaitGroup
        sums := make([]float64, numGoroutines)
        
        for i := 0; i < numGoroutines; i++ {
            wg.Add(1)
            go func(chunk int) {
                defer wg.Done()
                start := chunk * chunkSize
                end := start + chunkSize
                if end > len(numbers) {
                    end = len(numbers)
                }
                
                partialSum := 0.0
                for _, n := range numbers[start:end] {
                    partialSum += n
                }
                sums[chunk] = partialSum
            }(i)
        }
        
        wg.Wait()
        
        finalSum := 0.0
        for _, sum := range sums {
            finalSum += sum
        }
        return finalSum
    }

    func (s *ParallelStreams) ParallelSort(items []interface{}, less func(i, j int) bool) {
        // Go's sort package is already optimized for parallel sorting
        sort.Slice(items, less)
    }
    ```
  </TabItem>
</Tabs>

## Best Practices 🌟

### Stream Creation and Usage

1. **Choose Appropriate Stream Type**
```java
// Good: Use specialized streams for primitives
IntStream.range(0, 100).sum();

// Bad: Boxing/unboxing overhead
Stream.iterate(0, i -> i + 1)
    .limit(100)
    .mapToInt(Integer::intValue)
    .sum();
```

2. **Parallel Stream Considerations**
```java
// Good: Large dataset, independent operations
List<Integer> numbers = // large list
numbers.parallelStream()
    .filter(n -> n > 1000)
    .collect(Collectors.toList());

// Bad: Small dataset or dependent operations
List<String> smallList = Arrays.asList("a", "b", "c");
smallList.parallelStream() // Overhead > benefit
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

### Testing

1. **Unit Testing Streams**
```java
@Test
void testStreamOperations() {
    List<Integer> input = Arrays.asList(1, 2, 3, 4, 5);
    List<Integer> expected = Arrays.asList(4, 8);
    
    List<Integer> result = input.stream()
        .filter(n -> n % 2 == 0)
        .map(n -> n * 2)
        .collect(Collectors.toList());
    
    assertEquals(expected, result);
}
```

2. **Performance Testing**
```java
@Test
void testStreamPerformance() {
    List<Integer> numbers = // large list
    
    long start = System.nanoTime();
    numbers.stream()
        .filter(n -> n > 0)
        .count();
    long streamTime = System.nanoTime() - start;
    
    start = System.nanoTime();
    numbers.parallelStream()
        .filter(n -> n > 0)
        .count();
    long parallelTime = System.nanoTime() - start;
    
    // Compare times
}
```

## Common Pitfalls 🚨

1. **Stream Reuse**
```java
// Wrong: Stream reuse
Stream<String> stream = list.stream();
stream.forEach(System.out::println);
stream.count(); // IllegalStateException

// Correct: Create new stream
list.stream().forEach(System.out::println);
list.stream().count();
```

2. **Side Effects**
```java
// Wrong: Side effects in parallel stream
List<String> results = Collections.synchronizedList(new ArrayList<>());
stream.parallel().forEach(results::add); // Order not guaranteed

// Correct: Use collect
List<String> results = stream.parallel()
    .collect(Collectors.toList());
```

## Use Cases 🎯

### 1. Data Processing Pipeline
```java
public class DataProcessor {
    public List<CustomerDTO> processCustomers(List<Customer> customers) {
        return customers.stream()
            .filter(Customer::isActive)
            .map(this::enrichCustomerData)
            .sorted(Comparator.comparing(CustomerDTO::getScore).reversed())
            .limit(100)
            .collect(Collectors.toList());
    }
    
    private CustomerDTO enrichCustomerData(Customer customer) {
        return new CustomerDTO(
            customer.getId(),
            customer.getName(),
            calculateScore(customer),
            getCustomerMetrics(customer)
        );
    }
}
```

### 2. Report Generation
```java
public class ReportGenerator {
    public Map<String, DoubleSummaryStatistics> generateSalesReport(
            List<SalesTransaction> transactions) {
        return transactions.stream()
            .collect(Collectors.groupingBy(
                SalesTransaction::getProduct,
                Collectors.summarizingDouble(SalesTransaction::getAmount)
            ));
    }
}
```

### 3. Real-time Data Analysis
```java
public class DataAnalyzer {
    public Analysis analyzeSensorData(Stream<SensorReading> readings) {
        return readings
            .filter(reading -> reading.getQuality() >= 0.8)
            .collect(Collectors.teeing(
                Collectors.averagingDouble(SensorReading::getValue),
                Collectors.summarizingDouble(SensorReading::getValue),
                (avg, stats) -> new Analysis(avg, stats)
            ));
    }
}
```

## Deep Dive Topics 🔍

### Stream Internals

1. **Lazy Evaluation**
```java
Stream<Integer> stream = numbers.stream()
    .filter(n -> {
        System.out.println("Filtering: " + n);
        return n > 0;
    })
    .map(n -> {
        System.out.println("Mapping: " + n);
        return n * 2;
    });
// Nothing happens until terminal operation
```

2. **Spliterator Mechanism**
```java
public class CustomSpliterator<T> implements Spliterator<T> {
    @Override
    public boolean tryAdvance(Consumer<? super T> action) {
        // Process single element
    }
    
    @Override
    public Spliterator<T> trySplit() {
        // Split for parallel processing
    }
}
```

### Performance Optimization

1. **Short-circuiting Operations**
```java
// Efficient: Stops processing after finding match
boolean hasNegative = numbers.stream()
    .anyMatch(n -> n < 0);

// Less efficient: Processes all elements
boolean hasNegative = numbers.stream()
    .filter(n -> n < 0)
    .findFirst()
    .isPresent();
```

2. **Stream Sizing**
```java
// Good: Stream knows its size
IntStream.range(0, 1000)
    .boxed()
    .collect(Collectors.toList());

// Bad: Stream size unknown
Stream.iterate(0, i -> i + 1)
    .limit(1000)
    .collect(Collectors.toList());
```

## Additional Resources 📚

### Official Documentation
- [Java Stream JavaDoc](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)
- [Package java.util.stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html)

### Books and Articles
- "Modern Java in Action" by Raoul-Gabriel Urma
- "Java 8 in Action" by Raoul-Gabriel Urma