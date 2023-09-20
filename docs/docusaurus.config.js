// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'StarRail.js',
  tagline: 'A Node.js Enka.Network API wrapper for Honkai: Star Rail',
  favicon: 'img/fire.ico',

  // Set the production url of your site here
  url: 'https://starrail.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.npm_config_base_url ?? '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yuko1101', // Usually your GitHub org/user name.
  projectName: 'starrail.js', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [require("remark-breaks")],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: "5OZ5AOCZ1S",
        apiKey: "1005cc2a90f0c5835fff1ce2ae2f579c",
        indexName: "starrail",
      },
      // Replace with your project's social card
      image: 'img/starrail-social-card.png',
      navbar: {
        title: 'StarRail.js',
        logo: {
          alt: 'StarRail.js',
          src: 'img/fire.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Get Started',
          },
          {
            type: 'doc',
            docId: 'api/StarRail',
            position: 'left',
            label: 'Documentation'
          },
          // { to: '/examples', label: 'Examples', position: 'left' },
          {
            href: 'https://github.com/yuko1101/starrail.js',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Contents',
            items: [
              {
                label: 'Get Started',
                to: '/docs/intro',
              },
              {
                label: 'Documentation',
                to: '/docs/api/StarRail'
              }
            ],
          },
          {
            title: 'GitHub',
            items: [
              {
                label: 'Repository',
                href: 'https://github.com/yuko1101/starrail.js',
              },
              {
                label: 'Issues',
                href: 'https://github.com/yuko1101/starrail.js/issues',
              },
              {
                label: 'Pull Requests',
                href: 'https://github.com/yuko1101/starrail.js/pulls',
              },
            ],
          },
          {
            title: 'Other Links',
            items: [
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/starrail.js'
              },
              {
                label: 'Enka.Network',
                href: 'https://enka.network'
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} starrail.js, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
