const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Module 1: Architecture Fundamentals',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-1-architecture-fundamentals/README',
      },
      items: [
        {
          type: 'category',
          label: '1.1 Design Principles',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'module-1-architecture-fundamentals/1.1-design-principles/README',
          },
          items: [
            'module-1-architecture-fundamentals/1.1-design-principles/overview',
            'module-1-architecture-fundamentals/1.1-design-principles/solid-principles',
            'module-1-architecture-fundamentals/1.1-design-principles/dry-kiss-yagni',
            'module-1-architecture-fundamentals/1.1-design-principles/conways-law',
            'module-1-architecture-fundamentals/1.1-design-principles/separation-of-concerns',
            'module-1-architecture-fundamentals/1.1-design-principles/principle-of-least-surprise',
          ],
        },
        {
          type: 'category',
          label: '1.2 Architectural Patterns',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'module-1-architecture-fundamentals/1.2-architectural-patterns/README',
          },
          items: [
            'module-1-architecture-fundamentals/1.2-architectural-patterns/overview',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/monolith-vs-microservices',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/event-driven-architecture',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/cqrs',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/event-sourcing',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/saga-pattern',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/strangler-fig',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/sidecar-pattern',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/api-gateway',
            'module-1-architecture-fundamentals/1.2-architectural-patterns/bff-pattern',
          ],
        },
        {
          type: 'category',
          label: '1.3 Domain-Driven Design',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'module-1-architecture-fundamentals/1.3-domain-driven-design/README',
          },
          items: [
            'module-1-architecture-fundamentals/1.3-domain-driven-design/overview',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/bounded-contexts',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/ubiquitous-language',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/aggregates-entities-value-objects',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/domain-events',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/anti-corruption-layer',
            'module-1-architecture-fundamentals/1.3-domain-driven-design/context-mapping',
          ],
        },
        {
          type: 'category',
          label: '1.4 Clean & Hexagonal Architecture',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/README',
          },
          items: [
            'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/overview',
            'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/dependency-inversion',
            'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/ports-and-adapters',
            'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/layered-architecture',
            'module-1-architecture-fundamentals/1.4-clean-hexagonal-architecture/comparison',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Distributed Systems',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-2-distributed-systems/README',
      },
      items: [
        {
          type: 'doc',
          label: '2.1 Fundamental Concepts',
          id: 'module-2-distributed-systems/2.1-fundamental-concepts/README',
        },
        {
          type: 'doc',
          label: '2.2 Communication Patterns',
          id: 'module-2-distributed-systems/2.2-communication-patterns/README',
        },
        {
          type: 'doc',
          label: '2.3 Consistency & Consensus',
          id: 'module-2-distributed-systems/2.3-consistency-consensus/README',
        },
        {
          type: 'doc',
          label: '2.4 Data Management',
          id: 'module-2-distributed-systems/2.4-data-management/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Scalability & Performance',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-3-scalability-performance/README',
      },
      items: [
        {
          type: 'doc',
          label: '3.1 Scalability Principles',
          id: 'module-3-scalability-performance/3.1-scalability-principles/README',
        },
        {
          type: 'doc',
          label: '3.2 Caching Strategies',
          id: 'module-3-scalability-performance/3.2-caching-strategies/README',
        },
        {
          type: 'doc',
          label: '3.3 Database Optimization',
          id: 'module-3-scalability-performance/3.3-database-optimization/README',
        },
        {
          type: 'doc',
          label: '3.4 Performance Engineering',
          id: 'module-3-scalability-performance/3.4-performance-engineering/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Observability & Operations',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-4-observability-operations/README',
      },
      items: [
        {
          type: 'doc',
          label: '4.1 Three Pillars',
          id: 'module-4-observability-operations/4.1-three-pillars/README',
        },
        {
          type: 'doc',
          label: '4.2 Alerting & On-Call',
          id: 'module-4-observability-operations/4.2-alerting-oncall/README',
        },
        {
          type: 'doc',
          label: '4.3 Reliability Engineering',
          id: 'module-4-observability-operations/4.3-reliability-engineering/README',
        },
        {
          type: 'doc',
          label: '4.4 Incident Management',
          id: 'module-4-observability-operations/4.4-incident-management/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 5: Security',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-5-security/README',
      },
      items: [
        {
          type: 'doc',
          label: '5.1 Security by Design',
          id: 'module-5-security/5.1-security-by-design/README',
        },
        {
          type: 'doc',
          label: '5.2 Authentication & Authorization',
          id: 'module-5-security/5.2-authentication-authorization/README',
        },
        {
          type: 'doc',
          label: '5.3 Data Security',
          id: 'module-5-security/5.3-data-security/README',
        },
        {
          type: 'doc',
          label: '5.4 Application Security',
          id: 'module-5-security/5.4-application-security/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 6: Cloud Architecture',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-6-cloud-architecture/README',
      },
      items: [
        {
          type: 'doc',
          label: '6.1 Multi-Cloud & Hybrid',
          id: 'module-6-cloud-architecture/6.1-multi-cloud/README',
        },
        {
          type: 'doc',
          label: '6.2 Serverless',
          id: 'module-6-cloud-architecture/6.2-serverless/README',
        },
        {
          type: 'doc',
          label: '6.3 Container Orchestration',
          id: 'module-6-cloud-architecture/6.3-container-orchestration/README',
        },
        {
          type: 'doc',
          label: '6.4 Infrastructure as Code',
          id: 'module-6-cloud-architecture/6.4-infrastructure-as-code/README',
        },
        {
          type: 'doc',
          label: '6.5 Cost Optimization',
          id: 'module-6-cloud-architecture/6.5-cost-optimization/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 7: Technical Leadership',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-7-leadership/README',
      },
      items: [
        {
          type: 'doc',
          label: '7.1 Technical Leadership',
          id: 'module-7-leadership/7.1-technical-leadership/README',
        },
        {
          type: 'doc',
          label: '7.2 Communication & Influence',
          id: 'module-7-leadership/7.2-communication-influence/README',
        },
        {
          type: 'doc',
          label: '7.3 Mentorship & Development',
          id: 'module-7-leadership/7.3-mentorship-development/README',
        },
        {
          type: 'doc',
          label: '7.4 Product Thinking',
          id: 'module-7-leadership/7.4-product-thinking/README',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 8: Advanced Topics',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'module-8-advanced-topics/README',
      },
      items: [
        {
          type: 'doc',
          label: '8.1 Data Engineering',
          id: 'module-8-advanced-topics/8.1-data-engineering/README',
        },
        {
          type: 'doc',
          label: '8.2 ML Operations',
          id: 'module-8-advanced-topics/8.2-ml-operations/README',
        },
        {
          type: 'doc',
          label: '8.3 Frontend Architecture',
          id: 'module-8-advanced-topics/8.3-frontend-architecture/README',
        },
        {
          type: 'doc',
          label: '8.4 Emerging Technologies',
          id: 'module-8-advanced-topics/8.4-emerging-technologies/README',
        },
      ],
    },
  ],
};

module.exports = sidebars;
