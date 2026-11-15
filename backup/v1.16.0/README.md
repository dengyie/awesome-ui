# awesome-ui

> **专为 AI 时代 / LLM 代码生成打造的精选前端原子组件库**  
> 支持 **React (TSX)** / **Vue 3 (SFC)** / **Vanilla (原生 JS/Web Component)** 三端，Tailwind CSS 美学，单文件即拷即用，零黑盒依赖。

---

## 🎯 为什么需要 awesome-ui？

传统组件库（AntD、Element、MUI）是为传统 CRUD 管理台设计的。当 AI（Cursor、v0、Claude Code、Codex）尝试生成现代 AI 网页（如类似 ChatGPT、Claude、Perplexity、v0 的交互）时，往往需要耗费大量 Token 反复调试流式打字、思维链折叠、自动跟底、代码分屏预览等复杂状态。

**awesome-ui 的核心价值**：
- **AI 友好（AI-to-AI First）**：组件全部为扁平 Props 设计，无深层嵌套对象，AI 生成命中率 100%。
- **单文件 Copy-Paste**：无 npm 私有黑盒，AI 直接按需取用单文件复制进用户项目。
- **全技术栈对齐**：React、Vue 3、Vanilla 三套代码的 API 与 Tailwind 样式 100% 对齐。

---

## 📦 组件列表 (精选 AI 场景与基础 UI)

