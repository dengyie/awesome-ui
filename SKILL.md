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
- **`docs/component-roadmap-v1.md`**：v1 任务书（已收官）。
- **`docs/roadmap-v2-candidates.md`**：v2 候选与批次执行记录（已收官）。
- **`docs/roadmap-v3-candidates.md`**：**v3 候选报告（当前活跃）**——储备池 8+5 新组件候选 + P1 增强 + 素材按需扩容策略。
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

### 64. `ComboBox` (可搜索下拉)
- **Props**: `options: ComboBoxOption[]`, `placeholder?`, `emptyText?`, `onChange?(value)`, `className?`
- **数据结构**: `ComboBoxOption { value, label, description?, icon? }`
- **Vanilla 用法**: `<combo-select placeholder="Pick a model…">`，`options` 属性注入；事件 `change`（detail `{ value }`）
- **特性**: 输入过滤（label 与 description 小写包含）；`role="combobox"` + `aria-controls`/`aria-expanded`；↑↓ 移动 active（indigo 高亮）、Enter 选中、Esc/外点关闭；选中后回填输入框并显示 check；有 query 时出现清空按钮。

### 65. `Navbar` (导航栏 / Mega Menu)
- **Props**: `brand`, `links?: NavbarLink[]`, `menus?: NavbarMenu[]`, `ctaText?`, `onCtaClick?`, `className?`
- **数据结构**: `NavbarLink { id?, label, href?, icon?, badge? }`；`NavbarMenu { id, label, columns: [{ heading?, links }] }`
- **Vanilla 用法**: `<nav-bar brand cta-text>`，`links` / `menus` 属性注入；事件 `cta`
- **特性**: 菜单按钮 `aria-expanded` + chevron 旋转；面板为多列 flex（栏目标题 uppercase 小字、链接带图标与徽标胶囊）；一次只开一个菜单；外点与 Esc 关闭；CTA 独立发事件。

### 66. `ActivityFeed` (活动时间线)
- **Props**: `entries: ActivityEntry[]`, `title?`, `className?`
- **数据结构**: `ActivityEntry { id, kind: 'event'|'comment'|'merge'|'deploy'|'flag'|'alert', actor, action, target?, time, detail? }`
- **Vanilla 用法**: `<activity-feed title="Recent activity">`，`entries` 属性注入
- **特性**: `<ol>` + `before:` 竖向连接线；每行色标圆点（六类事件映射六组 `bg-*-100`/`dark:bg-*-950/60`）+ ring 描边；actor 加粗、action 正文、target 为等宽胶囊；detail 次行弱化；右对齐 `<time>` 相对时间；未知 kind 回落 event 样式。

### 67. `UsageMeter` (用量条)
- **Props**: `label`, `used`, `limit`, `unit?`, `showLegend?`（默认 true）, `className?`
- **Vanilla 用法**: `<usage-meter label used limit unit show-legend="false">`
- **特性**: `usageTone()` 阈值：<70% indigo、70–90% amber、≥90% rose（`limit<=0` 视为 danger）；标题行右侧百分比、下方 `used / limit unit`（`toLocaleString`）；剩余额例 `remaining left`，归零换 `Limit reached`；条宽 = `ratio*100%`，`transition-[width]` 动画。


### 68. `ToggleSwitch` (开关)
- **Props**: `checked: boolean`, `onChange?`, `label?`, `description?`, `disabled?`, `size?: 'sm'|'md'`
- **Vanilla 用法**: `<toggle-switch label="…" description="…" checked size="sm">`，事件 `change` (`detail.checked`)
- **特性**: `role="switch"` + `aria-checked`；sm 轨道 `h-4 w-8` / md `h-5 w-9`，knob 位移 `translate-x`；有 label/description 时用 `<label>` 纵排布局；禁用态降透明度并拦截点击。

### 69. `Stepper` (步骤条)
- **Props**: `steps: Step[]`, `current?: number`（1-based）, `onStepClick?`, `static?`
- **数据结构**: `Step { id, label, description?, status?: 'complete'|'current'|'upcoming'|'error' }`
- **Vanilla 用法**: `<step-flow current="2">`，`steps` 属性注入，`static` 禁点，事件 `step-click` (`detail.step/index`)
- **特性**: `statusFor()` 推导缺省状态；complete = indigo 实心 + 勾、current = indigo 描边 + `aria-current="step"`、error = rose 实心 + 叉；前置 complete 时连接线着 indigo；仅非 upcoming 可点击回跳。

### 70. `SearchInput` (搜索框)
- **Props**: `value?`（受控）/`defaultValue?`、`placeholder?`、`shortcut?`、`loading?`、`autoFocus?`、`onChange?/onSearch?/onClear?`
- **Vanilla 用法**: `<search-field placeholder="…" shortcut="⌘K" loading>`，事件 `change`/`search`/`clear`
- **特性**: 受控/非受控双模式；后缀优先级 loading 菊花 > 清空按钮 > ⌘K kbd 提示；Enter 触发 search、Escape 且有值时清空并 onClear + 焦点回归；`focus-within` 边框/ring 强调。

### 71. `Tag` (标签)
- **Props**: `label`, `tone?` (neutral/indigo/emerald/amber/rose/sky), `size?: 'sm'|'md'`, `icon?`, `removable?`, `clickable?`, `onClick?`
- **Vanilla 用法**: `<ui-tag label="Beta" tone="indigo" removable clickable>`，事件 `remove`/`tag-click`
- **特性**: 六色调 `bg-*-50 text-*-700 dark:bg-*-950/60`；sm `text-[9.5px]` / md `text-[10.5px]` 圆角胶囊；removable 渲染移除钮（stopPropagation）；onClick / clickable 时渲染为 `<button>`；未知 tone 回落 neutral。

### 72. `Modal` (模态对话框)
- **Props**: `open`, `title`, `description?`, `dismissible?=true`, `showClose?=true`, `onClose?`；children 正文 + `slot="footer"` 页脚
- **Vanilla 用法**: `<modal-dialog title="…" description="…">`，`open` 属性/property，`dismissible="false"`/`show-close="false"` 可关，事件 `close`
- **特性**: `fixed inset-0 z-50` 遮罩 + `bg-zinc-950/50 backdrop-blur-[2px]`；`role="dialog" aria-modal="true"`；Escape（document 级）/遮罩 mousedown（面板外）/关闭钮三种关闭路径；关闭后移除 DOM；footer 渲染在 `bg-zinc-50` 分隔条内。

### 73. `ProfileHeader` (个人资料头)
- **Props**: `name`, `handle?`, `headline?`, `avatarUrl?`/`initials?`, `coverClass?`, `stats?: {label,value}[]`, `actions?: {label, variant?}[]`, `statusText?`, `statusTone?: ok|away`, `tabs?`, `activeTab?`, `onTabChange?`, `onAction?`
- **Vanilla 用法**: `<profile-header name="…" handle="…" tabs="A,B,C" active-tab="B">`，`stats`/`actions` 为 property，事件 `action`（detail `{label, variant}`）/`tab-change`（detail `{tab}`）
- **特性**: 渐变封面（默认 `from-indigo-500 via-violet-500 to-sky-400`）+ Pro 胶囊；头像 `-mt-8` 叠压、无图时姓名首字母回落；`bg-emerald-500`/`bg-zinc-400` 状态点；`<dl>` 统计组；页签 `aria-current="page"`。

### 74. `BillingPanel` (账单面板)
- **Props**: `planName`, `period?: monthly|annual`, `onPeriodChange?`, `price`, `priceSuffix?`, `features?`, `lineItems?: {label, amount, emphasized?}[]`, `ctaLabel`, `onCta?`, `note?`
- **Vanilla 用法**: `<billing-panel plan-name="…" price="…" cta-label="…" features="A,B,C" line-items='[{"label":"Total","amount":"$238.05","emphasized":true}]'>`，事件 `period-change`（detail `{period}`）/`cta`
- **特性**: 月付/年付双钮 `aria-pressed` 切换；emerald 勾选图标功能清单；`<dl>` 明细行，emphasized 行 `border-t + font-semibold`；indigo CTA；`bg-sky-50` 信息注脚。

### 75. `StepSlider` (离散步进滑杆)
- **Props**: `steps: string[]`, `value?`（0-based）, `onChange?(index, step)`, `highlightFrom?`, `label?`, `disabled?`
- **Vanilla 用法**: `<step-slider steps="+0k,+1k,+5k,+10k" value="1" highlight-from="2" label="…">`，事件 `change`（detail `{index, step}`）
- **特性**: `role="slider"` + `aria-valuemin/max/now/valuetext`；←→/Home/End 键盘；已到达停靠点 `border-indigo-600 bg-indigo-600`；填充轨 `width: ratio%`；highlight-from 及之后停靠点 indigo-300 前瞻高亮；标签等宽字体。

### 76. `InboxList` (收件箱列表)
- **Props**: `messages: {id, sender, count?, subject, snippet?, dateLabel, unread?, tag?, tagTone?: rose|emerald|indigo}[]`, `emptyText?`, `onSelect?`
- **Vanilla 用法**: `<inbox-list active-id="2" empty-text="…">`，`messages` 为 property，事件 `select`（detail `{message}`）
- **特性**: 未读圆点 `bg-indigo-500`；发送者固定列 `w-36` 截断；标签胶囊 `font-mono text-[9.5px]` 三色调；主题（未读加粗）+ 摘要 zinc-400；等宽大写日期；`role="button"` 行 + active-id `bg-indigo-50/70` 高亮；空态文案。

### 77. `ChangelogFeed` (更新日志流)
- **Props**: `title?`（默认 "Latest updates"）, `entries: {id, badge?, badgeTone?: rose|emerald|indigo|amber, title, detail?}[]`, `onSelect?`, `footerLink?`, `onFooterClick?`, `emptyText?`
- **Vanilla 用法**: `<changelog-feed title="…" footer-link="…" selectable>`，`entries` 为 property，事件 `select`（detail `{entry}`）/`footer-click`
- **特性**: sparkles 图标头部；`<ol>` divide-y 条目列表，徽标四色调胶囊；`selectable` 属性启用行 `role="button"`；footer 链接 `text-indigo-600 hover:bg-indigo-50`；空态文案。


### 78. `MetricStrip` (指标条带)
- **Props**: `metrics: {label, value, delta?, deltaLabel?, icon?}[]`, `activeIndex?`, `onMetricClick?`
- **Vanilla 用法**: `<metric-strip active-index="0">`，`metrics` 为 property，事件 `metric-click`（detail `{index, metric}`）
- **特性**: `role="group"` divide-x 单行条带；单元格 `role="button"` + Enter/Space；delta 三色调（正 emerald / 负 rose / 平 zinc）+ trending-up/down/minus 图标，`+N%` 或自定义 `deltaLabel`；活动单元格 `bg-zinc-50` + `aria-current`；空 metrics 不渲染。

### 79. `RankList` (排行榜列表)
- **Props**: `items: {label, value, ratio?, icon?}[]`, `title?`, `valueHeader?`, `showRatio?`, `maxItems?`, `emptyText?`, `onSelect?`
- **Vanilla 用法**: `<rank-list title="…" value-header="…" show-ratio max-items="5" selectable>`，`items` 为 property，或设 `onSelect` 函数属性；事件 `select`（detail `{index, item}`）
- **特性**: 峰值归一比率条 `calc((100% - 1rem) * N)`（4% 下限）；`<ul>` divide-y 行 + 等宽数值列；`value-header` 大写列头；`max-items` 截断；`selectable`/`onSelect` 启用 `role="button"` 行；空态文案。

### 80. `SideNav` (侧边导航)
- **Props**: `groups: {title?, items: {id, label, icon?, count?}[]}[]`, `activeId?`, `heading?`, `onNavigate?`
- **Vanilla 用法**: `<side-nav heading="Workspace" active-id="overview" groups='[{"title":"Main","items":[{"id":"overview","label":"Overview","icon":"eye"}]}]'>`（`groups` 也接受 property），事件 `navigate`（detail `{id, entry}`）
- **特性**: 大写分组标题；条目图标 + 截断标签；计数徽标（>0 玫红 / 0 灰）；活动条目 `bg-indigo-50` + `aria-current="page"`；JSON 解析失败回退为空导航。

### 81. `PageHeader` (页头)
- **Props**: `title`, `description?`, `statusText?`, `actions?: {label, variant?: primary|secondary|ghost, icon?}[]`, `tabs?: {label, count?}[]`, `activeTab?`, `onAction?`, `onTabChange?`
- **Vanilla 用法**: `<page-header title="…" description="…" status-text="Live" active-tab="Overview">`，`actions`/`tabs` 为 property（也接受同名 JSON 属性），事件 `action`（detail `{label, variant}`）/`tab-change`（detail `{label, count}`），tab 点击同步 `active-tab`
- **特性**: 标题 + emerald Live 状态胶囊 + 描述；动作按钮三变体；下划线式页签 + 计数徽标；`aria-current="page"` 活动页签。

### 82. `TimeframePicker` (时间范围选择器)
- **Props**: `presets?`（默认 ["Today","7d","30d","90d","12mo"]）, `value?`, `rangeLabel?`, `disabled?`, `onChange?`, `onStep?`
- **Vanilla 用法**: `<timeframe-picker value="30d" range-label="Oct 15 – Nov 14" presets="24h,7d,30d" disabled>`，事件 `change`（detail `{value}`）/`step`（detail `{direction, value}`）
- **特性**: `aria-pressed` 分段预设控件；chevron 前后步进按钮 + 日历区间标签；`disabled` 全控件禁用 + `opacity-50`；value 缺省回退首个 preset。


### 83. `WizardSteps` (表单向导步骤)
- **Props**: `steps: {label, hint?, optional?}[]`, `current`, `variant?: vertical|bar`, `nextLabel?`, `onStepClick?`
- **Vanilla 用法**: `<wizard-steps current="1" variant="bar">`，`steps` 为 property，事件 `step-click`（detail `{index, step}`）；`onStepClick` 函数属性为可选附加回调
- **特性**: 竖向三态（done emerald 打勾 / active 黑圆 / todo 灰描边）+ 连接线；`(Optional)` 标注 + hint；仅 ≤current 的步骤可点击（回跳），vanilla 中事件始终触发（回调可选）；bar 变体输出 "N of M steps | Next: …" + violet `role="progressbar"`。

### 84. `FormField` (表单字段骨架)
- **Props**: `label`, `htmlFor?`, `required?`, `optional?`, `hint?`, `error?`, `counter?: {value, max}`, `helperFooter?`, `children`
- **Vanilla 用法**: `<form-field label="Policy name" required counter-value="19" counter-max="70" error="…">`（控件放默认插槽）
- **特性**: 必填 rose 星号 / `(Optional)` 灰字；error（alert-triangle + `aria-invalid`）优先于 hint；`N/M` tabular 计数右对齐；helper 注脚；vanilla 实现移动真实 DOM 节点（重复 render 不丢输入状态）。

### 85. `GanttTimeline` (甘特时间线)
- **Props**: `tasks: {label, start, span, progress?, tone?: indigo|emerald|amber|sky, depth?}[]`, `columns?`, `today?`, `columnLabel?`, `rowLabel?`, `emptyText?`, `onTaskClick?`
- **Vanilla 用法**: `<gantt-timeline columns="10" today="4">`，`tasks` 为 property，事件 `task-click`（detail `{task, index}`）；`onTaskClick` 为可选附加回调
- **特性**: `role="table"` 行列头结构；任务条四色调 + `bg-white/30` 进度覆盖 + 百分比标签；`depth` 缩进（每级 1.25rem）；今日 rose 竖线；空态文案；vanilla 行点击始终触发事件（回调可选）。

### 86. `ApprovalCard` (审批卡)
- **Props**: `title`, `approvers: {initials, tone?}[]`, `approvedCount?`, `dueDate?`, `decision?: approved|rejected|pending`, `note?`, `onApprove?`, `onReject?`, `onRequestChange?`
- **Vanilla 用法**: `<approval-card title="…" approved-count="1" due-date="3 Jun" decision="pending">`，`approvers` 为 property；事件 `approve`/`reject`/`request-change`
- **特性**: 叠压圆形头像（四色调）；`N/M` 等宽计数；决策行三色调（emerald/rose/zinc + 图标）；`decision="pending"` 时总是渲染 Approve/Request change 按钮（vanilla 中属性回调为可选附加）；加人虚线 plus 按钮需设 `onRequestChange`。

### 87. `ResourceList` (资源列表)
- **Props**: `items: {name, path?, kind?, kindTone?: zinc|indigo|emerald|amber, timeLabel?, icon?}[]`, `title?`, `emptyText?`, `maxItems?`, `onSelect?`
- **Vanilla 用法**: `<resource-list title="Recents" max-items="8" selectable>`，`items` 为 property，或设 `onSelect`；事件 `select`（detail `{item, index}`）
- **特性**: 图标方块 + 名称 + mono 路径两行；时间标签 + kind 徽标四色调；头部显示总数；`max-items` 截断；空态文案。

### 88. `SegmentBreakdownBars` (分段条形对比)
- **Props**: `headline`, `headlineUnit?`, `caption?`, `items: {label, value, unit?, delta?, deltaUnit?, tone?: indigo|emerald|amber|sky|rose}[]`, `unit?`
- **Vanilla 用法**: `<segment-breakdown headline="23.19" caption="…">`，`items` 为 property
- **特性**: 左竖线大数字头部；每行「标签 + 圆角横条 + 数值 + pp 增减列」（正绿/负红/零灰）；条宽按最大值归一；底部 share 总计注脚；`role="table"`。

