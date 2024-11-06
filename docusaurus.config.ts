import type {Config} from '@docusaurus/types';


const config: Config = {
  title: 'Crack your Interview',
  tagline: 'A complete guide to crack your technical interviews',
  favicon: 'img/favicon.ico',
  url: 'https://guide.gonzalo-munoz.com', // Asegúrate que sea https
  trailingSlash: true,
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/', // Important: This makes docs the homepage
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
      ({
        colorMode: {
          defaultMode: 'dark',
          disableSwitch: false,
          respectPrefersColorScheme: true,
        },
        favicon: 'img/favicon.ico',
        navbar: {
          title: 'Crack Your Interview',
          logo: {
            alt: 'Gonzalo-Munoz Logo',
            src: 'img/logo.png',
          },
          style: 'dark',
          hideOnScroll: true,
          items: [
            {
              type: 'doc',
              docId: 'index',
              position: 'left',
              label: 'Learning Path',
            },
            {
              type: 'dropdown',
              label: 'Quick Access',
              position: 'left',
              items: [
                {
                  label: 'Design Principles',
                  to: '/principles/solid/introduction',
                },
                {
                  label: 'Java Advanced',
                  to: '/category/java',
                },
                {
                  label: 'Frameworks',
                  to: '/category/frameworks',
                },
                {
                  label: 'Microservices',
                  to: '/category/microservices',
                },
              ],
            },
            {
              href: 'https://github.com/gonzaloan/crack-your-interview',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          links: [
            {
              title: 'Documentation',
              items: [
                {
                  label: 'Getting Started',
                  to: '/',
                },
                {
                  label: 'Design Principles',
                  to: '/category/design-principles',
                },
                {
                  label: 'Java Advanced',
                  to: '/category/java',
                },
              ],
            },
            {
              title: 'Advanced Topics',
              items: [
                {
                  label: 'Microservices',
                  to: '/category/microservices',
                },
                {
                  label: 'Cloud',
                  to: '/category/cloud',
                },
                {
                  label: 'DevOps',
                  to: '/category/devops',
                },
              ],
            },
            {
              title: 'Community',
              items: [
                {
                  label: 'GitHub',
                  href: 'https://github.com/gonzaloan/crack-your-interview',
                },
                {
                  label: 'LinkedIn',
                  href: 'https://linkedin.com/in/mmgonzalo',
                },
              ],
            },
          ],
          copyright: `Copyright © ${new Date().getFullYear()} Gonzalo-Munoz, Built with Docusaurus.`,
        },
        docs: {
          sidebar: {
            hideable: true,
            autoCollapseCategories: true,
          },
        },
        prism: {
          theme: require('prism-react-renderer').themes.github,
          darkTheme: require('prism-react-renderer').themes.dracula,
          additionalLanguages: ['java', 'kotlin', 'groovy', 'scala'],
        },
      }),
};

module.exports = config;