---
name: awesome-ui
description: Use when building AI-native Web applications, chat interfaces, generative canvas, or AI dashboards. Provides copy-pasteable, zero-blackbox, single-file React/Vue/Vanilla components styled with Tailwind CSS.
---

# awesome-ui: AI 代码生成专属标准前端组件库

专为 AI Agent（Cursor, Claude Code, Codex, v0, Pi）设计的开箱即用、单文件 Copy-Paste 前端组件库。

## 核心设计哲学
1. **零黑盒 / 复制即用 (Copy-Paste First)**：直接将对应框架的单文件组件复制到项目中。
2. **极简扁平 Props**：不强绑复杂嵌套对象或特定后端 SDK，只接受最简基础类型。
3. **Tailwind CSS 统一美学**：天然支持 Dark / Light 模式与响应式。
4. **覆盖核心 AI 交互与仪表盘场景，并统一基础 UI**（含图标体系）。
5. **图标统一**：优先使用 `react/UiIcon.tsx`、`vue/UiIcon.vue` 或 `vanilla/UiIcon.js`，禁止 emoji、Unicode 符号和临时手写 SVG 作为界面图标。

## 目录结构
```text
awesome-ui/
├── SKILL.md                 # Agent 检索与消费指南
├── index.html               # 交互式 Gallery 体验页面
├── react/                   # React (TSX) 单文件组件 (React 18/19 + Tailwind)
│   ├── UiIcon.tsx           # 统一零依赖 SVG 图标系统
│   ├── ChatPromptInput.tsx  # 多模态自适应输入框
│   ├── StreamMarkdown.tsx   # 流式 Markdown 渲染与代码高亮
│   ├── ThinkingBlock.tsx    # 深度思考 / 思维链折叠面板
│   ├── ToolCallBadge.tsx    # Agent 工具调用状态卡片
│   ├── AutoScrollAnchor.tsx # 智能平滑跟底锚点
│   ├── ArtifactCanvas.tsx   # 分屏即时代码/页面预览画布
│   ├── SourcesCitation.tsx  # RAG 搜索来源卡片
│   ├── MessageActionToolbar.tsx # 消息底部操作条
│   ├── PromptChips.tsx      # 建议追问气泡
│   ├── StatusIndicator.tsx  # 状态指示徽章
│   ├── ThemeToggle.tsx      # 三态主题切换
│   ├── AudioWaveVisualizer.tsx # 语音波形跳动
│   ├── RoadmapTimeline.tsx  # 学习路径图谱
│   ├── KnowledgeDrawer.tsx  # 知识节点抽屉
│   ├── HomepageDashboard.tsx # 仪表盘 / 个性化首页（gethomepage/homepage 风格）
│   ├── ContextUsageBadge.tsx # Context Window 消耗量与 Token 分布指示器
│   └── ModelSelector.tsx    # LLM 模型切换与搜索选择器
├── vue/                     # Vue 3 (SFC) 单文件组件 (Vue 3 + Tailwind)
│   ├── UiIcon.vue
│   ├── ChatPromptInput.vue
│   ├── StreamMarkdown.vue
│   ├── ThinkingBlock.vue
│   ├── ToolCallBadge.vue
│   ├── AutoScrollAnchor.vue
│   ├── ArtifactCanvas.vue
│   ├── SourcesCitation.vue
│   ├── MessageActionToolbar.vue
│   ├── PromptChips.vue
│   ├── StatusIndicator.vue
│   ├── ThemeToggle.vue
│   ├── AudioWaveVisualizer.vue
│   ├── RoadmapTimeline.vue
│   ├── KnowledgeDrawer.vue
│   ├── HomepageDashboard.vue
│   ├── ContextUsageBadge.vue
│   └── ModelSelector.vue
└── vanilla/                 # 原生 JS / Web Components 单文件 (HTML + Tailwind CDN)
    ├── UiIcon.js            # uiIcon() SVG 图标工厂
    ├── ChatPromptInput.js
    ├── StreamMarkdown.js
    ├── ThinkingBlock.js
    ├── ToolCallBadge.js
    ├── AutoScrollAnchor.js
    ├── ArtifactCanvas.js
    ├── SourcesCitation.js
    ├── MessageActionToolbar.js
    ├── PromptChips.js
    ├── StatusIndicator.js
    ├── ThemeToggle.js
    ├── AudioWaveVisualizer.js
    ├── RoadmapTimeline.js
    ├── KnowledgeDrawer.js
    ├── HomepageDashboard.js
    ├── ContextUsageBadge.js
    └── ModelSelector.js
```