### 89. `TargetGauge` (目标仪表盘)
- **Props**: `value`, `target`, `label?`, `valuePrefix?`, `valueSuffix?`, `zones?: {from, tone?: rose|amber|emerald}[]`, `remainingLabel?`
- **Vanilla 用法**: `<target-gauge value="600" target="700" value-prefix="$" value-suffix="k">`；`zones` 为可选 property
- **特性**: 半圆三段色带（默认 rose 0–60 / amber 60–85 / emerald 85–100）+ 旋转指针（`rotate(-90–90deg)`）+ 值徽章按所在区间着色；起止刻度 + 可选 Remaining 行；隐藏 `data-gauge-percent` 助手。

### 90. `HealthDonutStats` (环形健康卡组)
- **Props**: `cards: {title, caption?, slices: {label, value, tone?: indigo|amber|zinc|emerald|rose}[], action?: {label}}[]`
- **Vanilla 用法**: `<health-donut-stats>`，`cards` 为 property；事件 `action-click`（detail `{index, label}`）
- **特性**: 三列卡片栅格；`conic-gradient` 多段环 + 内圆遮罩中心百分比（主导段占比）；右侧图例逐项色点 + 占比；卡片底部可选操作按钮。

### 91. `ForecastTrendChart` (实际+预测趋势)
- **Props**: `headline`, `unit?`, `deltaLabel?`, `deltaTone?: emerald|rose|zinc`, `note?`, `points: {label, value, forecast?}[]`
- **Vanilla 用法**: `<forecast-trend headline="48.2k" unit="views" delta-label="…">`，`points` 为 property
- **特性**: 头部大数字 + trending 图标涨跌徽章；柱列实色（Actual）vs 虚线边框（Forecast）双态；柱高按最大值归一（min 4%）；底部 Actual/Forecast 图例。

### 92. `GroupedBarCompare` (分组双柱对比)
- **Props**: `rows: {name, estimated, actual, unit?}[]`, `title?`, `legendEstimated?`, `legendActual?`, `unit?`
- **Vanilla 用法**: `<grouped-bar-compare title="…" unit="h">`，`rows` 为 property
- **特性**: 每组成员两根柱（violet 预估 / lime 实际）+ 柱顶数值标签；柱高按全组最大值归一；底部行名；头部双图例；`role="table"`。

### 93. `QuoteMasonry` (引言瀑布墙)
- **Props**: `quotes: {quote, name, role?, company?, marked?}[]`, `columns?: 2|3|4`
- **Vanilla 用法**: `<quote-masonry columns="3">`，`quotes` 为 property
- **特性**: CSS columns 瀑布流（`break-inside-avoid` 防截断）；默认 `“` 引号、`marked:false` 关闭；figcaption 大写姓名 + `role · company` + 公司徽章。

### 94. `SiteFooter` (深色站点页脚)
- **Props**: `columns: {heading, links: {label, href?}[]}[]`, `badges: {title, status, statusTone?: emerald|amber|zinc, icon?}[]`, `tagline?`, `copyright?`
- **Vanilla 用法**: `<site-footer copyright="© …" tagline="…">`，`columns`/`badges` 为 property
- **特性**: `bg-zinc-950` 深色底；多列链接栅格；合规徽章圆环（图标 + 状态色文字）；底部标语 + 版权行。

### 95. `MarqueeWall` (滚动弹幕墙)
- **Props**: `rows: {name, handle?, text, anonymous?}[][]`, `speedSeconds?=40`, `paused?`
- **Vanilla 用法**: `<marquee-wall speed-seconds="36" paused?>`，`rows` 为 property（外层数组 = 行，逐行交替方向）
- **特性**: `@keyframes marquee-scroll` 无缝滚动，偶数行 `reverse` 反向；卡片双份拼接实现循环；`paused` 属性冻结 + hover 暂停；首字母头像色轮换；匿名卡隐藏 handle。

### 96. `OnboardingStepper` (引导步骤条)
- **Props**: `steps: string[]`, `current?=0`, `segments?: {label, description, examples?}[]`, `title?`, `continueLabel?`
- **Vanilla 用法**: `<onboarding-stepper current="2" title="…">`，`steps`/`segments` 为 property；事件 `step-click`（detail `{index}`）、`continue`；`current` setter 同步 attribute
- **特性**: `>` 分隔步骤链 + 当步 `border-b-2 border-indigo-500`；进度条宽度 `((active+1)/total)*100%`；segmented control（`role="tablist"`）切换说明 + 示例行；底部 Continue 按钮。

### 97. `FilterToolbar` (筛选工具条)
- **Props**: `chips: {label, value?, valueTone?: rose|emerald|amber|indigo, removable?}[]`, `searchValue?`, `searchPlaceholder?`, `view?: list|grid|none`, `viewOnChange?`, `actionLabel?`
- **Vanilla 用法**: `<filter-toolbar view="grid" action-label="Create">`，`chips` 为 property；事件 `chip-remove`（detail `{index, chip}`）、`search`（detail `{value}`）、`view-change`（detail `{view}`）、`action`；`view="none"` 隐藏视图切换
- **特性**: 圆角 chip + 色调 value pill（rose/emerald/amber/indigo）；`removable` chip 带 × 移除按钮；搜索框（icon + placeholder）；list/grid 视图切换（React 端 `viewOnChange` 存在才渲染，事件始终触发）；右侧主操作按钮。


### 98. `OtpInput` (验证码输入)
- **Props**: `length?=6`, `value?`, `heading?`, `subtext?`, `status?: idle|error`, `errorText?`, `continueLabel?`, `resendHint?`
- **Vanilla 用法**: `<otp-input heading="…" status="error" error-text="…" resend-hint="…">`，`value` 为 property；事件 `change`/`complete`（detail `{value}`）、`continue`、`resend`
- **特性**: 6 格验证码（auto-advance、Backspace 回退、整段粘贴 auto-submit）；错误态 rose 边框 + 提示行；Continue 主按钮 + Resend 链接。

### 99. `SearchTypeahead` (搜索联想)
- **Props**: `query?`, `placeholder?`, `suggestions?: {label, type?, meta?}[]`, `results?: {title, badge?}[]`, `resultsHeading?`, `footerHint?`, `highlight?`
- **Vanilla 用法**: `<search-typeahead query="…" highlight="…" footer-hint="…">`，`suggestions`/`results` 为 property；事件 `select`（detail `{label}`）、`submit`（detail `{query}`）
- **特性**: 大号下划线搜索行（非框式）；命中子串黄色 `<mark>` 高亮；建议行 + mono 类型徽章；Top results 分组 + 徽章；底部提示 + Help Center；清空按钮。

### 100. `TourTooltip` (引导浮层)
- **Props**: `step`, `totalSteps`, `title`, `body`, `theme?: light|dark`, `caret?: top|bottom|none`, `feedback?`
- **Vanilla 用法**: `<tour-tooltip step="1" total-steps="4" feedback theme="dark" caret="bottom">`；事件 `prev`/`next`/`dismiss`、`feedback`（detail `{helpful}`）
- **特性**: 锚点卡片（三角 caret 旋转 45° 贴边）；Step N of M 计数；明暗双主题；反馈模式 👍/👎；首步隐藏 Previous、末步 Finish tour。

### 101. `CookieConsent` (Cookie 偏好)
- **Props**: `title?`, `description?`, `policyLabel?`, `categories?: {id, label, description?, alwaysActive?, cookies?}[]`, `acceptLabel?`, `rejectLabel?`, `saveLabel?`
- **Vanilla 用法**: `<cookie-consent accept-label="Accept All" reject-label="Reject All">`，`categories` 为 property；事件 `confirm`（detail `{accepted: string[]}`）
- **特性**: `<details>` 可折叠分类行；Always Active 标签 + 必选类；cookie 名 mono 列表；Accept All / Reject All / Confirm 三操作（confirm detail 返回接受 id 列表）。

### 102. `SettingsSideDrawer` (侧边设置抽屉)
- **Props**: `title?`, `side?: right|left`, `tabs?: {id, label}[]`, `activeTab?`, `sections?: {title?, rows: SettingsRow[]}[]`, `footerPrimary?`, `footerSecondary?`
- **Vanilla 用法**: `<settings-side-drawer title="Settings" active-tab="general" footer-primary="Deploy">`，`tabs`/`sections` 为 property；事件 `close`、`tab-change`（detail `{id}`，setter 同步 attribute）、`row-toggle`（detail `{label, enabled}`）、`row-action`（detail `{label}`）、`footer-primary`
- **特性**: fixed 遮罩层 + 侧边面板（round 单侧角）；tab 条（下划线 active）；设置行 = 标题 + 描述 + 控件（toggle 开关 / select / 按钮三色调）；粘性底部操作区。

### 103. `ClarifyQuestionCard` (澄清问题卡)
- **Props**: `question`, `title?`, `value?`, `placeholder?`, `index?`, `total?`, `answered?`, `stepLabel?`
- **Vanilla 用法**: `<clarify-question question="..." title="..." index="1" total="2">`，`value`/`answered` 为 property；事件 `answer`（detail `{value}`，Enter 触发）、`prev`、`next`
- **特性**: indigo 边框卡 + "?" 圆标；total>1 时显示 ‹ N of M › 分页；已答态 zinc pill 展示；emerald 勾 + stepLabel 脚注。

### 104. `AgentTaskProgress` (Agent 任务进度)
- **Props**: `title?`, `contextLabel?`, `contextText?`, `hint?`, `steps?: {label, state: done|active|pending, substeps?}[]`, `refineLabel?`, `nextLabel?`, `feedbackLabel?`
- **Vanilla 用法**: `<agent-task-progress title="...">`，`steps` 为 property（也支持 `steps` JSON attribute）；事件 `refine`、`next`
- **特性**: 上下文横幅 + hint；堆叠步骤卡（done 黑色播放 / active spinner + substeps 竖线列表 / pending chevron）；底部反馈链接 + Refine/Next。

### 105. `UsageQuotaCard` (用量配额卡)
- **Props**: `label?`, `used?`, `total?`, `unit?`, `summary?`, `upgradeLine?`, `ctaLabel?`, `ctaTone?: dark|primary`, `banner?`
- **Vanilla 用法**: `<usage-quota label="Credits Remaining" used="120" total="500" unit="credits">`，`variant="banner"` 切换横幅；事件 `cta`
- **特性**: 卡片态（label + used of total + sky 进度条 + upgradeLine + 全宽 CTA）与横幅态（emerald 横幅 + 内联 CTA）双变体。

### 106. `WorkspaceSwitcherMenu` (工作区切换菜单)
- **Props**: `title?`, `subtitle?`, `workspaces?: {id, name, logo?, memberCount?, role?, current?}[]`, `footerUser?: {name, email, initials?}`, `createLabel?`, `logoutLabel?`, `variant?: page|dropdown`
- **Vanilla 用法**: `<workspace-switcher footer-name="..." footer-email="...">`，`workspaces`/`footerUser` 为 property；事件 `select`（detail `{workspace}`）、`create-new`、`logout`
- **特性**: 工作区行（渐变首字母 tile 或 logo、"N members · You are an Admin/Editor" 角色文案、current 高亮）；创建按钮；footerUser 行 + 登出。

### 107. `AttachmentChip` (附件芯片)
- **Props**: `name`, `kind?: pdf|doc|csv|image`, `size?`, `meta?`, `removable?`
- **Vanilla 用法**: `<attachment-chip name="report.pdf" kind="pdf" size="2.4 MB">`，`removable` 为 property（默认 true）；事件 `remove`（detail `{name}`）
- **特性**: inline-flex 芯片 + KIND_TONE 徽章（pdf=rose / doc=sky / csv=emerald / image=violet）、mono 字形、名称 + size·meta、圆形黑色 X 移除按钮。

### 108. `DeploymentCard` (部署记录卡)
- **Props**: `deployId`, `status?: queued|building|live|failed|canceled`, `commit?: {sha, message?}`, `createdAt?`, `source?`, `url?`, `cancelLabel?`, `visitLabel?`
- **Vanilla 用法**: `<deployment-card deploy-id="Deploy #128" status="building" sha="2d300ac">`；事件 `cancel`、`visit`（detail `{url}`）
- **特性**: 状态 pill（building 脉冲 sky / live emerald / failed rose）；mono commit 行 + 来源·时间；进行中显示 Cancel deploy，终态显示 Visit ↗。

### 109. `LiveTailLogConsole` (实时日志终端)
- **Props**: `lines?: {ts?, level: info|warn|error|success, message, source?}[]`, `sources?`, `liveTail?`, `searchPlaceholder?`, `timezone?`, `maxLines?`
- **Vanilla 用法**: `<live-tail-log-console timezone="GMT+7">`，`lines`/`sources` 为 property；事件 `search`（detail `{query}`）、`source-change`、`live-tail-change`（detail `{enabled}`）
- **特性**: neutral-950 深色终端；工具条（来源下拉 + 搜索 + Live tail 开关 + 时区 chip）；行级 severity 圆点（info 蓝 / warn 琥珀 / error 红 / success 绿）；maxLines 截断。

### 110. `PipelineStageList` (CI 流水线阶段列表)
- **Props**: `groups?: {id, title, currentStep?, stages: {id, label, status: pending|running|success|failed, durationMs?}[]}[]`, `defaultExpanded?`, `showDuration?`, `collapsible?`
- **Vanilla 用法**: `<pipeline-stage-list expanded='["build"]'>`，`groups` 为 property（也支持 JSON attribute）；事件 `stage-click`（detail `{stage}`）、`group-toggle`（detail `{id, open}`）
- **特性**: 分组手风琴（divide-y 分隔）；组头 = 虚线圆/spinner + 标题 + 当前步骤 + 累计时长；嵌套 zinc-50 块内 stage 行（右对齐 mono 状态 + 时长）。

### 111. `ChangedFilesList` (变更文件列表)
- **Props**: `title?`, `files?: {path, additions, deletions, status?: new|modified|generated|deleted}[]`, `grouped?`, `showDiffstat?`, `defaultExpanded?`
- **Vanilla 用法**: `<changed-files-list title="3 Files Changed" grouped="true">`，`files` 为 property；事件 `file-click`（detail `{file}`）、`toggle`（detail `{open}`）
- **特性**: 可折叠卡片头（标题 + 总 +N/−N diffstat）；文件行 = 扩展名徽章 + mono 路径 + 状态 tag（new 绿 / generated 紫 / deleted 红）+ 每文件 +N/−N；grouped 按文件夹分组。

### 112. `ServiceStatusList` (服务状态清单)
- **Props**: `services?: {name, command, status: running|stopped|failed|starting, url?}[]`, `checks?: {label, passed, detail?}[]`, `durationLabel?`
- **Vanilla 用法**: `<service-status-list duration-label="Worked for 37s">`，`services`/`checks` 为 property；事件 `service-click`（detail `{service}`）
- **特性**: 服务表 = 名称 + 命令 code chip + 状态（running 勾 / starting spinner / stopped 圆点 / failed ×）+ URL 深色 chip；下方验证清单（绿勾 + code + 说明，未通过为灰点）；底部耗时行。

### 113. `FilterQueryBuilder` (过滤器查询构建器)
- **Props**: `fields?: {name, label, operators?}[]`, `rows?: {id, conjunction: where|and|or, field, operator, value}[]`, `addLabel?`, `clearLabel?`, `maxRows?`
- **Vanilla 用法**: `<filter-query-builder>`，`fields`/`rows` 为 property（也支持 JSON attribute）；事件 `change`（detail `{rows}`，每次编辑即发）、`clear`
- **特性**: 行 = where/and 连接词 chip + 字段 select + mono 操作符 select（`=` `<>` `>` `<` `~` `>=` `<=`）+ 无边框值输入 + 圆形 X 删除；"+ Add filter" ghost 按钮（maxRows 上限）+ "Clear filters" 链接。

### 114. `ColumnVisibilityMenu` (列显隐菜单)
- **Props**: `columns: {id, label, locked?, hidden?}[]`, `visibleIds?`, `showReorderHandles?`, `applyMode?: instant|apply-button`, `resetLabel?`, `applyLabel?`
- **Vanilla 用法**: `<column-visibility-menu columns='[...]' visible-ids='[...]' apply-mode="apply-button">`；事件 `toggle`（detail `{id, visible}`）、`reorder`（detail `{from, to}`）、`reset`、`apply`（detail `{visibleIds}`）
- **特性**: w-64 弹出面板；头部 "Showing X of Y" + "Reset to default"；行 = 拖拽把手 + 锁图标（locked 禁用）+ 眼睛/闭眼切换 + 上下排序；apply-button 模式维护草稿集合 + 底部 Apply 按钮。

### 115. `StatusCountTabs` (状态计数标签条)
- **Props**: `tabs: {id, label, count?, disabled?}[]`, `value`, `size?: sm|md`, `fullWidth?`
- **Vanilla 用法**: `<status-count-tabs tabs='[...]' value="all" full-width="true">`；事件 `change`（detail `{id}`）
- **特性**: 分段 tab 条与表格卡片齐平对接（rounded-t-lg + border-b-0）；激活 tab = bg-white + 底部内嵌阴影，未激活 = zinc-50 + sky-600 链接色；计数括号弱化显示；role=tablist/tab。

