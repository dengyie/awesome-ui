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

## 设计与实现规范（实现/修改组件前必读）

- **`docs/design-guidelines.md`**：视觉基调、交互模式（浮现式操作/渐进披露/命令面板等 8 大 Mobbin pattern）、动效、无障碍硬性要求、验收清单。**任何新增或修改组件都必须过一遍其第 7 节验收清单。**
- **`docs/component-roadmap-v1.md`**：待实现组件的任务书（Props 设计 + 参考素材索引）。
- **`docs/mobbin-patterns-2026-11.md`**：Mobbin pattern 研究报告（设计决策的依据来源）。
- **素材 SOP**：`tools/mobbin_auth.py`（OAuth）/ `tools/mobbin_fetch.py`（分品类拉取）；参考图在 `references/`（gitignore，仅本地参考，勿提交）。

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
│   ├── AgentTaskChecklist.tsx # Agent 任务清单（进度/切换）
│   ├── PricingTable.tsx    # SaaS 定价三列卡（推荐列高亮/功能清单）
│   ├── StatCard.tsx        # 统计卡（环比/迷你趋势线）
│   ├── DataTable.tsx       # 数据表（排序/多选/批量操作条）
│   ├── AgentRunLog.tsx     # Agent 执行日志（状态时间线/终端详情）
│   ├── AuthForm.tsx        # 登录/注册表单（SSO/错误/loading）
│   ├── SettingsPanel.tsx   # 设置页框架（锚点导航/分节卡片/Save）
│   ├── OnboardingChecklist.tsx # 激活清单（进度/划线/全完成态）
│   └── UpgradePromptCard.tsx   # 用量升级卡（阈值进度条/权益/CTA）
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
│   ├── AgentTaskChecklist.vue
│   ├── PricingTable.vue
│   ├── StatCard.vue
│   ├── DataTable.vue
│   ├── AgentRunLog.vue
│   ├── AuthForm.vue
│   ├── SettingsPanel.vue
│   ├── OnboardingChecklist.vue
│   └── UpgradePromptCard.vue
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
    ├── AgentTaskChecklist.js
    ├── PricingTable.js
    ├── StatCard.js
    ├── DataTable.js
    ├── AgentRunLog.js
    ├── AuthForm.js
    ├── SettingsPanel.js
    ├── OnboardingChecklist.js
    └── UpgradePromptCard.js
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
- **特性**: 即时搜索过滤 label/hint/group，分组标题去重展示，键盘 ↑↓ 导航 + Enter 选中 + Esc 关闭，背景遮罩点击关闭；底部快捷键提示条（↑↓ Navigate · ↵ Select · esc Close，kbd 样式）。

### 22. `ToastStack` (全局通知栈)
- **Props**: `toasts: Array<{ id: string|number, message: string, type?: 'success'|'error'|'warning'|'info' }>`, `onDismiss?: (id) => void`, `duration?: number`（默认 4000，0 关闭自动消除）, `className?: string`
- **Vanilla 用法**: `<toast-stack duration="4000">`，命令式 API `push(message, type)` / `dismiss(id)`；事件 `dismiss`（CustomEvent）
- **特性**: 固定右下堆叠，类型图标+色彩（success 绿 / error 红 / warning 黄 / info 蓝），手动关闭按钮，`aria-live="polite"` 播报，组件卸载自动清理定时器；底部 `h-0.5` 倒计时进度条随剩余时间收缩，hover 暂停、移出恢复，`duration=0` 为常驻无条。

