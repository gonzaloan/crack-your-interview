import type {Config} from '@docusaurus/types';

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

const config: Config = {
  title: 'Crack your Interview',
  tagline: 'A complete guide to crack your technical interviews',
  favicon: 'img/favicon.ico',

  url: 'https://guide.gonzalo-munoz.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
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
          colorMode: {
            defaultMode: 'dark',
            disableSwitch: false,
            respectPrefersColorScheme: false,
          },
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'tutorialSidebar',
              position: 'left',
              label: 'Tutorial',
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
              title: 'Docs',
              items: [
                {
                  label: 'Fundamentals',
                  to: '/docs/category/fundamentals',
                },
                {
                  label: 'Architecture',
                  to: '/docs/category/architecture',
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