### 116. `EntityMultiSelectPicker` (实体多选选择器)
- **Props**: `options: {id, label, avatar?, initials?, system?}[]`, `selected?`, `searchable?`, `emptyMessage?`, `confirmLabel?`, `cancelLabel?`
- **Vanilla 用法**: `<entity-picker options='[...]' selected='[...]'>`；事件 `select`（detail `{ids}`）、`search`（detail `{query}`）、`dismiss`
- **特性**: 可搜索 checkbox 多选；行 = checkbox（选中 indigo）+ 头像（图片 / 首字母轮换色调 / system 圆点块）+ 标签，选中行 bg-blue-50；底部 Cancel / "Insert results"（indigo）。

### 117. `FederatedSearchResultsPanel` (联邦搜索结果面板)
- **Props**: `query?`, `results: {id, title, icon?, subtitle?, snippet, source?}[]`, `sourceFilters?`, `selectedSources?`, `searchPlaceholder?`, `showKeyboardLegend?`, `askAiLabel?`
- **Vanilla 用法**: `<federated-search results='[...]' source-filters='[...]' selected-sources='[...]'>`；事件 `query-change`、`source-change`（detail `{ids}`）、`result-select`（detail `{result}`）
- **特性**: rounded-2xl shadow-2xl 覆盖层；来源过滤 chips（toggle 集合，aria-pressed，激活 indigo）；结果 = 图标/标题/来源徽章/摘要 + `<mark>` 黄色高亮；空态；底部键盘图例 + "Press Tab to Ask AI" 药丸。

### 118. `TimeSlotPicker` (时间段选择器)
- **Props**: `days: {id, weekday, label, disabled?, slots: {id, label, period?: morning|afternoon|evening, available?, disabled?}[]}[]`, `value?: {dayId, slotId}`, `timezone?`, `daysLabel?`, `slotsLabel?`
- **Vanilla 用法**: `<time-slot-picker days='[...]' timezone="GMT+8">`，`days`/`value` 为 property（也支持 JSON attribute）；事件 `select`（detail `{dayId, slotId, slot}`）
- **特性**: 横向日期 chip 条（选中深色实心）；时段按 Morning/Afternoon/Evening 分组网格；slot 按钮 = 时间 + 可用数（>0 绿色 / 0 "Fully booked" 灰）；选中 indigo 描边 + 底色。

### 119. `OrderTracker` (订单物流追踪)
- **Props**: `stages: {id, label, timestamp?}[]`, `current: number|"canceled"`, `variant?: dots|bar`, `eta?`, `trackingNumber?`, `trackingUrl?`, `canceledReason?`
- **Vanilla 用法**: `<order-tracker stages='[...]' current="2" eta="Arrives by Sat, May 24">`，`stages` 为 property；事件 `track`
- **特性**: dots 变体 = 圆点连线（到达 emerald 勾 / 当前 ring 高亮 / 未来灰）+ ETA 行 + Track shipment 链接；bar 变体 = 连续进度条 + 底部阶段标签（当前加粗）；canceled 状态全灰 + 取消原因文案。

### 120. `OrderSummaryPanel` (订单摘要面板)
- **Props**: `rows: {id, label, value, kind?: item|discount|tax|fee|subtotal|total, strikeValue?, note?}[]`, `heading?`, `ctaLabel?`, `ctaAmount?`, `promoPlaceholder?`, `appliedPromos?`, `trustFooter?`
- **Vanilla 用法**: `<order-summary rows='[...]' cta-label="Place your order" cta-amount="$22.64">`，`rows` 为 property；事件 `cta`、`apply-promo`（detail `{code}`）、`remove-promo`（detail `{code}`）
- **特性**: 价格行 = label 左 value 右（discount/fee 绿色、total 加粗 + 顶部边框、strikeValue 删除线、note 括注）；已应用 promo 绿底 chip（可移除）+ 输入行（Enter/Apply 提交）；深色圆角 CTA 携带金额；trust footer 锁图标行。

### 121. `PaymentMethodCard` (支付方式卡片)
- **Props**: `brand: visa|mastercard|amex|string`, `last4`, `exp?`, `amount?`, `holderLabel?`, `holder?`, `showAddNew?`, `changeLabel?`, `addNewLabel?`
- **Vanilla 用法**: `<payment-method-card brand="visa" last4="6008" exp="10 / 2028" amount="$6.53">`；事件 `change`、`add-new`
- **特性**: 品牌 tile（VISA 蓝 / MC 黑 / AMEX 天蓝）+ "Ending in ••••" + Exp 行 + 可选右对齐金额；Change 大写链接 + 账单地址块 + "+ Add new payment" 下划线链接。

### 122. `OrderCard` (订单卡片)
- **Props**: `orderNumber`, `placedAt?`, `status: placed|preparing|shipped|delivered|on-hold|canceled`, `fulfillment?: {type: delivery|pickup|curbside, eta?, store?}`, `items?: {id, title, image?, price?, qty?}[]`, `total?`, `statusNote?`
- **Vanilla 用法**: `<order-card order-number="..." status="shipped" total="$24.98">`，`items`/`fulfillment` 为 property（也支持 JSON attribute）；事件 `open`、`action`（detail `{action: "buy-again"}`）
- **特性**: 灰底头带 = Order# + Placed 日期 + View details 药丸；主行 = 履约动词（Arrives/Ready for pickup/Curbside ready）+ ETA 加粗 + 门店定位行；状态徽章六态（shipped indigo / delivered emerald / on-hold amber / canceled 灰）；条目缩略图列表 + Buy it again / Total 底行。

### 123. `ColorPickerPopover` (取色器弹层)
- **Props**: `value`, `swatches?: string[]`, `documentColors?: string[]`, `customColors?: string[]`, `showEyedropper?`, `showRgbInputs?`, `showHexInput?`
- **Vanilla 用法**: `<color-picker-popover value="#2563eb" show-eyedropper="true" show-rgb-inputs="true" document-colors='[...]'>`，`swatches`/`documentColors`/`customColors` 为 property（也支持 JSON attribute）；事件 `change`（detail `{hex}`）、`eyedropper-click`、`add-custom`（detail `{hex}`）
- **特性**: 6 行色调网格（灰/红/橙/绿/蓝/紫渐变）选中 ring+勾标（浅色勾自动转灰）；hex 输入实时解析（非法输入不触发 change）；R/G/B 数值输入三通道联动；吸管按钮；Document colors / Custom colors 分区 + 虚线加号添加当前色。

### 124. `EditorToolPalette` (画布工具栏)
- **Props**: `tools: {id, icon, label, kbd?, disabled?}[]`, `orientation?: horizontal|vertical`, `activeId?`, `activeCount?`, `showKbdHints?`
- **Vanilla 用法**: `<editor-tool-palette active-id="select" active-count="1" orientation="vertical">`，`tools` 为 property（也支持 JSON attribute）；事件 `select`（detail `{id}`）
- **特性**: 白底圆角浮动容器；激活工具蓝底白图标（Craft 风格）；每工具右上角 kbd 数字提示（激活时反白）；选中计数徽标（选择工具上的 "1"）；水平胶囊与垂直工具条两种布局。

### 125. `ShortcutCheatSheet` (快捷键速查表)
- **Props**: `shortcuts: {id, icon?, label, hint?, keys: string[], section?}[]`, `columns?: 1|2`, `title?`, `searchable?`
- **Vanilla 用法**: `<shortcut-cheat-sheet title="Editor" searchable="true">`，`shortcuts` 为 property（也支持 JSON attribute）
- **特性**: 两列分组列表（Editor / Blocks / Collab 节标题）；每行图标 + 标签 + markdown 语法蓝 mono 提示（`**Bold**`）+ keycap 芯片组（灰底描边 + 底部微阴影）；实时搜索过滤 + 无结果空态。

### 126. `ZoomControlBar` (画布缩放条)
- **Props**: `value`, `min?`, `max?`, `step?`, `variant?: stepper|dropdown|slider`, `presets?: number[]`, `showFit?`, `showUndoRedo?`
- **Vanilla 用法**: `<zoom-control-bar value="100" variant="dropdown" show-fit="true">`；事件 `zoom-change`（detail `{value}`）、`fit`、`undo`、`redo`
- **特性**: 三变体一体——stepper（−/百分比/+）、dropdown（百分比 ▾ 上翻预设菜单 + Fit）、slider（range + 百分比）；可选 undo/redo 图标对 + 分隔线；值 clamp 到 [min,max]；slider 拖动实时更新标签。

### 127. `AIInlineMenu` (AI 内联操作菜单)
- **Props**: `actions: {id, label, options?}[]`, `loading?`, `error?`, `tone?: neutral|brand`
- **Vanilla 用法**: `<ai-inline-menu tone="brand" loading="true">`，`actions` 为 property（也支持 JSON attribute）；事件 `action`（detail `{id, option?}`）、`dismiss`
- **特性**: 选择锚定浮动药丸——AI 徽章芯片（sparkles 图标，indigo/brand-emerald 双色调）+ 分隔线 + 动作下拉按钮（带 options 的上翻菜单）；loading 时 sparkles 脉冲 + "Working…" + 按钮禁用；error 红描边 + 行内提示；右上关闭圆钮发 dismiss。

### 128. `EmptyStateStarter` (首次使用空态卡)
- **Props**: `illustration?`, `title`, `description?`, `actionLabel?`, `variant?: plain|dashed|card`, `size?: md|sm`, `actionVariant?: solid|outline|link`
- **Vanilla 用法**: `<empty-state-starter title="No forms yet" action-label="+ Create form" variant="dashed">`，illustration 为 property；事件 `action`
- **特性**: 居中列布局（插画 + 20-24px 标题 + 灰描述 + CTA）；dashed 变体（Literal 灰虚线卡）；sm 尺寸（侧栏 mini 空态）；三种 CTA 风格（黑药丸 / 描边 / 蓝链接）。

### 129. `AuthGatePrompt` (软登录门)
- **Props**: `title`, `providers?: {id, label, tone?: white|brand|dark}[]`, `secondaryAction?`, `dividerText?`, `skipLabel?`
- **Vanilla 用法**: `<auth-gate-prompt title="Sign in to save" secondary-label="Use phone number">`，providers 为 property（也支持 JSON attribute）；事件 `provider`（detail `{id}`）、`secondary`、`skip`
- **特性**: 上下文理由标题（"登录以保存…" 而非整页 auth）；三色 SSO 药丸栈（白 / #1877F2 / 黑）；发丝 "or" 分隔线；次级描边药丸（手机号）；"Not now" 游客跳过文本链接。

### 130. `AuthSplitPanel` (分栏认证壳)
- **Props**: `media?`, `mediaSide?: left|right`, `mediaTitle?`, `mediaSubtitle?`, `mediaBackground?: tinted|cover`, `footerLinks?: {label, href}[]`
- **Vanilla 用法**: `<auth-split-panel media-title="Welcome back" media-subtitle="...">`（light-DOM 子节点为 auth 内容），media/footerLinks 为 property；事件无
- **特性**: `grid md:grid-cols-2` 外壳；tinted 变体（灰底 + 2xl 粗标题 + 灰副题）或 cover 变体（深底白字）；子节点自动捕获渲染进 auth 列；蓝 Terms/Privacy footer 链接行。

### 131. `SuccessToast` (成功确认条)
- **Props**: `message`, `icon?`, `duration?`（ms，0 = sticky）, `position?: top-right|bottom-right`
- **Vanilla 用法**: `<success-toast message="Link copied" duration="3000">`；事件 `close`；`show()` 方法重新显示
- **特性**: mint 绿底（emerald-100）+ 深绿 check 圆标 + 深色文案；右上 fixed（或 bottom-right）；自动消失（message 变化重置计时）；X 圆钮即时关闭并派发 close。

### 132. `EditableHeading` (行内编辑标题)
- **Props**: `value?`, `defaultValue?`, `breadcrumb?`, `meta?`, `size?: md|lg`
- **Vanilla 用法**: `<editable-heading value="Q4 Pipeline" breadcrumb="Contacts / Lists" meta="<span>…</span>">`；事件 `change`（detail `{value}`）、`cancel`
- **特性**: 空闲时为 heading 按钮（hover 灰底提示可点）；点击变输入框（黄底高亮 #fff8d6 + teal focus 双线框）；Enter/blur 提交、Esc 取消；上方 breadcrumb 行 + 下方 meta 芯片行。

### 133. `PlanComparisonTable` (方案特性对比矩阵)
- **Props**: `plans: [{id, name, highlighted?}]`, `sections: [{id, title, rows: [{id, label, values: [{value: true|false|string}]}]}]`, `ctaText?`, `onSelect?(planId)`
- **Vanilla 用法**: `<plan-comparison-table cta-text="Choose plan">` + `plans`/`sections` property；事件 `select`（detail `{planId}`）
- **特性**: Linear/Sprig 式特性矩阵——深色分节标题带（Features/Support）；单元格三态（✓ / 灰减 / ✓+备注如 "G Suite + SAML"）；highlighted 列整列 indigo 浅底；底部每方案 CTA 行（主列实心）。

### 134. `UpgradeCheckoutPanel` (升级结算面板)
- **Props**: `title?`, `planName?`, `billingPeriod?: monthly|annual`, `seats?`, `minSeats?/maxSeats?`, `lineItems: [{id, label, amount, muted?, strikethrough?}]`, `totalLabel?`, `total`, `discount?`, `terms?`, `processing?`, `onConfirm?`
- **Vanilla 用法**: `<upgrade-checkout-panel seats="5" billing-period="annual" total="$405.00 + tax">` + `lineItems` property；事件 `billing-period-change`/`seats-change`/`confirm`
- **特性**: Clockwise/Attio 式升级结算——左列计费周期分段开关 + 席位步进器（min/max 钳制 + 禁用态）；右列灰底汇总卡：行项目（可划线原价）、总计、绿色折扣行、条款小字、emerald Confirm CTA（processing 态）。

### 135. `TrialBanner` (试用倒计时横幅)
- **Props**: `planName?`, `daysLeft`, `message?`, `ctaText?`, `tone?: indigo|amber`, `dismissible?`, `onCta?`, `onDismiss?`
- **Vanilla 用法**: `<trial-banner days-left="11" dismissible>`；事件 `cta`/`dismiss`；`show()` 恢复
- **特性**: Later 式试用横幅——天数胶囊（≤3 天 animate-pulse 催促）；默认文案自动带 plan 名；indigo/amber 双色调；X 按钮可关闭、可恢复。

### 136. `MembershipTierGrid` (创作者会员层级)
- **Props**: `title?`, `subtitle?`, `tiers: [{id, name, price, period?, image?, description?, perks?, badge?, limited?, highlighted?, ctaText?}]`, `onSelect?(tier)`
- **Vanilla 用法**: `<membership-tier-grid>` + `tiers` property；事件 `select`（detail `{tier}`）
- **特性**: Patreon 式会员卡——封面图 + 名称/徽章 + 大价格/周期；"Limited (N remaining)" 库存提示；全宽试用 CTA（highlighted 黑底反白）；perk 圆点列表；2/3 列自适应。

### 137. `AddonPicker` (附加项选择器)
- **Props**: `title?`, `options: [{id, label, price?, disabled?, contactInstead?}]`, `selectedIds?`, `totalLabel?`, `totalText?`, `onChange?(selectedIds)`
- **Vanilla 用法**: `<addon-picker total-text="$3600">` + `options` property；事件 `change`（detail `{selectedIds}`）
- **特性**: User Interviews/Attio 式加购——复选行（选中 indigo 浅底 + 实心勾）；价格右对齐或 "Let's talk" 联系链接；disabled 行降透明；底部合计行。

### 138. `ImageGenGallery` (AI 生图工作台)
- **Props**: `title?`, `prompt?`, `placeholder?`, `generateText?`, `images: [{id, alt, url?, aspect?: square|portrait|landscape, status?: done|generating, model?}]`, `onGenerate?(prompt)`, `onTileAction?(id, action)`
- **Vanilla 用法**: `<image-gen-gallery title="Image studio">` + `images` property；事件 `generate`（detail `{prompt}`）、`tile-action`（detail `{id, action}`）
- **特性**: AI 生图工作台——提示词条 + Generate CTA（空输入禁用、Enter 提交）；2/3 列 tile 网格（渐变占位、比例类、模型徽章）；hover 浮现下载/变体/删除操作条；generating 骨架 animate-pulse；空态虚线框。

### 139. `SharedChatViewer` (分享聊天公开页)
- **Props**: `appName?`, `title?`, `meta?`, `messages: [{id, role: user|assistant, text}]`, `ctaText?`, `ctaNote?`, `onCta?`
- **Vanilla 用法**: `<shared-chat-viewer app-name="Nebula" meta="12 messages · Mar 3">` + `messages` property；事件 `cta`
- **特性**: 分享聊天公开页——品牌 header（首字母方块 + meta 行）；用户右 indigo 气泡 / 助手左灰气泡（whitespace-pre-wrap）；底部灰底 CTA 条（默认 "This conversation is read-only."）。

### 140. `MemoryPanel` (AI 记忆管理)
- **Props**: `title?`, `note?`, `items: [{id, text, source?}]`, `addPlaceholder?`, `addText?`, `onAdd?(text)`, `onEdit?(id, text)`, `onDelete?(id)`, `onClearAll?`
- **Vanilla 用法**: `<memory-panel>` + `items` property；事件 `add`/`edit`/`delete`/`clear`
- **特性**: ChatGPT 式记忆管理——条目卡（文本 + 来源小字）；铅笔/垃圾桶行内操作；编辑态 indigo 输入框 + Save/Cancel（Enter/Esc 支持）；底部新增输入行；空态虚线框；Clear all 红字（空列表隐藏）。

