const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Design Principles',
      items: [
        {
          type: 'category',
          label: 'SOLID',
          collapsed: true,
          items: [
            'principles/solid/introduction',
            'principles/solid/single-responsibility',
            'principles/solid/open-closed',
            'principles/solid/liskov-substitution',
            'principles/solid/interface-segregation',
            'principles/solid/dependency-inversion',
          ],
        },
        {
          type: 'category',
          label: 'DRY',
          items: [
            'principles/dry/intro',
            'principles/dry/implementation',
          ],
        },
        {
          type: 'category',
          label: 'Clean Code',
          collapsed: true,
          items: [
            'principles/clean-code/intro',
            'principles/clean-code/naming-conventions',
            'principles/clean-code/functions',
            'principles/clean-code/comments',
            'principles/clean-code/error-handling',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Java',
      items: [
        {
          type: 'category',
          label: 'Basics',
          collapsed: true,
          items: [
            'java/basics/intro',
            'java/basics/key-concepts',
            'java/basics/java-8-features',
            'java/basics/api-collections',
            'java/basics/exceptions',

          ],
        },
        {
          type: 'category',
          label: 'OOP',
          collapsed: true,
          items: [
            'java/oop/intro',
            'java/oop/encapsulation',
            'java/oop/inheritance',
            'java/oop/polymorphism',
            'java/oop/abstraction',
          ],
        },
        {
          type: 'category',
          label: 'Functional Programming',
          collapsed: true,
          items: [
            'java/functional/intro',
            'java/functional/streams',
            'java/functional/lambdas',
            'java/functional/optional',
          ],
        },
        {
          type: 'category',
          label: 'Advanced Features',
          collapsed: true,
          items: [
            'java/advanced/intro',
            'java/advanced/java-11-17-features',
            'java/advanced/performance',
            'java/advanced/memory-management',
            'java/advanced/concurrency',
          ],
        },

        {
          type: 'category',
          label: 'Frameworks',
          items: [
            {
              type: 'category',
              label: 'Spring',
              items: [
                {
                  type: 'category',
                  label: 'Core',
                  items: [
                    'java/frameworks/spring/core/intro',
                  ],
                },
              ],
            },
          ]
        }

      ],
    }
  ],
};

module.exports = sidebars;