### 23. `ChatSessionList` (会话历史侧边栏)
- **Props**: `sessions: Array<{ id: string|number, title: string, timeLabel?: string, group?: string }>`, `activeId?: string|number|null`, `onSelect?: (session) => void`, `onDelete?: (id) => void`, `user?: { name: string, email?: string, avatarUrl?: string }`, `onUserClick?: () => void`, `title?: string`（默认 `'Chats'`）, `emptyText?: string`, `className?: string`
- **Vanilla 用法**: `<chat-session-list active-id="2">`，数据经 `sessions` / `user` 属性注入；事件 `select`（detail 为 session）/ `delete`（detail 为 `{ id }`）/ `user-click`
- **特性**: 当前会话高亮（indigo 底）、悬停显现删除按钮、键盘 Enter/Space 可选中、空态文案、头部会话计数徽章；`group` 分组标题可折叠（无 group 的进 "Recent" 桶不折叠），底部用户卡（首字母头像/图片 + 姓名 + 邮箱 + 设置齿轮）。

### 24. `DiffViewer` (AI 代码差异对比)
- **Props**: `lines?: Array<{ type: 'add'|'remove'|'context', content: string }>`（旧 API 保留）, `files?: Array<{ filename: string, language?: string, lines: DiffLine[] }>`（多文件 API）, `filename?: string`, `language?: string`, `contextSize?: number`（默认 3）, `showLineNumbers?: boolean`（默认 true）, `className?: string`
- **Vanilla 用法**: `<diff-viewer filename="src/app.ts" language="ts">`，数据经 `lines` 或 `files` 属性注入；全量实体转义防注入
- **特性**: 增行绿底/删行红底/上下文中性，`+`/`-` 槽位符号，头部 +/- 统计徽章，新旧双列行号；`files` 传入时渲染多文件 tab 栏（每 tab 带 +/- 计数），长上下文段折叠为 "⋯ N unchanged lines" 行，点击展开隐藏行（含正确行号）并可再收起，`contextSize` 控制两侧保留行数。

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

### 32. `PricingTable` (SaaS 定价三列卡)
- **Props**: `plans: Array<{ name, price, period?, description?, features: string[], highlighted?, badge?, ctaText? }>`, `onSelect?: (plan) => void`, `className?: string`
- **Vanilla 用法**: `<pricing-table>`，数据经 `plans` 属性注入；事件 `select`（detail 为被点击的 plan）
- **特性**: `md:grid-cols-3`，推荐列 `ring-2 ring-indigo-600` + `-top-3` 徽章（默认 "Most popular"）；价格大字 + `/period`；功能清单 ✓ 用 emerald；推荐列实心 CTA、其余描边。

### 33. `StatCard` (仪表盘统计卡)
- **Props**: `label`, `value`, `delta?: number`（环比 %，正负色）, `deltaLabel?: string`, `trend?: number[]`（零依赖 polyline 迷你趋势线）, `icon?: UiIconName`, `className?: string`
- **Vanilla 用法**: `<stat-card label="Requests" value="12.4k" delta="8.2" trend="[3,5,4,7]">`，`trend` 传 JSON 数组
- **特性**: 正 delta 显示 `+N%` 配 trending-up/emerald，负值配 trending-down/red；无 `trend` 时不渲染 sparkline。

### 34. `DataTable` (数据表)
- **Props**: `columns: Array<{ key, label, align?, width? }>`, `rows: Record<string, any>[]`, `selectable?: boolean`, `onSort?: (key, direction) => void`, `actions?: Array<{ label, icon?, onClick }>`, `emptyText?: string`, `className?: string`
- **Vanilla 用法**: `<data-table selectable>`，`columns`/`rows`/`actions` 属性注入；事件 `sort` / `action` / `batch`
- **特性**: 无 `onSort` 时内置升/降序；数字列右对齐 + `tabular-nums`；行操作 `group-hover` 才显现；多选时底部 `fixed bottom-6` 胶囊批量条。

### 35. `AgentRunLog` (Agent 执行日志)
- **Props**: `steps: Array<{ id, label, status: 'pending'|'running'|'done'|'error', detail?, durationMs? }>`, `title?: string`, `autoExpandRunning?: boolean`, `className?: string`
- **Vanilla 用法**: `<agent-run-log title="Deploy">`，数据经 `steps` 属性注入；事件 `toggle`（detail `{ id, expanded }`）
- **特性**: 状态图标（pending 时钟 / running 旋转 loader / done 勾 / error 叉）+ 竖向连接线；`formatDuration` 输出 `240ms` / `1.5s`；running 步骤默认展开深色终端 `detail`，点击折叠。

