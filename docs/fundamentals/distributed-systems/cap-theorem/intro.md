---
sidebar_position: 1
title: "Introduction"
description: "CAP - Intro"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔄 CAP Theorem: Introduction

## Overview

The CAP Theorem states that a distributed system can only provide two out of three guarantees simultaneously: Consistency, Availability, and Partition Tolerance. This fundamental theorem helps system architects make trade-offs in distributed system design.

### Real-World Analogy
Think of a bank with multiple branches. When you deposit money:
- **Consistency**: All branches should show the same balance immediately
- **Availability**: You can access your account at any branch at any time
- **Partition Tolerance**: The system works even if branches can't communicate

Just as a bank must choose between immediate consistency across all branches or constant availability during network issues, distributed systems face similar trade-offs.

## 🔑 Key Concepts

### Core Components
1. **Consistency (C)**
    - All nodes see the same data at the same time
    - Reads get most recent write
    - Strong consistency guarantee

2. **Availability (A)**
    - Every request receives a response
    - System remains operational
    - No guarantee of data freshness

3. **Partition Tolerance (P)**
    - System continues to operate despite network partitions
    - Messages between nodes can be lost
    - Essential for distributed systems

### System Types
1. **CP Systems (Consistency + Partition Tolerance)**
    - Sacrifice availability for consistency
    - Example: Banking systems

2. **AP Systems (Availability + Partition Tolerance)**
    - Sacrifice consistency for availability
    - Example: Content delivery networks

3. **CA Systems (Consistency + Availability)**
    - Cannot exist in distributed systems
    - Only possible in single-node systems

## 💻 Implementation

