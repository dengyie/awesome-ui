# Roadmap v2 组件选型候选报告（素材库扩充后 · 2026-11-16）

> **执行进度（2026-11-16）**：批次 v2.1.0 已完成 —— SessionDeviceTable（← Airwallex）、
> AuditLogTable（← Okta）、ChangelogTimeline（← Canny）三端落地（组件编号 190–192），
> Gallery sections 180–182，633 项回归测试全绿。原候选 OtpCodeEntry 实施时发现与
> 既有组件 #97 `OtpInput` 功能重叠，按"零重叠"规则撤销，改用 security/10_Airwallex
> 登录会话表补位。批次 v2.2.0 已完成 —— TaskDetailPanel（← ClickUp）、
> DeliveryTrackingPanel（← DoorDash）、MapPropertyCard（← Airbnb）三端落地
> （组件编号 193–195），Gallery sections 183–185，642 项回归测试全绿。
> 批次 v2.3.0 已完成 —— ApiReferenceViewer（← GitBook）、WeekCalendarGrid
> （← Clockwise）、VideoProjectSettings（← Vimeo）、EventStreamPanel（← WorkOS）
> 三端落地（组件编号 196–199），Gallery sections 186–189，654 项回归测试全绿
> （"后续储备"四项全部消费完毕）。全库组件总数 200（含 UiIcon）× 3 端。
> 批次 v2.4.0 已完成 —— ProjectGanttTimeline（← workflow/01_Linear）、
> GroupedTaskList（← workflow/08_Asana）、EventLogTable（← security/13_Vanta）、
> DocsPageLayout（← docs-help/02_Mintlify）三端落地（组件编号 200–203），
> Gallery sections 190–193，666 项回归测试全绿。原候选 Amie 周历与 #197
> WeekCalendarGrid 重叠、Airtable 时间线与甘特图重叠，按"零重叠"规则跳过。
> 全库组件总数 204（含 UiIcon）× 3 端。
> 批次 v2.5.0 已完成 —— TaskCardModal（← workflow/09_Trello）、
> FormTrackingDashboard（← workflow/20_Fresha）、AudioPlaylistPage（← media/21_Suno）、
> BlogPostArticle（← docs-help/01_Hashnode）三端落地（组件编号 204–207），
> Gallery sections 194–197，678 项回归测试全绿。重叠跳过记录：Wrike/Motion
> （甘特变体）、Productboard（时间线泳道）、Evernote/Proton（周历）、Qatalog
> （任务详情侧栏）、Rise（周历 + 事件编辑）、Remote/HoneyBook（OTP）、GitLab
> （活动会话表）、Mixpanel（事件表）、Gumloop（changelog 页）、Grain/Vimeo 余量
> （播放器空间）、Subframe（文档页）、Slite（搜索浮层与 #116 重叠）、Adaline
> （代码面板与 #196 重叠）、Employment Hero（步骤条 + 状态表）、SuperHi（课程章节页）。
> 全库组件总数 208（含 UiIcon）× 3 端。
> 批次 v2.6.0 已完成 —— PermissionMatrix（← security/22_Vanta）、
> StockPhotoPicker（← media/18_Substack）、MapActivityList（← maps/01_GetYourGuide）、
> SearchResultsPage（← docs-help/08_Confluence）三端落地（组件编号 208–211），
> Gallery sections 198–201，690 项回归测试全绿。重叠跳过记录：WorkOS Events
> （与 #198 EventStreamPanel 同源重叠）、Spotify（与 #206 AudioPlaylistPage 同属
> 音频播放空间）、Slack Lists 看板（与 #45 KanbanBoard 重叠）、Exa AI 问答页
> （与 chat 全家桶 + #207 重叠）、Uber Eats 追踪（与 #194 DeliveryTrackingPanel
> 重叠）、komoot 地图搜索（与 #98 SearchTypeahead 重叠）、Amazon 地图追踪
> （配送追踪空间）、Nextdoor 地址补全（与 #98 重叠）、Profound 工作流进度
> （与 #103 AgentTaskProgress / #34 AgentRunLog 重叠）、Base44 API 文档
> （与 #196 ApiReferenceViewer 重叠）、Cosmos 瀑布流（与 #137 ImageGenGallery 重叠）。
> 全库组件总数 212（含 UiIcon）× 3 端。

> 背景：roadmap v1 已收官（v1.47.0，190 组件 × 3 端，624 测试）。为延续迭代，
> 已通过 `tools/mobbin_fetch.py` 新增 5 个分类并抓取 114 张 Mobbin 截图，
> 素材库总量 326 → 512 张（21 分类）。本报告为新一批次的选型候选。

## 新增素材概览

