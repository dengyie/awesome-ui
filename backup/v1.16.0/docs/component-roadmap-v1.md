# awesome-ui 新组件开发任务书 v1

> 基于 Mobbin pattern 研究产出。实现时严格遵循 `docs/design-guidelines.md`。
> 每个组件给出：定位、Props 设计、参考 pattern、素材索引（references/ 下文件）。

## P0 新增组件（8 个，三端同步）

### 1. PricingTable（SaaS 定价表） ✅ 已实现
- **场景**：产品定价页、升级弹窗内嵌
- **Props**：`plans: [{name, price, period, description, features: string[], highlighted?, badge?, ctaText}]`、`onSelect?(plan)`
- **Pattern**：三列卡 + 推荐列 `ring-2 ring-indigo-600` + "Most popular" 顶部徽章 + 功能 ✓ 分组
- **素材**：`references/paywall/`（01_Vercel、02_Navattic、04_Whop）
- **文件**：`react/PricingTable.tsx` · `vue/PricingTable.vue` · `vanilla/PricingTable.js`

### 2. StatCard（统计卡） ✅ 已实现
- **场景**：仪表盘、概览页顶部
- **Props**：`label`、`value`、`delta?`（环比，正负色）、`deltaLabel?`、`trend?`（mini 数组画 sparkline）、`icon?`、`className?`
- **Pattern**：大数字 + 环比小箭头 + mini 趋势线（纯 SVG polyline，零依赖）
- **素材**：`references/dashboard/`、`references/charts/`
- **文件**：`react/StatCard.tsx` · `vue/StatCard.vue` · `vanilla/StatCard.js`

### 3. DataTable（数据表） ✅ 已实现
- **场景**：管理台列表、订单/用户管理
- **Props**：`columns: [{key, label, align?, width?}]`、`rows`、`selectable?`、`onSort?(key,direction)`、`actions?`、`emptyText?`、`className?`
- **Pattern**：列头筛选 icon hover 显现、行 hover 工具条、批量选中底部浮动胶囊条、数字右对齐
- **素材**：`references/basics/13_Xero`、`references/basics/15_Neon`、`references/basics/17_Supabase`
- **文件**：`react/DataTable.tsx` · `vue/DataTable.vue` · `vanilla/DataTable.js`

### 4. AuthForm（登录/注册表单） ✅ 已实现
- **场景**：登录页、注册页
- **Props**：`mode: "signin"|"signup"`、`providers: [{name, icon?}]`、`onProviderClick`、`onSubmit(email, password, name?)`、`loading?`、`error?`、`footerText?`、`onFooterClick?`
- **Pattern**：SSO 按钮在上 + "or" 分隔线 + 邮箱/密码 + 主按钮；错误行内提示
- **素材**：`references/onboarding/01_Pi`、`03_Patreon`、`04_Sora`
- **文件**：`react/AuthForm.tsx` · `vue/AuthForm.vue` · `vanilla/AuthForm.js`

### 5. SettingsPanel（设置页框架） ✅ 已实现
- **场景**：应用设置、账户设置
- **Props**：`sections: [{id, title, icon?, description?, items: [{id, label, description?, value?, actionText?}]}]`、`activeId?`、`saving?`、`onSectionChange`、`onItemAction`、`onSave`
- **Pattern**：左侧锚点导航 + 右侧分节卡片；每节底部 Save 行（保存中按钮 loading）
- **素材**：`references/dashboard/07_Superlist`、`10_Pipedrive`、`12_Skiff`
- **文件**：`react/SettingsPanel.tsx` · `vue/SettingsPanel.vue` · `vanilla/SettingsPanel.js`

### 6. AgentRunLog（Agent 执行日志） ✅ 已实现
- **场景**：AI Agent 会话中展示多步执行过程
- **Props**：`steps: [{id, label, status, detail?, durationMs?}]`、`title?`、`autoExpandRunning?`、`className?`
- **Pattern**：Devin/Cursor 式——状态图标 + 连接线 + 展开 dark 终端日志块
- **素材**：`references/agent/13_Devin`、`18_Cursor`、`15_Google_AI_Studio`
- **与 AgentStepTimeline 区别**：Timeline 是概览，RunLog 含可展开日志终端
- **文件**：`react/AgentRunLog.tsx` · `vue/AgentRunLog.vue` · `vanilla/AgentRunLog.js`