### 36. `AuthForm` (登录/注册表单)
- **Props**: `mode?: 'signin'|'signup'`, `providers?: Array<{ name, icon? }>`, `loading?`, `error?`, `title?`, `subtitle?`, `submitText?`, `footerText?`, `onSubmit?: ({ name?, email, password }) => void`, `onProviderClick?`, `onFooterClick?`, `className?`
- **Vanilla 用法**: `<auth-form mode="signup">`，`providers` 属性注入；事件 `submit` / `provider` / `footer`
- **特性**: SSO 按钮（`icon` 为图片 URL，缺省用首字母方块兜底）→ "or" 分隔 → 邮箱/密码（signup 多一个 name）；`error` 走 `role="alert"` 行内条；`loading` 时按钮禁用并显示 spinner；原生 `<form>` 提交，Enter 可用。

### 37. `SettingsPanel` (设置页框架)
- **Props**: `sections: Array<{ id, title, icon?, description?, items: Array<{ id, label, description?, value?, actionText? }> }>`, `activeId?`, `saving?`, `saveText?`, `onSectionChange?`, `onItemAction?`, `onSave?`, `className?`
- **Vanilla 用法**: `<settings-panel>`，`sections` 属性注入；事件 `section-change` / `item-action` / `save`；`allow-save="false"` 隐藏底部保存行
- **特性**: 左列锚点导航（窄屏横向滚动，`aria-current="page"` 标记当前项），右列分节卡片；行右侧 `value` + inline action link；底部 Save 行 `saving` 时 spinner + 禁用。当前分区由组件内部维护（受 `active-id` 初始化）。

### 38. `OnboardingChecklist` (激活任务清单)
- **Props**: `tasks: Array<{ id, title, description?, done, actionText? }>`, `title?: string`（默认 `'Get started'`）, `onToggle?`, `onTaskAction?`, `className?`
- **Vanilla 用法**: `<onboarding-checklist>`，`tasks` 属性注入；事件 `toggle` / `action`
- **特性**: 头部 done/total + 进度条 + `N% complete · M left`；完成项绿勾实心 + 划线置灰；未完成项显示 `actionText`；全部完成时换成 emerald "All set — nothing left to do."。

### 39. `UpgradePromptCard` (用量升级提示卡)
- **Props**: `used: number`, `limit: number`, `planName?: string`, `features?: string[]`, `onUpgrade?: () => void`, `className?: string`
- **Vanilla 用法**: `<upgrade-prompt-card used="820" limit="1000">`，数据经属性注入；事件 `upgrade`
- **特性**: 阈值分档配色（≥90% 红 / ≥70% 琥珀 / 其余绿），百分比安全钳制（limit≤0 不产生 NaN），`formatNumber` 千分位，权益清单 + 升级 CTA。

### 40. `ConfirmDialog` (危险操作确认弹窗)
- **Props**: `isOpen: boolean`, `title: string`, `description?`, `confirmText?`（默认 `'Confirm'`）, `cancelText?`（默认 `'Cancel'`）, `tone?: 'danger' | 'warning' | 'default'`, `requireText?: string`, `loading?`, `onConfirm?`, `onCancel?`, `className?`
- **Vanilla 用法**: `<confirm-dialog open title="Delete?" tone="danger">`；事件 `confirm` / `cancel`（组件不自关闭，由宿主移除 `open`）
- **特性**: 三档 tone 决定图标胶囊与主按钮配色；`requireText` 开启输入校验闸门（精确匹配才解锁确认键）；`loading` 同时禁用双按钮并忽略 Esc / 遮罩点击；Esc 与遮罩点击均触发 `cancel`，重开时自动清空已输入校验文本。

