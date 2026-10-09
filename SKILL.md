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
│   ├── ModelSelector.tsx    # LLM 模型切换与搜索选择器
│   ├── CodeBlock.tsx        # 独立代码块（语言徽章/复制/行号）
│   ├── TypingIndicator.tsx  # AI 输入中三点加载指示器
│   ├── ChatMessageRow.tsx   # 会话消息气泡行（User/Assistant/System）
│   ├── CommandPalette.tsx   # Cmd+K 命令面板（搜索/键盘导航）
│   ├── ToastStack.tsx       # 全局通知栈（四类型/自动消除）
│   ├── ChatSessionList.tsx  # 会话历史侧边栏（高亮/悬停删除）
│   ├── DiffViewer.tsx       # 代码差异对比（增删行高亮/行号）
│   ├── ToolApprovalCard.tsx # Agent 工具审批卡片（Approve/Reject）
│   ├── FileAttachmentList.tsx # 输入框附件列表（类型图标/大小/移除）
│   ├── StreamingProgressBar.tsx # 流式生成进度条（确定/不确定/三色）
│   ├── EmptyState.tsx       # 空态占位页（图标/标题/CTA）
│   ├── AgentStepTimeline.tsx # Agent 多步执行轨迹（四态/连接线）
│   ├── PromptTemplateGrid.tsx # 提示词模板卡片网格（标签/Use）
│   └── AgentTaskChecklist.tsx # Agent 任务清单（进度/切换）
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
│   ├── ModelSelector.vue
│   ├── CodeBlock.vue
│   ├── TypingIndicator.vue
│   ├── ChatMessageRow.vue
│   ├── CommandPalette.vue
│   ├── ToastStack.vue
│   ├── ChatSessionList.vue
│   ├── DiffViewer.vue
│   ├── ToolApprovalCard.vue
│   ├── FileAttachmentList.vue
│   ├── StreamingProgressBar.vue
│   ├── EmptyState.vue
│   ├── AgentStepTimeline.vue
│   ├── PromptTemplateGrid.vue
│   └── AgentTaskChecklist.vue
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
    ├── ModelSelector.js
    ├── CodeBlock.js
    ├── TypingIndicator.js
    ├── ChatMessageRow.js
    ├── CommandPalette.js
    ├── ToastStack.js
    ├── ChatSessionList.js
    ├── DiffViewer.js
    ├── ToolApprovalCard.js
    ├── FileAttachmentList.js
    ├── StreamingProgressBar.js
    ├── EmptyState.js
    ├── AgentStepTimeline.js
    ├── PromptTemplateGrid.js
    └── AgentTaskChecklist.js
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

### 18. `CodeBlock` (独立代码块卡片)
- **Props**: `code: string`, `language?: string`, `filename?: string`, `showLineNumbers?: boolean`, `showCopy?: boolean`, `maxHeight?: string`, `className?: string`
- **Vanilla 用法**: `<code-block language="typescript" filename="app.ts" show-line-numbers>`，代码通过属性 `code` 注入或直接写在标签文本内容内；复制成功自动切换为 `Copied` 反馈，2 秒后复位。
- **安全**: 代码内容全量实体转义，注入 `<script>` 不产生节点。

### 19. `TypingIndicator` (AI 输入中 / 加载指示器)
- **Props**: `label?: string`, `variant?: 'dots'|'pulse'`, `size?: 'sm'|'md'|'lg'`, `className?: string`
- **特性**: 三点交错弹跳（160ms 阶梯 delay）或脉冲变体，`role="status"` + `aria-label` 无障碍语义，适合等待首 Token / AI 正在输入场景。