### 7. OnboardingChecklist（激活清单） ✅ 已实现
- **场景**：首次进入产品主页的引导任务卡
- **Props**：`tasks: [{id, title, description?, done, actionText?}]`、`title?`、`onToggle`、`onTaskAction`
- **Pattern**：进度条 + 任务列表 + 完成 strikethrough + 全部完成变庆祝态
- **素材**：`references/onboarding/flows`（JSON 里 6 个 flow 元数据）、`references/onboarding/`
- **文件**：`react/OnboardingChecklist.tsx` · `vue/OnboardingChecklist.vue` · `vanilla/OnboardingChecklist.js`

### 8. UpgradePromptCard（额度升级卡） ✅ 已实现
- **场景**：接近用量上限时插入会话/页面
- **Props**：`used`、`limit`、`planName?`、`unit?`、`title?`、`features?: string[]`、`ctaText?`、`onUpgrade`
- **Pattern**：用量进度条分色预警（复用 ContextUsageBadge 阈值逻辑）+ 权益清单 + CTA
- **素材**：`references/paywall/`、`references/dashboard/13_Fibery`（试用提醒条）
- **文件**：`react/UpgradePromptCard.tsx` · `vue/UpgradePromptCard.vue` · `vanilla/UpgradePromptCard.js`

## P1 增强现有组件（6 个）

| 组件 | 增强 | 参考素材 |
|---|---|---|
| ChatPromptInput | ✅ 底部模型/工具 chips 行（v1.9.2） | `ai-chat/07_Cursor`、`08_Claude` |
| ThinkingBlock | ✅ 步骤竖向连接线 + 收起时耗时摘要行（v1.9.2） | `ai-chat/13_Microsoft_Copilot` |
| DiffViewer | ✅ 多文件 tab 切换 + hunk 折叠（v1.9.2） | `agent/13_Devin`、`17_GitLab` |
| CommandPalette | ✅ 底部快捷键提示条（v1.9.2） | `basics/04_v0`、`01_Base44` |
| ToastStack | ✅ 自动消失倒计时进度条 + hover 暂停（v1.9.2） | `basics/12_Vercel` |
| ChatSessionList | ✅ 分组折叠 + 底部用户卡（v1.9.2） | `dashboard/13_Fibery`、`ai-chat/03_ChatGPT` |

## P2 覆盖更多场景（二期候选，素材已备）

| 组件 | 场景 | 素材目录 |
|---|---|---|
| ~~KanbanBoard~~ | 看板拖拽 | `lists/` ✅ v1.12.0 |
| ~~CommentThread~~ | 评论嵌套回复 | `lists/` ✅ v1.11.0 |
| ~~DatePicker~~ | 日历选择 | `forms/` ✅ v1.11.0 |
| ~~FileDropzone~~ | 拖拽上传 | `forms/` ✅ v1.11.0 |
| ~~SideDrawer~~ | 侧滑抽屉 | `overlays/` ✅ v1.12.0 |
| ~~ConfirmDialog~~ | 危险操作确认 | `overlays/` ✅ v1.10.0 |
| ~~NotificationCenter~~ | 通知中心 | `profile/` ✅ v1.11.0 |
| ~~AccountSwitcher~~ | 工作区切换 | `profile/` ✅ v1.12.0 |
| ~~SchedulerSlots~~ | 日历预约时间段 | `commerce/` ✅ v1.12.0 |
| ~~RichToolbar~~ | 富文本编辑工具条 | `editor/` ✅ v1.13.0 |
| ~~HeroSection~~ | 营销首页 Hero | `navigation/` ✅ v1.13.0 |
| ~~FooterSection~~ | 营销页脚 | `navigation/` ✅ v1.13.0 |
| ~~TestimonialGrid~~ | 客户证言卡片 | `navigation/` ✅ v1.13.0 |
| ~~VoiceModePanel~~ | AI 语音交互面板 | `ai-native/` ✅ v1.14.0 |
| ~~PromptLibrary~~ | 提示词库（增强 PromptTemplateGrid） | `ai-native/` ✅ v1.14.0 |
| ~~ShortcutsOverlay~~ | 快捷键帮助浮层 | `ai-native/` ✅ v1.10.0 |

## P3 基础原语补齐（v1.15.0 起）

> 56 个组件已覆盖 P0/P1/P2 后，本阶段补齐被多个场景反复需要的基础原语。素材取自 `references/basics` / `lists` / `profile`。

