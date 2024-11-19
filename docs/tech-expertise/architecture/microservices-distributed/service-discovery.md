---
sidebar_position: 4
title: "Service Discovery"
description: "Service Discovery"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Service Discovery in Microservices

## Overview
Service Discovery is a mechanism that enables microservices to locate and communicate with each other dynamically in a distributed system. It maintains a registry of available service instances and their locations.

**Real-world Analogy**: Think of service discovery like a phone directory service. Just as you can look up a business's current phone number without knowing its exact location, microservices can find and communicate with other services without knowing their specific network addresses.

## 🔑 Key Concepts

### Core Components

1. **Service Registry**
    - Service registration
    - Health monitoring
    - Location tracking

2. **Discovery Patterns**
    - Client-side discovery
    - Server-side discovery
    - Service mesh discovery

3. **Health Checks**
    - Liveness probes
    - Readiness probes
    - Custom health indicators

4. **Load Balancing**
    - Client-side load balancing
    - Server-side load balancing
    - Service mesh routing

## 💻 Implementation Examples

### Client-Side Discovery Pattern

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Using Spring Cloud and Netflix Eureka
    @SpringBootApplication
    @EnableDiscoveryClient
    public class ServiceApplication {
        public static void main(String[] args) {
            SpringApplication.run(ServiceApplication.class, args);
        }
    }

    @RestController
    public class ServiceController {
        private final DiscoveryClient discoveryClient;
        private final LoadBalancerClient loadBalancer;
        
        public ServiceController(DiscoveryClient discoveryClient, LoadBalancerClient loadBalancer) {
            this.discoveryClient = discoveryClient;
            this.loadBalancer = loadBalancer;
        }
        
        @GetMapping("/service-instances/{applicationName}")
        public List<ServiceInstance> serviceInstancesByApplicationName(
                @PathVariable String applicationName) {
            return this.discoveryClient.getInstances(applicationName);
        }
        
        @GetMapping("/call-service/{serviceName}")
        public ResponseEntity<String> callService(@PathVariable String serviceName) {
            ServiceInstance instance = loadBalancer.choose(serviceName);
            if (instance == null) {
                return ResponseEntity.notFound().build();
            }
            
            String serviceUrl = instance.getUri().toString() + "/api/endpoint";
            // Make the service call
            return restTemplate.getForEntity(serviceUrl, String.class);
        }
    }

    // Service Registration
    @Configuration
    public class ServiceRegistrationConfig {
        @Bean
        public ServiceRegistrationLifecycle serviceRegistrationLifecycle(
                Registration registration) {
            return new ServiceRegistrationLifecycle(registration);
        }
    }

    public class ServiceRegistrationLifecycle {
        private final Registration registration;
        
        @PostConstruct
        public void register() {
            // Register with Eureka
            registration.register();
        }
        
        @PreDestroy
        public void deregister() {
            // Deregister from Eureka
            registration.deregister();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // Using Consul
    type ServiceDiscovery struct {
        consul    *api.Client
        serviceName string
        serviceID   string
        port        int
    }

    func NewServiceDiscovery(serviceName string, port int) (*ServiceDiscovery, error) {
        config := api.DefaultConfig()
        client, err := api.NewClient(config)
        if err != nil {
            return nil, fmt.Errorf("failed to create consul client: %w", err)
        }

        return &ServiceDiscovery{
            consul:      client,
            serviceName: serviceName,
            serviceID:   fmt.Sprintf("%s-%s", serviceName, uuid.New().String()),
            port:        port,
        }, nil
    }

    func (sd *ServiceDiscovery) Register() error {
        registration := &api.AgentServiceRegistration{
            ID:      sd.serviceID,
            Name:    sd.serviceName,
            Port:    sd.port,
            Tags:    []string{"microservice"},
            Check: &api.AgentServiceCheck{
                HTTP:     fmt.Sprintf("http://localhost:%d/health", sd.port),
                Interval: "10s",
                Timeout:  "1s",
            },
        }

        return sd.consul.Agent().ServiceRegister(registration)
    }

    func (sd *ServiceDiscovery) Deregister() error {
        return sd.consul.Agent().ServiceDeregister(sd.serviceID)
    }

    func (sd *ServiceDiscovery) DiscoverService(serviceName string) (*api.AgentService, error) {
        services, err := sd.consul.Agent().Services()
        if err != nil {
            return nil, fmt.Errorf("failed to get services: %w", err)
        }

        for _, service := range services {
            if service.Service == serviceName {
                return service, nil
            }
        }

        return nil, fmt.Errorf("service %s not found", serviceName)
    }

    // Service Client with Load Balancing
    type ServiceClient struct {
        discovery *ServiceDiscovery
        client    *http.Client
        lb        *LoadBalancer
    }

    func (sc *ServiceClient) CallService(ctx context.Context, serviceName string) (*http.Response, error) {
        instances, err := sc.discovery.GetServiceInstances(serviceName)
        if err != nil {
            return nil, fmt.Errorf("failed to get service instances: %w", err)
        }

        instance := sc.lb.Choose(instances)
        if instance == nil {
            return nil, fmt.Errorf("no available instances for service %s", serviceName)
        }

        url := fmt.Sprintf("http://%s:%d/api/endpoint", instance.Address, instance.Port)
        req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
        if err != nil {
            return nil, err
        }

        return sc.client.Do(req)
    }
    ```
  </TabItem>
</Tabs>

### Health Check Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    @Component
    public class CustomHealthIndicator implements HealthIndicator {
        private final DataSource dataSource;
        private final RestTemplate restTemplate;

        @Override
        public Health health() {
            Health.Builder builder = new Health.Builder();

            // Check database connectivity
            try {
                dataSource.getConnection().close();
                builder.up().withDetail("database", "Connected");
            } catch (SQLException e) {
                builder.down().withDetail("database", "Disconnected");
                return builder.build();
            }

            // Check external service dependency
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    "http://dependent-service/health", String.class);
                if (response.getStatusCode() == HttpStatus.OK) {
                    builder.withDetail("dependent-service", "Available");
                } else {
                    builder.down().withDetail("dependent-service", "Unavailable");
                }
            } catch (Exception e) {
                builder.down().withDetail("dependent-service", "Unreachable");
            }

            return builder.build();
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    type HealthChecker struct {
        db       *sql.DB
        services map[string]string
    }

    type HealthStatus struct {
        Status    string                 `json:"status"`
        Details   map[string]interface{} `json:"details"`
        Timestamp time.Time             `json:"timestamp"`
    }

    func NewHealthChecker(db *sql.DB, services map[string]string) *HealthChecker {
        return &HealthChecker{
            db:       db,
            services: services,
        }
    }

    func (hc *HealthChecker) Check(ctx context.Context) HealthStatus {
        status := HealthStatus{
            Status:    "UP",
            Details:   make(map[string]interface{}),
            Timestamp: time.Now(),
        }

        // Check database
        if err := hc.db.PingContext(ctx); err != nil {
            status.Status = "DOWN"
            status.Details["database"] = map[string]interface{}{
                "status":  "DOWN",
                "message": err.Error(),
            }
        } else {
            status.Details["database"] = map[string]interface{}{
                "status": "UP",
            }
        }

        // Check dependent services
        client := &http.Client{Timeout: 5 * time.Second}
        for name, url := range hc.services {
            req, err := http.NewRequestWithContext(ctx, "GET", url+"/health", nil)
            if err != nil {
                status.Status = "DOWN"
                status.Details[name] = map[string]interface{}{
                    "status":  "DOWN",
                    "message": err.Error(),
                }
                continue
            }

            resp, err := client.Do(req)
            if err != nil || resp.StatusCode != http.StatusOK {
                status.Status = "DOWN"
                status.Details[name] = map[string]interface{}{
                    "status":  "DOWN",
                    "message": "Service unavailable",
                }
            } else {
                status.Details[name] = map[string]interface{}{
                    "status": "UP",
                }
            }
        }

        return status
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

1. **Circuit Breaker**
    - Failure detection
    - Service resilience
    - Fallback mechanisms

2. **Load Balancer**
    - Request distribution
    - Health monitoring
    - Traffic management

3. **Service Mesh**
    - Service discovery
    - Traffic routing
    - Security

## ⚙️ Best Practices

### Configuration
- Service registration automation
- Health check configuration
- Timeout settings
- Retry policies

### Monitoring
- Service health metrics
- Discovery latency
- Registration status
- Load balancing metrics

### Testing
- Integration testing
- Chaos testing
- Performance testing
- Failover testing

## ❌ Common Pitfalls

1. **Stale Registrations**
    - Problem: Outdated service entries
    - Solution: TTL and health checks

2. **Network Partition**
    - Problem: Split-brain scenarios
    - Solution: Consensus protocols

3. **Discovery Latency**
    - Problem: Slow service lookup
    - Solution: Caching and local registry

## 🎯 Use Cases

### 1. Microservices Platform
Problem: Dynamic service locations
Solution: Service registry with health checks

### 2. Cloud Native Application
Problem: Auto-scaling service discovery
Solution: Dynamic registration/deregistration

### 3. Multi-Region Deployment
Problem: Cross-region service discovery
Solution: Federated service registry

## 🔍 Deep Dive Topics

### Thread Safety
- Registry consistency
- Concurrent registrations
- Cache synchronization
- State management

### Distributed Systems
- Consensus protocols
- Split-brain prevention
- Replication strategies
- Failure detection

### Performance
- Cache optimization
- Query efficiency
- Network overhead
- Registration latency

## 📚 Additional Resources

### Tools
- Consul
- Eureka
- etcd
- ZooKeeper

### References
- "Building Microservices" by Sam Newman
- "Cloud Native Patterns" by Cornelia Davis
- "Designing Distributed Systems" by Brendan Burns

## ❓ FAQ

1. **Q: Which service discovery tool should I use?**
   A: Depends on scale, infrastructure, and requirements. Consul for modern systems, Eureka for Spring Cloud.

2. **Q: How often should health checks run?**
   A: Typically every 10-30 seconds, depending on service SLAs and infrastructure.

3. **Q: Should I use client-side or server-side discovery?**
   A: Client-side for more control, server-side for simpler clients.

4. **Q: How do I handle service discovery in multiple regions?**
   A: Use federated service registry or region-specific registries.

5. **Q: What's the impact of service discovery on latency?**
   A: Minimal with proper caching and local registries.