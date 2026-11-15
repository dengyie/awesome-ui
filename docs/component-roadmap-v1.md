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
| ~~ComboBox~~ | 可搜索下拉（过滤 + 键盘漫游） | `forms/` ✅ v1.17.0 |
| ~~Navbar~~ | 导航栏 / Mega menu | `navigation/` ✅ v1.17.0 |
| ~~ActivityFeed~~ | 活动时间线（事件色标） | `lists/` ✅ v1.17.0 |
| ~~UsageMeter~~ | 用量条（阈值变色） | `charts/` ✅ v1.17.0 |
| ~~ToggleSwitch~~ | 开关（switch 语义 + 双尺寸） | `forms/` ✅ v1.18.0 |
| ~~Stepper~~ | 步骤条（四态 + 可点击回跳） | `navigation/` ✅ v1.18.0 |
| ~~SearchInput~~ | 搜索框（快捷键 + 清空 + loading） | `forms/` ✅ v1.18.0 |
| ~~Tag~~ | 标签（六色 + 可移除/可点击） | `basics/` ✅ v1.18.0 |
| ~~Modal~~ | 模态对话框（遮罩 + footer 插槽） | `overlays/` ✅ v1.18.0 |

## P4 组合业务模式（v1.19.0 起）

> P3 原语齐备后，本阶段沉淀由多个原语组合而成的完整业务面板。素材取自 `references/profile` / `billing` / `inbox` / `changelog`。