### CAP Theorem Demonstration

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    import java.util.concurrent.*;
    import java.util.Map;
    import java.util.HashMap;
    import java.util.Optional;

    public class DistributedSystem {
        public enum ConsistencyModel {
            STRONG,    // CP - Consistent + Partition Tolerant
            EVENTUAL  // AP - Available + Partition Tolerant
        }

        private final Map<String, String> data;
        private final ConsistencyModel consistencyModel;
        private final ConcurrentMap<String, CompletableFuture<String>> pendingWrites;
        private volatile boolean isNetworkPartitioned;

        public DistributedSystem(ConsistencyModel consistencyModel) {
            this.data = new ConcurrentHashMap<>();
            this.consistencyModel = consistencyModel;
            this.pendingWrites = new ConcurrentHashMap<>();
            this.isNetworkPartitioned = false;
        }

        public Optional<String> read(String key) {
            if (consistencyModel == ConsistencyModel.STRONG && isNetworkPartitioned) {
                // CP system during partition - refuse reads
                return Optional.empty();
            }

            // AP system or CP system without partition
            return Optional.ofNullable(data.get(key));
        }

        public boolean write(String key, String value) {
            if (consistencyModel == ConsistencyModel.STRONG && isNetworkPartitioned) {
                // CP system during partition - refuse writes
                return false;
            }

            CompletableFuture<String> writeFuture = new CompletableFuture<>();
            pendingWrites.put(key, writeFuture);

            try {
                // Simulate distributed write
                if (!isNetworkPartitioned) {
                    data.put(key, value);
                    writeFuture.complete(value);
                    return true;
                } else if (consistencyModel == ConsistencyModel.EVENTUAL) {
                    // AP system - accept write during partition
                    data.put(key, value);
                    writeFuture.complete(value);
                    return true;
                }
                return false;
            } finally {
                pendingWrites.remove(key);
            }
        }

        public void simulateNetworkPartition(boolean partitioned) {
            this.isNetworkPartitioned = partitioned;
        }

        // Monitor system state
        public SystemState getSystemState() {
            return new SystemState(
                consistencyModel,
                isNetworkPartitioned,
                data.size(),
                pendingWrites.size()
            );
        }

        public record SystemState(
            ConsistencyModel consistencyModel,
            boolean isPartitioned,
            int dataSize,
            int pendingWrites
        ) {}
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    package cap

    import (
        "context"
        "errors"
        "sync"
        "time"
    )

    type ConsistencyModel int

    const (
        Strong ConsistencyModel = iota  // CP - Consistent + Partition Tolerant
        Eventual               // AP - Available + Partition Tolerant
    )

    type DistributedSystem struct {
        data               map[string]string
        consistencyModel   ConsistencyModel
        isPartitioned     bool
        mutex             sync.RWMutex
        pendingWrites     map[string]chan struct{}
    }

    type SystemState struct {
        ConsistencyModel ConsistencyModel
        IsPartitioned   bool
        DataSize       int
        PendingWrites  int
    }

    func NewDistributedSystem(model ConsistencyModel) *DistributedSystem {
        return &DistributedSystem{
            data:             make(map[string]string),
            consistencyModel: model,
            pendingWrites:    make(map[string]chan struct{}),
        }
    }

    func (ds *DistributedSystem) Read(ctx context.Context, key string) (string, error) {
        ds.mutex.RLock()
        defer ds.mutex.RUnlock()

        if ds.consistencyModel == Strong && ds.isPartitioned {
            return "", errors.New("system unavailable due to network partition")
        }

        value, exists := ds.data[key]
        if !exists {
            return "", errors.New("key not found")
        }

        return value, nil
    }

    func (ds *DistributedSystem) Write(ctx context.Context, key, value string) error {
        ds.mutex.Lock()
        defer ds.mutex.Unlock()

        if ds.consistencyModel == Strong && ds.isPartitioned {
            return errors.New("system unavailable due to network partition")
        }

        done := make(chan struct{})
        ds.pendingWrites[key] = done

        defer delete(ds.pendingWrites, key)

        // Simulate distributed write
        if !ds.isPartitioned {
            ds.data[key] = value
            close(done)
            return nil
        } else if ds.consistencyModel == Eventual {
            // AP system - accept write during partition
            ds.data[key] = value
            close(done)
            return nil
        }

        return errors.New("write failed due to network partition")
    }

    func (ds *DistributedSystem) SimulateNetworkPartition(partitioned bool) {
        ds.mutex.Lock()
        defer ds.mutex.Unlock()
        ds.isPartitioned = partitioned
    }

    func (ds *DistributedSystem) GetSystemState() SystemState {
        ds.mutex.RLock()
        defer ds.mutex.RUnlock()

        return SystemState{
            ConsistencyModel: ds.consistencyModel,
            IsPartitioned:   ds.isPartitioned,
            DataSize:       len(ds.data),
            PendingWrites:  len(ds.pendingWrites),
        }
    }

    // Example usage of eventual consistency
    func (ds *DistributedSystem) WriteEventually(key, value string) error {
        if ds.consistencyModel != Eventual {
            return errors.New("system not configured for eventual consistency")
        }

        go func() {
            for {
                ds.mutex.Lock()
                if !ds.isPartitioned {
                    ds.data[key] = value
                    ds.mutex.Unlock()
                    return
                }
                ds.mutex.Unlock()
                time.Sleep(time.Second)
            }
        }()

        return nil
    }
    ```
  </TabItem>
</Tabs>

## 🤝 Related Concepts

1. **PACELC Theorem**
    - Extends CAP for normal operations
    - Considers latency vs. consistency trade-offs

2. **BASE Properties**
    - Alternative to ACID for distributed systems
    - Focuses on availability over consistency

3. **Eventual Consistency**
    - Relaxed consistency model
    - Common in distributed databases

## 🎯 Best Practices

### System Design
- Choose consistency model based on requirements
- Plan for network partitions
- Implement proper monitoring
- Design for failure recovery

### Monitoring
- Track consistency violations
- Monitor network partitions
- Measure replication lag
- Alert on system degradation

### Testing
- Simulate network partitions
- Test consistency guarantees
- Verify recovery procedures
- Measure performance impact

## ⚠️ Common Pitfalls

1. **Ignoring Partition Tolerance**
    - *Problem*: Assuming reliable networks
    - *Solution*: Always design for partitions

2. **Wrong Consistency Choice**
    - *Problem*: Over-emphasizing consistency
    - *Solution*: Match business requirements

3. **Inadequate Monitoring**
    - *Problem*: Missing consistency violations
    - *Solution*: Implement comprehensive monitoring

## 🎉 Use Cases

### 1. Banking System (CP)
- Requires strong consistency
- Handles temporary unavailability
- Prioritizes correct balances

### 2. Social Media Feed (AP)
- Favors availability
- Accepts eventual consistency
- Tolerates temporary inconsistencies

### 3. E-commerce Inventory (CP/AP Hybrid)
- Strong consistency for orders
- Eventual consistency for views
- Balance between accuracy and availability

## 🔍 Deep Dive Topics

### Consistency Models
- Strong consistency
- Sequential consistency
- Causal consistency
- Eventual consistency

### Partition Handling
- Detection mechanisms
- Recovery procedures
- Data reconciliation

### Performance Considerations
- Replication strategies
- Conflict resolution
- Latency management

## 📚 Additional Resources

### References
1. "Designing Data-Intensive Applications" by Martin Kleppmann
2. "Distributed Systems" by Maarten van Steen
3. "NoSQL Distilled" by Pramod Sadalage

### Tools
- Jepsen for distributed systems testing
- Chaos Monkey for resilience testing
- Prometheus for monitoring

## ❓ FAQs

**Q: Can I have both strong consistency and high availability?**
A: Not during network partitions. You must choose one during partition events.

**Q: Which is better: CP or AP?**
A: It depends on your use case. Financial systems often choose CP, while content delivery systems choose AP.

**Q: How do I choose between consistency models?**
A: Consider your business requirements, user expectations, and failure costs.

**Q: What about CA systems?**
A: True CA systems cannot exist in distributed environments since partitions are inevitable.

**Q: How do I handle network partitions?**
A: Design for them explicitly, implement proper detection and recovery procedures.