### 141. `ConnectorGrid` (应用连接器面板)
- **Props**: `title?`, `connectors: [{id, name, description?, icon?, connected?}]`, `connectText?`, `connectedText?`, `onToggle?(id, connected)`
- **Vanilla 用法**: `<connector-grid>` + `connectors` property；事件 `toggle`（detail `{id, connected}`）
- **特性**: Apps & Connectors 面板——图标方卡 + 名称/两行描述；Connect（indigo 实心）/ Connected（描边 + 勾）切换；header 实时 N/M connected 徽章；已连接卡 indigo 浅底；sm 双列。

### 142. `ModelComparePane` (双模型对比)
- **Props**: `prompt?`, `modelA?`, `modelB?`, `outputA?`, `outputB?`, `statusA?/statusB?: done|streaming|error`, `voteLabelA?/B?/Tie?`, `onVote?(choice)`
- **Vanilla 用法**: `<model-compare-pane prompt="..." model-a="GPT-5.2" model-b="Claude 4.5">` + `outputA`/`outputB`/`statusA`/`statusB` property；事件 `vote`（detail `{choice: A|B|tie}`）
- **特性**: LMArena 式对比——共享 Prompt indigo 条；左右两列（模型名反白徽章 + 输出区 min-h）；streaming 三点 bounce / error 红字替换输出；底部三格投票栏（👈 A / 🤝 Tie / 👉 B）。

### 143. `SystemPromptEditor` (System prompt 编辑器)
- **Props**: `title?`, `value?`, `placeholder?`, `version?`, `savedValue?`, `variables?: string[]`, `temperature?`, `onSave?(text)`, `onReset?()`, `onTemperatureChange?(value)`
- **Vanilla 用法**: `<system-prompt-editor title="System prompt" version="v3" saved-value="..." temperature="0.7" variables='["company"]'>`；事件 `save`（detail `{text}`）/ `reset` / `temperature-change`（detail `{value}`）
- **特性**: Saved/Unsaved 状态标签（emerald/amber）、token 估算 `~N tokens · M chars`、`{{变量}}` chips、temperature 滑杆（0–2 step 0.1）、Reset / Save prompt（干净态禁用）。

### 144. `ToolSchemaEditor` (工具 Schema 注册表)
- **Props**: `tools?: [{id, name, description?, method?: GET|POST, endpoint?, parameters?: [{name, type: string|number|boolean, required?}]}]`, `onToggle?(tool, enabled)`, `onValidate?(tool)`
- **Vanilla 用法**: `<tool-schema-editor>` + `tools` property；事件 `toggle`（detail `{tool, enabled}`）/ `validate`（detail `{tool}`）
- **特性**: 工具卡（name code + method 徽章 GET emerald / POST indigo + endpoint code + 描述）、typed 参数 chips（string sky / number violet / boolean amber、required 红星 title）、enable 开关 + header `N/M enabled` 徽章、逐卡 Validate schema、禁用卡 opacity-60。

### 145. `FineTuneJobList` (Fine-tune 任务列表)
- **Props**: `jobs?: [{id, model, baseModel?, status: queued|training|completed|failed, progress?, cost?, eta?}]`, `onNew?()`, `onCancel?(job)`
- **Vanilla 用法**: `<finetune-job-list>` + `jobs` property；事件 `new` / `cancel`（detail `{job}`）
- **特性**: 模型 code + `from baseModel` 小字、状态 chips（queued zinc / training indigo / completed emerald / failed red）、training 进度条 + 百分比、cost + `ETA x` meta、active 行 Cancel 红链、header New fine-tune indigo CTA、空态。

### 146. `PersonaPresetGrid` (Persona 预设网格)
- **Props**: `presets?: [{id, name, description?, emoji?, temperature?, selected?}]`, `onSelect?(preset)`
- **Vanilla 用法**: `<persona-preset-grid>` + `presets` property；事件 `select`（detail `{preset}`，本地移动选中标记后重渲）
- **特性**: 渐变 emoji 方卡（6 渐变）、name + 描述 line-clamp-2、`temp N` mono chip、选中 indigo 描边 + ring-2 + 右上对勾气泡。

### 147. `AgentBuilderCard` (Agent 工作流卡)
- **Props**: `agentName?`, `title?`, `nodes?: [{id, label, type: trigger|tool|llm|output, status?: idle|active|done|error}]`, `running?`, `onRun?()`, `onEdit?()`
- **Vanilla 用法**: `<agent-builder-card agent-name="Support triage" running="true">` + `nodes` property；事件 `run` / `edit`（running="true" 时 run 被拦截）
- **特性**: agent 名 + `N nodes` 计数、竖向节点链（⚡🔧🧠📤 图标 + type chips、连接线）、状态圆点（active 脉冲 indigo / done emerald / error red / idle zinc）、active 节点 indigo 浅底、Edit 按钮、全宽 Run agent CTA（running 时 Running… 禁用）。

### 148. `VoiceOrb` (语音对话球)
- **Props**: `state?: listening|speaking|thinking|idle`, `label?`, `hint?`, `size?: sm|md|lg`, `showControls?`, `muted?`, `onToggleMute?()`, `onEnd?()`
- **Vanilla 用法**: `<voice-orb state="listening" hint="Ask anything">`；事件 `toggle-mute {muted}`（vanilla 内部切换 muted 属性）/ `end`
- **特性**: 状态渐变圆盘（listening 天蓝→靛蓝→紫 / speaking 翠绿→青 / thinking 琥珀→橙→玫红 / idle 锌灰，前三者 animate-pulse）、非 idle 显示 7 条波形条、状态默认标签（Listening… / Speaking… / Thinking… / Tap to talk）、可选 hint、Mute（静音时红底 Unmute + aria-pressed）/ End call（红底）控件、showControls=false 隐藏按钮。

### 149. `ShareChatDialog` (分享对话弹窗)
- **Props**: `open?`, `title?`, `description?`, `link?`, `shared?`, `onToggleShared?(shared)`, `onCreateLink?()`, `onCopyLink?(link)`, `onClose?()`
- **Vanilla 用法**: `<share-chat-dialog title="Share chat" shared="true" link="https://…">`；事件 `toggle-shared {shared}`（vanilla 内部切换 shared 属性）/ `create-link` / `copy-link {link}` / `close`（vanilla 内部置 open=false 并清空内容）
- **特性**: 🔒 Keep private / 🌐 Create public link 二选一卡（选中 zinc-100 底 + indigo 对勾）、shared 时有 link 显示 code 行 + Copy link 反色按钮、无 link 显示 Create link indigo CTA、open=false 不渲染任何内容。

### 150. `BrandPromptTable` (品牌 Prompt 表格)
- **Props**: `title?`, `quotaUsed?`, `quotaTotal?`, `rows?: [{id, prompt, topic?, visibility, sentiment, position, mentions?}]`, `onAddPrompt?()`, `onRowClick?(row)`
- **Vanilla 用法**: `<brand-prompt-table quota-used="49" quota-total="50">` + `rows` property；事件 `add-prompt` / `row-click {row}`
- **特性**: 标题 + N / M prompts quota 徽章、+ Add Prompt indigo CTA、四列表格（Prompt 截断 / 可见性 % / 情感分 >=70 emerald、>=50 amber、否则红 / 排名 #N）、行点击事件、无 rows 时空状态提示。

### 151. `PromptSaveDialog` (保存 Prompt 弹窗)
- **Props**: `open?`, `title?`, `folder?`, `description?`, `prompt?`, `variables?: string[]`, `onSave?(value)`, `onCancel?()`, `onClose?()`
- **Vanilla 用法**: `<prompt-save-dialog title="…" folder="…" variables='["company"]'>`；事件 `save {title,prompt,variables}`（vanilla 读取输入框实时值）/ `cancel` / `close`（vanilla 置 open=false 并清空）
- **特性**: 📁 文件夹下拉、无边框标题输入 + prompt 正文 textarea、+ Add variable 虚线 CTA、{{变量}} indigo chips、底部可见性说明 + Cancel / Save prompt（indigo）。

### 152. `AiTemplatePicker` (AI 模板选择器)
- **Props**: `open?`, `title?`, `categories?: [{id,label,count}]`, `templates?: [{id,name,description,category?}]`, `activeCategory?`, `onCategoryChange?(id)`, `onTry?(template)`, `onRunCustom?()`, `onClose?()`
- **Vanilla 用法**: `<ai-template-picker active-category="targeting">` + `categories`/`templates` property；事件 `category-change {id}`（vanilla 内部切换 active-category）/ `try {template}` / `run-custom` / `close`
- **特性**: 左侧分类栏（选中 indigo 底 + 计数徽章）、右侧 2–3 列模板卡（名称 + 描述 + Try it 描边按钮）、按 category 过滤（无 category 的模板全分类可见）、空状态提示、底部 Run custom AI prompt。

### 153. `CreationComposer` (创作输入条)
- **Props**: `open?`, `placeholder?`, `imageAssist?`, `resolution?`, `count?`, `resolutions?: string[]`, `counts?: number[]`, `onImageAssistChange?(enabled)`, `onResolutionChange?(resolution)`, `onCountChange?(count)`, `onSubmit?(value)`
- **Vanilla 用法**: `<creation-composer image-assist="true" resolution="4K">`；事件 `image-assist-change {enabled}`（vanilla 内部切换属性）/ `resolution-change {resolution}` / `count-change {count}` / `submit {prompt,imageAssist,resolution,count}`
- **特性**: 🖼 附件按钮 + Image Assist 胶囊开关（开时 indigo 底 + 滑块右移 + aria-checked）、💡 灵感按钮、3 行 prompt textarea、分辨率 / N× 数量原生 select、violet Create CTA。


### 154. `TraceSpanWaterfall` (调用瀑布图)
- **Props**: `spans?: [{id,name,startMs,durationMs,depth?,kind?,costUsd?,tokens?}]`, `title?`, `onSpanSelect?(span)`
- **Vanilla 用法**: `<trace-span-waterfall title="Agent run">` + `spans` property；事件 `span-select {span}`
- **特性**: 头部 span 计数 + 总时长、LLM/tool/retrieval 图例（indigo/emerald/amber）、按深度缩进的行 + 圆点色标、水平时间条按 startMs/durationMs 定位、右侧时长 + 成本标注。

### 155. `EvalScoreTable` (评测得分表)
- **Props**: `runs?: [{id,name,score,grader?,tone?}]`, `criteria?: [{id,title,description}]`, `title?`, `onRunSelect?(run)`, `onAddCriteria?()`
- **Vanilla 用法**: `<eval-score-table add-criteria="true">` + `runs`/`criteria` property；事件 `run-select {run}` / `add-criteria`
- **特性**: Run/Score/Grader 三列表格、得分 chip（emerald/amber/red 按tone）、20 宽进度条、标准卡两列网格、+ 圆点 Add criteria 虚线 CTA。

### 156. `TokenCostBreakdown` (Token 成本拆解)
- **Props**: `segments?: [{id,label,amountUsd,color?}]`, `usageRows?: [{id,label,tokens,percent,barColor?}]`, `title?`, `spendUsed?`, `spendTotal?`, `onSegmentSelect?(segment)`
- **Vanilla 用法**: `<token-cost-breakdown spend-used="34.49" spend-total="55">` + `segments`/`usageRows` property；事件 `segment-select {segment}`
- **特性**: 头部 "$used of $total"、堆叠消费条（默认 6 色 cycle）、图例行金额 + 百分比、Token usage 分区（大写小标题 + 输入/输出/推理行进度条）。
### 157. `PromptVariantDiff` (Prompt 版本对比)
- **Props**: `variants?: [{id,label,text}]`（需恰好 2 个：base + compare）, `variables?: string[]`, `title?`, `onApply?(variant)`
- **Vanilla 用法**: `<prompt-variant-diff title="Support bot">` + `variants` property；事件 `apply {variant}`
- **特性**: 双栏 A/B 面板（zinc 基线圆点 + violet 对比圆点 + Base 徽章）、{{var}} indigo chips 内联渲染、头部 +N/−N/~text 变更统计、Use this version 按钮、底部变量增删 chips（emerald + / red −）、不足 2 个变体不渲染。

### 158. `GuardrailReviewQueue` (审核队列)
- **Props**: `items?: [{id,author,content,reasons:string[],rule?,confidence?,verdict?: 'pending'|'approved'|'rejected'}]`, `title?`, `onApprove?(item)`, `onReject?(item)`
- **Vanilla 用法**: `<guardrail-review-queue title="Moderation queue">` + `items` property；事件 `approve {item}` / `reject {item}`
- **特性**: 头部 "{n} flagged" 红色计数徽章、待审卡（作者 + 置信度 chip ≥90% 红否则琥珀 + 规则 chip + 内容面板 + 琥珀原因 tags）、Approve（emerald）/ Reject（red）按钮、已决项折叠为一行 verdict chip + 作者 + 截断内容、空状态提示。

### 159. `ContentReviewTable` (内容审核表)
- **Props**: `rows?: [{id,text,tags?,extraTags?,time?,status: 'valid'|'error'}]`, `title?`, `draftsLabel?`, `scheduleLabel?`, `onRowSelect?(row)`, `onSaveDrafts?()`, `onSchedule?()`
- **Vanilla 用法**: `<content-review-table title="Review content">` + `rows` property；事件 `row-select {row}` / `save-drafts` / `schedule`
- **特性**: 头部 ✓ {n} valid / ⚠ {n} errors 计数、# / Text / Tags / Posting time / Status 表格（首 tag sky chip + +{n}、时间默认 Add to Queue）、行点击回调、底部 Save as Drafts（描边）+ Schedule Posts（emerald）CTA。

### 160. `QaTestTable` (QA 测试表)
- **Props**: `rows?: [{id,question,answered?,rating?: 'good'|'acceptable'|'poor'}]`, `title?`, `onRowCheck?(row,checked)`, `onRowSelect?(row)`
- **Vanilla 用法**: `<qa-test-table title="Fin QA tests">` + `rows` property；事件 `row-check {row,checked}` / `row-select {row}`
- **特性**: "N questions / M answered" 头部、行复选框（点击 stopPropagation）、✓ emerald / — zinc 回答状态、Good/Acceptable/Poor 评级 chips（emerald/amber/red）、行点击回调。

### 161. `AppealRestrictionDialog` (限制申诉弹窗)
- **Props**: `open?=true`, `reasonTitle?`, `reasonDetail?`, `policyLabel?`, `appealLabel?`, `backLabel?`, `onAppeal?()`, `onClose?()`, `onBack?()`
- **Vanilla 用法**: `<appeal-restriction-dialog reason-title="Unsafe Conduct">`；事件 `appeal` / `close` / `back`；`open="false"` 清空内容
- **特性**: ← 返回 / ✕ 关闭按钮、"180 days to appeal" 提示、原因卡（标题 + 详情）、Read our Content Policy 链接、rose Appeal CTA（Request another review）。

### 162. `ModelPricingCard` (模型定价卡)
- **Props**: `modelName: string`, `modelId?`, `pricing?: {inputPerMillion?, outputPerMillion?}`, `currency?`, `onCopyId?(modelId)`
- **Vanilla 用法**: `<model-pricing-card model-name="Glm 4.7 Flash" model-id="..." input-per-million="0.06" output-per-million="0.40">`；事件 `copy-id {modelId}`
- **特性**: 等宽粗体模型名、Model ID 行（truncate + ⧉ 复制按钮，无 id 不渲染）、Input / Output pricing 行（`$ 0.06 / million tokens` 或 —）。

### 163. `AiResearchPanel` (AI 研究面板)
- **Props**: `open?=true`, `title?='Research with AI'`, `templates?: [{id,title,description}]`, `runLabel?='Run custom AI prompt'`, `className?`, `onRun?(template)`, `onRunCustom?()`, `onClose?()`
- **Vanilla 用法**: `<ai-research-panel title="Research with AI">` + `templates` property；事件 `run {template}` / `run-custom` / `close`
- **特性**: 头部标题 + ✕ 关闭按钮、模板卡片栈（标题 + 两行描述 + Try it CTA）、底部 Run custom AI prompt 主 CTA、无模板空态、`open=false` 不渲染。

### 164. `ApiKeyTable` (API 密钥表)
- **Props**: `title?='API keys'`, `keys?: [{id,name,preview,created?,status?: 'active'|'revoked'}]`, `createLabel?='Create new secret key'`, `className?`, `onCreate?()`, `onCopy?(row)`, `onRevoke?(row)`
- **Vanilla 用法**: `<api-key-table title="API keys">` + `keys` property；事件 `copy {row}` / `revoke {row}` / `create`
- **特性**: "N active" 计数头部（排除 revoked）、emerald Create CTA、行内掩码 key 预览（`created` 前缀日期）、Active/Revoked 状态徽章、revoked 行隐藏 Copy / Revoke 操作、空态。

### 165. `VoiceSessionHistory` (语音会话历史)
- **Props**: `title?='History'`, `sessions?: [{id,title,date?,duration?,status?: 'completed'|'failed'|'in-progress'}]`, `emptyLabel?='No sessions yet.'`, `className?`, `onSelect?(session)`, `onPlay?(session)`
- **Vanilla 用法**: `<voice-session-history title="History">` + `sessions` property；事件 `select {session}` / `play {session}`
- **特性**: 计数徽章（排除 failed）、标题 + `date · duration` 元信息行、Completed/Running/Failed 状态徽章（emerald/amber/red）、▶ 重播按钮（stopPropagation + aria-label）、空态。

