---
sidebar_position: 1
title: "Resilience Patterns"
description: "Resilence Patterns"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🛡️ Resilience Patterns in Microservices

## Overview
Resilience patterns in microservices are strategies designed to handle failures gracefully, ensure system stability, and maintain service availability. These patterns help systems recover from failures and continue operating under adverse conditions.

**Real-world Analogy**: Think of resilience patterns like a city's emergency response system. Just as cities have backup power systems, emergency services, and disaster recovery plans, microservices need mechanisms to handle failures, overload, and unexpected conditions.

## 🔑 Key Concepts

### Core Components

1. **Circuit Breaker**
    - Failure detection
    - State transition
    - Fallback mechanisms

2. **Retry Pattern**
    - Backoff strategies
    - Retry policies
    - Timeout handling

3. **Bulkhead Pattern**
    - Resource isolation
    - Thread pool separation
    - Failure containment

4. **Rate Limiting**
    - Request throttling
    - Load shedding
    - Queue management

## 💻 Implementation Examples

### Circuit Breaker Pattern

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Using Resilience4j
    @Service
    public class OrderService {
        private final CircuitBreaker circuitBreaker;
        private final PaymentClient paymentClient;

        public OrderService(CircuitBreakerRegistry registry, PaymentClient paymentClient) {
            this.circuitBreaker = registry.circuitBreaker("paymentService");
            this.paymentClient = paymentClient;
        }

        public PaymentResponse processPayment(PaymentRequest request) {
            return CircuitBreaker.decorateSupplier(
                circuitBreaker,
                () -> paymentClient.processPayment(request)
            ).get();
        }

        // Fallback method
        private PaymentResponse fallback(PaymentRequest request, Exception ex) {
            return PaymentResponse.builder()
                .status(PaymentStatus.PENDING)
                .message("Payment service temporarily unavailable")
                .build();
        }
    }

    // Configuration
    @Configuration
    public class ResilienceConfig {
        @Bean
        public CircuitBreakerRegistry circuitBreakerRegistry() {
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowSize(2)
                .build();
                
            return CircuitBreakerRegistry.of(config);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // Circuit Breaker implementation
    type CircuitBreaker struct {
        failures     int
        maxFailures  int
        timeout      time.Duration
        lastFailure  time.Time
        state       State
        mutex       sync.RWMutex
    }

    func NewCircuitBreaker(maxFailures int, timeout time.Duration) *CircuitBreaker {
        return &CircuitBreaker{
            maxFailures: maxFailures,
            timeout:    timeout,
            state:     StateClosed,
        }
    }

    func (cb *CircuitBreaker) Execute(callback func() error) error {
        cb.mutex.RLock()
        if cb.state == StateOpen {
            if time.Since(cb.lastFailure) > cb.timeout {
                cb.mutex.RUnlock()
                cb.mutex.Lock()
                cb.state = StateHalfOpen
                cb.mutex.Unlock()
            } else {
                cb.mutex.RUnlock()
                return ErrCircuitOpen
            }
        } else {
            cb.mutex.RUnlock()
        }

        err := callback()

        cb.mutex.Lock()
        defer cb.mutex.Unlock()

        if err != nil {
            cb.failures++
            cb.lastFailure = time.Now()

            if cb.failures >= cb.maxFailures {
                cb.state = StateOpen
            }
            return err
        }

        if cb.state == StateHalfOpen {
            cb.state = StateClosed
        }
        cb.failures = 0
        return nil
    }

    // Usage example
    type PaymentService struct {
        client  *http.Client
        cb      *CircuitBreaker
    }

    func NewPaymentService() *PaymentService {
        return &PaymentService{
            client: &http.Client{},
            cb:     NewCircuitBreaker(5, time.Second*10),
        }
    }

    func (s *PaymentService) ProcessPayment(ctx context.Context, request PaymentRequest) (*PaymentResponse, error) {
        err := s.cb.Execute(func() error {
            // Make HTTP request to payment service
            resp, err := s.client.Post("payment-service/process", "application/json", request.ToJSON())
            if err != nil {
                return err
            }
            defer resp.Body.Close()
            
            if resp.StatusCode != http.StatusOK {
                return fmt.Errorf("payment service error: %d", resp.StatusCode)
            }
            return nil
        })

        if err == ErrCircuitOpen {
            return s.fallback(request), nil
        }

        if err != nil {
            return nil, err
        }

        return &PaymentResponse{
            Status: PaymentStatusSuccess,
        }, nil
    }
    ```
  </TabItem>
</Tabs>

### Bulkhead Pattern

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    @Service
    public class OrderProcessor {
        private final Bulkhead bulkhead;
        private final ExecutorService executorService;

        public OrderProcessor(BulkheadRegistry registry) {
            this.bulkhead = registry.bulkhead("orderProcessor");
            this.executorService = Executors.newFixedThreadPool(10);
        }

        public CompletableFuture<OrderResult> processOrder(Order order) {
            return Bulkhead.decorateSupplier(
                bulkhead,
                () -> processOrderAsync(order)
            ).get();
        }

        private CompletableFuture<OrderResult> processOrderAsync(Order order) {
            return CompletableFuture.supplyAsync(() -> {
                // Process order logic
                return new OrderResult(order.getId(), OrderStatus.PROCESSED);
            }, executorService);
        }
    }

    @Configuration
    public class BulkheadConfig {
        @Bean
        public BulkheadRegistry bulkheadRegistry() {
            BulkheadConfig config = BulkheadConfig.custom()
                .maxConcurrentCalls(10)
                .maxWaitDuration(Duration.ofMillis(500))
                .build();
                
            return BulkheadRegistry.of(config);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    type Bulkhead struct {
        semaphore chan struct{}
        timeout   time.Duration
    }

    func NewBulkhead(maxConcurrent int, timeout time.Duration) *Bulkhead {
        return &Bulkhead{
            semaphore: make(chan struct{}, maxConcurrent),
            timeout:   timeout,
        }
    }

    func (b *Bulkhead) Execute(ctx context.Context, fn func() error) error {
        select {
        case b.semaphore <- struct{}{}:
            defer func() { <-b.semaphore }()
            return fn()
        case <-time.After(b.timeout):
            return ErrBulkheadFull
        case <-ctx.Done():
            return ctx.Err()
        }
    }

    type OrderProcessor struct {
        bulkhead *Bulkhead
    }

    func NewOrderProcessor() *OrderProcessor {
        return &OrderProcessor{
            bulkhead: NewBulkhead(10, time.Second),
        }
    }

    func (p *OrderProcessor) ProcessOrder(ctx context.Context, order Order) (*OrderResult, error) {
        err := p.bulkhead.Execute(ctx, func() error {
            // Process order logic
            return nil
        })

        if err != nil {
            if err == ErrBulkheadFull {
                return nil, fmt.Errorf("system is overloaded, please try again later")
            }
            return nil, err
        }

        return &OrderResult{
            OrderID: order.ID,
            Status:  OrderStatusProcessed,
        }, nil
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Health Check Pattern**
    - Service health monitoring
    - Dependency checks
    - Self-healing mechanisms

2. **Timeout Pattern**
    - Request timeouts
    - Circuit breaker integration
    - Fallback strategies

3. **Cache-Aside Pattern**
    - Data availability
    - Load reduction
    - Latency improvement

## ⚙️ Best Practices

### Configuration
- Dynamic threshold adjustment
- Environment-specific settings
- Monitoring integration
- Graceful degradation

### Monitoring
- Failure metrics
- Response times
- Circuit breaker states
- Resource utilization

### Testing
- Chaos engineering
- Load testing
- Failure injection
- Recovery testing

## ❌ Common Pitfalls

1. **Cascading Failures**
    - Problem: Failure propagation
    - Solution: Circuit breakers and bulkheads

2. **Resource Exhaustion**
    - Problem: System overload
    - Solution: Rate limiting and bulkheads

3. **Timeout Confusion**
    - Problem: Multiple timeout layers
    - Solution: Coordinated timeout strategies

## 🎯 Use Cases

### 1. Payment Processing System
Problem: External service failures
Solution: Circuit breaker with fallback

### 2. API Gateway
Problem: Backend service overload
Solution: Rate limiting and bulkheads

### 3. Order Management System
Problem: Distributed transaction failures
Solution: Retry pattern with idempotency

## 🔍 Deep Dive Topics

### Thread Safety
- Concurrent request handling
- State management
- Resource synchronization
- Thread pool management

### Distributed Systems
- Consensus protocols
- Leader election
- Distributed state
- Network partitions

### Performance
- Response time optimization
- Resource utilization
- Latency management
- Throughput optimization

## 📚 Additional Resources

### Tools
- Resilience4j
- Hystrix (Legacy)
- Sentinel
- Polly

### References
- "Release It!" by Michael Nygard
- "Building Microservices" by Sam Newman
- "Designing Distributed Systems" by Brendan Burns

## ❓ FAQ

1. **Q: When should I use circuit breakers?**
   A: When calling potentially unstable external services or resources.

2. **Q: How do I choose timeout values?**
   A: Consider service SLAs, user experience, and resource constraints.

3. **Q: What's the difference between retry and circuit breaker?**
   A: Retry attempts to recover from transient failures, while circuit breaker prevents system overload.

4. **Q: How do I implement graceful degradation?**
   A: Use fallback mechanisms and feature toggles.

5. **Q: How do I test resilience patterns?**
   A: Use chaos engineering and fault injection testing.