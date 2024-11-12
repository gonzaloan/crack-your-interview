---
sidebar_position: 4
title: "Clean Comments"
description: "Writing meaningful and necessary comments"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 💭 Clean Code Comments

## Overview

Clean code comments are like road signs on a highway - they should provide crucial guidance without being distracting or redundant. The primary goal is to explain the "why" rather than the "what" or "how," as the code itself should be clear enough to explain its implementation.

### Real-World Analogy
Think of comments like museum placards. They don't describe what you can clearly see but provide important context, history, and explain the significance of what you're looking at.

## 🔑 Key Concepts

### Types of Comments
1. **Documentation Comments**: API/library documentation
2. **Implementation Comments**: Explain complex algorithms or business rules
3. **Warning Comments**: Alert other developers about consequences
4. **TODO Comments**: Mark incomplete implementations
5. **Legal Comments**: Copyright and license information

### Comment Principles
- Comments should explain things that code cannot express
- Keep comments close to the code they describe
- Update comments when code changes
- Avoid redundant or obvious comments

## 💻 Implementation

### Documentation Comments

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.ArrayList;

    /**
     * Manages user authentication and session tracking.
     * Thread-safe implementation supporting concurrent access.
     *
     * @author Security Team
     * @version 2.1
     * @since 1.0
     */
    public class AuthenticationManager {
        // Good: Explains the business rule
        /**
         * Maximum number of failed login attempts before account lockout.
         * Set to 3 as per security policy document SEC-2024-01.
         */
        private static final int MAX_LOGIN_ATTEMPTS = 3;

        // Bad: Redundant comment
        // Create a list of active sessions
        private List<Session> activeSessions = new ArrayList<>();

        /**
         * Authenticates a user and creates a new session.
         *
         * @param username the user's identifier
         * @param password the user's password
         * @return a new Session object if authentication successful
         * @throws AuthenticationException if credentials are invalid
         */
        public Session authenticate(String username, String password) 
            throws AuthenticationException {
            // Good: Explains why this check is necessary
            // Support team reported timing attacks on the login endpoint
            if (!rateLimiter.allowRequest(username)) {
                throw new AuthenticationException("Rate limit exceeded");
            }

            return performAuthentication(username, password);
        }

        /*
         * Implementation Note:
         * The password hashing algorithm used here (PBKDF2) was chosen
         * based on NIST recommendations for password storage.
         * See: https://security/standards/password-storage
         */
        private boolean verifyPassword(String password, String hash) {
            return passwordVerifier.verify(password, hash);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package auth

    import (
        "time"
        "sync"
    )

    // AuthenticationManager handles user authentication and session tracking.
    // It is thread-safe and supports concurrent access.
    type AuthenticationManager struct {
        // maxLoginAttempts defines the number of failed attempts before lockout
        // as per security policy SEC-2024-01
        maxLoginAttempts int

        // mu protects concurrent access to sessions
        mu sync.RWMutex

        // activeSessions tracks currently valid sessions
        activeSessions map[string]*Session
    }

    // NewAuthenticationManager creates a new authentication manager instance.
    // It initializes internal maps and sets default security parameters.
    func NewAuthenticationManager() *AuthenticationManager {
        return &AuthenticationManager{
            maxLoginAttempts: 3,
            activeSessions:   make(map[string]*Session),
        }
    }

    // Authenticate verifies user credentials and creates a new session.
    // It implements rate limiting and password verification as per security standards.
    // Returns error if authentication fails or rate limit is exceeded.
    func (am *AuthenticationManager) Authenticate(username, password string) (*Session, error) {
        // Check rate limit first to prevent timing attacks
        if !am.rateLimiter.AllowRequest(username) {
            return nil, ErrRateLimitExceeded
        }

        return am.performAuthentication(username, password)
    }

    // verifyPassword checks if the provided password matches the stored hash.
    // Uses PBKDF2 as per NIST recommendations for password storage.
    // See: https://security/standards/password-storage
    func (am *AuthenticationManager) verifyPassword(password, hash string) bool {
        return am.passwordVerifier.Verify(password, hash)
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Patterns

- **Self-Documenting Code**: Reduces the need for comments through clear naming
- **API Documentation**: Complements comments with formal API docs
- **Code Examples**: Provides practical usage demonstrations
- **Design Documentation**: Explains high-level architecture decisions

## ✨ Best Practices

### Documentation Guidelines
1. **API Documentation**
    - Document public APIs thoroughly
    - Include examples of usage
    - Document exceptions and edge cases
    - Keep documentation close to code

2. **Implementation Comments**
    - Explain complex algorithms
    - Document workarounds
    - Reference external documents/tickets
    - Explain business rules

3. **TODO Comments**
    - Include ticket/issue reference
    - Add owner/responsible team
    - Set timeline if possible
    - Regular cleanup of resolved TODOs

### Example of Well-Commented Code

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    /**
     * Implements the Luhn algorithm for credit card validation.
     * Reference: ISO/IEC 7812-1:2017
     */
    public class CreditCardValidator {
        /* Step 1: Double every second digit from right to left.
           If doubling results in a two-digit number, add those 
           digits together */
        private int[] doubleAlternateDigits(int[] digits) {
            // TODO(CARD-123): Optimize for large arrays
            int[] result = new int[digits.length];
            for (int i = digits.length - 2; i >= 0; i -= 2) {
                int doubled = digits[i] * 2;
                result[i] = doubled > 9 ? doubled - 9 : doubled;
                result[i + 1] = digits[i + 1];
            }
            return result;
        }

        // FIXME: Current implementation doesn't handle all edge cases
        // See issue CARD-456 for details
        public boolean validate(String cardNumber) {
            // Remove any spaces or hyphens
            cardNumber = cardNumber.replaceAll("[-\\s]", "");
            
            return performLuhnCheck(cardNumber);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package validation

    // CreditCardValidator implements the Luhn algorithm for credit card validation
    // as specified in ISO/IEC 7812-1:2017
    type CreditCardValidator struct {
        // Configuration parameters
    }

    // doubleAlternateDigits processes digits according to Luhn algorithm:
    // 1. Double every second digit from right to left
    // 2. If doubling results in two digits, add them together
    // TODO(CARD-123): Optimize for large arrays
    func (v *CreditCardValidator) doubleAlternateDigits(digits []int) []int {
        result := make([]int, len(digits))
        for i := len(digits) - 2; i >= 0; i -= 2 {
            doubled := digits[i] * 2
            result[i] = doubled
            if doubled > 9 {
                result[i] = doubled - 9
            }
            result[i+1] = digits[i+1]
        }
        return result
    }

    // Validate checks if a credit card number is valid using the Luhn algorithm
    // FIXME: Current implementation doesn't handle all edge cases
    // See issue CARD-456 for details
    func (v *CreditCardValidator) Validate(cardNumber string) bool {
        // Remove any spaces or hyphens
        cardNumber = strings.ReplaceAll(cardNumber, "-", "")
        cardNumber = strings.ReplaceAll(cardNumber, " ", "")
        
        return v.performLuhnCheck(cardNumber)
    }
    ```
  </TabItem>
</Tabs>

## ⚠️ Common Pitfalls

1. **Redundant Comments**
   ```java
   // Bad:
   // Increment counter by one
   counter++;

   // Good:
   // Reset counter when maximum retries reached
   counter++;
   ```

2. **Outdated Comments**
   ```java
   // Bad:
   // Check if user is admin
   if (user.hasRole("SUPER_USER")) // Role name changed but comment wasn't updated

   // Good:
   // Verify user has administrative privileges as per RBAC-2024 spec
   if (user.hasRole("ADMIN"))
   ```

3. **Commented-Out Code**
   ```java
   // Bad:
   public void processOrder(Order order) {
       // validateOrder(order);
       // Old validation method, keeping just in case
       newValidateOrder(order);
   }

   // Good:
   // Version control systems should be used for keeping old code
   public void processOrder(Order order) {
       validateOrder(order);
   }
   ```

## 🎯 Use Cases

### 1. Complex Algorithm Implementation
```java
/**
 * Implements the A* pathfinding algorithm.
 * Time Complexity: O(b^d) where b is the branching factor
 * and d is the depth of the shortest path.
 *
 * Reference: Hart, P. E., Nilsson, N. J., & Raphael, B. (1968)
 */
public class AStarPathfinder {
    // Implementation details...
}
```

### 2. Legal Requirements
```java
/*
 * Copyright (c) 2024 Company Name
 * Licensed under the Apache License, Version 2.0
 * 
 * This module contains proprietary algorithms for risk assessment.
 * Patent pending: US2024/123456
 */
public class RiskAssessmentEngine {
    // Implementation details...
}
```

### 3. Business Rules
```java
public class TaxCalculator {
    /**
     * Calculates VAT based on regional rules:
     * - EU: Apply country-specific rates
     * - US: Handle state-specific sales tax
     * - UAE: Apply 5% standard rate
     *
     * Reference: TAX-POLICY-2024 document
     */
    public double calculateTax(Order order) {
        // Implementation details...
    }
}
```

## 🔍 Deep Dive Topics

### Thread Safety
```java
public class ThreadSafeCache {
    /**
     * The cache implementation uses a striped lock approach for better
     * concurrent performance. Each stripe manages a subset of the key space.
     * 
     * Lock striping reduces contention by allowing multiple threads to
     * access different stripes simultaneously.
     *
     * @see ConcurrencyControl class for lock implementation details
     */
    private final StripedLock lockManager;
}
```

### Performance
```java
/**
 * Performance Critical Section
 * 
 * This code block is called frequently in the hot path.
 * Current performance characteristics:
 * - Average time: 0.5ms
 * - 99th percentile: 2ms
 * - Allocation rate: 100KB/sec
 *
 * Optimization history:
 * - 2024-01: Replaced string concatenation with StringBuilder
 * - 2024-02: Introduced object pooling
 * - 2024-03: Added cache preloading
 */
public class PerformanceCriticalSection {
    // Implementation details...
}
```

### Distributed Systems
```java
/**
 * Distributed Transaction Coordinator
 *
 * Implements the two-phase commit protocol with the following guarantees:
 * 1. Atomicity across all participants
 * 2. Eventual consistency in case of network partitions
 * 3. Recovery from coordinator failures
 *
 * System Design: https://wiki/design/distributed-transactions
 * Recovery Protocol: https://wiki/design/2pc-recovery
 */
public class TransactionCoordinator {
    // Implementation details...
}
```

## 📚 Additional Resources

### Tools
- Javadoc/godoc: API documentation generators
- CheckStyle: Comment style checker
- SonarQube: Code quality analysis
- Doxygen: Documentation generator

### References
- "Clean Code" by Robert C. Martin
- "Code Complete" by Steve McConnell
- "Documentation Guidelines" by Google
- "The Art of Readable Code" by Dustin Boswell

## ❓ FAQs

### Q: When should I comment code?
A: Comment when code alone cannot sufficiently explain "why" something is done a certain way.

### Q: How do I handle legacy comments?
A: Review and update during maintenance, remove outdated comments, and replace with self-documenting code when possible.

### Q: Should I comment private methods?
A: Comment if they implement complex logic or business rules. Otherwise, clear naming is often sufficient.

### Q: How do I maintain API documentation?
A: Keep it close to code, automate generation, and include in code review process.

### Q: What about TODO comments?
A: Include issue references, set timelines, and regularly review/clean up resolved TODOs.