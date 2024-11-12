---
sidebar_position: 1
title: Single Responsibility Principle (SRP)
description: A class should only have one reason to change, meaning it should only have one job or responsibility
---

# Single Responsibility Principle (SRP)

## Overview

The Single Responsibility Principle (SRP) is one of the five SOLID principles of object-oriented design, stating that a class should have only one reason to change, meaning it should have only one job or responsibility.

### Real-World Analogy
Think of a restaurant kitchen. Each chef has a specific role:
- The pastry chef focuses solely on desserts
- The sous chef prepares sauces and side dishes
- The grill chef handles only grilled items

If the pastry chef also had to manage reservations and handle customer complaints, it would violate SRP. Each role is focused and specialized, making the kitchen run efficiently.

## Key Concepts

### Core Components

1. **Responsibility**
  - A "reason to change"
  - A single, well-defined task or concern
  - A cohesive set of related functions

2. **Change Drivers**
  - Business rules
  - UI/UX requirements
  - Infrastructure concerns
  - External integrations

3. **Cohesion**
  - High cohesion within classes
  - Related functionality grouped together
  - Clear boundaries between different responsibilities

## Implementation

Here's a practical example showing both a violation of SRP and its correction:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
```java
// Bad Example - Multiple Responsibilities
public class UserManager {
    public void createUser(User user) {
        // Handle user creation
        validateUser(user);
        saveToDatabase(user);
        sendWelcomeEmail(user);
        logUserCreation(user);
    }

    private void validateUser(User user) {
        // Validation logic
    }
    
    private void saveToDatabase(User user) {
        // Database operations
    }
    
    private void sendWelcomeEmail(User user) {
        // Email sending logic
    }
    
    private void logUserCreation(User user) {
        // Logging logic
    }
}

// Good Example - Single Responsibility
public class UserValidator {
public boolean validateUser(User user) {
// Only validation logic
return true;
}
}

public class UserRepository {
public void saveUser(User user) {
// Only database operations
}
}

public class EmailService {
public void sendWelcomeEmail(User user) {
// Only email sending logic
}
}

public class UserLogger {
public void logUserAction(User user, String action) {
// Only logging logic
}
}

public class UserService {
private final UserValidator validator;
private final UserRepository repository;
private final EmailService emailService;
private final UserLogger logger;

    public UserService(UserValidator validator, 
                      UserRepository repository,
                      EmailService emailService,
                      UserLogger logger) {
        this.validator = validator;
        this.repository = repository;
        this.emailService = emailService;
        this.logger = logger;
    }

    public void createUser(User user) {
        if (validator.validateUser(user)) {
            repository.saveUser(user);
            emailService.sendWelcomeEmail(user);
            logger.logUserAction(user, "CREATED");
        }
    }
}
```
  </TabItem>
  <TabItem value="go" label="Go">
```go
// Bad Example - Multiple Responsibilities
type UserManager struct {
    db   *sql.DB
    mail *EmailClient
}

func (um *UserManager) CreateUser(user User) error {
    if err := um.validateUser(user); err != nil {
        return err
    }
    if err := um.saveToDatabase(user); err != nil {
        return err
    }
    if err := um.sendWelcomeEmail(user); err != nil {
        return err
    }
    return um.logUserCreation(user)
}

// Good Example - Single Responsibility
type UserValidator struct{}

func (v *UserValidator) ValidateUser(user User) error {
    // Only validation logic
    return nil
}

type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) SaveUser(user User) error {
    // Only database operations
    return nil
}

type EmailService struct {
    client *EmailClient
}

func (e *EmailService) SendWelcomeEmail(user User) error {
    // Only email sending logic
    return nil
}

type UserLogger struct {
    logger *Logger
}

func (l *UserLogger) LogUserAction(user User, action string) error {
    // Only logging logic
    return nil
}

type UserService struct {
    validator *UserValidator
    repo     *UserRepository
    email    *EmailService
    logger   *UserLogger
}

func NewUserService(v *UserValidator, r *UserRepository, 
                   e *EmailService, l *UserLogger) *UserService {
    return &UserService{
        validator: v,
        repo:     r,
        email:    e,
        logger:   l,
    }
}

func (s *UserService) CreateUser(user User) error {
    if err := s.validator.ValidateUser(user); err != nil {
        return err
    }
    if err := s.repo.SaveUser(user); err != nil {
        return err
    }
    if err := s.email.SendWelcomeEmail(user); err != nil {
        return err
    }
    return s.logger.LogUserAction(user, "CREATED")
}
```
  </TabItem>
