---
sidebar_position: 3
title: "Availability"
description: "CAP - Availability"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CAP Theorem: Availability 🌐

## Overview 📋

Availability in the CAP theorem ensures that every request to a non-failing node receives a response, without the guarantee that it contains the most recent version of the data. This means the system remains operational and responsive even in the presence of network partitions or node failures.

**Real-World Analogy:**
Think of a global coffee shop chain. Even if the central office system is down, local shops continue to serve customers using their local point-of-sale systems. They might not have the most up-to-date inventory or pricing, but they remain operational (available) rather than shutting down.

## Key Concepts 🔑

### Components

1. **Node Health**
    - Active/alive status
    - Response capability
    - Load status

2. **Request Handling**
    - Timeout mechanisms
    - Fallback strategies
    - Load balancing

3. **Replication Strategy**
    - Read replicas
    - Write replicas
    - Replication factor

### States

1. **Available State**
    - System responding to requests
    - Acceptable response times
    - Possibly stale data

2. **Degraded State**
    - Partial system functionality
    - Limited operations available
    - Increased response times

3. **Recovery State**
    - System healing
    - Catching up with updates
    - Rebalancing load

## Implementation 💻

### Basic Availability Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.List;
    import java.util.ArrayList;
    import java.util.concurrent.TimeoutException;
    import java.util.concurrent.CompletableFuture;
    import java.util.concurrent.TimeUnit;

    public class HighAvailabilitySystem {
        private List<Node> nodes;
        private LoadBalancer loadBalancer;
        private long timeoutMs;

        public HighAvailabilitySystem(List<Node> nodes, long timeoutMs) {
            this.nodes = new ArrayList<>(nodes);
            this.loadBalancer = new LoadBalancer(nodes);
            this.timeoutMs = timeoutMs;
        }

        public Response processRequest(Request request) {
            Node primaryNode = loadBalancer.getNextAvailableNode();
            try {
                return CompletableFuture
                    .supplyAsync(() -> primaryNode.process(request))
                    .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                    .exceptionally(ex -> processWithFallback(request))
                    .get();
            } catch (Exception e) {
                return processWithFallback(request);
            }
        }

        private Response processWithFallback(Request request) {
            for (Node node : nodes) {
                try {
                    if (node.isHealthy()) {
                        return node.process(request);
                    }
                } catch (Exception ignored) {}
            }
            return Response.serviceUnavailable();
        }

        public boolean isAvailable() {
            return nodes.stream().anyMatch(Node::isHealthy);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "context"
        "time"
        "errors"
    )

    type HighAvailabilitySystem struct {
        nodes        []Node
        loadBalancer *LoadBalancer
        timeout      time.Duration
    }

    func NewHighAvailabilitySystem(nodes []Node, timeout time.Duration) *HighAvailabilitySystem {
        return &HighAvailabilitySystem{
            nodes:        nodes,
            loadBalancer: NewLoadBalancer(nodes),
            timeout:      timeout,
        }
    }

    func (ha *HighAvailabilitySystem) ProcessRequest(request Request) Response {
        primaryNode := ha.loadBalancer.GetNextAvailableNode()
        
        ctx, cancel := context.WithTimeout(context.Background(), ha.timeout)
        defer cancel()

        respChan := make(chan Response, 1)
        errChan := make(chan error, 1)

        go func() {
            resp := primaryNode.Process(request)
            respChan <- resp
        }()

        select {
        case resp := <-respChan:
            return resp
        case <-ctx.Done():
            return ha.processWithFallback(request)
        }
    }

    func (ha *HighAvailabilitySystem) processWithFallback(request Request) Response {
        for _, node := range ha.nodes {
            if node.IsHealthy() {
                if resp := node.Process(request); resp != nil {
                    return resp
                }
            }
        }
        return NewServiceUnavailableResponse()
    }

    func (ha *HighAvailabilitySystem) IsAvailable() bool {
        for _, node := range ha.nodes {
            if node.IsHealthy() {
                return true
            }
        }
        return false
    }
    ```
  </TabItem>
</Tabs>

### Replica Set Implementation

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.Set;
    import java.util.HashSet;
    import java.util.concurrent.ConcurrentHashMap;

    public class ReplicaSet {
        private final Set<Node> replicas;
        private final ConcurrentHashMap<String, Object> cache;
        private final int minActiveReplicas;

        public ReplicaSet(Set<Node> replicas, int minActiveReplicas) {
            this.replicas = new HashSet<>(replicas);
            this.cache = new ConcurrentHashMap<>();
            this.minActiveReplicas = minActiveReplicas;
        }

        public boolean write(String key, Object value) {
            int successCount = 0;
            for (Node replica : replicas) {
                try {
                    if (replica.write(key, value)) {
                        successCount++;
                    }
                } catch (Exception ignored) {}
            }
            
            if (successCount >= minActiveReplicas) {
                cache.put(key, value);
                return true;
            }
            return false;
        }

        public Object read(String key) {
            Object cachedValue = cache.get(key);
            if (cachedValue != null) {
                return cachedValue;
            }

            for (Node replica : replicas) {
                try {
                    Object value = replica.read(key);
                    if (value != null) {
                        cache.put(key, value);
                        return value;
                    }
                } catch (Exception ignored) {}
            }
            return null;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sync"
    )

    type ReplicaSet struct {
        replicas         []Node
        cache           map[string]interface{}
        cacheMux        sync.RWMutex
        minActiveReplicas int
    }

    func NewReplicaSet(replicas []Node, minActiveReplicas int) *ReplicaSet {
        return &ReplicaSet{
            replicas:         replicas,
            cache:           make(map[string]interface{}),
            minActiveReplicas: minActiveReplicas,
        }
    }

    func (rs *ReplicaSet) Write(key string, value interface{}) bool {
        successCount := 0
        var wg sync.WaitGroup
        
        successChan := make(chan bool, len(rs.replicas))
        
        for _, replica := range rs.replicas {
            wg.Add(1)
            go func(n Node) {
                defer wg.Done()
                if success := n.Write(key, value); success {
                    successChan <- true
                }
            }(replica)
        }
        
        go func() {
            wg.Wait()
            close(successChan)
        }()
        
        for range successChan {
            successCount++
        }
        
        if successCount >= rs.minActiveReplicas {
            rs.cacheMux.Lock()
            rs.cache[key] = value
            rs.cacheMux.Unlock()
            return true
        }
        return false
    }

    func (rs *ReplicaSet) Read(key string) interface{} {
        rs.cacheMux.RLock()
        if value, exists := rs.cache[key]; exists {
            rs.cacheMux.RUnlock()
            return value
        }
        rs.cacheMux.RUnlock()

        for _, replica := range rs.replicas {
            if value := replica.Read(key); value != nil {
                rs.cacheMux.Lock()
                rs.cache[key] = value
                rs.cacheMux.Unlock()
                return value
            }
        }
        return nil
    }
    ```
  </TabItem>
</Tabs>

## Related Patterns 🔄

1. **Circuit Breaker**
    - Prevents cascade failures
    - Enables graceful degradation
    - Supports quick recovery

2. **Bulkhead Pattern**
    - Isolates components
    - Contains failures
    - Maintains partial availability

3. **Retry Pattern**
    - Handles transient failures
    - Implements exponential backoff
    - Increases request success rate

## Best Practices 👌

### Configuration
1. Set appropriate timeouts
2. Configure health check intervals
3. Define failover thresholds
4. Implement retry policies

### Monitoring
1. Track key metrics:
    - Response time
    - Error rates
    - System throughput
    - Resource utilization
2. Set up alerts for availability issues
3. Monitor node health status

### Testing
1. Chaos engineering practices
2. Failover testing
3. Load testing
4. Network partition simulation

## Common Pitfalls 🚫

1. **Insufficient Monitoring**
    - Solution: Implement comprehensive monitoring
    - Set up proper alerting
    - Regular health checks

2. **Poor Timeout Configuration**
    - Solution: Configure appropriate timeouts
    - Implement circuit breakers
    - Use fallback mechanisms

3. **Inadequate Testing**
    - Solution: Regular failover testing
    - Chaos engineering practices
    - Performance testing under load

## Use Cases 🎯

### 1. Content Delivery Networks (CDN)
- Global content distribution
- Edge caching
- Fast content delivery
```typescript
Requirements:
- High availability
- Geographic distribution
- Fast response times
```

### 2. Social Media Feeds
- News feed delivery
- Status updates
- User interactions
```typescript
Requirements:
- Always available
- Eventually consistent
- Real-time updates
```

### 3. E-commerce Product Catalog
- Product browsing
- Price display
- Basic inventory status
```typescript
Requirements:
- 24/7 availability
- Read-heavy operations
- Cached data acceptance
```

## Deep Dive Topics 🔍

### Thread Safety
1. **Concurrency Control**
    - Lock mechanisms
    - Atomic operations
    - Thread synchronization

2. **State Management**
    - Immutable states
    - State replication
    - Version vectors

### Distributed Systems
1. **Node Management**
    - Health checking
    - Load balancing
    - Failover strategies

2. **Data Distribution**
    - Replication
    - Partitioning
    - Consistency levels

### Performance
1. **Response Time**
    - Caching strategies
    - Load balancing
    - Resource optimization

2. **Scalability**
    - Horizontal scaling
    - Vertical scaling
    - Auto-scaling policies

## Additional Resources 📚

### References
1. [Building Reliable Systems](https://www.oreilly.com/library/view/designing-distributed-systems/9781491983638/)
2. [High Availability System Design Patterns](https://www.amazon.com/Patterns-Enterprise-Application-Architecture-Martin/dp/0321127420)
3. [Distributed Systems for Practitioners](https://aws.amazon.com/architecture/well-architected/)

### Tools
1. [Kubernetes](https://kubernetes.io/)
2. [HAProxy](https://www.haproxy.org/)
3. [Prometheus](https://prometheus.io/)

## FAQs ❓

**Q: How does availability affect system design?**
A: Availability influences:
- Architecture choices
- Infrastructure requirements
- Operational complexity
- Cost considerations

**Q: What's the relationship between availability and scalability?**
A: They are related through:
- Resource management
- Load distribution
- Failure handling
- System capacity

**Q: How do you measure system availability?**
A: Key metrics include:
- Uptime percentage
- Response time
- Error rates
- Recovery time

**Q: What are the trade-offs when prioritizing availability?**
A: Common trade-offs include:
- Consistency vs availability
- Cost vs redundancy
- Complexity vs reliability