## 图标 API 速查
- **React**: `import { UiIcon, Sparkles, Check, Cpu, Terminal, Zap } from './UiIcon'`; 使用 `<UiIcon name="sparkles" size={18} strokeWidth={1.8} />`
- **Vue**: `<UiIcon name="sparkles" :size="18" />`
- **Vanilla**: `import uiIcon from './UiIcon.js'`; 使用 `uiIcon('sparkles', { size: 18, className: 'text-cyan-500' })`
- 命名图标覆盖箭头、状态、主题、文件、代码、工具调用、来源、反馈、CPU、终端、闪电等常见 UI 语义。

## 组件 API 速查表

### 1. `ChatPromptInput` (多模态输入框)
- **Props**: `value: string`, `onChange: (val: string) => void`, `onSubmit: (text: string, files?: File[]) => void`, `onStop?: () => void`, `isGenerating?: boolean`, `allowAttachments?: boolean`, `placeholder?: string`, `className?: string`

### 2. `StreamMarkdown` (流式 Markdown 渲染器)
- **Props**: `content: string`, `isStreaming?: boolean`, `className?: string`

### 3. `ThinkingBlock` (深度思考 / 思维链折叠条)
- **Props**: `content: string`, `isThinking?: boolean`, `durationSeconds?: number`, `defaultExpanded?: boolean`, `className?: string`

### 4. `ToolCallBadge` (工具调用状态卡片)
- **Props**: `name: string`, `status: 'running'|'success'|'error'`, `args?: Record<string, any>|string`, `output?: any`, `error?: string`, `className?: string`

### 5. `AutoScrollAnchor` (智能平滑跟底锚点)
- **Props**: `isStreaming?: boolean`, `scrollContainer?: HTMLElement|Window`, `className?: string`

### 6. `ArtifactCanvas` (分屏即时预览画布)
- **Props**: `isOpen: boolean`, `onClose?: () => void`, `title?: string`, `code: string`, `language?: string`, `className?: string`

### 7. `MessageActionToolbar` (消息底部操作条)
- **Props**: `content: string`, `role?: 'user'|'assistant'`, `onRetry?: () => void`, `onFeedback?: (type: 'like'|'dislike') => void`, `branchIndex?: number`, `totalBranches?: number`, `onBranchChange?: (idx: number) => void`, `className?: string`

### 8. `PromptChips` (智能建议追问标签)
- **Props**: `suggestions: string[]`, `onSelect?: (prompt: string) => void`, `className?: string`

### 9. `SourcesCitation` (RAG 引文来源卡片)
- **Props**: `sources: Array<{ title: string, url: string, snippet?: string, siteName?: string }>`, `className?: string`

### 10. `StatusIndicator` (服务与节点状态指示器)
- **Props**: `status: 'online'|'connecting'|'error'|'idle'`, `label?: string`, `pingMs?: number|string`, `className?: string`

### 11. `ThemeToggle` (三态主题切换 Auto/Light/Dark)
- **Props**: `theme?: 'auto'|'light'|'dark'`, `onChange?: (theme: string) => void`, `className?: string`

### 12. `AudioWaveVisualizer` (实时音频波形跳动)
- **Props**: `isActive?: boolean`, `barCount?: number`, `className?: string`

