const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Software Architecture',
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
        }
      ]
    }
    // {
    //   type: 'category',
    //   label: 'Java',
    //   items: [
    //     {
    //       type: 'category',
    //       label: 'Basics',
    //       collapsed: true,
    //       items: [
    //         'java/basics/intro',
    //         'java/basics/key-concepts',
    //         'java/basics/java-8-features',
    //         'java/basics/api-collections',
    //         'java/basics/exceptions',
    //
    //       ],
    //     },
    //     {
    //       type: 'category',
    //       label: 'OOP',
    //       collapsed: true,
    //       items: [
    //         'java/oop/intro',
    //         'java/oop/encapsulation',
    //         'java/oop/inheritance',
    //         'java/oop/polymorphism',
    //         'java/oop/abstraction',
    //       ],
    //     },
    //     {
    //       type: 'category',
    //       label: 'Functional Programming',
    //       collapsed: true,
    //       items: [
    //         'java/functional/intro',
    //         'java/functional/streams',
    //         'java/functional/lambdas',
    //         'java/functional/optional',
    //       ],
    //     },
    //     {
    //       type: 'category',
    //       label: 'Advanced Features',
    //       collapsed: true,
    //       items: [
    //         'java/advanced/intro',
    //         'java/advanced/java-11-17-features',
    //         'java/advanced/performance',
    //         'java/advanced/memory-management',
    //         'java/advanced/concurrency',
    //       ],
    //     },
    //
    //     {
    //       type: 'category',
    //       label: 'Frameworks',
    //       items: [
    //         {
    //           type: 'category',
    //           label: 'Spring',
    //           items: [
    //             {
    //               type: 'category',
    //               label: 'Core',
    //               items: [
    //                 'java/frameworks/spring/core/intro',
    //               ],
    //             },
    //           ],
    //         },
    //       ]
    //     }
    //
    //   ],
    // }

  ],
};

module.exports = sidebars;
