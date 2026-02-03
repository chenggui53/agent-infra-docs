/**
 * Moltbook 配置文件
 * 用于配置知识库网站的构建和渲染
 */

module.exports = {
  // 网站基本信息
  site: {
    title: '个人知识库',
    description: '记录学习过程中的知识、经验和思考',
    keywords: '知识库,学习笔记,技术文档,个人博客',
    author: '你的名字',
    language: 'zh-CN'
  },

  // 源文件夹配置
  source: {
    // Markdown 文档源文件夹
    contentDir: 'content',
    // 静态资源文件夹
    assetsDir: 'assets',
    // 模板文件夹
    templatesDir: 'templates',
    // 忽略的文件和文件夹
    ignore: ['node_modules', '.git', '.clawdhub', 'agent-sandbox', 'k8s-pod-backup', 'video-refresh-plugin']
  },

  // 输出配置
  output: {
    // 输出文件夹
    distDir: '_site',
    // 清理输出目录
    clean: true
  },

  // 主题配置
  theme: {
    // 主题名称
    name: 'moltbook-theme-default',
    // 主题自定义配置
    config: {
      // 导航菜单
      nav: [
        {
          name: '首页',
          url: '/',
          icon: 'home'
        },
        {
          name: '知识库',
          url: '/knowledge',
          icon: 'book'
        },
        {
          name: '项目经验',
          url: '/projects',
          icon: 'folder'
        },
        {
          name: '学习记录',
          url: '/learning',
          icon: 'calendar'
        },
        {
          name: '关于',
          url: '/about',
          icon: 'user'
        }
      ],
      
      // 侧边栏菜单
      sidebar: [
        {
          name: '知识分类',
          items: [
            { name: '架构技术', url: '/knowledge/architecture' },
            { name: '项目经验', url: '/knowledge/projects' },
            { name: '学习记录', url: '/knowledge/learning' }
          ]
        },
        {
          name: '热门标签',
          items: [
            { name: 'Serverless', url: '/tags/serverless' },
            { name: 'FaaS', url: '/tags/faas' },
            { name: 'Kubernetes', url: '/tags/kubernetes' },
            { name: 'AI', url: '/tags/ai' },
            { name: '前端开发', url: '/tags/frontend' }
          ]
        }
      ],

      // 网站颜色
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb'
      },

      // 网站功能
      features: {
        search: true,
        darkMode: true,
        comments: false,
        analytics: false
      }
    }
  },

  // 解析器配置
  parser: {
    // Markdown 解析器配置
    markdown: {
      // 启用目录生成
      toc: true,
      // 启用代码高亮
      highlight: true,
      // 启用数学公式
      math: false,
      // 启用流程图
      mermaid: false
    },

    // 元数据解析
    metadata: {
      // 支持的元数据格式
      formats: ['yaml', 'json', 'toml']
    }
  },

  // 构建配置
  build: {
    // 启用增量构建
    incremental: true,
    // 压缩静态资源
    minify: true,
    // 启用图片优化
    optimizeImages: true
  },

  // 开发服务器配置
  dev: {
    // 端口
    port: 3000,
    // 主机
    host: '0.0.0.0',
    // 热重载
    hotReload: true,
    // 浏览器自动打开
    open: false
  },

  // 插件配置
  plugins: [
    // 启用搜索插件
    '@moltbook/plugin-search',
    // 启用代码高亮插件
    '@moltbook/plugin-highlight',
    // 启用目录插件
    '@moltbook/plugin-toc',
    // 启用标签插件
    '@moltbook/plugin-tags'
  ],

  // 自定义插件
  customPlugins: [],

  // 钩子配置
  hooks: {
    // 构建前钩子
    preBuild: async () => {
      console.log('开始构建个人知识库...');
    },
    // 构建后钩子
    postBuild: async () => {
      console.log('个人知识库构建完成！');
    },
    // 页面渲染前钩子
    preRender: async (page) => {
      // 可以在这里修改页面数据
      return page;
    }
  },

  // 部署配置
  deploy: {
    // GitHub Pages 配置
    githubPages: {
      // 分支
      branch: 'gh-pages',
      // 部署文件夹
      dist: '_site',
      // 提交信息
      message: '更新知识库内容',
      // 远程仓库
      remote: 'origin'
    }
  }
};