### 41. `ShortcutsOverlay` (键盘快捷键面板)
- **Props**: `isOpen: boolean`, `groups?: ShortcutGroup[]`, `shortcuts?: ShortcutItem[]`, `title?`, `placeholder?`, `onClose?`, `className?`
- **Vanilla 用法**: `<shortcuts-overlay open>`，`groups` / `shortcuts` 属性注入；事件 `close`
- **特性**: 传 `groups` 直接用，传扁平 `shortcuts` 则按 `item.group` 自动分桶（缺省 "General"）；搜索框同时匹配标签与键位文本；`kbd` 键帽渲染；Esc / 遮罩 / 关闭按钮统一派发 `close`，重开时清空搜索词。

### 42. `FileDropzone` (拖拽上传区)
- **Props**: `files?: DropzoneFile[]`, `accept?: string`, `maxSizeMb?: number`, `multiple?: boolean`, `hint?: string`, `disabled?: boolean`, `onFiles?`, `onReject?`, `onRemove?`, `className?`
- **Vanilla 用法**: `<file-dropzone accept="image/*,.pdf" max-size-mb="2" multiple>`，`files` 属性注入；事件 `files` / `reject` / `remove`
- **特性**: 拖拽、点击、Enter/Space 三通道触发；`accept` 支持扩展名、精确 MIME 与 `type/*` 通配；超限文件走 `reject` 并在 `role="alert"` 行提示；文件行显示格式化体积与移除按钮；导出 `matchesAccept` / `formatBytes` 供宿主复用。

### 43. `NotificationCenter` (通知收件箱)
- **Props**: `isOpen: boolean`, `notifications?: NotificationItem[]`, `title?`, `emptyText?`, `showFilter?`, `onSelect?`, `onMarkRead?`, `onMarkAllRead?`, `onClose?`, `className?`
- **Vanilla 用法**: `<notification-center open>`，`notifications` 属性注入；事件 `select` / `mark-read` / `mark-all-read` / `close`
- **特性**: 未读角标 `N new`；All / Unread 过滤带行内计数；点击未读项先派发 `mark-read` 再派发 `select`；无未读时 "Mark all read" 自动禁用；info/success/warning/error 四档图标胶囊；空态文案可配。

### 44. `CommentThread` (嵌套评论区)
- **Props**: `comments?: CommentItem[]`, `placeholder?`, `submitText?`, `allowComment?`, `emptyText?`, `onSubmit?`, `onLike?`, `onResolve?`, `className?`
- **Vanilla 用法**: `<comment-thread placeholder="Leave a review…">`，`comments` 属性注入；事件 `submit`（`{text, parentId}`）/ `like` / `resolve`
- **特性**: 扁平数组 + `parentId` 自动嵌套（最多 3 层，超出平铺）；首字母头像兜底；点赞计数、行内回复框、Resolve/Reopen 切换；根评论 composer 与回复 composer 共用 `submit` 事件，`parentId` 为 `null` 表示根级。

### 45. `DatePicker` (日期选择器)
- **Props**: `value?: string`, `min?: string`, `max?: string`, `weekStartsOn?: 0 | 1`, `showToday?: boolean`, `disabled?: boolean`, `onChange?`, `className?`
- **Vanilla 用法**: `<date-picker value="2026-11-14" min="2026-11-05" max="2026-12-20">`；事件 `change`（detail 为 `YYYY-MM-DD`）
- **特性**: 月网格自动补齐首尾空位；`min`/`max` 按 ISO 字符串比较禁用越界日；`weekStartsOn` 切换周起始列；Today 按钮在越界时静默不派发；选中日 `aria-pressed="true"`。

