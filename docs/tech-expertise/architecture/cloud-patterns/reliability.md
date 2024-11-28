---
sidebar_position: 3
title: "Reliability Patterns"
description: "Reliability Patterns"
---

# 🛡️ Cloud Reliability Patterns

## 1. 🔄 Circuit Breaker Pattern

### 1.1 Overview

**Concept**: Prevents cascading failures by failing fast and providing fallback behavior.

**States**:
- Closed (normal operation)
- Open (failure state)
- Half-Open (testing recovery)

**Implementation Example Using Resilience4j**:
```java
@Configuration
public class CircuitBreakerConfig {
    @Bean
    public CircuitBreaker orderServiceCircuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)                     // 50% failure rate
            .waitDurationInOpenState(Duration.ofMillis(1000))
            .permittedNumberOfCallsInHalfOpenState(2)
            .slidingWindowSize(4)
            .build();
            
        return CircuitBreaker.of("orderService", config);
    }
}

@Service
public class OrderService {
    private final CircuitBreaker circuitBreaker;
    private final OrderClient orderClient;

    public OrderResponse processOrder(OrderRequest request) {
        return circuitBreaker.decorateSupplier(() -> 
            orderClient.submitOrder(request))
            .recover(throwable -> fallbackOrder(request))
            .get();
    }

    private OrderResponse fallbackOrder(OrderRequest request) {
        // Fallback logic
        return OrderResponse.builder()
            .orderId(request.getOrderId())
            .status(OrderStatus.PENDING)
            .message("Service temporarily unavailable")
            .build();
    }
}
```

## 2. 🔁 Retry Pattern

### 2.1 Implementation

**Concept**: Handles temporary failures by retrying operations with exponential backoff.

**Example**:
```java
@Configuration
public class RetryConfig {
    @Bean
    public Retry orderServiceRetry() {
        return RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofMillis(100))
            .exponentialBackoff(2, Duration.ofMillis(1000))
            .retryExceptions(TimeoutException.class, 
                           ConnectException.class)
            .ignoreExceptions(ValidationException.class)
            .build();
    }
}

@Service
public class ReliableService {
    private final Retry retry;
    private final ExternalService externalService;

    @Retryable(
        value = {ServiceException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public Response callExternalService(Request request) {
        return retry.executeSupplier(() -> 
            externalService.process(request));
    }

    @Recover
    public Response fallbackMethod(ServiceException e, 
                                 Request request) {
        // Fallback logic after all retries fail
        return Response.builder()
            .status(Status.FAILED)
            .message("Service unavailable after retries")
            .build();
    }
}
```

## 3. 🛡️ Bulkhead Pattern

### 3.1 Implementation

**Concept**: Isolates failures by limiting concurrent requests.

**Example**:
```java
@Configuration
public class BulkheadConfig {
    @Bean
    public ThreadPoolBulkhead orderServiceBulkhead() {
        ThreadPoolBulkheadConfig config = 
            ThreadPoolBulkheadConfig.custom()
                .maxThreadPoolSize(10)
                .coreThreadPoolSize(5)
                .queueCapacity(100)
                .build();
                
        return ThreadPoolBulkhead.of("orderService", config);
    }
}

@Service
public class IsolatedService {
    private final ThreadPoolBulkhead bulkhead;

    @Bulkhead(name = "orderService", 
              type = Bulkhead.Type.THREADPOOL)
    public CompletableFuture<Response> processRequest(
            Request request) {
        return bulkhead.executeSupplier(() -> {
            // Process request
            return processAsync(request);
        });
    }

    private Response processAsync(Request request) {
        // Async processing logic
        return new Response();
    }
}
```

## 4. 🔄 Health Check Pattern

### 4.1 Implementation

**Concept**: Monitors service health and availability.

**Example**:
```java
@Component
public class HealthCheck {
    @Bean
    public HealthIndicator databaseHealthIndicator(
            DataSource dataSource) {
        return new DataSourceHealthIndicator(dataSource);
    }

    @Component
    public class CustomHealthIndicator 
            implements HealthIndicator {
        
        @Override
        public Health health() {
            try {
                // Check external dependency
                checkExternalService();
                return Health.up()
                    .withDetail("externalService", "UP")
                    .build();
            } catch (Exception e) {
                return Health.down()
                    .withDetail("externalService", "DOWN")
                    .withException(e)
                    .build();
            }
        }
    }
}

@RestController
public class HealthController {
    private final HealthIndicator healthIndicator;

    @GetMapping("/health")
    public ResponseEntity<Health> checkHealth() {
        Health health = healthIndicator.health();
        HttpStatus status = health.getStatus().equals(Status.UP) 
            ? HttpStatus.OK 
            : HttpStatus.SERVICE_UNAVAILABLE;
            
        return ResponseEntity
            .status(status)
            .body(health);
    }
}
```

## 5. 📝 Cache-Aside Pattern