| 分类 | 张数 | 代表产品 | 抽样验证 |
|------|------|----------|----------|
| docs-help | 24 | GitBook, Confluence, Hashnode, Mintlify, Canny | GitBook API 参考、Canny Changelog |
| media | 24 | Vimeo, Leonardo AI, Visual Electric | Vimeo 视频项目设置 |
| workflow | 24 | Linear, ClickUp, Asana, Motion, Clockwise | ClickUp 任务详情、Clockwise 周历 |
| maps | 18 | Airbnb, DoorDash, Uber Eats, GetYourGuide | DoorDash 配送追踪、Airbnb 地图卡片 |
| security | 24 | Okta, WorkOS, Vanta, Coinbase, HoneyBook | HoneyBook OTP、Okta 审计日志 |

## 候选组件（建议 roadmap v2 前两批，共 6 个）

### 批次 v2.1（流程与安全）

1. **SessionDeviceTable** ← security/10_Airwallex（Login Sessions）
   登录会话/设备列表：头部（标题 + 帮助文案 + Learn more + Log out all）、
   OS/应用/位置/IP/最近活跃/状态六列表格、Current/Logged out 徽章、分页器 + 每页行数。
   （原候选 OtpCodeEntry 因与 #97 OtpInput 重叠撤销）
   Props: `title` / `description` / `sessions[{id,os,application,location,ip,lastActive,status}]` / `page` / `onSessionClick` / `onLogoutAll`。
   data-hook 前缀：`data-session-*`。

2. **AuditLogTable** ← security/18_Okta (System Log)
   审计事件表：时间范围/关键词筛选区、事件趋势迷你柱状图、Events 计数 + 视图切换、
   Time/Actor/Event Info/Targets 四列表格，行内 SUCCESS 状态徽标。
   Props: `filters` / `trend` / `events[{time,actor,event,status,target}]` / `onEventClick`。
   data-hook 前缀：`data-audit-*`。

3. **ChangelogTimeline** ← docs-help/13_Canny
   更新日志时间轴：左侧日期 + 分类标签（Improved/New）+ 标题正文 + 点赞/浏览量/分享，
   搜索框 + Filters 下拉。注意素材为日文内容，默认数据用中文/英文重写。
   Props: `entries[{date,tag,title,body,likes,views}]` / `onEntryClick`。
   data-hook 前缀：`data-changelog-*`。

### 批次 v2.2（工作流与地图）

4. **TaskDetailPanel** ← workflow/07_ClickUp
   任务详情侧栏：状态胶囊（IN DEVELOPMENT）、双列字段网格（Assignees/Dates/Priority/
   Time estimate/Sprint points/Tags）、描述折叠区、子任务/依赖/清单动作列表、Activity 侧栏。
   Props: `title` / `status` / `fields` / `description` / `actions` / `onFieldChange`。
   data-hook 前缀：`data-task-*`。

5. **DeliveryTrackingPanel** ← maps/07_DoorDash
   配送追踪：地图占位 + 右侧信息栏（ETA、四段进度 stepper 图标、骑手卡片 + 联系按钮、
   订单明细折叠、礼品卡分享区块、Copy link / Text me the link 双按钮）。
   Props: `title` / `eta` / `steps[{icon,label,state}]` / `courier{name,phone}` / `items` / `onCall`。
   data-hook 前缀：`data-delivery-*`。

6. **MapPropertyCard** ← maps/05_Airbnb
   地图气泡卡片：价格 pin、悬浮预览卡（图片轮播点、收藏/关闭按钮、标题 + 评分、
   副标题、价格区间与日期）。
   Props: `pins[{id,price,x,y}]` / `card{images,title,rating,reviews,subtitle,price,dates}` / `onPinClick`。
   data-hook 前缀：`data-mappin-*`。

## 后续储备（v2.3+ 方向）

- **ApiReferenceViewer** ← docs-help/20_GitBook：GET endpoint 头 + 参数定义 + 可切换
  语言代码面板 + 响应 JSON 预览（与现有组件无重叠，AI/API 文档场景高频）。
- **VideoProjectSettings** ← media/02_Vimeo：媒体元数据表单（Title/Description/Thumbnail
  选择器 + Chapters 空态）。media 分类还可挖播放器控制条。
- **WeekCalendarGrid** ← workflow/13_Clockwise：周视图日历网格（事件块跨时段、
  当前时刻红线、Day/Week 切换）。
- security 分类还有 Sessions/Devices 列表、权限矩阵（WorkOS/Vanta）两张强素材未消费，
  可作 v2.3 候选（`SessionDeviceList` / `PermissionMatrix`）。

## 素材消费状态

- 已消费（v2.1–v2.2 预定）：security 2 张、docs-help 2 张、workflow 1 张、maps 2 张。
- 未消费余量：docs-help 22、media 23、workflow 23、maps 16、security 22（合计 106 张）。