| 组件 | 场景 | 素材目录 | 状态 |
|---|---|---|---|
| ~~ProfileHeader~~ | 个人资料头（封面 + 头像 + 统计 + 页签） | `profile/` ✅ v1.19.0 |
| ~~BillingPanel~~ | 账单面板（周期切换 + 明细 + CTA） | `billing/` ✅ v1.19.0 |
| ~~StepSlider~~ | 离散步进滑杆（停靠点 + 键盘） | `forms/` ✅ v1.19.0 |
| ~~InboxList~~ | 收件箱列表（未读 + 标签 + 摘要） | `inbox/` ✅ v1.19.0 |
| ~~ChangelogFeed~~ | 更新日志流（徽标条目 + footer） | `changelog/` ✅ v1.19.0 |
| ~~MetricStrip~~ | 指标条带（KPI 单元格 + delta 趋势） | `dashboard/` ✅ v1.20.0 |
| ~~RankList~~ | 排行榜列表（比率条 + 数值列） | `dashboard/` ✅ v1.20.0 |
| ~~SideNav~~ | 侧边导航（分组 + 计数徽标） | `dashboard/` ✅ v1.20.0 |
| ~~PageHeader~~ | 页头（状态胶囊 + 动作 + 页签） | `dashboard/` ✅ v1.20.0 |
| ~~TimeframePicker~~ | 时间范围选择器（预设 + 步进） | `dashboard/` ✅ v1.20.0 |
| ~~WizardSteps~~ | 表单向导步骤（竖向/进度条双变体） | `forms/` ✅ v1.21.0 |
| ~~FormField~~ | 表单字段骨架（必填/错误/计数） | `forms/` ✅ v1.21.0 |
| ~~GanttTimeline~~ | 甘特时间线（任务条 + 进度 + 今日线） | `agent/` ✅ v1.21.0 |
| ~~ApprovalCard~~ | 审批卡（头像组 + 决策三态） | `agent/` ✅ v1.21.0 |
| ~~ResourceList~~ | 资源列表（图标行 + 类型徽标） | `dashboard/` ✅ v1.21.0 |

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
| v1.17.0 | ComboBox / Navbar / ActivityFeed / UsageMeter | ✅ 三端 12 文件 + 12 组 vanilla 用例 + 6 组 React SSR + 全量 Vue SFC 编译校验；P3 基础原语第三批完成 |
| v1.18.0 | ToggleSwitch / Stepper / SearchInput / Tag / Modal | ✅ 三端 15 文件 + 19 组 vanilla 用例 + 9 组 React SSR + 全量 Vue SFC 编译校验，304 项测试通过；P3 基础原语全部完成 |
| v1.19.0 | ProfileHeader / BillingPanel / StepSlider / InboxList / ChangelogFeed | ✅ 三端 15 文件 + 11 组 vanilla 用例 + 8 组 React SSR + 全量 Vue SFC 编译校验，323 项测试通过；P4 首批组合业务面板 |
| v1.20.0 | MetricStrip / RankList / SideNav / PageHeader / TimeframePicker | ✅ 三端 15 文件 + 10 组 vanilla 用例 + 9 组 React SSR + 全量 Vue SFC 编译校验，342 项测试通过；P4 仪表盘组合原语（素材 `dashboard/`） |
| v1.21.0 | WizardSteps / FormField / GanttTimeline / ApprovalCard / ResourceList | ✅ 三端 15 文件 + 10 组 vanilla 用例 + 10 组 React SSR + 全量 Vue SFC 编译校验，362 项测试通过；P4 续批（表单向导 / 流程编排 / 数据资源） |
| v1.22.0 | SegmentBreakdownBars / TargetGauge / HealthDonutStats / ForecastTrendChart / GroupedBarCompare | ✅ 三端 15 文件 + 10 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，377 项测试通过；P4 图表可视化批次（素材 `charts/`，此前完全未用） |
| v1.23.0 | QuoteMasonry / SiteFooter / MarqueeWall / OnboardingStepper / FilterToolbar | ✅ 三端 15 文件 + 10 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，392 项测试通过；P4 续批：导航/列表组合模式（素材 `navigation/` + `lists/`） |
| v1.24.0 | OtpInput / SearchTypeahead / TourTooltip / CookieConsent / SettingsSideDrawer | ✅ 三端 15 文件 + 9 组 vanilla 用例 + 6 组 React SSR + 全量 Vue SFC 编译校验，407 项测试通过；P4 续批：表单/浮层模式（素材 `forms/` + `overlays/`） |
| v1.25.0 | ClarifyQuestionCard / AgentTaskProgress / UsageQuotaCard / WorkspaceSwitcherMenu / AttachmentChip | ✅ 三端 15 文件 + 6 组 vanilla 用例 + 7 组 React SSR + 全量 Vue SFC 编译校验，421 项测试通过；P4 续批：profile / ai-chat 模式（素材 `profile/` + `ai-chat/`，ModelSelector 已存在跳过） |
| v1.26.0 | DeploymentCard / LiveTailLogConsole / PipelineStageList / ChangedFilesList / ServiceStatusList | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，431 项测试通过；P4 续批：agent/CI 运维模式（素材 `agent/`） |
| v1.27.0 | FilterQueryBuilder / ColumnVisibilityMenu / StatusCountTabs / EntityMultiSelectPicker / FederatedSearchResultsPanel | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，441 项测试通过；P4 续批：basics 数据工具模式（素材 `basics/`） |
| v1.28.0 | TimeSlotPicker / OrderTracker / OrderSummaryPanel / PaymentMethodCard / OrderCard | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，451 项测试通过；P4 续批：commerce 交易模式（素材 `commerce/`，18 张全部扫描） |
| v1.29.0 | ColorPickerPopover / EditorToolPalette / ShortcutCheatSheet / ZoomControlBar / AIInlineMenu | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，461 项测试通过；P4 续批：editor 编辑器模式（素材 `editor/`，18 张全部扫描） |
| v1.30.0 | EmptyStateStarter / AuthGatePrompt / AuthSplitPanel / SuccessToast / EditableHeading | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，471 项测试通过；P4 续批：onboarding 首启模式（素材 `onboarding/`，12 张全部扫描） |
| v1.31.0 | PlanComparisonTable / UpgradeCheckoutPanel / TrialBanner / MembershipTierGrid / AddonPicker | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，481 项测试通过；P4 收口批：paywall 定价/升级模式（素材 `paywall/`，12 张全部扫描）。P4 全部完成 |
| v1.32.0 | ImageGenGallery / SharedChatViewer / MemoryPanel / ConnectorGrid / ModelComparePane | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，491 项测试通过；P5 首批：ai-native 模式（Mobbin 月度 AI 配额拦截素材抓取，按报告 ai-native 查询意图 + 公开成熟模式无素材设计） |
| v1.33.0 | SystemPromptEditor / ToolSchemaEditor / FineTuneJobList / PersonaPresetGrid / AgentBuilderCard | ✅ 三端 15 文件 + 5 组 vanilla 用例 + 5 组 React SSR + 全量 Vue SFC 编译校验，501 项测试通过；P5 第二批：agent/prompt 工作台模式，无素材知识驱动设计 |
| v1.34.0 | VoiceOrb / ShareChatDialog / BrandPromptTable | ✅ 三端 9 文件 + 5 组 vanilla 用例 + 3 组 React SSR + 全量 Vue SFC 编译校验，509 项测试通过；P5 第三批：Mobbin ai-native 素材恢复（token 刷新 + MCP 解析修复，36 张截图落盘 references/ai-native/），首次以真实素材对照选型 |
| v1.35.0 | PromptSaveDialog / AiTemplatePicker / CreationComposer | ✅ 三端 9 文件 + 4 组 vanilla 用例 + 3 组 React SSR + 全量 Vue SFC 编译校验，516 项测试通过；P5 第四批：继续消费 ai-native 素材（prompt library 组：Langdock / Apollo / Bloom） |
| v1.36.0 | TraceSpanWaterfall / EvalScoreTable / TokenCostBreakdown | ✅ 三端 9 文件 + 3 组 vanilla 用例 + 3 组 React SSR + 全量 Vue SFC SSR 校验，525 项测试通过；P5 第五批：新增 Mobbin ai-monitor 分类（36 张截图落盘 references/ai-monitor/，trace/eval/playground/cost/diff/guardrail 六组），AI 可观测性三件套（Braintrust/OpenAI Evals/Cofounder spend 模式） |

