# Roadmap v3 组件选型候选报告（素材库 3575 张深挖后 · 2026-11-18）

> **执行进度（2026-11-18）**：v2 系列已收官（v2.7.0 组件 216 + tactile 五组件并入 220 编号 + paper-theme，732 测试全绿，
> Gallery 98 sections）。素材库三轮扩充定版：**28 品类 3575 张 ~273MB**（28 类 × ≥8 查询，全部增量同步
> MangoDrive 并校验）。本报告从**未消费储备池**选型，延续「零重叠」规则。
>
> **批次执行记录（2026-11-18 一次拉完）**：v3.1.0（InvoiceHistoryTable 222 / UsagePricingBreakdown 223 /
> CancelRetentionFlow 224 / WebhookConfigPanel 225）、v3.1.1（IntegrationConnectGrid 226 /
> NotificationPrefsMatrix 227 / PermissionDeniedState 228 / NoResultsState 229）、v3.2.0（TableSavedViews 230 /
> BottomTabBar 231 / BentoFeatureGrid 232 / LogoCloud 233 / StatsBand 234）三批次 13 组件 × 3 端全部落地，
> 账本 235 条目 0..234，Gallery sections 211-223，测试 new-components55/56/57 三端三件套全绿。
> NotificationCenter #42 加 show-prefs-button 偏好齿轮（open-preferences 事件）。
> **勘误**：原 P1 增强「DataTable 批量工具条」经核对 #33 已内置 optional multi-select + floating
> batch-action bar，无需增强，撤销该项。（v2.7.0 组件 216 + tactile 五组件并入 220 编号 + paper-theme，732 测试全绿，
> Gallery 98 sections）。素材库三轮扩充定版：**28 品类 3575 张 ~273MB**（28 类 × ≥8 查询，全部增量同步
> MangoDrive 并校验）。本报告从**未消费储备池**选型，延续「零重叠」规则。

## 储备池概览（roadmap v2 未消费部分）

| 品类 | 张数 | 代表产品 | 状态 |
|------|------|----------|------|
| billing | 153 | Coinbase、Contractbook、Remote、Height、Shopify、Care com | v3.1 主池 |
| settings | 110 | Customer io、Uxcel、Salesforce、Contra、Sentry、ManyChat | v3.1 主池 |
| empty-error | 145 | Wix、Slite、NordVPN、Outseta、Copilot | v3.1/3.2 主池 |
| notifications | 105 | Delphi、Dovetail、Air、folk、Causal、Replit、Jira | v3.1 主池 |
| mobile | 104 | Wix、Stitch、Figma、Superhuman Mail、Trello、Fabric、Twenty | v3.2 主池 |
| tables | 99 | AirOps、n8n、Vercel、Supabase、Rows、Neon、OpenAI Platform、Attio | v3.2 主池 |
| landing | 80 | Krea AI、Magnific、Copy ai、Fiverr、Mural、Lyssna、Wix | v3.2 主池 |
| ai-monitor 余量 | ~90 | Adaline、Google AI Studio、LangChain | 按需 |

## 候选批次 v3.1（账单 / 设置 / 通知 / 权限空态）

1. **InvoiceHistoryTable** ← billing/Contractbook、Remote、Height
   发票历史表：月份分组行、状态徽章（Paid/Pending/Failed）、金额右对齐 mono、逐行 Download PDF
   图标钮、页脚合计。与 #30 DataTable（通用筛选分页）不重叠——发票域字段与聚合行为专用。
   Props: `title`, `invoices: [{id,period,amount,status,date}]`, `onDownload(invoice)`。
2. **UsagePricingBreakdown** ← billing/usage metered pricing 素材（Shopify、Care com）
   用量计费拆解：阶梯单价表（tier/range/unit price）+ 当前用量高亮 + 预估小计卡。
   与 #62 UsageMeter（环形进度）/ #101 UsageQuotaCard（配额卡）不同域——这里是账单拆解而非用量指示。
   Props: `tiers: [{range,unitPrice,usage}]`, `currency?`, `estimate?`。