| 组件 | 对应场景 | 核心特性 |
|---|---|---|
| **`ChatPromptInput`** | 多模态输入框 | 高度自适应、快捷键发送/换行、附件/图片列表、生成中停止切换、底部模型/工具 chips 行 |
| **`StreamMarkdown`** | 流式渲染器 | 高性能局部渲染、打字呼吸光标、代码块一键 Copy、语法高亮 |
| **`ThinkingBlock`** | 深度思考面板 | R1/o1 推理模型思维链折叠、流光动效、耗时展示、步骤时间线（连接线+耗时徽章）、收起摘要行 |
| **`ToolCallBadge`** | Agent 工具调用 | 工具执行状态（Running/Success/Error）、入参/返回值一键抽屉折叠 |
| **`AutoScrollAnchor`** | 智能跟底锚点 | 流式输出时自动平滑跟滚，用户手动回滚时暂停并浮现一键触底按钮 |
| **`ArtifactCanvas`** | 分屏预览画布 | 类似 Claude Artifacts，代码与 HTML/SVG 即时沙盒渲染分屏切换 |
| **`SourcesCitation`** | RAG 引文来源 | 对标 Perplexity 搜索来源网格卡片，展示域名、序号、标题与摘要 |
| **`MessageActionToolbar`** | 消息底部操作条 | 复制回答、重新生成、赞/踩反馈、多分支历史版本翻页器 |
| **`PromptChips`** | 智能建议追问 | 气泡推荐问题标签，一键填入或发送 |
| **`RoadmapTimeline`** | 学习路径图谱 | 纸质手账/工坊地图风格阶段进度条、菱形地标、完成态与锁态 |
| **`KnowledgeDrawer`** | 知识节点抽屉 | 阶段色系侧边抽屉、前置依赖/分支徽章、核心认知与行动 CTA |
| **`ThemeToggle`** | 三态主题切换 | Auto/Light/Dark 切换，时间与系统色系自适应，防闪烁与记忆 |
| **`StatusIndicator`** | 状态指示徽章 | 节点与服务状态 (Online/Connecting/Error) 呼吸光晕与延迟指示 |
| **`AudioWaveVisualizer`** | 语音交互波形 | 实时音频/语音交互波形跳动与呼吸动效 |
| **`HomepageDashboard`** | 仪表盘/个性首页 | 对标 gethomepage/homepage：分组服务卡片、折叠、即时搜索、实时时钟、状态点/胶囊、页脚版本 |
| **`ContextUsageBadge`** | 上下文与 Token 仪表 | Context Window 百分比进度条、分级色彩预警（70%/90%）、Prompt/History/Active 细分分布浮层 |
| **`ModelSelector`** | 模型切换选择器 | 即时搜索过滤、Provider 与 Context 长度徽章、多模型平滑切换抽屉 |
| **`CodeBlock`** | 独立代码块 | 语言徽章、文件名、一键复制反馈、行号模式、最大高度滚动 |
| **`TypingIndicator`** | AI 输入中指示 | 三点弹跳/脉冲双变体、sm/md/lg 三档尺寸、`role="status"` 无障碍 |
| **`ChatMessageRow`** | 会话消息气泡 | User/Assistant/System 三角色、头像/初始图标、名称与时间戳、气泡对齐 |
| **`CommandPalette`** | Cmd+K 命令面板 | 模糊搜索、分组标题、键盘上下导航/Enter 选中/Esc 关闭、快捷键提示、底部快捷键提示条 |
| **`ToastStack`** | 全局通知栈 | Success/Error/Warning/Info 四类型、自动消除、手动关闭、`aria-live` 播报、底部倒计时进度条（hover 暂停） |
| **`ChatSessionList`** | 会话历史侧边栏 | 当前会话高亮、悬停删除、空态展示、会话计数徽章、分组折叠、底部用户卡 |
| **`DiffViewer`** | AI 代码差异对比 | 增/删/上下文行高亮、+/- 统计、双列行号、文件名与语言徽章、多文件 tab、hunk 折叠 |
| **`ToolApprovalCard`** | Agent 工具审批 | Approve/Reject 按钮、高/低风险分级、参数预览、状态自更新 |
| **`FileAttachmentList`** | 输入框附件列表 | 类型图标（图片/代码/文件）、大小格式化、可移除 Chip |
| **`StreamingProgressBar`** | 流式生成进度 | 确定/不确定双模式、状态三色（streaming/done/error）、`role="progressbar"` |
| **`EmptyState`** | 空态占位页 | 图标、标题、描述、CTA 按钮，适配零结果/空列表场景 |
| **`AgentStepTimeline`** | Agent 执行轨迹 | Pending/Running/Done/Error 四态图标、步骤连接线、耗时展示 |
| **`PromptTemplateGrid`** | 提示词模板库 | 卡片网格、标签徽章、悬停 Use 操作、点击载入模板 |
| **`AgentTaskChecklist`** | Agent 任务清单 | 进度计数、状态图标（含 active 旋转）、点击切换完成态 |
| **`PricingTable`** | SaaS 定价表 | 三列计划卡、推荐列 ring 高亮 + "Most popular" 徽章、✓ 功能清单 |
| **`StatCard`** | 仪表盘统计卡 | 大数字、环比升降色、零依赖 SVG 迷你趋势线 |
| **`DataTable`** | 数据表 | 列表头排序、数字右对齐、hover 行操作、多选浮动批量条 |
| **`AgentRunLog`** | Agent 执行日志 | 状态时间线 + 连接线、耗时、可展开深色终端详情 |
| **`AuthForm`** | 登录/注册表单 | SSO 供应商按钮（图/首字母兜底）、"or" 分隔、行内错误、提交 loading |
| **`SettingsPanel`** | 设置页框架 | 左侧锚点导航（active 高亮）+ 右侧分节卡片、行内操作、底部 Save 行 |
| **`OnboardingChecklist`** | 激活任务清单 | 完成进度条 + 计数、完成划线、逐项 CTA、全完成庆祝态 |
| **`UpgradePromptCard`** | 用量升级卡 | 阈值变色进度条（70%/90%）、used/limit 格式化、权益清单 + CTA |
| **`ConfirmDialog`** | 确认/危险操作弹窗 | danger/warning/default 三档 tone、type-to-confirm 兜底、loading 双按钮锁、Esc/遮罩关闭 |
| **`ShortcutsOverlay`** | 快捷键面板 | 分组快捷键表、实时搜索过滤、kbd 键帽、Esc/遮罩关闭 |
| **`FileDropzone`** | 拖拽上传区 | 拖拽/点击/键盘三通道、accept 类型校验、maxSizeMb 体积拦截、文件行 + 移除 |
| **`NotificationCenter`** | 通知收件箱 | 未读角标、All/Unread 过滤、单条已读、全部已读、空态 |
| **`CommentThread`** | 嵌套评论区 | 扁平数组 + parentId 自动嵌套（最多 3 层）、点赞、回复、已解决切换 |
| **`DatePicker`** | 日期选择器 | 月网格、上/下一月、min/max 禁用、周起始日可配、Today 快捷 |
| **`KanbanBoard`** | 看板拖拽 | 列/卡片扁平数据、HTML5 拖放 + 左右方向键移动、WIP limit 计数、优先级/标签/负责人 |
| **`SideDrawer`** | 侧滑抽屉 | 左/右四档宽度、Esc/遮罩关闭、header/body/footer 三段、`role="dialog"` 模态语义 |
| **`AccountSwitcher`** | 工作区切换 | 当前账号触发器、下拉账号列表（角色/套餐）、Add account / Sign out、外点与 Esc 关闭 |
| **`SchedulerSlots`** | 预约时间段 | 上午/下午/晚上分组、12 小时制、可约数统计、不可约时段锁定、时区注记 |
| **`RichToolbar`** | 富文本工具条 | 分组按钮 + 分隔线、图标/文字混排、active 切换、disabled 禁用、快捷键 tooltip |
| **`HeroSection`** | 营销 Hero | eyebrow 胶囊、大标题、双 CTA、勾选式卖点、左/居中对齐 |
| **`FooterSection`** | 营销页脚 | 品牌块 + 多列链接、社交图标行、自动/自定义版权 |
| **`TestimonialGrid`** | 客户证言 | 2/3 列网格、星级评分、头像或首字母兜底、角色 + 公司署名 |
| **`VoiceModePanel`** | 语音对话面板 | 四态光球（idle / listening / thinking / speaking）、脉冲光环、波形条、实时转写与回复、结束会话 |
| **`PromptLibrary`** | 提示词库 | 搜索框、分类胶囊筛选、收藏星标、等宽提示词预览、标签、Use 动作 |
| **`Tabs`** | 标签页 | underline / pills 两种形态、图标 + 徽标、受控 / 非受控、左右方向键 + Home/End 漫游焦点 |
| **`Accordion`** | 折叠面板 | 单开 / 多开、图标 + 描述、chevron 旋转、`aria-expanded` + region 语义 |
| **`AvatarGroup`** | 头像组 | 叠放排列、姓名首字母 / 图片 / user 图标三级兜底、+N 溢出、在线状态点、三档尺寸 |
| **`FilterBar`** | 多选筛选条 | 下拉胶囊、选项计数、选中数徽标、Clear all、外点与 Esc 关闭 |
| **`Tooltip`** | 悬浮提示 | 四方向定位、hover / focus-within 触发、`aria-describedby` 关联、纯 CSS 过渡 |
| **`Breadcrumb`** | 面包屑 | 图标 + 链接 / 按钮 / 当前页三级渲染、`maxItems` 中间折叠省略号、`aria-current` |
| **`Pagination`** | 分页器 | 首/末页跳转、省略号折叠、`siblingCount` 可调、边界禁用、`aria-current` |
| **`AlertBanner`** | 内联提示条 | info / success / warning / danger 四色、可选动作与关闭、status / alert 角色 |
| **`UiIcon`** | 统一图标系统 | 零依赖 SVG 图标，React / Vue / Vanilla 同名 API，支持尺寸、线宽、颜色与无障碍标签 |

