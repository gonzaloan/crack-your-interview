import type {Config} from '@docusaurus/types';

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

const config: Config = {
  title: 'Crack your Interview',
  tagline: 'A complete guide to crack your technical interviews',
  favicon: 'img/favicon.ico',

  url: 'https://guide.gonzalo-munoz.com',
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
        navbar: {
          title: 'Crack Your Interview',
          logo: {
            alt: 'Gonzalo-Munoz Logo',
            src: 'img/logo.svg',
          },
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
                  to: '/docs/category/principles',
                },
                {
                  label: 'Java Advanced',
                  to: '/docs/category/java',
                },
                {
                  label: 'Frameworks',
                  to: '/docs/category/frameworks',
                },
                {
                  label: 'Microservices',
                  to: '/docs/category/microservices',
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
                  to: '/docs/index',
                },
                {
                  label: 'Design Principles',
                  to: '/docs/category/design-principles',
                },
                {
                  label: 'Java Advanced',
                  to: '/docs/category/java',
                },
              ],
            },
            {
              title: 'Advanced Topics',
              items: [
                {
                  label: 'Microservices',
                  to: '/docs/category/microservices',
                },
                {
                  label: 'Cloud',
                  to: '/docs/category/cloud',
                },
                {
                  label: 'DevOps',
                  to: '/docs/category/devops',
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
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      }),
};

module.exports = config;