3. **CancelRetentionFlow** ← billing/plan downgrade cancel retention
   取消挽留流程：退出原因单选卡 + 优惠保留 offer 卡（折扣价 + Keep plan）+ 确认步骤条。
   流程类组件与既有 Form/Panel 均不重叠。
   Props: `reasons: string[]`, `offer?: {title,description,discountedPrice,originalPrice}`, `onKeep()`, `onConfirmCancel(reason)`。
4. **WebhookConfigPanel** ← settings/webhooks endpoint configuration
   Webhook 端点管理：endpoint URL 行 + events 多选 chips + recent deliveries 表
   （状态码徽章 + 重试钮）+ secret 轮换区。与 #161 ApiKeyTable（密钥表）不重叠。
   Props: `endpoints: [{id,url,events[],lastStatus,lastDelivery}]`, `events: string[]`, `onTest(endpoint)`。
5. **IntegrationConnectGrid** ← settings/integration settings connect service cards
   集成连接卡网格：服务 logo 卡 + Connected/Not connected 徽章 + Connect/Disconnect 钮 +
   分类筛选 tabs。SettingsPanel（#34 锚点设置页）不含此网格形态。
   Props: `integrations: [{id,name,icon,connected,category}]`, `categories?: string[]`, `onToggle(integration)`。
6. **NotificationPrefsMatrix** ← notifications/email digest frequency 素材
   通知偏好矩阵：行=事件类型、列=渠道（In-app/Email/Push）的 checkbox 矩阵 + 按 channels 全开/关
   行级快捷钮。#39 NotificationCenter 是通知消息列表，偏好矩阵是设置面。
   Props: `events: [{id,label,channels: {inapp,email,push}}]`, `onChange(event, channel, enabled)`。
7. **PermissionDeniedState** ← empty-error/permission denied access restricted
   权限受限空态：锁图标插画位 + 标题/描述 + 「Request access」主 CTA + 管理员联系副链接。
   与 #25 EmptyState / #125 EmptyStateStarter（通用空态）的区别：权限域专属文案与 CTA 语义。
   Props: `title?`, `description?`, `onRequestAccess()`, `contactAdmin?`。
8. **NoResultsState** ← empty-error/search no results suggestions
   搜索无结果空态：放大镜插画位 + 「No results for “query”」+ 拼写建议 chips + 清除筛选钮。
   Props: `query`, `suggestions?: string[]`, `onSuggestion(s)`, `onClearFilters()`。

## 候选批次 v3.2（表格 / 移动端 / 营销落地页）

9. **TableSavedViews** ← tables/saved views filters tabs（Attio、Rows）
   数据表保存视图条：视图 tabs（All/My views）+ 视图内筛选 chips + 保存/分享当前视图钮。
   Props: `views: [{id,label,filters[]}], activeView, onSwitch(view), onSaveView(name)`。
10. **BottomTabBar** ← mobile/mobile web navigation bottom tab bar（Wix、Stitch、Trello）
    移动端底部 tab 导航：icon+label 项、active 指示、badge 计数、safe-area padding。
    Props: `tabs: [{id,label,icon,badge?}], active, onChange(tab)`。
11. **BentoFeatureGrid** ← landing/bento grid feature showcase（Krea AI、Magnific、Copy ai）
    Bento 网格特性展示：不等宽 tile（span 配置）+ 每 tile icon/标题/描述/内嵌视觉位。
    与 HeroSection/FooterSection/TestimonialGrid（#51/52/53）均为营销 section 家族互补，形态无重叠。
    Props: `tiles: [{id,title,description,icon?,span?: 1|2|3,media?}]`。
12. **LogoCloud** ← landing/logo cloud trusted by companies
    客户 logo 墙：单行/双行网格 + 「Trusted by」小标题 + 灰度 hover 彩色。
    Props: `logos: [{name,src?}], title?`。