### 166. `AiRewriteMenu` (AI 改写菜单)
- **Props**: `open?=false`, `triggerLabel?='Rewrite'`, `actions?: [{id,label,badge?}]`, `className?`, `onSelect?(action)`, `onToggle?()`
- **Vanilla 用法**: `<ai-rewrite-menu trigger-label="Rewrite">` + `actions`/`open` property；事件 `select {action}` / `toggle {open}`
- **特性**: ✦ 触发按钮（aria-expanded 同步）、底部弹出 popover、行级功能徽章（Get feature）、选中后自动收起、空 actions 不渲染菜单。

### 167. `PromptPerformanceTable` (提示词表现表)
- **Props**: `title?='Prompt performance'`, `exportLabel?='Export'`, `rows?: [{id,prompt,visibility,sentiment,position,mentions,trend?: 'up'|'down'|'flat'}]`, `className?`, `onExport?()`, `onRowClick?(row)`
- **Vanilla 用法**: `<prompt-performance-table>` + `rows` property；事件 `export` / `row-click {row}`
- **特性**: Prompt / Visibility / Sentiment / Position / Mentions 五列、▲▼— 趋势标记、行 hover + 点击、Export CTA、空态。

### 168. `ShareAccessDialog` (分享访问弹窗)
- **Props**: `open?=true`, `title?='Share Conversation'`, `description?`, `url?`, `copyLabel?='COPY LINK'`, `people?: [{id,name,email,role?}]`, `className?`, `onCopyLink?()`, `onClose?()`, `onRemovePerson?(person)`
- **Vanilla 用法**: `<share-access-dialog>` + `people`/`open` property；事件 `copy-link {url}` / `remove-person {person}` / `close`
- **特性**: 邀请邮箱输入框、成员行（姓名首字母头像 / 邮箱 / 权限角色徽章 + ✕ 移除，移除即时更新列表）、等宽 URL 行 + COPY LINK 按钮、遮罩居中卡片、关闭后清空内容。

### 169. `AiNoteAnswer` (AI 笔记回答卡)
- **Props**: `question?='What improvements should I prioritize for Homepage?'`, `answer?`, `sources?: string[]`, `waveform?: number[]`（默认 48 根正弦条带）, `className?`, `onPlay?()`, `onCopy?()`, `onSourceClick?(source)`
- **Vanilla 用法**: `<ai-note-answer>` + `question`/`answer` 属性、`sources`/`waveform` property；事件 `play` / `copy {answer}` / `source-click {source}`
- **特性**: 波形提问行（▶ 播放按钮 + 48 根波形条）、回答段落、"Other sources" 分隔引用列表（↗ 链接行）、Copy 圆角按钮、sources 为空时隐藏引用区。

### 170. `AudioNotePlayer` (音频笔记播放器)
- **Props**: `title?='Homepage walkthrough notes'`, `duration?='00:47'`, `playing?=false`, `waveform?: number[]`（默认 64 根条带）, `className?`, `onTogglePlay?()`
- **Vanilla 用法**: `<audio-note-player>` + `title`/`duration` 属性、`playing`/`waveform` property；点击切换并派发 `toggle-play {playing}`
- **特性**: ▶ / ❚❚ 圆形播放切换按钮（aria-label Play note / Pause note）、播放时前半段波形高亮 emerald、等宽时长角标、标题行截断、空波形回退默认条带。

### 171. `ImageActionMenu` (图片操作菜单)
- **Props**: `open?=true`, `actions?: [{id,label,icon?,danger?}]`, `className?`, `onAction?(action)`, `onClose?()`
- **Vanilla 用法**: `<image-action-menu>` + `actions` JSON 属性或 `actions`/`open` property；事件 `action {action}`
- **特性**: w-56 白底圆角菜单、每项图标（Fullscreen ⛶ / Vary ↻ / Edit ✎ / Make video ▶ / Download ↓ 默认映射 + 自定义 icon）、danger 红色态、Download 前分隔线、空态提示、`open=false` 清空内容。

### 172. `FalRunCard` (运行信息卡)
- **Props**: `type?='Text To Image'`, `models?=4`, `time?='22 minutes ago'`, `prompt?`, `aspect?='1:1'`, `cost?='$0.241'`, `costTone?='green'`, `className?`, `onDuplicate?()`, `onRerun?()`, `onDelete?()`
- **Vanilla 用法**: `<fal-run-card>` + `type`/`models`/`time`/`prompt`/`aspect`/`cost`/`cost-tone` 属性；事件 `duplicate` / `rerun` / `delete`
- **特性**: 紫色任务类型徽标（Text To Image ▸）、模型数 · 相对时间头部、Prompt 段落、AspectRatio mono 角标 + Total Cost 等宽绿色费用行、⚑ 收藏、底部 ⧉ / ↻ / 🗑 动作行（删除悬停红色）+ ⇗ 分享。

### 173. `ImageGenMetaBar` (生成结果元信息条)
- **Props**: `model?='openai/gpt-image-2'`, `jobId?='# 019f1ba4'`, `duration?='169.0s'`, `cost?='$ 0.211'`, `className?`
- **Vanilla 用法**: `<image-gen-meta-bar>` + `model`/`job-id`/`duration`/`cost` 属性（纯展示，无事件）
- **特性**: 左下模型徽标浮层（毛玻璃深色 pill）、等宽元信息行（job id · ◷ 时长 · 右对齐费用）、贴合生成图底部的页脚条。

### 174. `GammaImageDetail` (图片详情面板)
- **Props**: `title?='AI images'`, `preview?`, `prompt?`, `liked?=false`, `className?`, `onDownload?()`, `onZoom?()`, `onDelete?()`, `onLike?()`, `onDislike?()`
- **Vanilla 用法**: `<gamma-image-detail>` + `title`/`preview`/`prompt` 属性、`liked` property；事件 `download` / `zoom` / `delete` / `like` / `dislike` / `close`
- **特性**: 大图预览区（无 preview 时 🖼 占位）、↓ / 🔍 / 🗑 工具行（删除悬停红色）+ 👎 / 👍 反馈对（liked 时玫红高亮 + aria-pressed）、标题行 ✕ 关闭、完整 Prompt 边框阅读块。

### 175. `WriterStyleGuide` (写作风格指南卡)
- **Props**: `entries?: [{id,title,description,minutes}]`, `activeTab?='company'`, `className?`, `onTabChange?(tab)`, `onEntryClick?(entry)`
- **Vanilla 用法**: `<writer-style-guide>` + `entries` JSON 属性或 `entries`/`activeTab` property；事件 `tab-change {tab}` / `entry-click {entry}`
- **特性**: Company / Team / My 三标签页（激活项 indigo 下划线）、编号圆形序号 + 标题 / 描述 / 阅读时长三行条目、行 hover、底部虚线 "+ Add guideline" CTA、空 entries 时仅渲染标签页。

### 176. `CampsiteHandoff` (设计交付面板)
- **Props**: `items?: [{id,label,done?,assignee?,due?}]`, `summary?`, `className?`, `onToggle?(item)`
- **Vanilla 用法**: `<campsite-handoff>` + `items` JSON 属性或 `items` property、`summary` 属性；点击条目翻转 done 并派发 `toggle {item}`
- **特性**: 标题行 + x/y done 圆角计数徽章、复选框行（完成项删除线灰化）、负责人首字母头像 + 截止日期、✦ AI summary 靛蓝摘要块、summary 为空时隐藏摘要区。

### 177. `ZendeskFieldSuggest` (工单字段建议条)
- **Props**: `fields?: [{id,label,value,confidence}]`, `className?`, `onApply?(field)`, `onDismiss?()`
- **Vanilla 用法**: `<zendesk-field-suggest>` + `fields` JSON 属性或 `fields` property；事件 `apply {field}`（点击即从条中移除）/ `dismiss`
- **特性**: 琥珀色建议条（✦ Suggested fields 标签）、字段 chips（标签: 值 + mono 置信度 %）点击即应用、右下 Ignore 按钮、dismiss / 应用完清空 chips。

### 178. `AiSuggestionCard` (AI 建议卡)
- **Props**: `message?: string`, `chips?: string[]`, `className?`, `onChipClick?(chip)`, `onClose?()`
- **Vanilla 用法**: `<ai-suggestion-card>` + `message`/`chips` JSON 属性或 `message`/`chips` property；事件 `chip-click {chip}` / `close`
- **特性**: ✦ 黑底圆形头像、建议消息段落、圆角跟进 chips 行（点击即派发）、右上 ✕ 关闭按钮（aria-label Dismiss suggestion）、chips 为空时隐藏 chips 行。

### 179. `JumpBackIn` (续聊卡片行)
- **Props**: `cards?: [{id,kind,title,subtitle,image?}]`, `className?`, `onCardClick?(card)`
- **Vanilla 用法**: `<jump-back-in>` + `cards` JSON 属性或 `cards` property；事件 `card-click {card}`
- **特性**: "Jump back in" 标题 + See all、卡片网格（h-32 缩略图，无 image 时 sky→indigo→slate 渐变占位）、底部渐变遮罩 + Trip（sky）/Chat（zinc）类型徽章、标题与副标题 truncate、hover 轻微放大。

### 180. `HelpResourcesPanel` (帮助资源面板)
- **Props**: `resources?: [{id,badge,title,description,minutes?}]`, `links?: string[]`, `className?`, `onResourceClick?(resource)`, `onLinkClick?(link)`
- **Vanilla 用法**: `<help-resources-panel>` + `resources`/`links` JSON 属性或 property；事件 `resource-click {resource}` / `link-click {link}`
- **特性**: Help 标题行、Tutorials & resources 分组标签、资源卡（indigo Reference / emerald Tutorial 徽章 + 可选 "N minutes" 时长 + 标题 / 描述）、底部链接行（links 为空隐藏）。

### 181. `VisionAnalysisCard` (视觉分析卡)
- **Props**: `sections?: [{heading, rows: [{key, value}]}]`, `className?`, `onSectionClick?(section)`
- **Vanilla 用法**: `<vision-analysis-card>` + `sections` JSON 属性或 property；事件 `section-click {section}`
- **特性**: 可点击分区标题（hover 变色）+ `dl` 属性行网格（`grid-cols-[minmax(0,9rem)_1fr]`，key dt / value dd），多分区纵向堆叠。

### 182. `PrReviewQueue` (PR 评审队列)
- **Props**: `groups?: [{id,label,prs: [{id,title,repo,number,author}]}]`, `className?`, `onPrClick?(pr)`
- **Vanilla 用法**: `<pr-review-queue>` + `groups` JSON 属性或 property；事件 `pr-click {pr}`；分组折叠由内部状态管理（点击分组行切换）
- **特性**: 可折叠分组（▼/▶ caret + 计数徽章 + 标签）、PR 行（indigo 首字母头像 + 标题 + `{author} · {repo} #{number}` 元信息）、hover 高亮。

### 183. `IterationActionBar` (迭代操作条)
- **Props**: `page?: number`, `totalPages?: number`, `className?`, `onAction?(action)`, `onPageChange?(page)`
- **Vanilla 用法**: `<iteration-action-bar>` + `page`/`total-pages` 属性；事件 `action {action}` / `page-change {page}`（翻页按钮内部更新页码）
- **特性**: Show More / Brainstorm / Reply 圆角 pills + ··· 溢出位（aria-label "More actions"）、‹ › 翻页器（边界禁用）与 `{page}/{totalPages}` 页码标签。

### 184. `MonitorRunList` (监控运行列表)
- **Props**: `runs?: [{id,name,startedAt,latencyMs,ok?}]`, `histogram?: [{label,value}]`, `ranges?: string[]`, `activeRange?: string`, `className?`, `onRunClick?(run)`, `onRangeChange?(range)`
- **Vanilla 用法**: `<monitor-run-list>` + `runs`/`histogram`/`ranges`/`active-range` 属性；事件 `run-click {run}` / `range-change {range}`（时段点击内部更新激活态）
- **特性**: Filter 按钮 + 时段 pills（激活态 emerald 实底）、迷你请求直方图（emerald 条形按值缩放）、运行行（✅/⚠️ 状态图标 + Started At + 名称 + 格式化延迟 "7 s 668 ms"）。

### 185. `EvalTurnBuilder` (评估回合编排器)
- **Props**: `turns?: [{id,role,turn,content,mock?}]`, `className?`, `onTurnRemove?(turn)`, `onAddTurn?(role)`
- **Vanilla 用法**: `<eval-turn-builder>` + `turns` JSON 属性或 property；事件 `turn-remove {turn}`（点击 ✕ 同时从 DOM 移除回合）/ `add-turn {role}`
- **特性**: 角色徽章（SYSTEM 紫 / USER 天蓝 / ASSISTANT 翠绿 / TOOL RESPONSE 琥珀）+ Mock 标签 + Turn 序号、`pre` 内容块（max-h 滚动）、底部 + Add User / Assistant / Tool Response 三列页脚。

### 186. `AgentSessionTimeline` (会话时间线)
- **Props**: `title?`, `status?`, `duration?`, `stepsCount?`, `steps?: [{id,kind,label,at}]`, `requests?: [{id,url,method?,status,duration,ok?}]`, `className?`, `onStepClick?(step)`
- **Vanilla 用法**: `<agent-session-timeline>` + `steps`/`requests` JSON 属性；事件 `step-click {step}`
- **特性**: 标题 + Complete 徽章 / ⏱ 时长 / ≡ 步骤数 chips、prompt/reason/tool 三色分段活动条、步骤列表（kind 徽章 + 标签 + 时间戳）、请求面板（失败状态红色显示）。

### 187. `EvalRunResults` (评估运行结果)
- **Props**: `passRate?`, `passLabel?`, `counters?: {passed,unknown,failed,total}`, `filterLabel?`, `filterValue?`, `sections?: [{id,name,subtitle,icon?,results:[{id,status,reason,response,variables?}]}]`, `className?`, `onResultClick?(result, section)`
- **Vanilla 用法**: `<eval-run-results>` + `sections`/`pass-rate`/`pass-label`/`counters`/`filter-label`/`filter-value` 属性；事件 `result-click {result, section}`
- **特性**: 通过率大字（emerald）+ 四计数行（✓/⊘/✕/≡）、Status "has any of" 过滤 chip、按 evaluator 分节（图标 + 名称 + 副标题）的结果表：状态 pill（passed 绿 / failed 红 / unknown 琥珀）、Reason、Response（line-clamp-2）、变量 chips（violet mono）。

### 188. `EventTagGrid` (事件标签网格)
- **Props**: `title?`, `scopes?: string[]`, `activeScope?`, `groups?: [{id,title,tags:[{key,value,link?}]}]`, `className?`, `onTagClick?(tag, group)`
- **Vanilla 用法**: `<event-tag-grid>` + `groups`/`scopes`/`active-scope`/`title` 属性；事件 `tag-click {tag, group}` / `scope-change {scope}`（scope 点击内部更新激活态）
- **特性**: 标题 + 分段式 scope pills（激活白底阴影）、双列 key/value 网格（mono 灰键 + 截断值按钮）、`link` 值以 zinc/sky 可点击样式高亮（可检索标签）。

### 189. `PromptTunerResult` (提示词调优结果)
- **Props**: `optimizedPrompt?`, `completions?: [{id,label,text}]`, `activeCompletionId?`, `className?`, `onCopyPrompt?()`, `onCompletionChange?(completion)`
- **Vanilla 用法**: `<prompt-tuner-result>` + `optimized-prompt`/`completions`/`active-completion` 属性；事件 `copy-prompt` / `completion-change {completion}`（选择器 change 内部切换完成文本）
- **特性**: OPTIMIZED PROMPT 暗色代码面板（mono 小标签 + Copy 按钮 + max-h 滚动 pre）、COMPLETIONS 卡片（mono 小标签 + 完成选择器）、完成文本 pre-wrap 查看器。

### 190. `AuditLogTable` (审计日志表)
- **Props**: `title?`, `filters?: [{label,value}]`, `trend?: [{label,value}]`, `views?: string[]`, `activeView?`, `events?: [{id,time,actor,event,status,target}]`, `className?`, `onEventClick?(event)`, `onViewChange?(view)`
- **Vanilla 用法**: `<audit-log-table>` + `title`/`filters`/`trend`/`views`/`active-view`/`events` 属性；事件 `event-click {event}` / `view-change {view}`（视图切换内部更新激活态）
- **特性**: 筛选 pills（◷ 标签: 值 ▾）、迷你柱状趋势（按值归一化高度）、N events 计数 + 分段视图切换、四列表格（Time/Actor/Event info/Targets），行内 SUCCESS/FAILURE/PENDING 徽章（绿/红/琥珀）。

### 191. `ChangelogTimeline` (产品更新日志)
- **Props**: `title?`, `subtitle?`, `searchPlaceholder?`, `filterLabel?`, `entries?: [{id,date,tag,tone?,title,body,likes?,views?}]`, `className?`, `onEntryClick?(entry)`
- **Vanilla 用法**: `<changelog-timeline>` + `title`/`subtitle`/`search-placeholder`/`filter-label`/`entries` 属性；`entries` property；事件 `entry-click {entry}`
- **特性**: 大标题 + 副标题头部、搜索框 + Filters 下拉控件行、左侧日期栏 + 分类 tag（sky/emerald/amber/violet 四色）、正文段落、♡ 点赞 / 👁 浏览 / 🔗 分享 meta 行。