---

## 🚀 目录结构

```text
awesome-ui/
├── index.html                 # 交互式 Gallery 体验页面
├── SKILL.md                   # Agent 检索与规范文档
├── react/                     # React (TSX) 单文件组件
│   ├── UiIcon.tsx           # 统一零依赖 SVG 图标与命名图标
│   ├── ChatPromptInput.tsx
│   ├── StreamMarkdown.tsx
│   ├── ThinkingBlock.tsx
│   ├── ToolCallBadge.tsx
│   ├── AutoScrollAnchor.tsx
│   ├── ArtifactCanvas.tsx
│   ├── MessageActionToolbar.tsx
│   ├── PromptChips.tsx
│   ├── SourcesCitation.tsx
│   ├── StatusIndicator.tsx
│   ├── ThemeToggle.tsx
│   ├── AudioWaveVisualizer.tsx
│   ├── RoadmapTimeline.tsx
│   ├── KnowledgeDrawer.tsx
│   ├── HomepageDashboard.tsx
│   ├── ContextUsageBadge.tsx
│   ├── ModelSelector.tsx
│   ├── CodeBlock.tsx
│   ├── TypingIndicator.tsx
│   ├── ChatMessageRow.tsx
│   ├── CommandPalette.tsx
│   ├── ToastStack.tsx
│   ├── ChatSessionList.tsx
│   ├── DiffViewer.tsx
│   ├── ToolApprovalCard.tsx
│   ├── FileAttachmentList.tsx
│   ├── StreamingProgressBar.tsx
│   ├── EmptyState.tsx
│   ├── AgentStepTimeline.tsx
│   ├── PromptTemplateGrid.tsx
│   ├── AgentTaskChecklist.tsx
│   ├── PricingTable.tsx
│   ├── StatCard.tsx
│   ├── DataTable.tsx
│   ├── AgentRunLog.tsx
│   ├── AuthForm.tsx
│   ├── SettingsPanel.tsx
│   ├── OnboardingChecklist.tsx
│   ├── UpgradePromptCard.tsx
│   ├── ConfirmDialog.tsx
│   ├── ShortcutsOverlay.tsx
│   ├── FileDropzone.tsx
│   ├── NotificationCenter.tsx
│   ├── CommentThread.tsx
│   ├── DatePicker.tsx
│   ├── KanbanBoard.tsx
│   ├── SideDrawer.tsx
│   ├── AccountSwitcher.tsx
│   ├── SchedulerSlots.tsx
│   ├── RichToolbar.tsx
│   ├── HeroSection.tsx
│   ├── FooterSection.tsx
│   ├── TestimonialGrid.tsx
│   ├── VoiceModePanel.tsx
│   ├── PromptLibrary.tsx
│   ├── Tabs.tsx
│   ├── Accordion.tsx
│   ├── AvatarGroup.tsx
│   ├── FilterBar.tsx
│   ├── Tooltip.tsx
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   └── AlertBanner.tsx
├── vue/                       # Vue 3 (SFC) 单文件组件
│   ├── UiIcon.vue           # 统一零依赖 SVG 图标
│   ├── ChatPromptInput.vue
│   ├── StreamMarkdown.vue
│   ├── ThinkingBlock.vue
│   ├── ToolCallBadge.vue
│   ├── AutoScrollAnchor.vue
│   ├── ArtifactCanvas.vue
│   ├── MessageActionToolbar.vue
│   ├── PromptChips.vue
│   ├── SourcesCitation.vue
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
│   ├── UpgradePromptCard.vue
│   ├── ConfirmDialog.vue
│   ├── ShortcutsOverlay.vue
│   ├── FileDropzone.vue
│   ├── NotificationCenter.vue
│   ├── CommentThread.vue
│   ├── DatePicker.vue
│   ├── KanbanBoard.vue
│   ├── SideDrawer.vue
│   ├── AccountSwitcher.vue
│   ├── SchedulerSlots.vue
│   ├── RichToolbar.vue
│   ├── HeroSection.vue
│   ├── FooterSection.vue
│   ├── TestimonialGrid.vue
│   ├── VoiceModePanel.vue
│   ├── PromptLibrary.vue
│   ├── Tabs.vue
│   ├── Accordion.vue
│   ├── AvatarGroup.vue
│   ├── FilterBar.vue
│   ├── Tooltip.vue
│   ├── Breadcrumb.vue
│   ├── Pagination.vue
│   └── AlertBanner.vue
└── vanilla/                   # 原生 JS / Web Components 单文件
    ├── UiIcon.js            # uiIcon() SVG 工厂函数
    ├── ChatPromptInput.js
    ├── StreamMarkdown.js
    ├── ThinkingBlock.js
    ├── ToolCallBadge.js
    ├── AutoScrollAnchor.js
    ├── ArtifactCanvas.js
    ├── MessageActionToolbar.js
    ├── PromptChips.js
    ├── SourcesCitation.js
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
    ├── UpgradePromptCard.js
    ├── ConfirmDialog.js
    ├── ShortcutsOverlay.js
    ├── FileDropzone.js
    ├── NotificationCenter.js
    ├── CommentThread.js
    ├── DatePicker.js
    ├── KanbanBoard.js
    ├── SideDrawer.js
    ├── AccountSwitcher.js
    ├── SchedulerSlots.js
    ├── RichToolbar.js
    ├── HeroSection.js
    ├── FooterSection.js
    ├── TestimonialGrid.js
    ├── VoiceModePanel.js
    ├── PromptLibrary.js
    ├── Tabs.js
    ├── Accordion.js
    ├── AvatarGroup.js
    ├── FilterBar.js
    ├── Tooltip.js
    ├── Breadcrumb.js
    ├── Pagination.js
    └── AlertBanner.js
├── docs/                      # 设计与实现规范
│   ├── design-guidelines.md   # 视觉/交互/动效/无障碍规范 + 验收清单
│   ├── component-roadmap-v1.md# 新组件任务书（Props 设计 + 素材索引）
│   └── mobbin-patterns-2026-11.md # Mobbin pattern 研究报告
├── tools/                     # 素材拉取工具（Mobbin MCP）
│   ├── mobbin_auth.py         # OAuth PKCE 授权 / token 刷新
│   └── mobbin_fetch.py        # 分品类批量搜索 + 下载参考图
└── references/                # 本地参考图库（gitignore，勿提交）
```