### 46. `KanbanBoard` (看板拖拽)
- **Props**: `columns?: KanbanColumn[]`, `cards?: KanbanCard[]`, `onMoveCard?`, `onCardClick?`, `onAddCard?`, `className?`
- **数据结构**: `KanbanColumn { id, title, accent?, limit? }`；`KanbanCard { id, columnId, title, description?, tags?, assignee?, priority?: 'low'|'medium'|'high' }` —— 扁平数组 + `columnId` 外键，不做嵌套。
- **Vanilla 用法**: `<kanban-board>`，`columns` / `cards` 属性注入；事件 `move-card`（detail `{cardId, from, to}`）/ `card-click`（detail 为卡片）/ `add-card`（detail 为列 id）
- **特性**: HTML5 拖放（`dataTransfer` 传卡片 id）+ 卡片聚焦后 ArrowLeft/ArrowRight 键盘移动；列头 accent 圆点 + `n/limit` 或 `n` 计数；空列显示 "Drop cards here"；优先级三档色胶囊、标签 chip、负责人首字母头像；同列拖放不派发事件。

### 47. `SideDrawer` (侧滑抽屉)
- **Props**: `isOpen: boolean`, `title: string`, `description?`, `side?: 'left'|'right'`, `size?: 'sm'|'md'|'lg'`, `onClose?`, `footer?: ReactNode`, `children?`, `className?`
- **Vanilla 用法**: `<side-drawer open title="Filters" side="left" size="lg">`，light-DOM 子节点自动搬入 body，`slot="footer"` 子节点搬入 footer；事件 `close`
- **特性**: 关闭时渲染空（不占 DOM）；`role="dialog"` + `aria-modal="true"`；Esc / 遮罩 / 关闭按钮三通道派发 `close`（关闭状态下 Esc 静默）；`sm`/`md`/`lg` 对应 `max-w-xs`/`max-w-md`/`max-w-xl`；左侧抽屉用 `mr-auto border-r` 贴左。

### 48. `AccountSwitcher` (工作区切换)
- **Props**: `accounts?: Account[]`, `currentId?`, `onSwitch?`, `onAddAccount?`, `onSignOut?`, `onOpenChange?`, `className?`
- **数据结构**: `Account { id, name, email?, avatar?, role?, plan? }`
- **Vanilla 用法**: `<account-switcher current-id="a1">`，`accounts` 属性注入；事件 `switch`（detail 为账号）/ `add-account` / `sign-out` / `open-change`（detail 为 boolean）
- **特性**: 触发器展示当前账号（头像/首字母 + 名称 + 邮箱）；`currentId` 找不到时回退到第一个账号，无账号时渲染空；菜单行 `role="menuitemradio"` + `aria-checked`，meta 为 `role · plan`；选择/添加/登出后自动收起；document 级 mousedown 外点与 Esc 关闭。

### 49. `SchedulerSlots` (预约时间段)
- **Props**: `date: string`, `slots?: SchedulerSlot[]`, `selectedId?`, `timezone?`, `onSelect?`, `className?`
- **数据结构**: `SchedulerSlot { id, time: 'HH:MM', available?, note? }`
- **Vanilla 用法**: `<scheduler-slots date="2026-11-20" timezone="GMT+8" selected-id="s2" empty-text="Fully booked">`，`slots` 属性注入；事件 `select`（detail 为时段）
- **特性**: 按 6–12 / 12–17 / 17–24 分上午/下午/晚上三组，空组自动隐藏；`HH:MM` 转 12 小时制（`9:00 AM` / `6:30 PM`）；头部 `n open` 统计排除 `available: false`；不可约时段 `disabled` + 删除线 + 锁图标且点击不派发；组内 `note` 汇总为一行小字；空态文案可配（vanilla `empty-text`）。