### 20. `ChatMessageRow` (会话消息气泡行)
- **Props**: `role: 'user'|'assistant'|'system'`, `content?: string`, `name?: string`, `avatar?: string`, `timestamp?: string`, `className?: string`；React/Vue 支持 children/slot 覆盖气泡内容（可嵌套 StreamMarkdown）
- **Vanilla 用法**: `<chat-message-row role="assistant" name="Claude" timestamp="21:30" content="...">`，内容也可直接写在标签文本内；全量实体转义防注入
- **特性**: user 右对齐靛蓝气泡、assistant 左对齐中性气泡、system 居中胶囊；缺省头像自动回落为 `user`/`sparkles` 图标。

### 21. `CommandPalette` (Cmd+K 命令面板)
- **Props**: `items: Array<{ id: string, label: string, hint?: string, icon?: UiIconName, group?: string, shortcut?: string }>`, `isOpen: boolean`, `onClose?: () => void`, `onSelect?: (item) => void`, `placeholder?: string`, `className?: string`
- **Vanilla 用法**: `<command-palette>`，数据经 `items` 属性注入，`open` 属性控制显隐；事件 `select` / `close`（CustomEvent）
- **特性**: 即时搜索过滤 label/hint/group，分组标题去重展示，键盘 ↑↓ 导航 + Enter 选中 + Esc 关闭，背景遮罩点击关闭。

### 22. `ToastStack` (全局通知栈)
- **Props**: `toasts: Array<{ id: string|number, message: string, type?: 'success'|'error'|'warning'|'info' }>`, `onDismiss?: (id) => void`, `duration?: number`（默认 4000，0 关闭自动消除）, `className?: string`
- **Vanilla 用法**: `<toast-stack duration="4000">`，命令式 API `push(message, type)` / `dismiss(id)`；事件 `dismiss`（CustomEvent）
- **特性**: 固定右下堆叠，类型图标+色彩（success 绿 / error 红 / warning 黄 / info 蓝），手动关闭按钮，`aria-live="polite"` 播报，组件卸载自动清理定时器。

### 23. `ChatSessionList` (会话历史侧边栏)
- **Props**: `sessions: Array<{ id: string|number, title: string, timeLabel?: string }>`, `activeId?: string|number|null`, `onSelect?: (session) => void`, `onDelete?: (id) => void`, `title?: string`（默认 `'Chats'`）, `emptyText?: string`, `className?: string`
- **Vanilla 用法**: `<chat-session-list active-id="2">`，数据经 `sessions` 属性注入；事件 `select`（detail 为 session）/ `delete`（detail 为 `{ id }`）
- **特性**: 当前会话高亮（indigo 底）、悬停显现删除按钮、键盘 Enter/Space 可选中、空态文案、头部会话计数徽章。

### 24. `DiffViewer` (AI 代码差异对比)
- **Props**: `lines: Array<{ type: 'add'|'remove'|'context', content: string }>`, `filename?: string`, `language?: string`, `showLineNumbers?: boolean`（默认 true）, `className?: string`
- **Vanilla 用法**: `<diff-viewer filename="src/app.ts" language="ts">`，数据经 `lines` 属性注入；全量实体转义防注入
- **特性**: 增行绿底/删行红底/上下文中性，`+`/`-` 槽位符号，头部 +/- 统计徽章，新旧双列行号（增行只显新号、删行只显旧号）。

### 25. `ToolApprovalCard` (Agent 工具审批卡片)
- **Props**: `toolName: string`, `description?: string`, `args?: Record<string, unknown>|string`, `risk?: 'low'|'high'`, `status?: 'pending'|'approved'|'rejected'`, `onApprove?: () => void`, `onReject?: () => void`, `className?: string`
- **Vanilla 用法**: `<tool-approval-card tool-name="shell_execute" risk="high">`，参数经 `args` 属性注入；事件 `approve` / `reject`，点击后卡片自动更新 status 并切换为结果徽章
- **特性**: 高风险 amber 描边 + `high risk` 徽章 + lock 图标，低风险中性 tool 图标；参数 JSON 美化预览（max-height 滚动）；适合 Agent Human-in-the-loop 审批流。