### 192. `SessionDeviceTable` (登录会话/设备列表)
- **Props**: `title?`, `description?`, `learnMoreLabel?`, `logoutAllLabel?`, `pageLabel?`, `page?`, `rowsPerPageLabel?`, `rowsPerPage?`, `sessions?: [{id,os,application,location,ip,lastActive,status}]`, `className?`, `onSessionClick?(session)`, `onLogoutAll?()`
- **Vanilla 用法**: `<session-device-table>` + `title`/`description`/`learn-more-label`/`logout-all-label`/`page-label`/`page`/`rows-per-page-label`/`rows-per-page`/`sessions` 属性；`sessions` property；事件 `session-click {session}` / `logout-all` / `rows-per-page-change {rowsPerPage}`
- **特性**: 头部（标题 + 帮助文案 + Learn more 链接 + Log out 全部按钮）、六列表格（OS/应用/位置/IP/最近活跃/状态，OS 图标按名称子串匹配）、Current(紫)/Active(绿)/Logged out(灰) 徽章、底部分页器 + 每页行数选择器（10/25/50）。

### 193. `TaskDetailPanel` (任务详情面板)
- **Props**: `type?`, `title?`, `aiBarText?`, `aiBarActions?: string[]`, `statusLabel?`, `fields?: [{label,value,icon?,tag?}]`, `description?`, `actions?: [{id,icon,label}]`, `activityTitle?`, `activity?: [{id,actor,text,time}]`, `commentPlaceholder?`, `className?`, `onActionClick?(action)`, `onCommentSubmit?(text)`
- **Vanilla 用法**: `<task-detail-panel>` + `type`/`title`/`ai-bar-text`/`ai-bar-actions`/`status-label`/`fields`/`description`/`actions`/`activity-title`/`activity`/`comment-placeholder` 属性；事件 `action-click {action}` / `comment-submit {text}`（发送按钮或输入框 Enter 触发）
- **特性**: 类型胶囊头 + Ask AI / Share、AI 建议条（or 连接的动作链接）、双列字段网格（sky 状态胶囊 + 标签值紫 chip）、描述折叠区、动作列表（图标 + 标签）、Activity 侧栏（Show more + 动态流 + Comment/Email tab + 评论框）。

### 194. `DeliveryTrackingPanel` (配送追踪面板)
- **Props**: `title?`, `etaPrefix?`, `eta?`, `statusText?`, `steps?: [{id,icon,label,state}]`, `courierName?`, `courierRole?`, `orderName?`, `orderSummary?`, `items?: [{id,name,quantity,price}]`, `giftRecipient?`, `giftMessage?`, `shareTitle?`, `shareDescription?`, `copyLinkLabel?`, `textLinkLabel?`, `className?`, `onCourierCall?()`, `onCourierMessage?()`, `onCopyLink?()`, `onTextLink?()`
- **Vanilla 用法**: `<delivery-tracking-panel>` + `title`/`eta-prefix`/`eta`/`status-text`/`steps`/`courier-name`/`courier-role`/`order-name`/`order-summary`/`items`/`gift-recipient`/`gift-message`/`share-title`/`share-description`/`copy-link-label`/`text-link-label` 属性；事件 `courier-call` / `courier-message` / `copy-link` / `text-link`
- **特性**: 地图占位（渐变 + 骑手/目的地 pin + 返回/Help/缩放控件）、ETA 头部、四段 stepper（done/active 黑色 + pending 灰）、骑手卡片（📞/💬 圆形按钮）、Order Details 圆形折叠条（内部更新开合）、订单明细 + 礼品区块 + Copy link / Text me the link 双按钮（红色主按钮）。

### 195. `MapPropertyCard` (地图房源卡片)
- **Props**: `pins?: [{id,price,x,y}]`, `activePinId?`, `card?: {id?,images?,title,rating,reviews,subtitle,price,dates?} | null`, `likeLabel?`, `closeLabel?`, `className?`, `onPinClick?(pin)`, `onCardClose?()`, `onCardLike?()`
- **Vanilla 用法**: `<map-property-card>` + `pins`/`active-pin-id`/`card`（`"null"` 隐藏预览卡）/`like-label`/`close-label` 属性；事件 `pin-click {pin}`（点击内部激活 pin）/ `card-close`（内部移除预览卡）/ `card-like`
- **特性**: 地图占位（渐变 + 缩放控件）、价格 pin（激活黑底白字）、悬浮预览卡（渐变图区 + 收藏/关闭按钮 + 轮播点 + 下一张箭头、标题 + ★ 评分(评论数)、副标题、价格 · 日期）。

### 196. `ApiReferenceViewer` (API 参考文档)
- **Props**: `title?`, `method?`, `endpoint?`, `paramsTitle?`, `params?: [{name,type,meta?,required?,description}]`, `responsesTitle?`, `responses?: [{status,tone?,label,schema,body}]`, `languages?: [{id,label,sample}]`, `activeLanguageId?`, `responseTitle?`, `className?`, `onParamClick?(param)`, `onLanguageChange?(language)`
- **Vanilla 用法**: `<api-reference-viewer>` + `title`/`method`/`endpoint`/`params-title`/`params`/`responses-title`/`responses`/`languages`/`active-language-id`/`open-statuses`/`response-title` 属性；事件 `param-click {param}` / `language-change {language}`
- **特性**: 双栏布局（左定义卡右代码面板）、方法徽章五色（GET/POST/PUT/PATCH/DELETE 含暗色变体）、参数行（名称 + 类型 · 约束 + optional 红标 + 描述）、响应折叠列表（状态徽章三色调 + schema 行 + Show properties ＋）、代码面板（语言下拉 + 请求样例 + Test it ▸ + JSON 响应天蓝高亮）。

### 197. `WeekCalendarGrid` (周视图日历网格)
- **Props**: `days?: [{id,label,date}]`, `startHour?`, `endHour?`, `timeZone?`, `events?: [{id,dayId,title,subtitle?,start,end,tone?('solid'|'dashed'),color?('blue'|'green'|'amber')}]`, `view?`(`'week'|'day'`), `activeDayId?`, `nowHour?`, `composerPlaceholder?`, `className?`, `onEventClick?(event)`, `onViewChange?(view)`, `onFindTime?()`
- **Vanilla 用法**: `<week-calendar-grid>` + `days`/`events`/`start-hour`/`end-hour`/`time-zone`/`view`/`active-day-id`/`now-hour`/`composer-placeholder` 属性；事件 `event-click {event}` / `view-change {view}` / `find-time` / `compose-submit {text}`（composer 内 Enter）
- **特性**: 小时刻度槽（左栏）、日列网格（绝对定位事件块：实心蓝绿琥珀三色 / 虚线 Focus 块）、红色当前时刻线 + 圆点、Day/Week 分段切换（激活黑底白字）、Find time 按钮、"Schedule or reschedule…" 作曲输入框。

### 198. `VideoProjectSettings` (视频项目设置)
- **Props**: `panelTitle?`, `panelEmptyText?`, `chapters?: [{id,label,timestamp}]`, `addChapterLabel?`, `titleLabel?`, `titleValue?`, `descriptionLabel?`, `descriptionValue?`, `thumbnailLabel?`, `thumbnails?: [{id,src?,gradient?}]`, `selectedThumbnailId?`, `storageUsed?`, `storageTotal?`, `className?`, `onAddChapter?()`, `onTitleChange?(value)`, `onDescriptionChange?(value)`, `onThumbnailSelect?(thumbnail)`
- **Vanilla 用法**: `<video-project-settings>` + `panel-title`/`panel-empty-text`/`chapters`/`add-chapter-label`/`title-label`/`title-value`/`description-label`/`description-value`/`thumbnail-label`/`thumbnails`/`selected-thumbnail-id`/`storage-used`/`storage-total` 属性；事件 `add-chapter` / `thumbnail-select {thumbnail}` / `title-change {value}` / `description-change {value}`
- **特性**: 左侧 Chapters 面板（返回/关闭、🔖 图标块、空态文案 + 虚线 "＋ Add a chapter"）、右侧表单（Title 输入、Description 多行文本、缩略图选择器：上传块 + 渐变块选中 ring-2、💾 存储用量徽章）。

### 199. `EventStreamPanel` (审计事件流)
- **Props**: `filterPlaceholder?`, `eventColumnLabel?`, `dateColumnLabel?`, `events?: [{id,name,date,metadata:[{label,value}],details}]`, `metadataTitle?`, `detailsTitle?`, `detailsLines?`, `className?`, `onFilterChange?(value)`, `onEventSelect?(event)`, `onViewEvent?(event)`
- **Vanilla 用法**: `<event-stream-panel>` + `filter-placeholder`/`event-column-label`/`date-column-label`/`events`/`metadata-title`/`details-title`/`details-lines`/`active-event-id` 属性；事件 `filter-change {value}` / `event-select {event}` / `view-event {event}`
- **特性**: 左 3/5 事件列表卡（过滤输入实时收窄 + Event/Date 双列头 + 空态）、右 2/5 详情列（Metadata 键值对 + View event 全宽按钮、Event Details JSON 块带行号 + Previous/Next 分页器）。

### 200. `ProjectGanttTimeline` (项目甘特时间线)
- **Props**: `months?: [{label,weeks}]`, `projects?: [{id,emoji,name,status,points,start,end,tone?}]`, `todayMonth?`, `todayFraction?`, `className?`, `onProjectClick?(project)`
- **Vanilla 用法**: `<project-gantt-timeline>` + `months`/`projects`/`today-month`/`today-fraction` 属性；事件 `project-click {project}`
- **特性**: 月刻度表头带周子刻度与红色 Today 徽标、项目行（emoji/名称/状态徽标/pts）+ 横向时长条（sky/violet/emerald/amber 四色调）、红色当前日期竖线贯穿行区（Linear Projects 时间线模式）。

### 201. `GroupedTaskList` (分组任务列表)
- **Props**: `sections?: [{id,label,tasks:[{id,title,due,done,subtasks?,likes?,comments?,assignee}]}]`, `detail?: {completedLabel?,title,assignee,due,project,projectStatus?,fields[{label,value,tone?}],tags?,description?}`, `addTaskLabel?`, `commentPlaceholder?`, `className?`, `onTaskClick?(task)`, `onSectionToggle?(sectionId, open)`, `onCommentSubmit?(text)`
- **Vanilla 用法**: `<grouped-task-list>` + `sections`/`detail`/`add-task-label`/`comment-placeholder` 属性；事件 `task-click {task}` / `section-toggle {sectionId, open}` / `comment-submit {text}`
- **特性**: 左 3/5 列表（＋ Add task 工具栏、Name 列头、可折叠 To Do / In Progress / Done 分组、任务行完成圈/👍💬⑂ 计数/到期/琥珀头像、Add task… 内联行）、右 2/5 详情（✓ Completed 徽标、Assignee/Due date/Projects 元信息、字段网格含 Priority rose 色块、Tags 翡翠芯片、描述、回车提交评论输入）（Asana 列表视图模式）。

### 202. `EventLogTable` (事件日志表)
- **Props**: `title?`, `description?`, `filters?: string[]`, `dateRangeLabel?`, `exportLabel?`, `columnLabels?: string[]`, `entries?: [{id,type,date,time,source,role,action,targets,details,muted?}]`, `className?`, `onFilterSelect?(filter)`, `onExport?`, `onEntryClick?(entry)`
- **Vanilla 用法**: `<event-log-table>` + `title`/`description`/`filters`/`column-labels`/`entries`/`date-range-label`/`export-label` 属性；事件 `filter-select {filter}` / `entry-click {entry}` / `export`
- **特性**: 标题 + 描述头部、Type/Source/Action/Target 下拉过滤行 + 🗓 日期范围 + ↓ Export CSV、六列日志表（TYPE/DATE/SOURCE 角色/ACTION/TARGETS/DETAILS），旧条目 muted 灰化（Vanta 事件日志模式）。

### 203. `DocsPageLayout` (文档页面布局)
- **Props**: `topLinks?: [{id,label,icon?}]`, `navGroups?: [{label,items:[{id,label,icon?,badge?}]}]`, `title?`, `copyLabel?`, `blocks?: DocsBlock[]`, `toc?: [{id,label}]`, `activeTocId?`, `className?`, `onNavClick?(item)`, `onTocClick?(item)`, `onCopyPage?`
- **Vanilla 用法**: `<docs-page-layout>` + `top-links`/`nav-groups`/`title`/`copy-label`/`blocks`/`toc`/`active-toc-id` 属性；事件 `nav-click {item}` / `toc-click {item}` / `copy-page`
- **特性**: 三栏文档壳（220px 左导航：顶部链接 + 分组导航含 Start here 徽标；中栏文章：标题 + ⧉ Copy page 按钮点击后变 ✓ Copied、callout info/success/warning、cards 网格、终端代码块；右栏 On this page TOC 左边框活动高亮）（Mintlify 文档模式）。

### 204. `TaskCardModal` (任务卡片弹窗)
- **Props**: `title?`, `completed?`, `members?: [{id,name,initials?,avatarUrl?}]`, `labels?: [{id,label,color}]`, `dates?`, `description?`, `attachments?: [{id,name,meta,kind?:"link"|"file"}]`, `checklist?: [{id,text,done}]`, `comments?: [{id,author,initials?,text,time}]`, `commentPlaceholder?`, `className?`, `onCardClose?`, `onCompleteToggle?(completed)`, `onChecklistToggle?(item)`, `onCommentSubmit?(text)`
- **Vanilla 用法**: `<task-card-modal>` + `title`/`completed`/`members`/`labels`/`dates`/`description`/`attachments`/`checklist`/`comments`/`comment-placeholder` 属性；事件 `card-close` / `complete-toggle {completed}` / `checklist-toggle {item}` / `comment-submit {text}`（输入框回车或 Comment 按钮提交）
- **特性**: 半透明遮罩 + 居中弹窗（完成复选框切换标题删除线、右上 ✕ 关闭）、Members 圆形头像组 / Labels 彩色芯片 / Dates 区间行、描述区、链接/文件附件行（🔗/📄 图标）、Checklist 完成 % + 翡翠进度条 + 可勾选条目、右栏 Comments & activity 评论输入（Enter 提交）+ 时间线评论（Trello 卡片弹窗模式）。

### 205. `FormTrackingDashboard` (表单追踪仪表盘)
- **Props**: `title?`, `active?`, `stats?: [{id,label,value,pct,tone:"sky"|"emerald"|"amber"|"rose",icon?}]`, `details?: [{label,value}]`, `requests?: [{id,name,initials?,avatarUrl?,submitted,service,status:"completed"|"to-be-completed"|"not-completed"}]`, `sortOptions?: string[]`, `className?`, `onBack?`, `onSortChange?(option)`, `onRequestClick?(row)`
- **Vanilla 用法**: `<form-tracking-dashboard>` + `title`/`active`/`stats`/`details`/`requests`/`sort-options` 属性；事件 `back` / `sort-change {option}` / `request-click {row}`（点击外部关闭下拉）
- **特性**: ← 返回 + 标题 + Active 翡翠胶囊 + Options 排序下拉、四张统计卡（色调圆点 + 图标 + 大数值 + % 进度条）、Consultation form details 两列明细网格、Client form requests 表格（头像行 + Submitted/Service 列 + Completed 翡翠 / To be completed 琥珀 / Not completed 玫红状态胶囊）（Fresha 表单追踪模式）。

### 206. `AudioPlaylistPage` (音频播放列表页)
- **Props**: `title?`, `subtitle?`, `coverUrl?`, `tracks?: [{id,title,artist,duration,coverUrl?,version?,liked?}]`, `queue?: [{id,title,artist,duration}]`, `activeTrackId?`, `className?`, `onTrackClick?(track)`, `onLike?(track)`, `onRemix?(track)`, `onQueueClick?(track)`
- **Vanilla 用法**: `<audio-playlist-page>` + `title`/`subtitle`/`cover-url`/`tracks`/`queue`/`active-track-id` 属性；事件 `track-click {track}` / `like {track}` / `remix {track}` / `queue-click {track}`（Play 按钮与播放条切换 ❚❚/▶）
- **特性**: 品紫青渐变封面（径向纹理占位）+ Playlist 眉题 + Play/Share 按钮、曲目行（序号/迷你封面/标题艺人/version 胶囊/时长/Remix ▾/♡♥ 点赞切换且红心高亮）、工具栏（N songs + Like/Comment）、底部深色播放条（播放切换/曲名/进度条/快退快进音量）、右栏 Queue 队列 + 拖放占位（Suno 音频工作台模式）。

### 207. `BlogPostArticle` (博客文章页)
- **Props**: `siteName?`, `title?`, `subtitle?`, `meta?`, `blocks?: [{type:"paragraph"|"heading"|"list"|"code",...}]`, `toc?: [{id,text,level?}]`, `activeHeadingId?`, `codeLabel?`, `copiedLabel?`, `className?`, `onHeadingClick?(heading)`, `onCopyCode?`
- **Vanilla 用法**: `<blog-post-article>` + `site-name`/`title`/`subtitle`/`meta`/`blocks`/`toc`/`active-heading-id`/`code-label`/`copied-label` 属性；事件 `heading-click {heading}` / `copy-code`（Copy 按钮 1.5s 后还原）
- **特性**: 顶栏（站点名 + ⌕ Search ⌘K 胶囊 + ☾ 主题按钮）、左栏 On this page TOC（sky 活动高亮 + level 3 缩进 + Collapse ⌘\ 提示）、文章体（大标题 + 副题 + meta、段落、h2/h3 标题、圆点列表、深色代码块带 language 眉题 + ⧉ Copy 按钮点击变 Copied!）（Hashnode 文章模式）。

