const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Fundamentals',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Software Architecture',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Design Patterns',
              collapsed: true,
              items: [
                {
                  type: 'category',
                  label: 'Creational',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/design-patterns/creational/factory',
                    'fundamentals/software-architecture/design-patterns/creational/abstract-factory',
                    'fundamentals/software-architecture/design-patterns/creational/builder',
                    'fundamentals/software-architecture/design-patterns/creational/prototype',
                    'fundamentals/software-architecture/design-patterns/creational/singleton',
                  ],
                },
                {
                  type: 'category',
                  label: 'Structural',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/design-patterns/structural/adapter',
                    'fundamentals/software-architecture/design-patterns/structural/bridge',
                    'fundamentals/software-architecture/design-patterns/structural/composite',
                    'fundamentals/software-architecture/design-patterns/structural/decorator',
                    'fundamentals/software-architecture/design-patterns/structural/facade',
                    'fundamentals/software-architecture/design-patterns/structural/proxy',
                  ],
                },
                {
                  type: 'category',
                  label: 'Behavioral',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/design-patterns/behavioral/observer',
                    'fundamentals/software-architecture/design-patterns/behavioral/strategy',
                    'fundamentals/software-architecture/design-patterns/behavioral/command',
                    'fundamentals/software-architecture/design-patterns/behavioral/state',
                    'fundamentals/software-architecture/design-patterns/behavioral/template_method',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'SOLID',
              collapsed: true,
              items: [
                'fundamentals/software-architecture/solid/introduction',
                'fundamentals/software-architecture/solid/single-responsibility',
                'fundamentals/software-architecture/solid/open-closed',
                'fundamentals/software-architecture/solid/liskov-substitution',
                'fundamentals/software-architecture/solid/interface-segregation',
                'fundamentals/software-architecture/solid/dependency-inversion',
              ],
            },
            {
              type: 'category',
              label: 'DRY',
              collapsed: true,
              items: [
                'fundamentals/software-architecture/dry/dry',
              ],
            },
            {
              type: 'category',
              label: 'Clean Code',
              collapsed: true,
              items: [
                'fundamentals/software-architecture/clean-code/intro',
                'fundamentals/software-architecture/clean-code/naming-conventions',
                'fundamentals/software-architecture/clean-code/functions',
                'fundamentals/software-architecture/clean-code/comments',
                'fundamentals/software-architecture/clean-code/error-handling',
              ],
            },

            {
              type: 'category',
              label: 'Clean Architecture',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction',
                  id: 'fundamentals/software-architecture/clean-architecture/intro'
                },
                {
                  type: 'category',
                  label: 'Layers',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/clean-architecture/layers/entities',
                    'fundamentals/software-architecture/clean-architecture/layers/use-cases',
                    'fundamentals/software-architecture/clean-architecture/layers/interfaces',
                    'fundamentals/software-architecture/clean-architecture/layers/frameworks',
                  ],
                },
                {
                  type: 'category',
                  label: 'Principles',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/clean-architecture/principles/principles',
                  ],
                },
                {
                  type: 'category',
                  label: 'Patterns',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/clean-architecture/patterns/repository-pattern',
                    'fundamentals/software-architecture/clean-architecture/patterns/presenter-pattern',
                    'fundamentals/software-architecture/clean-architecture/patterns/gateway-pattern',
                    'fundamentals/software-architecture/clean-architecture/patterns/factory-pattern',
                  ],
                },
                {
                  type: 'category',
                  label: 'Implementation',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/clean-architecture/implementation/project-structure',
                    'fundamentals/software-architecture/clean-architecture/implementation/testing-strategy',
                    'fundamentals/software-architecture/clean-architecture/implementation/dependency-management',
                    'fundamentals/software-architecture/clean-architecture/implementation/api-design',
                  ],
                },
                {
                  type: 'category',
                  label: 'Examples',
                  collapsed: true,
                  items: [
                    'fundamentals/software-architecture/clean-architecture/examples/web-application',
                    'fundamentals/software-architecture/clean-architecture/examples/microservices',
                    'fundamentals/software-architecture/clean-architecture/examples/monolithic-app',
                  ],
                },
              ],
            },
          ]
        },
        {
          type: 'category',
          label: 'Distributed Systems',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'fundamentals/distributed-systems/intro'
            },
            {
              type: 'category',
              label: 'Consistency & Availability',
              collapsed: true,
              items: [
                'fundamentals/distributed-systems/consistency-availability/eventual-consistency',
                'fundamentals/distributed-systems/consistency-availability/strong-consistency',
                'fundamentals/distributed-systems/consistency-availability/replication',
                'fundamentals/distributed-systems/consistency-availability/partitioning',
              ]
            },
            {
              type: 'category',
              label: 'Distributed Patterns',
              collapsed: true,
              items: [
                'fundamentals/distributed-systems/distributed-patterns/intro',
                'fundamentals/distributed-systems/distributed-patterns/circuit-breaker',
                'fundamentals/distributed-systems/distributed-patterns/bulkhead',
                'fundamentals/distributed-systems/distributed-patterns/retry',
                'fundamentals/distributed-systems/distributed-patterns/fallback',
                'fundamentals/distributed-systems/distributed-patterns/saga',
                'fundamentals/distributed-systems/distributed-patterns/api-gateway',
                'fundamentals/distributed-systems/distributed-patterns/cache-aside',
                'fundamentals/distributed-systems/distributed-patterns/cqrs',
                'fundamentals/distributed-systems/distributed-patterns/event-sourcing',
                'fundamentals/distributed-systems/distributed-patterns/idempotency',
                'fundamentals/distributed-systems/distributed-patterns/leader-election',
                'fundamentals/distributed-systems/distributed-patterns/message-queue',
                'fundamentals/distributed-systems/distributed-patterns/publisher-subscriber',
                'fundamentals/distributed-systems/distributed-patterns/rate-limiting',
                'fundamentals/distributed-systems/distributed-patterns/service-discovery',
                'fundamentals/distributed-systems/distributed-patterns/sharding',
              ]
            },
            {
              type: 'category',
              label: 'CAP Theorem',
              collapsed: true,
              items: [
                'fundamentals/distributed-systems/cap-theorem/intro',
                'fundamentals/distributed-systems/cap-theorem/consistency',
                'fundamentals/distributed-systems/cap-theorem/availability',
                'fundamentals/distributed-systems/cap-theorem/partition-tolerance',
              ]
            }
          ]
        },
        {
          type: 'category',
          label: 'Scalability',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Introduction',
              id: 'fundamentals/scalability/intro'
            },
            {
              type: 'category',
              label: 'Horizontal & Vertical',
              collapsed: true,
              items: [
                'fundamentals/scalability/horizontal-vertical/scaling-strategies',
                'fundamentals/scalability/horizontal-vertical/capacity-planning',
                'fundamentals/scalability/horizontal-vertical/performance-metrics'
              ]
            },
            {
              type: 'category',
              label: 'Caching Strategies',
              collapsed: true,
              items: [
                'fundamentals/scalability/caching-strategies/cache-aside',
                'fundamentals/scalability/caching-strategies/read-through',
                'fundamentals/scalability/caching-strategies/write-through',
                'fundamentals/scalability/caching-strategies/write-behind',
                'fundamentals/scalability/caching-strategies/cache-eviction',
              ]
            },
            {
              type: 'category',
              label: 'Load Balancing',
              collapsed: true,
              items: [
                'fundamentals/scalability/load-balancing/algorithms',
                'fundamentals/scalability/load-balancing/session-persistence',
                'fundamentals/scalability/load-balancing/health-checks',
              ]
            },
          ]
        },
        {
          type: 'category',
          label: 'Data Structures & Algorithms',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Data Structures',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction',
                  id: 'fundamentals/data-structures-algorithms/data-structures/intro'
                },
                {
                  type: 'category',
                  label: 'Lineal',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/data-structures/lineal/arrays',
                    'fundamentals/data-structures-algorithms/data-structures/lineal/linked-lists',
                    'fundamentals/data-structures-algorithms/data-structures/lineal/stacks',
                    'fundamentals/data-structures-algorithms/data-structures/lineal/queues',
                  ]
                },
                {
                  type: 'category',
                  label: 'Trees',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/data-structures/trees/binary-trees',
                    'fundamentals/data-structures-algorithms/data-structures/trees/balanced-trees',
                    'fundamentals/data-structures-algorithms/data-structures/trees/b-trees',
                    'fundamentals/data-structures-algorithms/data-structures/trees/red-black-trees',
                  ]
                },
                {
                  type: 'category',
                  label: 'Graphs',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/data-structures/graphs/directed',
                    'fundamentals/data-structures-algorithms/data-structures/graphs/undirected',
                    'fundamentals/data-structures-algorithms/data-structures/graphs/weighted',
                    'fundamentals/data-structures-algorithms/data-structures/graphs/algorithms',
                  ]
                },
                {
                  type: 'category',
                  label: 'Advanced',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/data-structures/advanced/hash-tables',
                    'fundamentals/data-structures-algorithms/data-structures/advanced/heaps',
                    'fundamentals/data-structures-algorithms/data-structures/advanced/tries',
                    'fundamentals/data-structures-algorithms/data-structures/advanced/bloom-filters',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Algorithms',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  label: 'Introduction',
                  id: 'fundamentals/data-structures-algorithms/algorithms/intro'
                },
                {
                  type: 'category',
                  label: 'Sorting',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/algorithms/sorting/comparison-based',
                    'fundamentals/data-structures-algorithms/algorithms/sorting/non-comparison-based',
                    'fundamentals/data-structures-algorithms/algorithms/sorting/specialized',
                  ]
                },
                {
                  type: 'category',
                  label: 'Searching',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/algorithms/searching/binary-search',
                    'fundamentals/data-structures-algorithms/algorithms/searching/tree-traversal',
                    'fundamentals/data-structures-algorithms/algorithms/searching/graph-search',
                  ]
                },
                {
                  type: 'category',
                  label: 'Dynamic Programming',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/algorithms/dynamic-programming/memoization',
                    'fundamentals/data-structures-algorithms/algorithms/dynamic-programming/tabulation',
                    'fundamentals/data-structures-algorithms/algorithms/dynamic-programming/common-patterns',
                  ]
                },
                {
                  type: 'category',
                  label: 'Optimization',
                  collapsed: true,
                  items: [
                    'fundamentals/data-structures-algorithms/algorithms/optimization/greedy',
                    'fundamentals/data-structures-algorithms/algorithms/optimization/backtracking',
                    'fundamentals/data-structures-algorithms/algorithms/optimization/branch-and-bound',
                  ]
                },
              ]
            },

            {
              type: 'category',
              label: 'Algorithm Patterns',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  label: 'Divide & Conquer',
                  id: 'fundamentals/data-structures-algorithms/algorithm-patterns/divide-and-conquer'
                },
                {
                  type: 'doc',
                  label: 'Sliding Window',
                  id: 'fundamentals/data-structures-algorithms/algorithm-patterns/sliding-window'
                },
                {
                  type: 'doc',
                  label: 'Two Pointers',
                  id: 'fundamentals/data-structures-algorithms/algorithm-patterns/two-pointers'
                },
              ]
            },
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Tech Expertise',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Java',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Core',
              collapsed: true,
              items: [
                {
                  type: 'category',
                  label: 'Basics',
                  collapsed: true,
                  items: [
                    {
                      type: 'category',
                      label: 'OOP',
                      collapsed: true,
                      items: [
                        'tech-expertise/java/core/oop/intro',
                        'tech-expertise/java/core/oop/encapsulation',
                        'tech-expertise/java/core/oop/inheritance',
                        'tech-expertise/java/core/oop/polymorphism',
                        'tech-expertise/java/core/oop/abstraction',
                      ]
                    },
                      'tech-expertise/java/core/basics/key-concepts',
                      'tech-expertise/java/core/basics/java-11-17-features',
                      'tech-expertise/java/core/basics/java-8-features',
                      'tech-expertise/java/core/basics/exceptions',
                  ]
                },
                {
                  type: 'category',
                  label: 'Collections',
                  collapsed: true,
                  items: [
                    'tech-expertise/java/core/collections/list-set-map',
                    'tech-expertise/java/core/collections/concurrent-collections',
                    'tech-expertise/java/core/collections/streams',
                  ]
                },
                {
                  type: 'category',
                  label: 'Concurrency',
                  collapsed: true,
                  items: [
                    'tech-expertise/java/core/concurrency/threads',
                    'tech-expertise/java/core/concurrency/executors',
                    'tech-expertise/java/core/concurrency/completable-future',
                    'tech-expertise/java/core/concurrency/synchronization',
                  ]
                },
                {
                  type: 'category',
                  label: 'Functional',
                  collapsed: true,
                  items: [
                    'tech-expertise/java/core/functional/intro',
                    'tech-expertise/java/core/functional/lambdas',
                    'tech-expertise/java/core/functional/optional',
                    'tech-expertise/java/core/functional/streams',
                  ]
                },
                {
                  type: 'category',
                  label: 'Memory & GC',
                  collapsed: true,
                  items: [
                    'tech-expertise/java/core/memory-gc/heap-stack',
                    'tech-expertise/java/core/memory-gc/garbage-collector',
                    'tech-expertise/java/core/memory-gc/memory-leaks',
                    'tech-expertise/java/core/memory-gc/tuning',
                  ]
                },
              ]
            }
          ]
        },
        {
          type: 'category',
          label: 'Architecture',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Principles & Patterns',
              collapsed: true,
              items: [
                'tech-expertise/architecture/principles-patterns/architectural-principles',
                'tech-expertise/architecture/principles-patterns/enterprise-patterns',
                'tech-expertise/architecture/principles-patterns/anti-patterns',

              ]
            },
            {
              type: 'category',
              label: 'Microservices Distributed',
              collapsed: true,
              items: [
                'tech-expertise/architecture/microservices-distributed/microservices-fundamentals',
                'tech-expertise/architecture/microservices-distributed/service-boundaries',
                'tech-expertise/architecture/microservices-distributed/data-management',
                'tech-expertise/architecture/microservices-distributed/service-discovery',
                'tech-expertise/architecture/microservices-distributed/resilience-patterns',
              ]
            }
          ]

        }
      ]
    },
    {
      type: 'category',
      label: 'Interview Questions',
      collapsed: true,
      items: [
          'interviews/technical-backend-analyst'
      ]
    }
  ],
};

module.exports = sidebars;
