import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
        // {
        //   type: 'category',
        //   label: 'Clean Code',
        //   items: [
        //     'principles/clean-code/intro',
        //     'principles/clean-code/naming-conventions',
        //     'principles/clean-code/functions',
        //     'principles/clean-code/comments',
        //     'principles/clean-code/error-handling',
        //   ],
        // },
      ],
    },
  ],
};

module.exports = sidebars;