### 208. `PermissionMatrix` (角色权限矩阵)
- **Props**: `title?`, `description?`, `roles?: string[]`, `groups?: [{id,title,rows:[{id,label,cells:("edit"|"view"|"none"|"na")[]}]}]`, `className?`, `onCellClick?({row,role,state,roleIndex})`
- **Vanilla 用法**: `<permission-matrix>` + `title`/`description`/`roles`/`groups` 属性（JSON）；事件 `cell-click {row, role, state, roleIndex}`
- **特性**: 标题 + 描述、Overview / Permission details 双 tab（indigo 下划线活动态）、分组权限行（组头跨整行 zinc-50 底）、角色列居中单元格（✔ Edit 绿 / 👁 View only / ✖ No access 红 / N/A 灰）（Vanta Roles 模式）。

### 209. `StockPhotoPicker` (媒体选图模态)
- **Props**: `title?`, `poweredBy?`, `placeholder?`, `photos?: [{id,url,alt?,author?,span?}]`, `open?`, `className?`, `onSearch?(query)`, `onAdd?(photo)`, `onClose?`
- **Vanilla 用法**: `<stock-photo-picker>` + `title`/`powered-by`/`placeholder`/`photos`/`open` 属性；事件 `search {query}` / `add {photo}` / `close`（Esc 或 ✕）
- **特性**: 标题栏 + ✕ 关闭、搜索输入（orange focus ring + 清除按钮）、⭳ Powered by 标注、masonry 图片网格（span 2 高瓦片、hover 显作者名 + 绿色 Add 按钮、空态提示）（Substack Stock photos 模式）。

### 210. `MapActivityList` (地图活动列表)
- **Props**: `title?`, `activities?: [{id,title,image?,emoji?,city,duration,rating,reviews,price,oldPrice?,x,y}]`, `filters?: string[]`, `className?`, `onActivityClick?(activity)`, `onFilterClick?(filter)`, `onCloseMap?`
- **Vanilla 用法**: `<map-activity-list>` + `title`/`activities`/`filters` 属性（JSON）；事件 `activity-click {activity}` / `filter-click {filter}` / `close-map`
- **特性**: 左栏筛选 chips + 可滚动活动卡（emoji/图片、城市、标题、时长、★评分 (评论数)、划线原价 + 现价）、右栏 SVG 地图占位 + 评分 pin 气泡（点击联动高亮 indigo）、Close map 按钮（GetYourGuide 模式）。

### 211. `SearchResultsPage` (搜索结果页)
- **Props**: `query?`, `filterSelects?: [{id,label,options?}]`, `relatedSearches?: string[]`, `results?: [{id,title,space,type,author,updated,snippet}]`, `className?`, `onSearchSubmit?(query)`, `onFilterChange?(id,value)`, `onRelatedClick?(term)`, `onResultClick?(entry)`
- **Vanilla 用法**: `<search-results-page>` + `query`/`filter-selects`/`related-searches`/`results` 属性（JSON）；事件 `search-submit {query}`（按钮或 Enter）/ `filter-change {id, value}` / `related-click {term}` / `result-click {result}`
- **特性**: 顶部搜索栏（⌕ 输入 + blue Search 按钮）、筛选 select 行 + N results 计数、Related searches 双列胶囊 chips、结果条目（blue 标题 hover 下划线、space • type • author • updated 面包屑、摘要段）（Confluence 搜索模式）。

### 212. `SessionDiagnosticsPanel` (通话诊断面板)
- **Props**: `title?='Events Timeline'`, `devices?: [{label,value,emoji}]`, `tracks?: [{id,label,emoji,windows:[{start,width,level:'good'|'poor'|'bad'}]}]`, `events?: [{id,no,message,time}]`, `className?`, `onEventClick?(event)`, `onSearch?(query)`
- **Vanilla 用法**: `<session-diagnostics-panel>` + `title`/`devices`/`tracks`/`events` 属性（JSON）；事件 `event-click {event}` / `search {query}`（输入内联过滤事件列表，保焦点）
- **特性**: 设备信息双卡网格（Browser/OS + emoji）、每轨质量时间条（emerald/amber/rose 绝对定位窗口）、事件日志表（60px 编号列 + mono 消息 + 时间）+ 圆角搜索框内联过滤与空态（Whereby Insights 模式）。

### 213. `HelpCenterHome` (帮助中心首页)
- **Props**: `title?='Welcome to the Help Center'`, `searchPlaceholder?='Cancellation, meeting point, etc.'`, `topics?: [{id,label,articles?:string[]}]`, `className?`, `onSearchSubmit?(query)`, `onTopicClick?(topic)`, `onArticleClick?(topic, article)`
- **Vanilla 用法**: `<help-center-home>` + `title`/`search-placeholder`/`topics` 属性（JSON）；事件 `search-submit {query}`（capture 拦截 submit）/ `topic-click {topic}`（展开折叠）/ `article-click {topic, article}`
- **特性**: 居中欢迎标题、Search for a topic 标签 + 搜索框（🔍 indigo 提交钮）、Or browse by topic 分组行（有 articles 可展开，chevron ›/▾，文章 indigo hover 下划线）（GetYourGuide Help 模式）。

### 214. `AccountSecurityPanel` (账号安全面板)
- **Props**: `tabs?: string[]`, `passwordValue?='••••••••'`, `sessionsTitle?='Manage verified sessions'`, `sessionsDescription?`, `sessions?: [{id,device,detail}]`, `className?`, `onTabClick?(tab)`, `onEditPassword?()`, `onRemoveSession?(session)`
- **Vanilla 用法**: `<account-security-panel>` + `tabs`/`password-value`/`sessions-title`/`sessions-description`/`sessions` 属性（JSON）；事件 `tab-click {tab}` / `edit-password` / `remove-session {session}`
- **特性**: Account 标题 + 下边线 tab 行（Security 激活）、Password 行（mono 密码点 + Edit 边框钮）、Manage verified sessions 卡片（说明段、zinc-50 设备行 + ✕ 移除、Done 右对齐）；非 Security tab 显示 dashed 占位（Podia 账号模式）。

### 215. `MasonryDensityControls` (密度控制瀑布流)
- **Props**: `title?='Discovery wall'`, `items?: [{id,url,alt,span?}]`, `columns?=4`, `padding?=12`, `className?`, `onItemClick?(item)`
- **Vanilla 用法**: `<masonry-density-controls>` + `title`/`items`/`columns`/`padding` 属性（JSON）；事件 `item-click {item}` / `density-change {columns, padding}` / `close`
- **特性**: 黑底 zinc-950 沉浸容器、悬浮 bg-black/80 backdrop-blur 控制条（Size 2-6 滑杆 + Padding 4-32 滑杆 + ✕）、`N cols · Npx` meta 读数、CSS columns 瀑布流（break-inside-avoid、aspectRatio 按 span 3/4·4/5·1/1、hover scale-105）（Savee 发现墙模式）。

### 216. `LiquidGlass` (Apple 液态玻璃材质容器)
- **Props**: `variant?: 'capsule'|'card'|'sidebar'`, `intensity?: 'regular'|'thick'`, `interactive?=true`, `enableTilt?=false`, `maxTilt?=4`, `glareOpacity?=0.35`, `className?`
- **Vanilla 用法**: `<liquid-glass>` + `variant`/`intensity`/`interactive`/`enable-tilt`/`max-tilt`/`glare-opacity` 属性；无事件
- **特性**: backdrop blur + 镜面高光 rim + 可选指针 tilt 折射；capsule=悬浮药丸/工具坞、card=内容卡/模态面板、sidebar=边缘半透明导航（Apple material 模式）；数值 prop 已白名单化（JS 调用方传字符串也安全）。

### 217. `AnimatedCounter` (数字滚动计数器)
- **Props**: `target: number`, `start?=0`, `duration?=1500`, `delay?=0`, `suffix?`, `prefix?`, `className?`
- **Vanilla 用法**: `<animated-counter>` + `target`/`start`/`duration`/`delay`/`suffix`/`prefix` 属性；无事件
- **特性**: IntersectionObserver 进入视口后 easeOutCubic 计数；reduced-motion 直接跳终值；font-mono + tabular-nums（stat card 模式）。

### 218. `SpotlightGlareCard` (指针追光卡片)
- **Props**: `children?`, `glareOpacity?=0.45`, `glareRadius?=55`, `enableTilt?=false`, `maxTilt?=5`, `className?`, `style?`, `onClick?`
- **Vanilla 用法**: `<spotlight-glare-card>` + `glare-opacity`/`glare-radius`/`enable-tilt`/`max-tilt` 属性；无事件
- **特性**: 指针跟随径向 glare + 可选 3D tilt；reduced-motion 短路 tilt；数值 prop 白名单化（hero card 模式）。

### 219. `PointerRipples` (WebGL 指针涟漪背景)
- **Props**: `simResolution?=128`, `dyeResolution?=768`, `densityDissipation?=2.4`, `velocityDissipation?=1.6`, `pressure?=0.8`, `curl?=18`, `splatRadius?=0.25`, `splatForce?=6000`, `shading?=true`, `opacity?=0.58`, `idleMs?=5000`, `className?`
- **Vanilla 用法**: `<pointer-ripples>` + 上述 kebab-case 属性（`sim-resolution` 等）+ `shading`；无事件
- **特性**: Navier-Stokes 流体模拟、彩虹染色泼溅、涡量旋 swirl、3D diffuse shading、闲置自动沉降；WebGL 不可用时优雅降级；opacity 属性局部更新不重建引擎（hero background 模式）。

### 220. `FluidContourBackdrop` (流体墨线等高线背景)
- **Props**: `inkColor?: [r,g,b] 0-1`, `paperColor?: [r,g,b] 0-1`, `speed?=0.035`, `interactive?=true`, `className?`
- **Vanilla 用法**: `<fluid-contour-backdrop>` + `speed`/`interactive`/`ink-color`("r,g,b")/`paper-color`("r,g,b") 属性；无事件
- **特性**: 流动等高线墨纹、指针重力吸附、visibilitychange 暂停、WebGL 降级（ambient background 模式）。

### 216-220 注意事项（tactile 套件）
- PointerRipples/FluidContourBackdrop 的 canvas 为 `fixed inset-0` 全屏背景；在受限容器内展示时需用 CSS 覆写 `canvas{position:absolute!important;inset:0}` 并给容器 `relative overflow-hidden`（Gallery sections 209/210 即此做法）。
- 全部五个组件尊重 prefers-reduced-motion（tilt 短路 / 计数跳终值 / 背景静止首帧）。

### 221. `paper-theme` (共享主题资产，非组件)
- 三端同构导出 `PaperTrailThemeCSS` 字符串（react/vue `.ts` + vanilla `.js`）：纸感 trail 主题 CSS 变量集，供组件外部注入主题基调；不注册 custom element，不在 Gallery 展示。

### 222. `InvoiceHistoryTable` (发票历史表)
- **Props**: `title?='Invoice history'`, `currency?='USD'`, `downloadLabel?='Download'`, `invoices?: [{id,period,amount,status:'paid'|'pending'|'failed',date}]`, `onDownload?(invoice)`
- **Vanilla 用法**: `<invoice-history-table>` + `title`/`currency`/`download-label`/`invoices` 属性（JSON）；事件 `invoice-download {invoice}`
- **特性**: 状态三色徽章、mono 金额、paid 合计页脚（Contractbook / Remote 账单模式）。

### 223. `UsagePricingBreakdown` (用量计费拆解)
- **Props**: `title?='Usage this cycle'`, `currency?='USD'`, `tiers?: [{range,unit?,usage,unitPrice}]`, `footerNote?`
- **Vanilla 用法**: `<usage-pricing-breakdown>` + `title`/`currency`/`tiers`/`footer-note` 属性（JSON）；无事件
- **特性**: 当前 tier 高亮、逐行小计、估算总额页脚（用量计费模式）。

### 224. `CancelRetentionFlow` (取消挽留流程)
- **Props**: `title?`, `stepLabel?='Step'`, `reasonsLabel?`, `reasons?: [{id,label}]`, `offer?: {title,description,discountedPrice,originalPrice,periodLabel}|null`, `keepLabel?`, `confirmLabel?`, `onKeep?`, `onConfirmCancel?(reason)`, `onStepChange?(step)`
- **Vanilla 用法**: `<cancel-retention-flow>` + `title`/`step-label`/`reasons-label`/`reasons`/`offer`/`keep-label`/`confirm-label` 属性（JSON）；事件 `keep` / `confirm-cancel {reason}` / `step-change {step}`
- **特性**: 两步流程（原因单选卡 gating → 折扣挽留 offer 卡）、offer 为 null 时裸确认态（SaaS 降级挽留模式）。

### 225. `WebhookConfigPanel` (Webhook 端点管理)
- **Props**: `title?='Webhooks'`, `description?`, `endpoints?: [{id,url,events[],lastStatus,lastDelivery,active?}]`, `events?: string[]`, `testLabel?='Test'`, `eventsLabel?`, `onTest?(endpoint)`, `onToggle?(endpoint, active)`
- **Vanilla 用法**: `<webhook-config-panel>` + `title`/`description`/`endpoints`/`events`/`test-label`/`events-label` 属性（JSON）；事件 `webhook-test {endpoint}` / `webhook-toggle {endpoint, active}`
- **特性**: active 开关行淡出、2xx/4xx/5xx 三档投递徽章、事件虚线图例（webhook 设置模式）。

### 226. `IntegrationConnectGrid` (集成连接网格)
- **Props**: `title?='Integrations'`, `description?`, `integrations?: [{id,name,category?,connected?}]`, `connectLabel?='Connect'`, `disconnectLabel?='Disconnect'`, `onToggle?(integration, connected)`
- **Vanilla 用法**: `<integration-connect-grid>` + `title`/`description`/`integrations`/`connect-label`/`disconnect-label` 属性（JSON）；事件 `integration-toggle {integration, connected}`
- **特性**: 分类筛选 tabs、首字母 logo 占位、绿点 Connected 徽章、切换即时重渲染（集成设置模式）。

### 227. `NotificationPrefsMatrix` (通知偏好矩阵)
- **Props**: `title?='Notification preferences'`, `description?`, `events?: [{id,label,channels:{inapp,email,push}}]`, `columns?: [{key,label}]`, `onChange?(event, channel, enabled)`
- **Vanilla 用法**: `<notification-prefs-matrix>` + `title`/`description`/`events`/`columns` 属性（JSON）；事件 `pref-change {event, channel, enabled}`
- **特性**: 事件行 × 渠道列 checkbox 矩阵、列头可自定义（通知设置模式）。

### 228. `PermissionDeniedState` (权限受限空态)
- **Props**: `title?`, `description?`, `ctaLabel?='Request access'`, `contactLabel?`, `contactHref?`, `children?`, `onRequestAccess?`
- **Vanilla 用法**: `<permission-denied-state>` + `title`/`description`/`cta-label`/`contact-label`/`contact-href` 属性；事件 `request-access`；宿主可塞 `[data-denied-illustration-slot]` 自定义插画
- **特性**: 锁插画、主 CTA + 副链接（权限拒绝模式）。

### 229. `NoResultsState` (搜索无结果空态)
- **Props**: `query?`, `suggestions?: string[]`, `clearLabel?='Clear all filters'`, `didYouMeanLabel?`, `children?`, `onSuggestion?(s)`, `onClearFilters?`
- **Vanilla 用法**: `<no-results-state>` + `query`/`suggestions`/`clear-label`/`did-you-mean-label` 属性（JSON）；事件 `suggestion {suggestion}` / `clear-filters`
- **特性**: 引号内原查询 mono 强调、Did-you-mean chips、清筛选幽灵钮（零结果模式）。

### 230. `TableSavedViews` (数据表保存视图条)
- **Props**: `views?: [{id,label,filters?[]}]`, `active?`, `saveLabel?='Save view'`, `shareLabel?='Share'`, `onViewChange?(view)`, `onSaveView?(id)`, `onShareView?(id)`
- **Vanilla 用法**: `<table-saved-views>` + `views`/`active`/`save-label`/`share-label` 属性（JSON）；事件 `view-change {view, id}` / `view-save {id}` / `view-share {id}`
- **特性**: 下边线激活 tab、筛选 chips、无筛选占位（Attio / Rows 视图模式）。

### 231. `BottomTabBar` (移动端底部导航)
- **Props**: `tabs?: [{id,label,icon?,badge?}]`, `active?`, `label?='Primary navigation'`, `onChange?(id)`
- **Vanilla 用法**: `<bottom-tab-bar>` + `tabs`/`active`/`label` 属性（JSON）；事件 `tab-change {id}`
- **特性**: 顶部激活指示条、红色计数徽章、safe-area padding（移动导航模式）。

### 232. `BentoFeatureGrid` (Bento 特性网格)
- **Props**: `title?`, `description?`, `tiles?: [{id,title,description?,icon?,span?:1|2|3,media?}]`, `onTileClick?(tile)`
- **Vanilla 用法**: `<bento-feature-grid>` + `title`/`description`/`tiles` 属性（JSON）；事件 `tile-click {tile}`
- **特性**: sm:col-span-2/3 混排、icon 视觉位、可选媒体图（Krea AI / Magnific bento 模式）。

### 233. `LogoCloud` (客户 Logo 墙)
- **Props**: `kicker?='Trusted by teams at'`, `logos?: [{name,src?}]`
- **Vanilla 用法**: `<logo-cloud>` + `kicker`/`logos` 属性（JSON）；无事件
- **特性**: 灰度名/图 tile、hover 强调（logo cloud 社会证明模式）。

