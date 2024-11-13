import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Crack your Interview',
  tagline: 'A complete guide to crack your technical interviews',
  favicon: 'img/favicon.ico',
  url: 'https://guide.gonzalo-munoz.com',
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: true,
          sidebarCollapsed: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Crack Your Interview',
      hideOnScroll: false,
      style: 'dark',
      logo: {
        alt: 'Logo',
        src: 'img/logo.png',
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
          items: [],
        },
        {
          href: 'https://github.com/gonzaloan/crack-your-interview',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'kotlin', 'groovy', 'scala'],
    },
  },

  // Añade configuración para mejorar el SEO y compartir en redes sociales
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: 'Complete guide for mastering technical interviews with advanced Java concepts',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: 'Complete guide for mastering technical interviews with advanced Java concepts',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'Crack Your Interview - Advanced Java Development Guide',
      },
    },
  ],
};


export default config;