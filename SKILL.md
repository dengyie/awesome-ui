---
name: awesome-ui
description: Use when building AI-native Web applications, chat interfaces, generative canvas, or AI dashboards. Provides copy-pasteable, zero-blackbox, single-file React/Vue/Vanilla components styled with Tailwind CSS.
---

# awesome-ui: AI 代码生成专属标准前端组件库

专为 AI Agent（Cursor, Claude Code, Codex, v0, Pi）设计的开箱即用、单文件 Copy-Paste 前端组件库。

## 核心设计哲学
1. **零黑盒 / 复制即用 (Copy-Paste First)**：直接将对应框架的单文件组件复制到项目中。
2. **极简扁平 Props**：不强绑复杂嵌套对象或特定后端 SDK，仅接受最简基础类型。
3. **Tailwind CSS 统一美学**：天然支持 Dark / Light 模式与响应式。
4. **覆盖核心 6 大 AI 交互场景**。

## 目录结构
```text
awesome-ui/
├── SKILL.md                 # Agent 检索与消费指南
├── react/                   # React (TSX) 单文件组件 (React 18/19 + Tailwind)
│   ├── ChatPromptInput.tsx  # 多模态自适应输入框
│   ├── StreamMarkdown.tsx   # 流式 Markdown 渲染与代码高亮
│   ├── ThinkingBlock.tsx    # 深度思考 / 思维链折叠面板
│   ├── ToolCallBadge.tsx    # Agent 工具调用状态与结果卡片
│   ├── AutoScrollAnchor.tsx # 智能平滑跟底锚点
│   └── ArtifactCanvas.tsx   # 分屏即席代码/页面预览画布
├── vue/                     # Vue 3 (SFC) 单文件组件 (Vue 3 + Tailwind)
│   ├── ChatPromptInput.vue
│   ├── StreamMarkdown.vue
│   ├── ThinkingBlock.vue
│   ├── ToolCallBadge.vue
│   ├── AutoScrollAnchor.vue
│   └── ArtifactCanvas.vue
└── vanilla/                 # 原生 JS / Web Components 单文件 (HTML + Tailwind CDN)
    ├── ChatPromptInput.js
    ├── StreamMarkdown.js
    ├── ThinkingBlock.js
    ├── ToolCallBadge.js
    ├── AutoScrollAnchor.js
    └── ArtifactCanvas.js
```

## 组件 API 速查表

### 1. `ChatPromptInput` (多模态输入框)
- **Props**: `value: string`, `onChange: (val: string) => void`, `onSubmit: () => void`, `onStop?: () => void`, `isGenerating?: boolean`, `placeholder?: string`, `allowAttachments?: boolean`, `attachments?: Array<{ id: string, name: string, url?: string, type: 'image'|'file' }>`, `onAddAttachment?: (file: File) => void`, `onRemoveAttachment?: (id: string) => void`

### 2. `StreamMarkdown` (流式 Markdown 渲染器)
- **Props**: `content: string`, `isStreaming?: boolean`, `className?: string`

### 3. `ThinkingBlock` (深度思考 / 思维链折叠条)
- **Props**: `content: string`, `isThinking?: boolean`, `durationSeconds?: number`, `defaultExpanded?: boolean`

### 4. `ToolCallBadge` (工具调用状态卡片)
- **Props**: `name: string`, `status: 'running' | 'success' | 'error'`, `args?: Record<string, any> | string`, `output?: any`, `error?: string`

### 5. `AutoScrollAnchor` (智能平滑跟底锚点)
- **Props**: `isStreaming?: boolean`, `targetRef?: HTMLElement | null`

### 7. `MessageActionToolbar` (消息底部工具条)
- **Props**: `content: string`, `role?: 'assistant' | 'user'`, `onRetry?: () => void`, `onFeedback?: (type: 'up' | 'down') => void`, `branchIndex?: number`, `totalBranches?: number`, `onBranchChange?: (index: number) => void`

### 8. `PromptChips` (建议追问标签)
- **Props**: `suggestions: string[]`, `onSelect: (prompt: string) => void`