### 234. `StatsBand` (指标大数带)
- **Props**: `stats?: [{value,label,note?}]`
- **Vanilla 用法**: `<stats-band>` + `stats` 属性（JSON）；无事件
- **特性**: 2-4 列自适应、分隔线带状布局（落地页社会证明模式）。

### 235. `AmberEmbersBackdrop` (暖金余烬氛围背景)
- **Props**: `speed?=1`, `density?=72`, `baseColor?='#0d0d0d'`, `bloomColor?='#6b5947'`, `emberColor?='#e6b745'`, `interactive?=false`, `paused?=false`, `className?`, `style?`
- **Vanilla 用法**: `<amber-embers-backdrop>` + `speed`/`density`/`base-color`/`bloom-color`/`ember-color`/`interactive`/`paused` 属性；无事件
- **特性**: 深橄榄/炭黑渐变 + 底部暖金 bloom + 边缘暗角 + 上浮微光余烬（Canvas 2D，零依赖、无需 WebGL）；reduced-motion / visibilitychange 降级为静止首帧；灵感源自 ArkZero 暖金花谷氛围（原创实现，非源码复制）。受限容器内需覆写 `canvas{position:absolute!important;inset:0}` + 容器 `relative overflow-hidden`（Gallery section 226）。

### 236. `DriftEmbersBackdrop` (登录后花散冷灰背景)
- **Props**: `speed?=1`, `density?=120`, `baseColor?='#0d1113'`, `bloomColor?='#4a4430'`, `emberColor?='#b9af39'`, `ashColor?='#c8c9ca'`, `interactive?=false`, `paused?=false`, `className?`, `style?`
- **Vanilla 用法**: `<drift-embers-backdrop>` + `speed`/`density`/`base-color`/`bloom-color`/`ember-color`/`ash-color`/`interactive`/`paused` 属性；无事件
- **特性**: 冷炭黑→橄榄纵向场 + 中部暖带 + 左中暖光 + 金/灰混合下沉微粒 + 细颗粒纹理 + 轻暗角（Canvas 2D，零依赖、无需 WebGL）；reduced-motion / visibilitychange 降级为静止首帧；灵感源自 ArkZero 登录后花谷消散的 drift 态（原创实现，非源码复制），与 AmberEmbersBackdrop (#235) 构成 garden→drift 转场。受限容器内覆写同上（Gallery section 227）。

### 237. `McpConnectPanel` (MCP 服务器连接引导)
- **Props**: `title?='Connection guide'`, `description?`, `clients?: [{id,label,mark?,steps[],snippet?}]`
- **Vanilla 用法**: `<mcp-connect-panel>` + `title`/`description` 属性；property `clients`（JSON）；事件 `copy {client}`
- **特性**: 按 client 切 tab、编号步骤列表、可复制 config snippet 块 + Copied! 反馈（1600ms 复位）；Customer.io settings 风格。

### 238. `AgentNotificationFeed` (Agent 通知流)
- **Props**: `title?='Notifications'`, `items?: [{id,kind:'started'|'completed'|'failed'|'info',title,statusText?,caption?,time,unread?}]`
- **Vanilla 用法**: `<agent-notification-feed>` + `title` 属性；property `items`（JSON）；事件 `open {item}`
- **特性**: 状态点色映射（started sky/completed emerald/failed rose/info zinc）、statusText 高亮 + caption 行、相对时间 + 未读标记、"N new" 徽章；点击行标记已读。

### 239. `AgentErrorRecovery` (Agent 失败恢复态)
- **Props**: `title?='Oops! Something went wrong'`, `description?`, `runId?`, `retryLabel?='Retry'`, `resetLabel?='Start over'`, `supportText?`
- **Vanilla 用法**: `<agent-error-recovery>` + `title`/`description`/`run-id`/`retry-label`/`reset-label`/`support-text` 属性；事件 `retry`/`reset`
- **特性**: 居中 alert（warning 图标）+ run-id mono chip、Retry / Start over 双按钮，`reset-label` 为空隐藏次按钮；Typeform/Rive 错误态风格。

### 240. `AgentWorkspaceSettings` (Agent 工作区设置)
- **Props**: `title?='Workspace settings'`, `subtitle?`, `tabs?: [{id,label}]`, `sections?: [{id,title,description?,toggles:[{id,label,description?,enabled}]}]`
- **Vanilla 用法**: `<agent-workspace-settings>` + `title`/`subtitle` 属性；properties `tabs`/`sections`（JSON）；事件 `toggle {toggle,enabled}`
- **特性**: 可选 pill 分区 tab、分组标题 + 描述前置 toggle 行（emerald 开关）、每组 on 计数（N/M on）；Uxcel/Contra 设置页风格。

### 241. `AgentEnvVarEditor` (环境变量编辑器)
- **Props**: `title?='Environment variables'`, `description?`, `vars?: [{key,value,secret?}]`
- **Vanilla 用法**: `<agent-env-var-editor>` + `title`/`description` 属性；property `vars`（JSON）；事件 `change {vars}`
- **特性**: key/value 行 + secret 掩码（password）与 Show/Hide 切换、逐行 Delete、底部新增行（key+value+secret checkbox，空 key 禁用 Add）；任意编辑后 change 事件携带完整列表。

### 242. `AgentScheduleEditor` (Agent 定时调度编辑器)
- **Props**: `title?='Run schedule'`, `description?`, `frequencies?: [{id,label,expression}]`, `activeId?`, `time?='09:00'`, `nextRun?`, `timezone?`
- **Vanilla 用法**: `<agent-schedule-editor>` + `title`/`description` 属性；properties `frequencies`/`activeId`/`time`/`nextRun`/`timezone`；事件 `save {frequency,time}`
- **特性**: 频率 pill（hourly/daily/weekly）切 cron 表达式、time 输入 + 时区说明、cron + next-run 预览条、保存后 1600ms "Schedule saved" 反馈。

### 243. `AgentGuardrailViolationCard` (护栏违规详情卡)
- **Props**: `rule`, `severity?='medium'`, `runId?`, `time?`, `input?`, `match?`, `policyRef?`, `proceedLabel?`, `blockLabel?`
- **Vanilla 用法**: `<agent-guardrail-violation-card>` + `rule`/`severity`/`run-id`/`time`/`input`/`match`/`policy-ref` 属性；事件 `proceed`/`block`
- **特性**: role=alert、severity badge（low amber/medium orange/high rose）、触发输入摘要 + match 高亮 mark、policy 引用；操作后按钮区被裁决行替换。与 GuardrailReviewQueue (#35?) 区分：单条详情卡而非审核队列。

### 244. `AgentModelFallbackList` (模型降级链)
- **Props**: `title?='Model fallback chain'`, `description?`, `entries?: [{id,model,provider?,health?:'healthy'|'degraded'|'down',condition?,latency?}]`, `primaryId?`
- **Vanilla 用法**: `<agent-model-fallback-list>` + `title`/`description` 属性；properties `entries`/`primaryId`；事件 `reorder {ids}`
- **特性**: 优先级行 + 健康点（emerald/amber/rose）、Primary badge、provider+触发条件+延迟 caption、↑/↓ 重排 + "order updated" 闪示。

### 245. `BillingAddressForm` (账单地址表单)
- **Props**: `title?='Billing details'`, `countries?=['United States','Singapore',…]`, `labels?: {address1?,address2?,city?,state?,zip?}`, `defaultValue?: Partial<BillingAddress>`, `submitLabel?='Continue to next step'`, `showOptional?=true`
- **Vanilla 用法**: `<billing-address-form>` + `title`/`submit-label`/`show-optional` 属性；properties `defaultValue`/`countries`/`labels`；事件 `billing-address-submit` detail {address}
- **特性**: Country 下拉、address1/address2 行（optional 标注）、city+ZIP 双列 grid、可选 State 行、必填校验禁用提交、提交后 "Saved {city}, {country}" 反馈。

### 246. `UsageCreditsDonut` (用量积分环图)
- **Props**: `title?='Usage by Type'`, `unit?='credits'`, `total?`, `slices?: [{id,label,value,color?}]`, `ranges?=['Last 7 days','Last 30 days']`, `defaultRange?`
- **Vanilla 用法**: `<usage-credits-donut>` + `title`/`unit`/`total` 属性；properties `slices`/`ranges`/`defaultRange`；事件 `range-change` detail {range}
- **特性**: 纯 SVG 环段（polar/donutArc 数学、0.6° 间隙、6 色调色板）、legend hover 联动 dim 非活动弧 + 中心文字切换、空态圆环、总量摘要行。

### 247. `SeatBillingTable` (席位计费表)
- **Props**: `title?='Usage by User'`, `description?`, `rows?: [{id,user,email?,seat?,cost?,usage?,status?:'active'|'invited'|'suspended'}]`, `period?='Monthly'`, `currency?='$'`, `searchable?=true`
- **Vanilla 用法**: `<seat-billing-table>` + `title`/`description`/`period`/`currency`/`searchable` 属性；property `rows`；事件 `seat-search` detail {query}
- **特性**: 用户行 + email/席位/用量/费用、active/invited/suspended 徽章（suspended 不计费）、客户端搜索保焦、空搜索文案、billed seats 合计脚行。

### 248. `CreditBalanceCard` (余额头卡)
- **Props**: `balance?=0`, `unit?='credits'`, `plan?='Current plan'`, `currency?=''`, `warnBelow?`, `buyLabel?='Buy More Credits'`, `couponLabel?='Apply Coupon'`, `onBuy?`, `onCoupon?`
- **Vanilla 用法**: `<credit-balance-card>` + `balance`/`unit`/`plan`/`currency`/`warn-below`/`buy-label`/`coupon-label` 属性；事件 `credit-buy` / `credit-coupon`
- **特性**: mono 余额大数 + 币种前缀与 unit caption、plan 状态点徽章（emerald 常态 / amber 低额）、warn-below 低额告警行、Buy/Coupon 双 CTA 点击环脉冲。

### 249. `SpendTrendChart` (消费趋势柱图)
- **Props**: `headline?='Spend'`, `unit?='$'`, `granularities?=['Daily','Weekly']`, `defaultGranularity?`, `points?: Record<string, [{label,value}]>`, `maxY?`, `yTicks?=4`, `onGranularityChange?`
- **Vanilla 用法**: `<spend-trend-chart>` + `headline`/`unit`/`granularity`/`y-ticks` 属性；property `points` { Daily: [...], Weekly: [...] }；事件 `granularity-change` detail {granularity}
- **特性**: mono 总额 headline + 粒度 caption、Daily/Weekly 分段 tab 重绘 SVG 柱、虚线网格 + y 轴刻度标签、密集时每 ceil(n/8) 根柱出一个 x 标签、空态文案。

### 250. `TopUpBalanceDialog` (充值弹窗)
- **Props**: `title?='Top up balance'`, `billToOptions?`, `defaultBillTo?`, `currencies?`, `defaultCurrency?`, `balance?=0`, `currencySymbol?='$'`, `quickAmounts?=[50,100,250,500]`, `minAmount?=10`, `confirmLabel?`, `cancelLabel?`, `defaultOpen?`, `onConfirm?`, `onCancel?`
- **Vanilla 用法**: `<topup-balance-dialog>` + `trigger-label`/`title`/`balance`/`currency-symbol`/`min-amount`/`confirm-label`/`cancel-label` 属性；properties `billToOptions`/`currencies`/`quickAmounts`；事件 `topup-confirm` detail {billTo,currency,amount} / `topup-cancel`
- **特性**: Bill-to/Currency 下拉、金额输入 + 快捷金额 chips（选中高亮）、实时新余额汇总行、最低额校验 role=alert 错误、确认成功态 + Done 关闭、cancel/close 重置。

### 251. `MetricLineChart` (指标线图卡)
- **Props**: `headline?='Active users'`, `value?='0'`, `delta?`, `deltaTone?='up'|'down'|'flat'`, `ranges?=['24h','7d','30d','90d']`, `defaultRange?`, `labels?: string[]`, `series?: [{name,color,values}]`, `unit?`, `onRangeChange?`
- **Vanilla 用法**: `<metric-line-chart>` + `headline`/`value`/`delta`/`delta-tone`/`ranges`/`range`/`unit` 属性；properties `labels` / `series`；事件 `range-change` detail {range}
- **特性**: 多系列 Catmull-Rom 平滑 SVG 折线（vector-effect 防缩放）、hover 列参考线 + 逐系列点标记 + tooltip（左右越界自动翻转）、delta 徽章三色调、时间范围 pill 组、2+ 系列出图例、文字走 HTML overlay 免 preserveAspectRatio 拉伸。

### 252. `PaywallDialog` (付费墙拦截弹窗)
- **Props**: `title?='Upgrade to continue'`, `description?`, `glyph?='🔒'`, `plans?: [{id,name,price,period?,originalPrice?,badge?,features,featured?}]`, `cadences?=['Monthly','Yearly']`, `defaultCadence?`, `cadenceNote?: Record<string,string>`, `cadencePrices?: Record<string,Record<string,string>>`, `ctaLabel?='Upgrade now'`, `discountBadge?`, `defaultOpen?`, `onUpgrade?`, `onDismiss?`
- **Vanilla 用法**: `<paywall-dialog>` + `title`/`description`/`glyph`/`cadences`/`cadence`/`cta-label`/`discount-badge`/`default-open` 属性；properties `plans`/`cadenceNote`/`cadencePrices`；方法 `show()`/`close()`；事件 `cadence-change` detail {cadence} / `upgrade` detail {plan} / `dismiss`
- **特性**: 拦截型弹窗（关闭态不渲染 DOM）、周期切换价格联动 + 注记 chips、featured 暗色方案卡 + 角标徽章 + 划线原价 + 权益清单、折扣旋转角标、CTA 带周期回显、backdrop 点击与 Maybe later 双关闭路径。

### 253. `TrialExpiryNotice` (试用到期警告卡)
- **Props**: `planName?='Pro'`, `daysLeft?=0`, `tone?='expiring'|'urgent'|'auto'`, `losingFeatures?: string[]`, `keepingFeatures?: string[]`, `expiresOn?`, `extendLabel?='Extend trial'`, `upgradeLabel?='Upgrade now'`, `onExtend?`, `onUpgrade?`
- **Vanilla 用法**: `<trial-expiry-notice>` + `plan-name`/`days-left`/`tone`/`expires-on`/`extend-label`/`upgrade-label` 属性；properties `losingFeatures`/`keepingFeatures`；事件 `upgrade`/`extend`
- **特性**: mono 倒计时大数、expiring（琥珀）/ urgent（红）双色调（auto 按 days-left≤3 判定）、截止日期 caption、锁定功能划线清单 vs 保留功能清单、Upgrade/Extend 双 CTA、role=alert。

### 254. `WorkspaceSurveyCard` (工作区问卷卡)
- **Props**: `title?='Tell us about your workspace'`, `stepLabel?`, `questions?: [{id,label,description?,options:[{id,label}],multi?,placeholder?}]`, `answers?: Record<string,string|string[]>`, `nextLabel?='Continue'`, `onAnswer?`, `onText?`, `onNext?`
- **Vanilla 用法**: `<workspace-survey-card>` + `title`/`step-label`/`next-label` 属性；properties `questions` / `answers`；事件 `answer` detail {questionId,optionId} / `text` detail {questionId,text} / `next`
- **特性**: 单选 pills（aria-checked）与多选 chips（aria-pressed）、可选开放输入行、进度点线 + 已答计数、答满解锁 Continue（未答禁用 + 提示行）、分组 divide-y 布局。

### 255. `WorkspaceSetupPanel` (分区设置面板)
- **Props**: `title?='Workspace setup'`, `sections?: [{id,title,tasks:[{id,label,done,href?}]}]`, `upNext?: [{id,title,description?}]`, `onTaskClick?`, `onUpNext?`
- **Vanilla 用法**: `<workspace-setup-panel>` + `title` 属性；properties `sections` / `upNext`；事件 `task-click` detail {section,task} / `up-next` detail {card}
- **特性**: 每分区 emerald n/m 计数徽章、完成行划线 + 圆形 check、未完成行箭头 affordance、全局 "N of M steps complete" caption（全完成换庆祝文案）、Up next 三卡网格 hover 高亮。

### 256. `InviteTeammatesCard` (团队邀请卡)
- **Props**: `title?='Invite your teammates'`, `description?`, `roles?=['Admin','Editor','Viewer']`, `defaultRole?`, `pending?: [{email,role}]`, `emailPlaceholder?`, `sendLabel?='Send invites'`, `skipLabel?='Skip for now'`, `onInvite?`, `onRemove?`, `onSend?`, `onSkip?`
- **Vanilla 用法**: `<invite-teammates-card>` + `title`/`description`/`email-placeholder`/`send-label`/`skip-label`/`default-role` 属性；properties `roles` / `pending`；事件 `invite` detail {email,role} / `remove` / `send` detail pending / `skip`
- **特性**: 邮箱输入 Enter/按钮双添加路径、邮箱格式 + 重复校验 role=alert、角色下拉随行添加、pending 行 mail 图标 + 角色 pill + 移除钮、Send 按待发数门控、pending 计数角标。

### LLMs 专属摄取通道
- 紧凑索引: [`llms.txt`](./llms.txt)
- 全量单文件源码: [`llms-full.txt`](./llms-full.txt)（单文件打包所有 React / Vue / Vanilla 源码，供 Agent 一次性载入上下文）
