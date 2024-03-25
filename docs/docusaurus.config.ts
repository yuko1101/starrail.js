import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';
import child_process from 'child_process';

function getGitRefName(): string {
  const stdout = child_process.execSync('git rev-parse --short HEAD');
  return stdout.toString().trim();
}

const config: Config = {
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

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@yuko1101/docusaurus-plugin-typedoc-api',
      {
        projectRoot: path.join(__dirname, '..'),
        packages: [
          '.',
        ],
        readmes: true,
        changelogs: true,
        gitRefName: getGitRefName(),
      },
    ],
  ],

  themeConfig: {
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
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Get Started',
        },
        {
          to: 'api',
          label: 'API',
          position: 'left',
        },
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
              to: '/docs',
            },
            {
              label: 'API',
              to: '/api'
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
              label: 'Pull requests',
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
              label: 'EnkaNetwork',
              href: 'https://enka.network'
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} starrail.js, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