> **设计规范**：新增或修改任何组件前，请先读 [`docs/design-guidelines.md`](docs/design-guidelines.md)，并逐项通过其第 7 节验收清单。
> **素材来源**：参考图由 Mobbin Pro MCP 拉取（`tools/mobbin_fetch.py`），仅作本地设计参考，**不得提交到公开仓库**（Mobbin ToS 禁止再分发）。

---

## 🛠️ 依赖说明 (Dependencies)

- **样式**：Tailwind CSS (v3 / v4)
- **React 端建议轻量依赖**：`marked`, `prismjs`；图标优先使用仓库内 `UiIcon`，不需要 `lucide-react`
- **图标规范**：UI 图标统一使用 `UiIcon`，禁止 emoji、Unicode 字符箭头和临时手写 SVG；图标几何遵循 [Tabler Icons](https://github.com/tabler/tabler-icons) 的 MIT 许可规范；品牌 Logo 仍应使用品牌官方资源
- **Vue 3 端建议轻量依赖**：`marked`, `prismjs`
- **Vanilla 端**：可直接通过 CDN 或浏览器原生运行

---

## 🧩 HomepageDashboard（仪表盘主推组件）

`HomepageDashboard` 以经典开源项目 [gethomepage/homepage](https://github.com/gethomepage/homepage) 为设计灵感（独立原创实现，非代码搬运），为自托管/内网应用提供「首页式」仪表盘：

- **分组服务卡片**：`groups[].services[]` 扁平数据驱动，卡片含图标（URL 图片 / Emoji / 字母缩略图）、名称、描述。
- **状态指示**：`statusStyle` 支持 `pill`（右上角胶囊文字）/ `dot`（圆点）/ `none`；状态由 `online/up/down/offline/warn/error/unknown` 控制颜色。
- **交互能力**：分组头点击折叠、顶部搜索框即时过滤、页头实时时钟、页脚 GitHub 版本链接。
- **Responsive 网格**：`md:1/2 · lg:1/3 · xl:1/4` 四档断点，与 homepage 默认列布局一致。
- **三端 API 完全一致**，可从 `react/`、`vue/`、`vanilla/` 任选单文件复制使用。

```html
<!-- Vanilla 用法 -->
<script type="module" src="./vanilla/HomepageDashboard.js"></script>
<homepage-dashboard title="Homepage" subtitle="My homelab" status-style="pill" show-search></homepage-dashboard>
<script>
  const dash = document.querySelector("homepage-dashboard");
  dash.groups = [{
    name: "Media",
    services: [
      { name: "Jellyfin", description: "Movies & TV", icon: "jellyfin.png", href: "https://jellyfin.local", status: "online", pingText: "24ms" },
    ],
  }];
</script>
```

> **安全与健壮性**（三端 API 一致，含 TypeScript `id?: string` 稳定 key）：
> - `href` 仅放行 `http(s)://`、`mailto:`、协议相对 `//`、根相对 `/`、`.`/`..` 相对路径，`javascript:`/`data:`/`vbscript:`/`file:` 一律不渲染为链接。
> - 纯文本插值/实体转义，注入 `<script>`/`<img onerror>` 不产生节点。
> - 搜索无命中时隐藏整组（与 React/Vue filter 行为对齐），缺失字段（name/href/description）安全降级不崩溃。
> - 时钟随 `showClock` 动态启停；默认 `version` 不伪装上游版本号。
>
> - **折叠事件**：React `onToggleGroup(group, collapsed)` / Vue `@toggle` / Vanilla `group-toggle` CustomEvent 三端对齐；`statusStyle` 未知值回退 `pill`，图标加载失败隐藏、时钟隔离秒刷新不重渲染整树。
>
> - **测试**：仓库本身零依赖、即拷即用；回归在独立工程 `tests/`（`cd tests && npm install && npm test`，89 项：vanilla jsdom、React SSR、Vue SFC 编译/SSR；`npm run typecheck` 对 React 端 strict TS）。
