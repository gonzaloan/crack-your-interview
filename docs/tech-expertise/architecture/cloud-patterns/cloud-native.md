---
sidebar_position: 1
title: "Cloud Native"
description: "Cloud Native"
---

# ☁️ Cloud Native Architecture Patterns

## 1. 🎯 Core Principles & Patterns

### 1.1 Container-Based Deployment

**Concept**: Applications and dependencies packaged as lightweight, portable containers.

**Key Components**:
- Container runtime (Docker, containerd)
- Container orchestration (Kubernetes)
- Container registry
- CI/CD pipeline

**Implementation Example**:
```dockerfile
# Multi-stage build for optimization
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Configuration via environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 1.2 Twelve-Factor App Pattern

**Concept**: Methodology for building cloud-native applications.

**Implementation Example**:
```java
@Configuration
public class CloudNativeConfig {
    // I. Codebase - One codebase tracked in revision control
    
    // III. Config - Store config in the environment
    @Value("${DATABASE_URL}")
    private String databaseUrl;
    
    // IV. Backing services - Treat backing services as attached resources
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder
            .create()
            .url(databaseUrl)
            .build();
    }
    
    // XI. Logs - Treat logs as event streams
    @Bean
    public LoggingSystem loggingSystem() {
        return LoggingSystem.get(getClass().getClassLoader())
            .configureDefault(LogOutput.toConsole());
    }
}

// VII. Port binding - Export services via port binding
@SpringBootApplication
public class CloudNativeApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudNativeApplication.class, args);
    }
}
```

## 2. 🔄 Cloud Native Design Patterns

### 2.1 Circuit Breaker Pattern

**Concept**: Prevent cascading failures in distributed systems.

**Implementation**:
```java
@Service
public class ResilienceService {
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    
    @CircuitBreaker(name = "externalService")
    @Retry(name = "externalService")
    @Bulkhead(name = "externalService")
    public Response callExternalService() {
        return externalServiceClient.makeRequest();
    }
    
    @Bean
    public CircuitBreakerConfig circuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofMillis(1000))
            .permittedNumberOfCallsInHalfOpenState(2)
            .slidingWindowSize(2)
            .build();
    }
}
```

### 2.2 Service Mesh Pattern

**Concept**: Infrastructure layer for handling service-to-service communication.

**Istio Configuration Example**:
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-service
spec:
  hosts:
  - my-service
  http:
  - route:
    - destination:
        host: my-service
        subset: v1
      weight: 90
    - destination:
        host: my-service
        subset: v2
      weight: 10
  retries:
    attempts: 3
    perTryTimeout: 2s
    retryOn: gateway-error,connect-failure,refused-stream
```

### 2.3 Event-Driven Architecture

**Concept**: Services communicate through events.

**Implementation**:
```java
@Service
public class CloudEventProcessor {
    private final EventBridge eventBridge;

    @EventListener
    public void handleOrderEvent(OrderEvent event) {
        CloudEvent cloudEvent = CloudEvent.builder()
            .withId(UUID.randomUUID().toString())
            .withSource(URI.create("/orders"))
            .withType("com.example.order.created")
            .withData(event.toJson())
            .build();
            
        eventBridge.putEvents(PutEventsRequest.builder()
            .entries(EventBridgeEntry.builder()
                .detail(cloudEvent.getData())
                .detailType(cloudEvent.getType())
                .source(cloudEvent.getSource().toString())
                .build())
            .build());
    }
}
```

## 3. 🔍 Observability Patterns

### 3.1 Distributed Tracing

**Concept**: Track requests across multiple services.