### 13. `RoadmapTimeline` (学习路径图谱)
- **Props**: `data: { activeId: number|string, nodes: Array<{ id: number|string, index: string, title: string, subtitle?: string, stageColor?: string, status: 'active'|'completed'|'locked', tags?: string[] }> }`, `onNodeClick?: (node: any) => void`, `className?: string`

### 14. `KnowledgeDrawer` (知识节点抽屉)
- **Props**: `data: { isOpen: boolean, index?: string, title?: string, subtitle?: string, themeColor?: string, conceptText?: string, dependencies?: Array<{ type: string, label: string }>, actionLabel?: string }`, `onClose?: () => void`, `onAction?: () => void`, `className?: string`

### 15. `HomepageDashboard` (仪表盘 / 个性首页启动页)
- **Props**: `title?: string`, `subtitle?: string`, `version?: string`（默认 `'Homepage · awesome-ui'`，不再伪装上游版本号）, `groups: Array<{ name: string, icon?: string, services: Array<{ id?: string, name: string, description?: string, icon?: string, href?: string, status?: 'online'|'up'|'down'|'offline'|'warn'|'error'|'unknown', pingText?: string }> }>`, `headerStyle?: 'underlined'|'boxed'|'clean'`, `statusStyle?: 'pill'|'dot'|'none'`, `showClock?: boolean`, `showSearch?: boolean`, `searchPlaceholder?: string`, `collapsible?: boolean`, `className?: string`
- **Vanilla 用法**: `<homepage-dashboard title="Homepage" show-search status-style="pill">`，数据通过属性 `groups`（数组）注入；HTML 属性（kebab-case）：`title` `subtitle` `version` `header-style` `status-style` `show-search` `search-placeholder` `collapsible` `show-clock`
- **折叠事件 API**（三端对齐）: React `onToggleGroup(group, collapsed)` 回调 ／ Vue emit `'group-toggle'` ／ Vanilla `CustomEvent('group-toggle')`；`statusStyle` 非法值统一回退 `pill`，图标加载失败统一隐藏，同名组 key 用 name+index 防冲突，React 时钟已拆独立子组件避免整树 re-render。
- **安全**: `href` 白名单 — 仅 `http(s)`/`mailto:`/`//`/`/`/`./`/`../` 渲染为链接，`javascript:`/`data:` 等一律不渲染；文本实体转义防注入，React 端额外导出 `isSafeHref`；`service.id` 为可选稳定 key，缺失时回落字符串 name。
- **搜索一致性**: 无命中组隐藏于三端行为一致（不残留空 group header），搜索框 `aria-label`，点 dot/pill 带 `role` 标注。

### 16. `ContextUsageBadge` (上下文窗口 / Token 消耗指示器)
- **Props**: `usedTokens: number`, `maxTokens: number`, `modelName?: string`, `breakdown?: Array<{ label: string, count: number, colorClass?: string }>`, `compact?: boolean`, `className?: string`
- **特性**: 超过 70%/90% 阶梯色彩预警，悬停/点击 Popover 弹出详细 Token 分布（Prompt / History / Active Turn）。

### 17. `ModelSelector` (AI 模型切换选择器)
- **Props**: `models: Array<{ id: string, name: string, provider?: string, description?: string, contextLength?: string, tags?: string[] }>`, `selectedId: string`, `onSelect?: (model: ModelOption) => void`, `placeholder?: string`, `showSearch?: boolean`, `disabled?: boolean`, `className?: string`
- **特性**: 扁平数据驱动，即时搜索过滤，Provider 与 Context 长度徽章，完美适配各类 AI 桌面与聊天工具栏。

## LLMs 专属摄取通道
- 紧凑索引: [`llms.txt`](./llms.txt)
- 全量单文件源码: [`llms-full.txt`](./llms-full.txt)（单文件打包所有 React / Vue / Vanilla 源码，供 Agent 一次性载入上下文）