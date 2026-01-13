import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Kir-Dev docusaurus site',
  tagline: 'Böngéssz a tanfolyamok anyagaiban.',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://tanfolyam.kir-dev.hu',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'kir-dev', // Usually your GitHub org/user name.
  projectName: 'tanfolyam-docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'hu',
    locales: ['hu'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/kir-dev/tanfolyam-docusaurus/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/kir-dev/tanfolyam-docusaurus/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/kir-dev-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Tanfolyam web',
      logo: {
        alt: 'My Site Logo',
        src: 'img/kir-dev-long.svg',
        srcDark: 'img/kir-dev-long-dark.svg',
        className: 'navbar__logo',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'getStartedSidebar',
          position: 'left',
          label: 'Tudnivalók',
        },
        {
          type: 'docSidebar',
          sidebarId: 'webesAlapokSidebar',
          position: 'left',
          label: 'Webes alapok',
        },
        {
          type: 'docSidebar',
          sidebarId: 'gitAlapokSidebar',
          position: 'left',
          label: 'Git',
        },
        {
          type: 'docSidebar',
          sidebarId: 'nodeJsSidebar',
          position: 'left',
          label: 'Node.js',
        },
        {
          type: 'docSidebar',
          sidebarId: 'springBootSidebar',
          position: 'left',
          label: 'Spring Boot',
        },
        {
          type: 'docSidebar',
          sidebarId: 'reactSidebar',
          position: 'left',
          label: 'React',
        },
        { to: '/blog', label: 'Hírek', position: 'left' },
        {
          href: 'https://github.com/kir-dev/tanfolyam-docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Dokumentáció',
          items: [
            {
              label: 'Tudnivalók',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Közösség',
          items: [
            {
              label: 'Website',
              href: 'https://kir-dev.hu',
            },
            {
              label: 'YouTube',
              href: 'https://youtube.com/channel/UCkpMTj9qST_7RDt2YL4RUEw',
            },
            {
              label: 'Instagram',
              href: 'https://instagram.com/kir.dev',
            },
          ],
        },
        {
          title: 'Továbbiak',
          items: [
            {
              label: 'Hírek',
              to: '/blog',
            },
            {
              label: 'GitHub org',
              href: 'https://github.com/kir-dev',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kir-Dev. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