**Implementation**:
```java
@Configuration
public class TracingConfig {
    @Bean
    public OpenTelemetry openTelemetry() {
        Resource resource = Resource.create(Attributes.of(
            ResourceAttributes.SERVICE_NAME, "order-service"
        ));

        SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
            .addSpanProcessor(BatchSpanProcessor.builder(
                OtlpGrpcSpanExporter.builder()
                    .setEndpoint("http://collector:4317")
                    .build())
                .build())
            .setResource(resource)
            .build();

        return OpenTelemetrySdk.builder()
            .setTracerProvider(tracerProvider)
            .buildAndRegisterGlobal();
    }
}

@Service
public class OrderService {
    private final Tracer tracer;
    
    public Order processOrder(OrderRequest request) {
        Span span = tracer.spanBuilder("processOrder")
            .setAttribute("orderId", request.getOrderId())
            .startSpan();
            
        try (Scope scope = span.makeCurrent()) {
            // Process order
            return orderProcessor.process(request);
        } catch (Exception e) {
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### 3.2 Metrics Collection

**Concept**: Gather metrics for monitoring and alerting.

**Implementation**:
```java
@Configuration
public class MetricsConfig {
    @Bean
    MeterRegistry meterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }
}

@Service
public class MonitoredService {
    private final MeterRegistry registry;
    
    public void processRequest() {
        Timer.Sample sample = Timer.start(registry);
        
        try {
            // Process request
            sample.stop(Timer.builder("request.duration")
                .description("Request processing duration")
                .tag("endpoint", "/process")
                .register(registry));
                
            registry.counter("request.success").increment();
        } catch (Exception e) {
            registry.counter("request.error",
                "error", e.getClass().getSimpleName()).increment();
            throw e;
        }
    }
}
```

## 4. 🔐 Security Patterns

### 4.1 Zero Trust Security

**Concept**: Never trust, always verify.

**Implementation**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) 
            throws Exception {
        return http
            .authorizeRequests()
                .antMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(jwtAuthConverter())
            .and()
            .cors()
            .and()
            .csrf()
            .and()
            .headers()
                .contentSecurityPolicy(
                    "default-src 'self'; frame-ancestors 'none';")
            .and()
            .build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
            Arrays.asList("https://trusted-origin.com"));
        configuration.setAllowedMethods(
            Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(
            Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 4.2 Secrets Management

**Concept**: Secure handling of sensitive configuration.

**Implementation**:
```java
@Configuration
public class SecretsConfig {
    @Bean
    public AWSSecretsManagerClientBuilder secretsManagerClient() {
        return AWSSecretsManagerClientBuilder.standard()
            .withRegion(Regions.US_EAST_1)
            .withCredentials(new DefaultAWSCredentialsProviderChain());
    }
    
    @Bean
    public SecretValueProvider secretValueProvider(
            AWSSecretsManagerClientBuilder builder) {
        return new SecretsManagerSecretValueProvider(
            builder.build());
    }
}

@Service
public class SecureService {
    private final SecretValueProvider secretProvider;
    
    public void processSecurely() {
        String apiKey = secretProvider.getSecretValue("api-key");
        // Use apiKey securely
    }
}
```

## 5. 📦 Infrastructure as Code Patterns

### 5.1 Terraform Infrastructure Definition

**Example**:
```hcl
# Define cloud infrastructure
provider "aws" {
  region = "us-west-2"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "my-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-west-2a", "us-west-2b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
  
  tags = {
    Environment = "prod"
    Terraform   = "true"
  }
}

resource "aws_eks_cluster" "main" {
  name     = "main-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  
  vpc_config {
    subnet_ids = module.vpc.private_subnets
  }
}
```

### 5.2 Kubernetes Resource Definition

**Example**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloud-native-app
  labels:
    app: cloud-native-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cloud-native-app
  template:
    metadata:
      labels:
        app: cloud-native-app
    spec:
      containers:
      - name: app
        image: cloud-native-app:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 6. 🚦 Best Practices

1. **Design Principles**
    - Build for failure
    - Design for scalability
    - Implement security at every layer
    - Use automation extensively

2. **Implementation Guidelines**
    - Use container-based deployment
    - Implement comprehensive monitoring
    - Practice Infrastructure as Code
    - Maintain service independence

3. **Operational Considerations**
    - Implement automated scaling
    - Use blue-green deployments
    - Monitor service health
    - Maintain security compliance

## 7. 📚 References

- "Cloud Native Patterns" by Cornelia Davis
- "Kubernetes Patterns" by Bilgin Ibryam & Roland Huß
- "Cloud Native Infrastructure" by Justin Garrison & Kris Nova
- AWS, Azure, and GCP Best Practices Documentation