### 50. `RichToolbar` (富文本工具条)
- **Props**: `groups?: RichToolbarGroup[]`, `onAction?: (id: string) => void`, `className?`
- **数据结构**: `RichToolbarGroup { id, label?, items: RichToolbarItem[] }`；`RichToolbarItem { id, label, icon?, text?, shortcut?, active?, disabled? }`
- **Vanilla 用法**: `<rich-toolbar>`，`groups` 属性注入；事件 `action`（detail 为 item id）
- **特性**: 组间竖线分隔，`role="toolbar"` + 每组 `role="group"`；`icon` 与 `text` 二选一（`text` 渲染为 B/I/U 这类字形）；`active` 加 `aria-pressed` 并高亮 indigo；`disabled` 降透明度且点击不派发；`shortcut` 拼进 `title` tooltip；全部按钮带 `aria-label`。

### 51. `HeroSection` (营销 Hero)
- **Props**: `eyebrow?`, `title: string`, `description?`, `primaryCta?`, `secondaryCta?`, `highlights?: string[]`, `align?: 'left'|'center'`, `onPrimary?`, `onSecondary?`, `className?`
- **Vanilla 用法**: `<hero-section title="..." eyebrow="New" primary-cta="Start" secondary-cta="Docs" align="left">`，`highlights` 属性注入；事件 `primary` / `secondary`
- **特性**: eyebrow 为 sparkles 图标胶囊；标题 `text-3xl sm:text-4xl tracking-tight`；主 CTA 实心 indigo、次 CTA 描边；`highlights` 用 emerald 勾选列表；`align="center"`（默认）居中，`left` 左对齐；无 CTA 文案时不渲染按钮行。

### 52. `FooterSection` (营销页脚)
- **Props**: `brand?`, `tagline?`, `columns?: FooterColumn[]`, `socials?: {label, icon?}[]`, `copyright?`, `onLinkClick?`, `className?`
- **数据结构**: `FooterColumn { title, links: {label, href?}[] }`
- **Vanilla 用法**: `<footer-section brand="Acme" tagline="..." copyright="© 2026 Acme">`，`columns` / `socials` 属性注入；事件 `link-click`（detail 为完整 link 对象）
- **特性**: 左侧品牌块（layers 图标 + 名称 + tagline）+ 右侧 2/3 列链接网格；底部条含版权（缺省自动生成 `© <year> <brand>`）与社交图标按钮（`aria-label` 取 label，icon 缺省 globe）；链接用 `<button>` 以便宿主接管路由。

### 53. `TestimonialGrid` (客户证言)
- **Props**: `testimonials?: Testimonial[]`, `columns?: 2 | 3`, `onSelect?`, `className?`
- **数据结构**: `Testimonial { id, quote, name, role?, company?, avatar?, rating? }`
- **Vanilla 用法**: `<testimonial-grid columns="3">`，`testimonials` 属性注入；事件 `select`（detail 为证言对象）
- **特性**: `columns` 2/3 切换网格列数；`rating` 1–5 渲染 5 颗星（超出部分灰显，含 `aria-label`），为 0 时隐藏星级行；有 `avatar` 用图片，否则取姓名首字母头像；署名 meta 为 `role, company`；空数组显示 "No testimonials yet." 虚线空态。

### 54. `VoiceModePanel` (语音对话面板)
- **Props**: `state?: 'idle' | 'listening' | 'thinking' | 'speaking'`, `transcript?`, `reply?`, `onToggle?`, `onEnd?`, `className?`
- **Vanilla 用法**: `<voice-mode-panel state="listening" transcript="..." reply="..." show-end>`；事件 `toggle`（点击光球）与 `end`（结束会话按钮）
- **特性**: 三层同心光环 + 中心光球，`listening` / `speaking` 时外环 `animate-ping`、`thinking` 时内环 `animate-pulse`；9 根波形条用 `animate-[voice-bar_...]` 逐条 `animation-delay` 错峰（宿主需提供 `voice-bar` keyframes，gallery 已在 tailwind.config 中注册）；光球图标 idle 为 `mic`、其余为 `square`，`aria-label` 在 Start/Stop 间切换并带 `aria-pressed`；转写用引号包裹，回复用 indigo 强调；`onEnd` / `show-end` 缺省时不渲染结束按钮。