### 26. `FileAttachmentList` (输入框附件列表)
- **Props**: `files: Array<{ id: string|number, name: string, size?: number, type?: string }>`, `onRemove?: (id) => void`, `className?: string`；React 端额外导出 `formatFileSize(bytes)`
- **Vanilla 用法**: `<file-attachment-list>`，数据经 `files` 属性注入；事件 `remove`（detail 为 `{ id }`）
- **特性**: 按 MIME/扩展名自动选图标（image→`image`，代码后缀→`code`，其他→`paperclip`），大小格式化 B/KB/MB，文件名截断 + 实体转义，空数组不渲染；与 ChatPromptInput 附件流配套。

### 27. `StreamingProgressBar` (流式生成进度条)
- **Props**: `value?: number|null`（0-100，省略/null 为不确定模式，自动钳位）, `label?: string`, `status?: 'streaming'|'done'|'error'`, `className?: string`
- **Vanilla 用法**: `<streaming-progress-bar value="64" label="Generating" status="streaming">`，属性变更即时重渲染
- **特性**: 不确定模式渲染 1/3 宽脉冲条，确定模式平滑过渡宽度；`role="progressbar"` + `aria-valuenow`（不确定时省略）；状态三色 indigo/emerald/rose。

### 28. `EmptyState` (空态占位页)
- **Props**: `icon?: UiIconName`（默认 `'sparkles'`）, `title: string`, `description?: string`, `actionLabel?: string`, `onAction?: () => void`, `className?: string`
- **Vanilla 用法**: `<empty-state icon="search" title="..." action-label="New Chat">`，事件 `action`（CustomEvent）
- **特性**: 居中图标块 + 标题 + 描述 + 可选 CTA 按钮；全量实体转义；适合零结果搜索、空会话列表、空白画布。

### 29. `AgentStepTimeline` (Agent 多步执行轨迹)
- **Props**: `steps: Array<{ id: string|number, title: string, description?: string, status: 'pending'|'running'|'done'|'error', duration?: string }>`, `className?: string`
- **Vanilla 用法**: `<agent-step-timeline>`，数据经 `steps` 属性注入；空数组不渲染
- **特性**: 竖向时间线，running 步骤 loader 旋转；步骤间连接线，done 步骤连接线染绿；耗时徽章；全量实体转义。适合 Devin/Cline 风格 Agent 执行过程回放。

### 30. `PromptTemplateGrid` (提示词模板卡片网格)
- **Props**: `templates: Array<{ id: string|number, title: string, description?: string, prompt: string, tag?: string }>`, `onUse?: (template) => void`, `className?: string`
- **Vanilla 用法**: `<prompt-template-grid>`，数据经 `templates` 属性注入；事件 `use`（detail 为完整 template，含 prompt）
- **特性**: 响应式 1/2 列网格，tag 徽章，悬停显现 "Use template"；点击卡片派发模板。适合提示词库/快捷指令面板。

### 31. `AgentTaskChecklist` (Agent 任务清单)
- **Props**: `items: Array<{ id: string|number, label: string, status: 'pending'|'active'|'done' }>`, `title?: string`（默认 `'Tasks'`）, `onToggle?: (id) => void`, `className?: string`
- **Vanilla 用法**: `<agent-task-checklist title="Release plan">`，数据经 `items` 属性注入；事件 `toggle`（detail 为 `{ id }`）
- **特性**: 头部 done/total 进度计数；done 划线 + 绿勾，active 旋转 loader，pending 空方框；React 端不传 onToggle 时为纯展示态（无指针/键盘监听）；Vue / Vanilla 端始终渲染交互样式，无监听器时点击为空操作。

## LLMs 专属摄取通道
- 紧凑索引: [`llms.txt`](./llms.txt)
- 全量单文件源码: [`llms-full.txt`](./llms-full.txt)（单文件打包所有 React / Vue / Vanilla 源码，供 Agent 一次性载入上下文）