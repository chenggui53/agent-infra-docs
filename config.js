module.exports = {
  title: '个人知识库',
  description: '记录学习过程中的知识、经验和思考',
  lang: 'zh-CN',
  base: '/',
  dest: '_site',
  
  // 主题配置
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { 
        text: '知识库', 
        items: [
          { text: '架构技术', link: '/knowledge/architecture' },
          { text: '项目经验', link: '/knowledge/projects' },
          { text: '学习记录', link: '/knowledge/learning' }
        ]
      },
      { 
        text: '分类', 
        items: [
          { text: '架构技术', link: '/category/architecture' },
          { text: '项目经验', link: '/category/projects' },
          { text: '学习记录', link: '/category/learning' }
        ]
      },
      { 
        text: '标签', 
        items: [
          { text: 'Serverless', link: '/tag/serverless' },
          { text: 'FaaS', link: '/tag/faas' },
          { text: 'Kubernetes', link: '/tag/kubernetes' },
          { text: 'AI', link: '/tag/ai' },
          { text: '前端开发', link: '/tag/frontend' }
        ]
      },
      { text: '关于', link: '/about' }
    ],
    
    sidebar: {
      '/knowledge/': [
        {
          title: '架构技术',
          collapsable: true,
          children: [
            'architecture/',
            'architecture/faas-research',
            'architecture/vnc-technologies'
          ]
        },
        {
          title: '项目经验',
          collapsable: true,
          children: [
            'projects/',
            'projects/cloud-ai-robot'
          ]
        },
        {
          title: '学习记录',
          collapsable: true,
          children: [
            'learning/'
          ]
        }
      ],
      '/category/': [
        {
          title: '分类',
          children: ['architecture', 'projects', 'learning']
        }
      ],
      '/tag/': [
        {
          title: '标签',
          children: ['serverless', 'faas', 'kubernetes', 'ai', 'frontend']
        }
      ]
    },
    
    search: true,
    searchMaxSuggestions: 10,
    author: 'Xiong Qi',
    lastUpdated: true,
    editLink: {
      text: '在 GitHub 上编辑此页',
      pattern: 'https://github.com/yourusername/personal-knowledge-base/edit/main/:path'
    }
  },
  
  // 插件配置
  plugins: [
    '@vuepress/search',
    '@vuepress/medium-zoom',
    '@vuepress/prismjs'
  ],
  
  // 全局配置
  markdown: {
    // 代码块高亮
    highlight: {
      preprocess: (code, lang) => {
        if (lang === 'vue' || lang === 'html') {
          return ['```vue', code, '```'].join('\n')
        }
        return code
      }
    },
    extendMarkdown: md => {
      md.set({ breaks: true })
      md.use(require('markdown-it-task-lists'))
      md.use(require('markdown-it-footnote'))
      md.use(require('markdown-it-abbr'))
    }
  },
  
  // 额外配置
  extraWatchFiles: [
    '.vuepress/config.js',
    '.vuepress/**/*.js',
    '.vuepress/**/*.vue'
  ]
}