### 55. `PromptLibrary` (提示词库)
- **Props**: `prompts?: PromptItem[]`, `categories?: string[]`, `searchable?: boolean`（默认 true）, `onUse?`, `onToggleFavorite?`, `className?`
- **数据结构**: `PromptItem { id, title, description?, prompt, category?, tags?, favorite? }`
- **Vanilla 用法**: `<prompt-library searchable>`，`prompts` / `categories` 属性注入；事件 `use` 与 `toggle-favorite`（detail 均为完整 prompt 对象）
- **特性**: 分类胶囊 = `categories` 与 prompts 中出现的 category 去重合并，首项固定 `all`，选中项 `aria-pressed`；搜索对 title / description / prompt / tags 做小写包含匹配，与分类筛选叠加；卡片含收藏星标（`aria-pressed` + 动态 `aria-label`）、等宽提示词预览、最多 3 个标签、Use 按钮；无匹配时显示 "No prompts match your filters."；Vanilla 端只重渲染 chips + 列表区域，保持搜索框焦点。

### 56. `Tabs` (标签页)
- **Props**: `tabs: TabItem[]`, `activeId?`（受控）, `defaultActiveId?`, `variant?: 'underline' | 'pills'`, `onChange?(id)`, `ariaLabel?`, `className?`
- **数据结构**: `TabItem { id, label, icon?, badge?, disabled? }`
- **Vanilla 用法**: `<tabs-bar active-id="overview" variant="pills">`，`tabs` 属性注入；事件 `change`（detail `{ id }`）
- **特性**: `role="tablist"` + 每个 `role="tab"`，`aria-selected` 与 roving `tabindex`（选中 0、其余 -1）；ArrowLeft/Right 循环、Home/End 跳首尾，均跳过 disabled 并同步移动焦点；`active-id` 存在时完全受控（点击只发事件不改内部态）；badge 为独立胶囊，disabled 用 `disabled` + `opacity-40`。

### 57. `Accordion` (折叠面板)
- **Props**: `items: AccordionItem[]`, `allowMultiple?`（默认 false）, `defaultOpenIds?`, `onToggle?(id, open)`, `className?`
- **数据结构**: `AccordionItem { id, title, description?, content, icon?, defaultOpen? }`
- **Vanilla 用法**: `<accordion-list allow-multiple default-open-ids='["a"]'>`，`items` 属性注入；事件 `toggle`（detail `{ id, open }`）
- **特性**: 单开模式打开新面板会关闭旧面板，`allow-multiple` 时累加；触发器为 `<h3><button>`，带 `aria-expanded` / `aria-controls`，面板 `role="region"` + `aria-labelledby`；chevron 用 `rotate-180` 过渡；面板关闭时不渲染 DOM。

### 58. `AvatarGroup` (头像组)
- **Props**: `members: AvatarMember[]`, `max?`（默认 4）, `size?: 'sm' | 'md' | 'lg'`, `onMemberClick?(member)`, `className?`
- **数据结构**: `AvatarMember { id, name, src?, status?: 'online' | 'away' | 'offline' }`
- **Vanilla 用法**: `<avatar-group max="4" size="lg">`，`members` 属性注入；事件 `member-click`（detail 为 member）
- **特性**: `-space-x-2` 叠放 + `ring-2 ring-white` 描边，hover 时 `z-10 scale-105` 浮起；头像内容三级兜底：`src` 图片 → 姓名首字母（最多两词）→ `user` 图标；超出 `max` 显示 `+N` 胶囊；`status` 渲染右下角状态点（emerald / amber / zinc）；每个头像为 `<button>`，`aria-label` 取姓名。

