---
sidebar_position: 4
title: "Partitioning"
description: "Partitioning - Distributed Systems"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔀 Partitioning in Distributed Systems

## Overview

Partitioning (or sharding) is a technique for dividing large datasets across multiple machines to improve scalability and performance. Think of it like a large library dividing its books across different floors or buildings based on categories or alphabetical order - each section can be accessed independently, but together they form the complete collection.

### Real-World Analogy
Consider a postal service:
- Mail is sorted by zip codes (partition key)
- Each distribution center handles specific regions
- Local offices process their assigned areas
- The system scales by adding new distribution centers

## 🔑 Key Concepts

### Partitioning Strategies

1. **Range Partitioning**
    - Data divided by key ranges
    - Easy to implement
    - Risk of hot spots

2. **Hash Partitioning**
    - Data distributed using hash function
    - Even distribution
    - Loses range queries

3. **Consistent Hashing**
    - Dynamic partitioning
    - Minimal redistribution
    - Complex implementation

### Components

1. **Partition Key**
    - Determines data location
    - Primary partitioning field
    - Distribution criteria

2. **Partition Map**
    - Tracks data location
    - Routing information
    - Partition assignments

3. **Rebalancing Mechanism**
    - Handles node additions/removals
    - Redistributes data
    - Maintains balance

## 💻 Implementation

Let's implement a partitioned data store using different strategies.