| 组件 | 场景 | 素材目录 | 状态 |
|---|---|---|---|
| ~~Tabs~~ | 标签页（underline / pills、键盘漫游） | `basics/` ✅ v1.15.0 |
| ~~Accordion~~ | 折叠面板 / FAQ（单开、多开） | `basics/` ✅ v1.15.0 |
| ~~AvatarGroup~~ | 协作者头像堆叠 + 在线状态 | `profile/` ✅ v1.15.0 |
| ~~FilterBar~~ | 多选筛选条（下拉胶囊 + 计数） | `lists/` ✅ v1.15.0 |
| ~~Tooltip~~ | 悬浮提示（四方向 + 焦点可达） | `basics/` ✅ v1.16.0 |
| ~~Breadcrumb~~ | 面包屑（层级折叠 + 当前页） | `navigation/` ✅ v1.16.0 |
| ~~Pagination~~ | 分页器（省略号 + 边界禁用） | `lists/` ✅ v1.16.0 |
| ~~AlertBanner~~ | 内联提示条（四色 + 动作/关闭） | `basics/` ✅ v1.16.0 |

## 实现顺序建议

1. ~~先做 P0 中素材最充分的：PricingTable → DataTable → AgentRunLog → StatCard~~ ✅ v1.9.0 已完成
2. ~~AuthForm / SettingsPanel / OnboardingChecklist / UpgradePromptCard 随后~~ ✅ v1.9.1 已完成
3. P1 增强穿插进行（改动小、收益快）
4. 每完成 4 个组件跑一次 `tests/` + 更新索引（SKILL.md / llms.txt / index.html）

## 进度

| 批次 | 组件 | 状态 |
|---|---|---|
| v1.9.0 | PricingTable / StatCard / DataTable / AgentRunLog | ✅ 三端 12 文件 + 4 组用例，52 项测试通过 |
| v1.9.1 | AuthForm / SettingsPanel / OnboardingChecklist / UpgradePromptCard | ✅ 三端 12 文件 + 11 组 vanilla 用例 + 9 组 React SSR + 全量 Vue SFC 编译校验，89 项测试通过 |
| v1.9.2 | P1 增强：ChatPromptInput chips / ThinkingBlock 步骤线 / DiffViewer 多文件+hunk / CommandPalette 提示条 / ToastStack 倒计时 / ChatSessionList 分组+用户卡 | ✅ 三端 6 组件 + 9 组 vanilla 用例 + 7 组 React SSR，89 项测试通过 + Gallery 交互验证 |
| v1.10.0 | ConfirmDialog / ShortcutsOverlay | ✅ 三端 6 文件 + 14 组 vanilla 用例 + 6 组 React SSR + 全量 Vue SFC 编译校验 |
| v1.11.0 | FileDropzone / NotificationCenter / CommentThread / DatePicker | ✅ 三端 12 文件 + 26 组 vanilla 用例 + 9 组 React SSR + 全量 Vue SFC 编译校验，144 项测试通过 |
| v1.12.0 | KanbanBoard / SideDrawer / AccountSwitcher / SchedulerSlots | ✅ 三端 12 文件 + 16 组 vanilla 用例 + 8 组 React SSR + 全量 Vue SFC 编译校验，168 项测试通过 |
| v1.13.0 | RichToolbar / HeroSection / FooterSection / TestimonialGrid | ✅ 三端 12 文件 + 12 组 vanilla 用例 + 8 组 React SSR + 全量 Vue SFC 编译校验，188 项测试通过 |
| v1.14.0 | VoiceModePanel / PromptLibrary | ✅ 三端 6 文件（含 UiIcon 新增 `mic`）+ 14 组 vanilla 用例 + 6 组 React SSR + 全量 Vue SFC 编译校验，206 项测试通过；P2 表全部完成 |
| v1.15.0 | Tabs / Accordion / AvatarGroup / FilterBar | ✅ 三端 12 文件 + 19 组 vanilla 用例 + 8 组 React SSR + 全量 Vue SFC 编译校验，233 项测试通过；P3 基础原语首批完成 |
| v1.16.0 | Tooltip / Breadcrumb / Pagination / AlertBanner | ✅ 三端 12 文件 + 17 组 vanilla 用例 + 8 组 React SSR + 全量 Vue SFC 编译校验，258 项测试通过；P3 基础原语第二批完成 |
| 下一批 | P3 剩余基础原语 | ⬜ 待规划 |