### 59. `FilterBar` (多选筛选条)
- **Props**: `filters: FilterDefinition[]`, `selected?: Record<string, string[]>`, `onChange?(selected)`, `onClear?`, `className?`
- **数据结构**: `FilterDefinition { id, label, options: { value, label, count? }[] }`
- **Vanilla 用法**: `<filter-bar>`，`filters` / `selected` 属性注入；事件 `change`（detail 为完整选中映射）与 `clear`
- **特性**: 每个筛选是一个胶囊按钮，展开后为复选列表（`aria-pressed` + 勾选框），选中项计数显示在胶囊内；有选中时出现 Clear all；`aria-expanded` 标记展开态；点击外部或按 Esc 关闭；选中映射中空数组会被删除，保持对象干净。

### 60. `Tooltip` (悬浮提示)
- **Props**: `content: string`, `side?: 'top' | 'bottom' | 'left' | 'right'`（默认 top）, `children`, `className?`
- **Vanilla 用法**: `<tooltip-hint content="Copy" side="right"><button>…</button></tooltip-hint>`，light DOM 子节点即触发器
- **特性**: 外层 `group relative inline-flex`，气泡绝对定位并按 `side` 选择四组偏移类；`opacity-0` → `group-hover:opacity-100` / `group-focus-within:opacity-100` 纯 CSS 显隐；`aria-describedby` 指向气泡 id（React 用 `useId`，Vue 用 `useId`，Vanilla 用模块自增 id）；Vanilla 每次渲染前收集除气泡外的子节点并重新插入，保证 light DOM 内容跨重渲染存活。

### 61. `Breadcrumb` (面包屑)
- **Props**: `items: BreadcrumbItem[]`, `maxItems?`（默认 0 = 不折叠）, `onNavigate?(item, index)`, `ariaLabel?`, `className?`
- **数据结构**: `BreadcrumbItem { id?, label, href?, icon? }`
- **Vanilla 用法**: `<breadcrumb-trail max-items="4">`，`items` 属性注入；事件 `navigate`（detail `{ item, index }`）
- **特性**: `<nav aria-label>` + `<ol>`，项间 `chevron-right` 分隔；末项为 `<span aria-current="page">` 不可点击；有 `href` 渲染 `<a>`（有 `onNavigate` 时 `preventDefault` 后回调），否则渲染 `<button>`；`maxItems` 超长时保留首项 + 省略号 + 末尾 N 项。

### 62. `Pagination` (分页器)
- **Props**: `page`（1 起）, `pageCount`, `onChange?(page)`, `siblingCount?`（默认 1）, `showEdges?`（默认 true）, `ariaLabel?`, `className?`
- **Vanilla 用法**: `<pagination-bar page="5" page-count="12" sibling-count="1" show-edges="false">`；事件 `change`（detail `{ page }`）
- **特性**: 页码集合 = 首页 + 末页 + 当前页 ± `siblingCount`，排序后间隔 > 1 处插入省略号；首/末页跳转按钮可关；上一页/下一页在边界 `disabled`；当前页 `aria-current="page"` + `bg-indigo-600`；点击同步 `page` 属性并派发事件。

### 63. `AlertBanner` (内联提示条)
- **Props**: `tone?: 'info' | 'success' | 'warning' | 'danger'`（默认 info）, `title`, `description?`, `actionText?`, `onAction?`, `dismissible?`, `onDismiss?`, `className?`
- **Vanilla 用法**: `<alert-banner tone="warning" title="…" description="…" action-text="Retry" dismissible>`；事件 `action` 与 `dismiss`
- **特性**: 四色映射图标（info / check-circle / alert-triangle / circle-x）与浅底 + 深色模式底色；info/success 用 `role="status"`，warning/danger 用 `role="alert"`；动作按钮与关闭按钮按需渲染，关闭按钮 `aria-label="Dismiss"`。


## LLMs 专属摄取通道
- 紧凑索引: [`llms.txt`](./llms.txt)
- 全量单文件源码: [`llms-full.txt`](./llms-full.txt)（单文件打包所有 React / Vue / Vanilla 源码，供 Agent 一次性载入上下文）