</Tabs>

## Related Patterns

1. **Interface Segregation Principle (ISP)**
  - Complements SRP by focusing on client-specific interfaces
  - Helps prevent classes from having multiple responsibilities through interface design

2. **Dependency Injection**
  - Supports SRP by allowing loose coupling between components
  - Makes it easier to maintain single responsibility by injecting dependencies

3. **Factory Pattern**
  - Helps maintain SRP by separating object creation from business logic
  - Allows classes to focus on their core responsibility

## Best Practices

### Design & Implementation
1. Keep classes small and focused
2. Use meaningful names that reflect the single responsibility
3. Avoid mixing different levels of abstraction
4. Implement dependency injection for better testability
5. Use composition over inheritance

### Testing
1. Unit tests should be simple and focused
2. Each test should verify one specific behavior
3. Mock dependencies to isolate the responsibility being tested
4. Use test naming conventions that reflect the responsibility being tested

### Monitoring
1. Log specific to each responsibility
2. Monitor each component independently
3. Set up alerts based on component-specific metrics
4. Track performance metrics for each responsibility separately

## Common Pitfalls

1. **God Classes**
  - Problem: Creating classes that do too much
  - Solution: Break down into smaller, focused classes

2. **Mixed Abstraction Levels**
  - Problem: Mixing high-level and low-level operations
  - Solution: Separate concerns into appropriate abstraction layers

3. **Hidden Responsibilities**
  - Problem: Responsibilities disguised as helper methods
  - Solution: Extract helper methods into appropriate service classes

4. **Tight Coupling**
  - Problem: Classes directly dependent on implementation details
  - Solution: Use dependency injection and interfaces

## Use Cases

### 1. Financial System
- **Scenario**: Processing payments
- **Implementation**: Separate classes for:
  - Payment validation
  - Payment processing
  - Transaction logging
  - Receipt generation

### 2. E-commerce Platform
- **Scenario**: Order processing
- **Implementation**: Separate classes for:
  - Order validation
  - Inventory management
  - Payment processing
  - Shipping coordination
  - Email notifications

### 3. Content Management System
- **Scenario**: Article publishing
- **Implementation**: Separate classes for:
  - Content validation
  - Content storage
  - SEO processing
  - Cache management
  - Notification system

## Deep Dive Topics

### Thread Safety
- Each class with single responsibility is easier to make thread-safe
- Simpler synchronization requirements
- Clear boundaries for concurrent operations
- Reduced risk of race conditions

### Distributed Systems
- Clearer service boundaries
- Easier to scale individual components
- Simplified error handling
- Better fault isolation

### Performance
- Easier to optimize specific components
- Clear performance bottleneck identification
- Simpler caching strategies
- Better resource utilization

## Additional Resources

### Books
1. "Clean Code" by Robert C. Martin
2. "Agile Principles, Patterns, and Practices in C#" by Robert C. Martin
3. "Growing Object-Oriented Software, Guided by Tests" by Steve Freeman

### Online Resources
1. [Martin Fowler's Blog](https://martinfowler.com)
2. [SOLID Principles by Example](https://blog.cleancoder.com)
3. [Object-Oriented Design Patterns](https://refactoring.guru)

### Tools
1. SonarQube - Code quality analysis
2. JDepend - Dependency analysis
3. Structure101 - Architecture visualization

## FAQs

### Q: How do I identify if a class has multiple responsibilities?
A: Look for multiple reasons for the class to change. If modifying one feature requires changes to unrelated methods, the class likely has multiple responsibilities.

### Q: Does SRP mean one method per class?
A: No, SRP focuses on responsibilities, not methods. A class can have multiple methods if they serve the same responsibility.

### Q: How does SRP affect testing?
A: SRP makes testing easier by:
- Reducing test setup complexity
- Focusing tests on specific behaviors
- Making mocking simpler
- Improving test readability

### Q: Can SRP lead to too many small classes?
A: While it's possible to over-segregate responsibilities, having too many focused classes is usually better than having a few large, unfocused ones. Use common sense and consider maintenance costs.

### Q: How does SRP relate to microservices?
A: SRP principles align well with microservice architecture, where each service has a single responsibility. This makes it easier to:
- Scale services independently
- Deploy changes safely
- Maintain service boundaries
- Handle failures gracefully



