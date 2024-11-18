---
sidebar_position: 2
title: "Java 8 Features"
description: "Key features introduced in Java 8 for software architects and senior engineers"
---

# Java 8 Features

## Lambda Expressions

### Core Understanding

Lambda expressions in Java 8 allow treating functionality as a method argument, or code as data. They enable writing concise, functional-style code by representing behaviors inline, without the need for verbose anonymous class syntax.

#### ✅ Good Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(name -> System.out.println(name));
```

#### ❌ Bad Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
for (String name : names) {
    System.out.println(name);
}
```

The bad example uses a traditional for loop instead of a lambda expression, leading to more verbose and less expressive code.

### Best Practices

- Use lambda expressions to implement functional interfaces
- Keep lambda expressions concise and focused on a single responsibility
- Use method references (`::`) when appropriate for better readability
- Avoid side effects in lambda expressions to maintain referential transparency

### Use Cases

- Implementing event listeners and callbacks
- Defining behaviors for functional-style operations (e.g., map, filter, reduce)
- Creating fluent and expressive APIs

## Streams API

### Core Understanding

The Streams API, introduced in Java 8, provides a declarative and functional approach to processing collections of data. It allows chaining multiple operations to express complex data processing pipelines in a readable and concise manner.

#### ✅ Good Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");
long count = names.stream()
    .filter(name -> name.length() > 4)
    .map(String::toUpperCase)
    .sorted()
    .count();
```

#### ❌ Bad Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");
int count = 0;
List<String> filteredNames = new ArrayList<>();
for (String name : names) {
    if (name.length() > 4) {
        filteredNames.add(name.toUpperCase());
    }
}
Collections.sort(filteredNames);
count = filteredNames.size();
```

The bad example uses imperative-style code with explicit loops and temporary collections, making it harder to understand and maintain compared to the declarative streams approach.

### Best Practices

- Prefer using streams over explicit loops for data processing
- Leverage built-in stream operations for common tasks (e.g., filtering, mapping, reducing)
- Use parallel streams judiciously, considering the overhead and potential performance impact
- Avoid stateful operations and side effects within stream pipelines

### Use Cases

- Filtering, mapping, and reducing collections
- Implementing data processing pipelines
- Performing bulk operations on data
- Enabling parallel processing of large datasets

## Date and Time API

### Core Understanding

The Date and Time API, introduced in Java 8, provides a comprehensive and user-friendly library for handling dates, times, and durations. It addresses the shortcomings of the old `java.util.Date` and `java.util.Calendar` classes by offering a more intuitive and immutable approach.

#### ✅ Good Example

```java
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1990, Month.JANUARY, 1);
Period age = Period.between(birthday, today);
System.out.println("Age: " + age.getYears() + " years");
```

#### ❌ Bad Example

```java
Date today = new Date();
Calendar birthday = Calendar.getInstance();
birthday.set(1990, Calendar.JANUARY, 1);
int age = today.getYear() - birthday.get(Calendar.YEAR);
System.out.println("Age: " + age + " years");
```

The bad example uses the old `Date` and `Calendar` classes, which are mutable, error-prone, and less expressive compared to the new Date and Time API.

### Best Practices

- Use the appropriate classes for different use cases (e.g., `LocalDate`, `LocalTime`, `LocalDateTime`, `ZonedDateTime`)
- Prefer immutable objects and avoid mutating date and time instances
- Use `Duration` and `Period` for representing time-based and date-based amounts, respectively
- Leverage the rich set of operations provided by the API for date and time manipulations

### Use Cases

- Handling dates, times, and durations in application logic
- Performing date and time calculations and comparisons
- Formatting and parsing dates and times
- Working with time zones and calendar systems

## Interview Questions

Q1: What is the difference between a lambda expression and an anonymous inner class?
A1: Lambda expressions provide a concise way to represent a single abstract method interface (functional interface) inline, without the need for explicit class declaration. Anonymous inner classes, on the other hand, allow implementing any interface or extending any class, but with more verbose syntax. Lambda expressions are more suitable for simple, single-method interfaces, while anonymous inner classes offer more flexibility for complex implementations.

Q2: How do you create a parallel stream from a collection?
A2: To create a parallel stream from a collection, you can call the `parallelStream()` method on the collection. For example:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Stream<Integer> parallelStream = numbers.parallelStream();
```

Alternatively, you can convert a sequential stream to a parallel stream using the `parallel()` method:

```java
Stream<Integer> parallelStream = numbers.stream().parallel();
```

Q3: What is the difference between `LocalDate`, `LocalTime`, and `LocalDateTime` in the Java 8 Date and Time API?
A3:
- `LocalDate` represents a date without a time or time zone. It is suitable for representing dates like birthdays or anniversaries.
- `LocalTime` represents a time without a date or time zone. It is useful for representing times like "12:30 PM" or "09:45:30".
- `LocalDateTime` represents a combination of date and time, without a time zone. It is used when you need to represent a specific moment in time, like "2023-05-18T14:30:00".

These classes are part of the `java.time` package and offer various methods for creating, manipulating, and formatting dates and times.