13. **StatsBand** ← landing/stats band metrics big numbers（Fey、Visitors）
    大数字指标带：3-4 列数字 + 标签 + 可选趋势注脚；reduced-motion 直接静态。
    与 #28 StatCard（卡片堆）不同：整条带状 section。
    Props: `stats: [{value,label,note?}]`。

## P1 增强候选（现有组件）

- **DataTable**：bulk selection 工具条（选中行数 + 批量操作下拉）与 saved views 可在 v3.1
  InvoiceHistoryTable 落地后回灌增强。
- **NotificationCenter**：偏好入口（齿轮钮 → NotificationPrefsMatrix）联动。

## 已消费批次 v3.4.0（Agent 工作台扩展批，#237-241）

- **McpConnectPanel** (#237)：MCP 服务器连接引导（按 client 切 tab + 编号步骤 + 可复制 snippet）。素材：references/agent 414。
- **AgentNotificationFeed** (#238)：Agent 通知流（四态状态点 + statusText 高亮 + 未读徽章）。素材：references/notifications 105。与 #39 NotificationCenter 区分：本组件为 Agent 运行域专用流式行。
- **AgentErrorRecovery** (#239)：失败恢复态（alert + run-id chip + Retry/Start over）。素材：references/empty-error 145。
- **AgentWorkspaceSettings** (#240)：工作区设置（分区 tab + 描述前置 toggle 组 + on 计数）。素材：references/settings 110。
- **AgentEnvVarEditor** (#241)：环境变量编辑器（secret 掩码 + reveal + 行级增删）。素材：references/agent。
- 选型说明：延续 v3.3 Agent 工作台五件的自然进化，全部 Agent 域专用、零名称重叠；空态/通知/权限的通用形态分别由 #25/#125、#39、#24 已覆盖，本批不做通用变体。

## 已消费批次 v3.5.0（Agent 工作台纵深批，#242-244）

- **AgentScheduleEditor** (#242)：定时触发器编辑（频率 pill + cron/next-run 预览 + 保存反馈）。素材：references/workflow 129 / settings 110。SchedulerSlots (#48) 是预约时段选择，ContentReviewTable 仅 Schedule 按钮——cron 编辑全库空白。
- **AgentGuardrailViolationCard** (#243)：单条护栏违规详情卡（severity badge + match 高亮 + Proceed/Block）。素材：references/ai-monitor 150 / security 125。与 GuardrailReviewQueue（列表+verdict 队列）形态区分。
- **AgentModelFallbackList** (#244)：模型降级链（优先级行 + 健康点 + 重排）。素材：references/ai-monitor 51_Adaline Providers 行形态。
- 选型说明：TokenBudgetBar 候选因与 UsageMeter/UsageQuotaCard（账户级汇总）形态趋同被放弃，改为上述三件 Agent 域纵深。

## 重叠跳过记录（选型时排除）

- Outseta/Slite 通用空态 → #25/#125 已覆盖形态。
- n8n/Vercel 表格通用筛选分页 → #30 DataTable。
- Shopify 发票表若与现有 SessionDeviceTable/AuditLogTable 形态高度趋同则复用其结构仅换域字段。
- notifications 里「通知消息列表」变体 → #39 NotificationCenter。

## 素材扩容策略（定版）

素材库 28 品类 3575 张已覆盖全部主要设计方向（每品类 ≥8 查询），**转入按需增量模式**：
1. roadmap 选型驱动——候选组件实施时若对应方向素材不足，用 `tools/mobbin_fetch.py` 定向补查
   （CATEGORIES 加查询即可，链路幂等）。
2. Mobbin 上新驱动——月度小批量跑一次高频品类（ai-chat/agent/ai-monitor）吸收新 pattern。
3. 每轮拉取后：重生成 `references/INDEX.md` → `python -I tools/upload_references_to_mangodrive.py`
   增量同步 → `--verify` 抽样校验 → vault 回写（见 Mobbin 素材拉取凭据与SOP）。
