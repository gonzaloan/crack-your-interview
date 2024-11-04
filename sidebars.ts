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
      ],
    },
  ],
};

module.exports = sidebars;