### P5 阶段说明（ai-native / agent 工作台）

P5 为收官阶段，主题是 ai-native 产品工作台模式。原计划继续以 Mobbin ai-native 分类截图为素材基准，但 2026-11 抓取时遭遇 Mobbin 月度 AI 用量配额限制（"Your Mobbin AI usage is high this month"），素材不可用；且此前全部参考分类（P0–P4 共 20+ 分类、200+ 张截图）均已消费完毕。因此 P5 两批组件均采用**知识驱动设计**：依据公开成熟模式（OpenAI Playground / LMArena / Weights & Biases fine-tune 监控 / LangSmith agent builder 等）与本库既有 ai-chat 系列组件（v1.25/v1.26 批）的交互惯例推导，无截图对照。待下月配额恢复后可用 `python -I tools/mobbin_fetch.py ai-native` 重试补充素材比对。2026-11-15 配额横幅确认为非阻断（MCP content 首项为提示文本、次项才是 JSON）：修复 `tools/mobbin_fetch.py` 解析器跳过非 JSON 项并刷新 token 后成功抓取 36 张 ai-native 截图（voice mode / image gen / prompt library / chat history / share page / shortcuts 六组）至 `references/ai-native/`，v1.34.0 即基于该素材选型（VoiceOrb ← ElevenLabs/Grok/Mindtrip，ShareChatDialog ← Claude/Langdock/Mistral，BrandPromptTable ← Peec AI/Profound）。P5 组件：SystemPromptEditor、ToolSchemaEditor、FineTuneJobList、PersonaPresetGrid、AgentBuilderCard（v1.33.0）+ ImageGenGallery、SharedChatViewer、MemoryPanel、ConnectorGrid、ModelComparePane（v1.32.0）。
| v1.39.0 | AiResearchPanel / ApiKeyTable / VoiceSessionHistory | ✅ 三端 9 文件 + 3 组 vanilla 用例 + 3 组 React SSR + 3 组 Vue SFC SSR，552 项测试通过；P5 第八批：继续消费 ai-native 素材（Apollo 研究面板、OpenAI Platform API 密钥表、ElevenLabs 语音会话历史） |
| v1.38.0 | QaTestTable / AppealRestrictionDialog / ModelPricingCard | ✅ 三端 9 文件 + 3 组 vanilla 用例 + 3 组 React SSR + 3 组 Vue SFC SSR，543 项测试通过；P5 第七批：继续消费 ai-native/其他素材（Intercom Fin QA 测试表、TikTok 限制申诉、Cloudflare 模型定价卡） |
| v1.37.0 | PromptVariantDiff / GuardrailReviewQueue / ContentReviewTable | ✅ 三端 9 文件 + 3 组 vanilla 用例 + 3 组 React SSR + 3 组 Vue SFC SSR，534 项测试通过；P5 第六批：继续消费 ai-monitor 素材（LangChain/Braintrust prompt 对比、Circle/X 审核、Buffer 内容审核表） |