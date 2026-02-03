# 标签管理

## 标签系统设计

本知识库采用**扁平化标签系统**，便于快速定位和关联相关想法。标签与分类互补，分类提供结构化组织，标签提供语义关联。

## 标签命名规范

### 基本规则
- **小写字母**：标签名使用小写字母
- **单词间用连字符**：多个单词之间使用连字符分隔（如：`machine-learning`）
- **简洁明确**：每个标签应表达单一语义
- **避免冗余**：标签名不包含重复信息
- **一致性**：相同概念使用相同标签

### 标签类型

#### 1. 技术标签
- **语言类**：`python`, `javascript`, `java`, `go`, `rust`
- **框架类**：`react`, `vue`, `django`, `flask`, `express`
- **概念类**：`machine-learning`, `deep-learning`, `nlp`, `computer-vision`
- **工具类**：`git`, `docker`, `kubernetes`, `vscode`, `pycharm`

#### 2. 生活标签
- **个人成长**：`self-improvement`, `time-management`, `learning-methods`
- **健康管理**：`fitness`, `nutrition`, `sleep`, `mental-health`
- **财务管理**：`investment`, `budgeting`, `personal-finance`, `saving`
- **人际关系**：`communication`, `networking`, `relationship-management`

#### 3. 学习标签
- **学习方法**：`learning-strategies`, `note-taking`, `memory-techniques`
- **知识领域**：`computer-science`, `philosophy`, `psychology`, `economics`
- **学习资源**：`books`, `online-courses`, `workshops`, `conferences`

#### 4. 项目标签
- **项目类型**：`open-source`, `commercial`, `personal-projects`, `startup`
- **开发阶段**：`planning`, `development`, `testing`, `deployment`
- **技术栈**：`full-stack`, `frontend`, `backend`, `mobile`

#### 5. 思考标签
- **思考类型**：`daily-reflection`, `monthly-review`, `yearly-planning`
- **思维模型**：`first-principles`, `systems-thinking`, `critical-thinking`
- **哲学思考**：`existentialism`, `stoicism`, `buddhism`, `epistemology`

## 标签使用规范

### 使用原则
1. **相关性**：标签应与内容直接相关
2. **具体性**：避免过于宽泛的标签（如：`tech` 太宽泛，应使用更具体的标签）
3. **数量控制**：每个想法使用 3-5 个标签最佳
4. **一致性**：相同概念使用相同标签
5. **避免重复**：标签名不应与分类名重复

### 示例
```markdown
---
title: 机器学习优化技巧
categories: [人工智能/机器学习]
tags: [machine-learning, optimization, algorithm, hyperparameter-tuning]
---
```

## 标签管理

### 标签词典
所有标签应在本文件中进行管理，包括：
- 标签名称
- 标签描述
- 使用场景
- 关联标签

### 常用标签

#### 技术相关标签
```
python                    - Python 编程语言
javascript                - JavaScript 编程语言
react                     - React 前端框架
vue                       - Vue.js 前端框架
django                    - Django 后端框架
flask                     - Flask 后端框架
machine-learning          - 机器学习
deep-learning             - 深度学习
nlp                       - 自然语言处理
computer-vision           - 计算机视觉
```

#### 生活相关标签
```
self-improvement          - 个人成长
time-management           - 时间管理
learning-methods          - 学习方法
fitness                   - 健身
nutrition                 - 营养
sleep                     - 睡眠
mental-health             - 心理健康
investment                - 投资
budgeting                 - 预算
personal-finance          - 个人财务
```

#### 学习相关标签
```
learning-strategies       - 学习策略
note-taking               - 笔记方法
memory-techniques         - 记忆技巧
computer-science          - 计算机科学
philosophy                - 哲学
psychology                - 心理学
economics                 - 经济学
books                     - 书籍
online-courses            - 在线课程
workshops                 - 研讨会
```

#### 项目相关标签
```
open-source               - 开源项目
commercial                - 商业项目
personal-projects         - 个人项目
startup                   - 创业项目
planning                  - 规划阶段
development               - 开发阶段
testing                   - 测试阶段
deployment                - 部署阶段
full-stack                - 全栈开发
frontend                  - 前端开发
backend                   - 后端开发
mobile                    - 移动开发
```

## 标签搜索和分析

### 搜索方法
```bash
# 按标签搜索
grep -r "tags:.*machine-learning" entries/

# 统计标签使用频率
grep -r "tags:" entries/ | cut -d'"' -f2 | sort | uniq -c | sort -rn
```

### 标签分析
- 定期分析标签使用情况
- 识别高频标签和未使用标签
- 优化标签系统的实用性

## 标签扩展

### 添加新标签
1. 在本文件中添加标签定义
2. 更新标签词典
3. 为现有想法添加新标签

### 标签重命名
- 谨慎使用标签重命名
- 更新所有使用该标签的文件
- 保持标签系统的一致性

---

**最后更新**：2026年1月31日