### 5.1 Implementation

**Concept**: Improves performance and reliability by caching frequently accessed data.

**Example**:
```java
@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager cacheManager = RedisCacheManager
            .builder(redisConnectionFactory())
            .cacheDefaults(defaultConfig())
            .withInitialCacheConfigurations(
                customCacheConfigs())
            .build();
            
        return cacheManager;
    }

    private RedisCacheConfiguration defaultConfig() {
        return RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(
                RedisSerializationContext
                    .SerializationPair
                    .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext
                    .SerializationPair
                    .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}

@Service
public class CachingService {
    private final CacheManager cacheManager;
    private final DataService dataService;

    @Cacheable(value = "products", 
               key = "#id", 
               unless = "#result == null")
    public Product getProduct(String id) {
        return dataService.getProduct(id);
    }

    @CacheEvict(value = "products", key = "#id")
    public void updateProduct(String id, Product product) {
        dataService.updateProduct(id, product);
    }

    @CachePut(value = "products", key = "#id")
    public Product createProduct(String id, Product product) {
        return dataService.createProduct(id, product);
    }
}
```

## 6. 🔍 Service Discovery Pattern

### 6.1 Implementation

**Concept**: Enables services to find and communicate with each other dynamically.

**Example Using Spring Cloud Netflix**:
```java
@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(
            DiscoveryServerApplication.class, args);
    }
}

@EnableDiscoveryClient
@SpringBootApplication
public class ServiceApplication {
    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class ServiceDiscoveryClient {
    private final RestTemplate restTemplate;
    private final DiscoveryClient discoveryClient;

    public Response callService(String serviceId, Request request) {
        List<ServiceInstance> instances = 
            discoveryClient.getInstances(serviceId);
            
        if (instances.isEmpty()) {
            throw new ServiceNotFoundException(serviceId);
        }

        ServiceInstance instance = 
            instances.get(new Random().nextInt(instances.size()));
            
        String url = instance.getUri() + "/api/endpoint";
        
        return restTemplate.postForObject(
            url, request, Response.class);
    }
}
```

## 7. 🔒 Rate Limiting Pattern

### 7.1 Implementation

**Concept**: Protects services from being overwhelmed by too many requests.

**Example**:
```java
@Configuration
public class RateLimitConfig {
    @Bean
    public RateLimiter rateLimiter() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitForPeriod(100)
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .timeoutDuration(Duration.ofMillis(500))
            .build();
            
        return RateLimiter.of("default", config);
    }
}

@Component
public class RateLimitingFilter implements Filter {
    private final RateLimiter rateLimiter;

    @Override
    public void doFilter(ServletRequest request, 
                        ServletResponse response,
                        FilterChain chain) 
            throws IOException, ServletException {
        
        boolean permission = rateLimiter.acquirePermission();
        
        if (permission) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpResponse = 
                (HttpServletResponse) response;
            httpResponse.setStatus(
                HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter()
                .write("Too many requests");
        }
    }
}
```

## 8. 📊 Monitoring and Alerting

### 8.1 Implementation

**Concept**: Tracks service health and performance metrics.

**Example**:
```java
@Configuration
public class MonitoringConfig {
    @Bean
    public MeterRegistry meterRegistry() {
        return new SimpleMeterRegistry();
    }
}

@Service
public class MonitoredService {
    private final MeterRegistry registry;
    private final Counter requestCounter;
    private final Timer requestTimer;

    public MonitoredService(MeterRegistry registry) {
        this.registry = registry;
        this.requestCounter = Counter
            .builder("service.requests")
            .description("Number of requests received")
            .register(registry);
        this.requestTimer = Timer
            .builder("service.request.duration")
            .description("Request processing time")
            .register(registry);
    }

    public Response processRequest(Request request) {
        requestCounter.increment();
        
        return requestTimer.record(() -> {
            // Process request
            return new Response();
        });
    }
}

@Component
public class MetricsExporter {
    private final MeterRegistry registry;

    @Scheduled(fixedRate = 60000)
    public void exportMetrics() {
        Collection<Meter> meters = registry.getMeters();
        for (Meter meter : meters) {
            // Export metrics to monitoring system
            exportMeter(meter);
        }
    }
}
```

## 9. Best Practices

### 9.1 Implementation Guidelines

1. **Fault Isolation**
    - Use bulkheads to isolate failures
    - Implement circuit breakers
    - Design for partial failures

2. **Monitoring**
    - Track key metrics
    - Set up alerts
    - Monitor service health

3. **Resilience Testing**
    - Conduct chaos engineering
    - Test failure scenarios
    - Validate recovery mechanisms

4. **Performance Optimization**
    - Implement caching
    - Use connection pooling
    - Optimize resource usage

## 10. References

- "Release It!" by Michael Nygard
- "Building Microservices" by Sam Newman
- Spring Cloud Documentation
- Netflix OSS Documentation
- AWS Well-Architected Framework