### Hash-Based Partitioning

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // HashPartitioner.java
    public class HashPartitioner<K, V> {
        private final int numPartitions;
        private final List<PartitionNode<K, V>> nodes;
        private final ConsistentHash<PartitionNode<K, V>> consistentHash;

        public HashPartitioner(int numPartitions) {
            this.numPartitions = numPartitions;
            this.nodes = new ArrayList<>();
            this.consistentHash = new ConsistentHash<>(100, nodes);
        }

        public void put(K key, V value) {
            PartitionNode<K, V> node = consistentHash.getNode(key);
            node.put(key, value);
        }

        public V get(K key) {
            PartitionNode<K, V> node = consistentHash.getNode(key);
            return node.get(key);
        }

        public void addNode(PartitionNode<K, V> node) {
            nodes.add(node);
            consistentHash.addNode(node);
            rebalance();
        }

        public void removeNode(PartitionNode<K, V> node) {
            nodes.remove(node);
            consistentHash.removeNode(node);
            rebalance();
        }

        private void rebalance() {
            // Implement rebalancing logic
        }
    }

    class ConsistentHash<T> {
        private final int numberOfReplicas;
        private final SortedMap<Integer, T> circle = new TreeMap<>();

        public ConsistentHash(int numberOfReplicas, Collection<T> nodes) {
            this.numberOfReplicas = numberOfReplicas;
            for (T node : nodes) {
                addNode(node);
            }
        }

        public void addNode(T node) {
            for (int i = 0; i < numberOfReplicas; i++) {
                circle.put(hash(node.toString() + i), node);
            }
        }

        public void removeNode(T node) {
            for (int i = 0; i < numberOfReplicas; i++) {
                circle.remove(hash(node.toString() + i));
            }
        }

        public T getNode(Object key) {
            if (circle.isEmpty()) {
                return null;
            }
            int hash = hash(key);
            if (!circle.containsKey(hash)) {
                SortedMap<Integer, T> tailMap = circle.tailMap(hash);
                hash = tailMap.isEmpty() ? circle.firstKey() : tailMap.firstKey();
            }
            return circle.get(hash);
        }

        private int hash(Object key) {
            return key.hashCode() & 0x7FFFFFFF;
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    // hash_partitioner.go
    package partitioning

    import (
        "hash/fnv"
        "sort"
        "sync"
    )

    type HashPartitioner struct {
        numPartitions int
        nodes        []PartitionNode
        circle       *ConsistentHash
        mu           sync.RWMutex
    }

    type PartitionNode interface {
        Put(key string, value interface{}) error
        Get(key string) (interface{}, error)
        ID() string
    }

    func NewHashPartitioner(numPartitions int) *HashPartitioner {
        hp := &HashPartitioner{
            numPartitions: numPartitions,
            nodes:        make([]PartitionNode, 0),
        }
        hp.circle = NewConsistentHash(100)
        return hp
    }

    func (hp *HashPartitioner) Put(key string, value interface{}) error {
        hp.mu.RLock()
        defer hp.mu.RUnlock()

        node := hp.circle.GetNode(key)
        if node == nil {
            return errors.New("no available nodes")
        }
        return node.Put(key, value)
    }

    func (hp *HashPartitioner) Get(key string) (interface{}, error) {
        hp.mu.RLock()
        defer hp.mu.RUnlock()

        node := hp.circle.GetNode(key)
        if node == nil {
            return nil, errors.New("no available nodes")
        }
        return node.Get(key)
    }

    func (hp *HashPartitioner) AddNode(node PartitionNode) {
        hp.mu.Lock()
        defer hp.mu.Unlock()

        hp.nodes = append(hp.nodes, node)
        hp.circle.AddNode(node)
        hp.rebalance()
    }

    type ConsistentHash struct {
        replicas int
        circle   map[uint32]PartitionNode
        sorted   []uint32
        mu       sync.RWMutex
    }

    func NewConsistentHash(replicas int) *ConsistentHash {
        return &ConsistentHash{
            replicas: replicas,
            circle:   make(map[uint32]PartitionNode),
            sorted:   make([]uint32, 0),
        }
    }

    func (ch *ConsistentHash) AddNode(node PartitionNode) {
        ch.mu.Lock()
        defer ch.mu.Unlock()

        for i := 0; i < ch.replicas; i++ {
            hash := ch.hash(fmt.Sprintf("%s-%d", node.ID(), i))
            ch.circle[hash] = node
            ch.sorted = append(ch.sorted, hash)
        }
        sort.Slice(ch.sorted, func(i, j int) bool {
            return ch.sorted[i] < ch.sorted[j]
        })
    }

    func (ch *ConsistentHash) GetNode(key string) PartitionNode {
        ch.mu.RLock()
        defer ch.mu.RUnlock()

        if len(ch.sorted) == 0 {
            return nil
        }

        hash := ch.hash(key)
        idx := sort.Search(len(ch.sorted), func(i int) bool {
            return ch.sorted[i] >= hash
        })

        if idx == len(ch.sorted) {
            idx = 0
        }

        return ch.circle[ch.sorted[idx]]
    }

    func (ch *ConsistentHash) hash(key string) uint32 {
        h := fnv.New32a()
        h.Write([]byte(key))
        return h.Sum32()
    }
    ```
  </TabItem>
</Tabs>

### Range Partitioning

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    public class RangePartitioner<K extends Comparable<K>, V> {
        private final TreeMap<K, PartitionNode<K, V>> partitionMap;

        public RangePartitioner() {
            this.partitionMap = new TreeMap<>();
        }

        public void addPartition(K startKey, PartitionNode<K, V> node) {
            partitionMap.put(startKey, node);
        }

        public void put(K key, V value) {
            Map.Entry<K, PartitionNode<K, V>> entry = partitionMap.floorEntry(key);
            if (entry == null) {
                throw new IllegalStateException("No partition found for key");
            }
            entry.getValue().put(key, value);
        }

        public V get(K key) {
            Map.Entry<K, PartitionNode<K, V>> entry = partitionMap.floorEntry(key);
            if (entry == null) {
                return null;
            }
            return entry.getValue().get(key);
        }
    }
    ```
  </TabItem>
  <TabItem value="go" label="Go">
    ```go
    type RangePartitioner struct {
        partitionMap *treemap.Map
        mu          sync.RWMutex
    }

    func NewRangePartitioner() *RangePartitioner {
        return &RangePartitioner{
            partitionMap: treemap.NewWithStringComparator(),
        }
    }

    func (rp *RangePartitioner) AddPartition(startKey string, node PartitionNode) {
        rp.mu.Lock()
        defer rp.mu.Unlock()
        rp.partitionMap.Put(startKey, node)
    }

    func (rp *RangePartitioner) Put(key string, value interface{}) error {
        rp.mu.RLock()
        defer rp.mu.RUnlock()

        _, node := rp.partitionMap.Floor(key)
        if node == nil {
            return errors.New("no partition found for key")
        }
        return node.(PartitionNode).Put(key, value)
    }

    func (rp *RangePartitioner) Get(key string) (interface{}, error) {
        rp.mu.RLock()
        defer rp.mu.RUnlock()

        _, node := rp.partitionMap.Floor(key)
        if node == nil {
            return nil, errors.New("no partition found for key")
        }
        return node.(PartitionNode).Get(key)
    }
    ```
  </TabItem>
</Tabs>

## 🔄 Related Patterns

### 1. Replication
- Combines with partitioning
- Improves availability
- Handles partition failures

### 2. Load Balancing
- Distributes requests
- Handles hot partitions
- Improves performance

### 3. Consistent Hashing
- Minimizes rebalancing
- Handles node changes
- Even distribution

## ✅ Best Practices

### Configuration
1. Choose appropriate partition key
2. Set proper partition size
3. Configure rebalancing thresholds
4. Monitor partition growth

### Monitoring
1. Track partition sizes
2. Monitor request distribution
3. Watch for hot partitions
4. Alert on imbalances

### Testing
1. Test rebalancing
2. Verify data distribution
3. Simulate node failures
4. Measure partition performance

## ⚠️ Common Pitfalls

1. **Hot Partitions**
    - Solution: Use compound partition keys
    - Implement caching
    - Consider partition splitting

2. **Data Skew**
    - Solution: Choose better partition keys
    - Implement secondary indexes
    - Use compound partitioning

3. **Rebalancing Issues**
    - Solution: Use consistent hashing
    - Implement gradual rebalancing
    - Monitor partition sizes

4. **Complex Queries**
    - Solution: Use secondary indexes
    - Implement scatter-gather
    - Consider denormalization

## 🎯 Use Cases

### 1. Time-Series Data
- Partition by time ranges
- Rolling windows
- Historical data archival
- Real-time analytics

### 2. User Data
- Partition by user ID
- Geographic distribution
- Access patterns
- Data locality

### 3. Large-Scale Analytics
- Partition by data dimensions
- Parallel processing
- Query optimization
- Aggregation strategies

## 🔍 Deep Dive Topics

### Thread Safety

```java
public class ThreadSafePartitioning {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    
    public void partitionOperation() {
        lock.writeLock().lock();
        try {
            // Partition operation
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

### Performance Optimization

```java
public class OptimizedPartitioning {
    private final LoadBalancer loadBalancer;
    
    public void routeRequest(Request request) {
        Partition partition = loadBalancer.selectPartition(request);
        partition.process(request);
    }
}
```

### Dynamic Rebalancing

```java
public class RebalancingStrategy {
    public void rebalance(List<Partition> partitions) {
        Map<Partition, Integer> loads = analyzeLoads(partitions);
        redistributeData(loads);
    }
}
```

## 📚 Additional Resources

### Books
1. "Designing Data-Intensive Applications" by Martin Kleppmann
2. "Database Internals" by Alex Petrov
3. "Distributed Systems" by Maarten van Steen

### Tools
1. Apache Cassandra (Partitioning Implementation)
2. MongoDB (Sharding)
3. ElasticSearch (Sharding)
4. Redis Cluster

### Online Resources
1. "Understanding Database Sharding"
2. "Partitioning in Distributed Systems"
3. "Data Partitioning Strategies"

## ❓ FAQs

**Q: How do I choose a partition key?**  
A: Choose based on your access patterns, ensuring even distribution and minimizing cross-partition queries.

**Q: How many partitions should I have?**  
A: Start with 2-3 times the number of nodes you expect to have, allowing for growth.

**Q: How do I handle partition failures?**  
A: Implement replication across partitions and have proper failover mechanisms.

**Q: What's the impact on queries?**  
A: Cross-partition queries can be slower. Design your partitioning scheme to minimize them.

**Q: How do I handle growing data?**  
A: Use dynamic partitioning and implement proper rebalancing strategies.