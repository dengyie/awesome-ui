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
| **`ComboBox`** | 可搜索下拉 | 输入过滤、↑↓/Enter 键盘漫游、清空按钮、选中勾标、外点与 Esc 关闭 |
| **`Navbar`** | 导航栏 | 多列 mega menu、栏目标题 + 图标 + 徽标、纯链接区、CTA 按钮、外点与 Esc 关闭 |
| **`ActivityFeed`** | 活动时间线 | 六类事件色标、竖向连接线、等宽 target 胶囊、次行详情、相对时间 |
| **`UsageMeter`** | 用量条 | 70% / 90% 阈值变色、百分比 + 剩余额例、Legend 可关、limit 边界保护 |
| **`ToggleSwitch`** | 开关 | role=switch + aria-checked、sm/md 两档、label/description 布局、禁用态 |
| **`Stepper`** | 步骤条 | complete/current/upcoming/error 四态、连接线着色、可点击回跳、static 只读 |
| **`SearchInput`** | 搜索框 | 受控/非受控双模式、⌘K 快捷键提示、清空按钮、loading 菊花、Enter/Escape 语义 |
| **`Tag`** | 标签 | 六色调、sm/md 尺寸、可移除（remove 事件）、clickable（tag-click 事件） |
| **`Modal`** | 模态对话框 | 遮罩 + 毛玻璃、Escape/遮罩/关闭钮、dismissible/show-close 可关、footer 插槽 |
| **`ProfileHeader`** | 个人资料头 | 渐变封面 + Pro 徽标、头像叠压、状态点、`<dl>` 统计组、页签切换、动作按钮组 |
| **`BillingPanel`** | 账单面板 | 月付/年付切换、价格区、功能清单勾选、`<dl>` 费用明细（强调行）、CTA、提示注脚 |
| **`StepSlider`** | 离散步进滑杆 | 停靠点点击、←→/Home/End 键盘、已到达填充、highlight-from 前瞻高亮、aria-valuetext |
| **`InboxList`** | 收件箱列表 | 未读圆点、发送者列、标签胶囊（三色调）、主题+摘要截断、等宽日期、空态 |
| **`ChangelogFeed`** | 更新日志流 | 徽标四色调、标题+详情条目、可选 select 事件、footer 链接、sparkles 头部 |
| **`MetricStrip`** | 指标条带 | 一行式 KPI 单元格、正负持平 delta 三色调 + 趋势图标、可选图标、活动单元格高亮、metric-click |
| **`RankList`** | 排行榜列表 | 行内比率条（峰值归一 + 4% 下限）、等宽数值、value-header 列头、max-items 截断、可选 select |
| **`SideNav`** | 侧边导航 | 分组导航、图标 + 计数徽标（>0 玫红 / 0 灰）、active-id 高亮、heading 列头、navigate 事件 |
| **`PageHeader`** | 页头 | 标题 + Live 状态胶囊 + 描述、动作按钮组（primary/secondary/ghost）、下划线页签 + 计数、action/tab-change |
| **`TimeframePicker`** | 时间范围选择器 | 预设分段控件（aria-pressed）、前后步进箭头 + 日历区间标签、disabled 态、change/step 事件 |
| **`WizardSteps`** | 表单向导步骤 | 竖向步骤条（done/active/todo 三态 + 连接线）、可选 (Optional) 标注、bar 变体进度条（"N of M steps | Next: …"）、完成步骤回跳 |
| **`FormField`** | 表单字段骨架 | label + 必填星号 / (Optional)、error（alert 图标 + aria-invalid）/ hint 双态、N/M 计数、helper 注脚、控件插槽 |
| **`GanttTimeline`** | 甘特时间线 | 表格式行列头、任务条（四色调 + 进度白条 + 百分比）、层级缩进、今日红线、task-click |
| **`ApprovalCard`** | 审批卡 | 叠压头像组 + N/M 计数、到期日 + 决策三态（approved/rejected/pending）、 Approve/Request change 按钮、request-change 加人 |
| **`ResourceList`** | 资源列表 | 图标行 + mono 路径 + 时间标签、kind 徽标四色调、标题 + 总数、max-items 截断、可选 select |
| **`SegmentBreakdownBars`** | 分段条形对比 | 头部大数字 + 分段横条（五色调）、数值 + pp 增减列（正绿/负红）、按峰值归一、share 注脚 |
| **`TargetGauge`** | 目标仪表盘 | 半圆三段色带（rose/amber/emerald）+ 旋转指针、值徽章按区间着色、起止刻度、Remaining 行 |
| **`HealthDonutStats`** | 环形健康卡组 | conic-gradient 多段环 + 中心百分比、图例逐项占比、说明行、卡片操作按钮、三列栅格 |
| **`ForecastTrendChart`** | 实际+预测趋势 | 实色 Actual 柱 vs 虚线 Forecast 柱、trending 涨跌徽章、说明行、Actual/Forecast 图例 |
| **`GroupedBarCompare`** | 分组双柱对比 | violet 预估 / lime 实际双柱 + 柱顶数值、行名、双图例、按全组峰值归一 |
| **`QuoteMasonry`** | 引言瀑布墙 | CSS columns 瀑布流、`“` 引号可关、大写署名 + 公司徽章、1/2/3/4 列响应式 |
| **`SiteFooter`** | 深色站点页脚 | zinc-950 深底、多列链接栅格、合规徽章圆环（状态三色调）、标语 + 版权行 |
| **`MarqueeWall`** | 滚动弹幕墙 | 交替行反向无缝滚动（keyframes）、hover 暂停、`paused` 冻结、首字母头像、匿名卡 |
| **`OnboardingStepper`** | 引导步骤条 | `>` 步骤链 + 当步下划线、进度条按步推进、segmented 说明切换 + 示例行、Continue |
| **`FilterToolbar`** | 筛选工具条 | chip + 色调 value pill、可移除 ×、搜索框、list/grid 视图切换（none 隐藏）、主操作 |
| **`OtpInput`** | 验证码输入 | 6 格 auto-advance、Backspace 回退、整段粘贴、错误态 rose、Resend 链接 |
| **`SearchTypeahead`** | 搜索联想 | 下划线大输入、黄色 `<mark>` 命中高亮、类型徽章、Top results 分组、清空按钮 |
| **`TourTooltip`** | 引导浮层 | 三角 caret、Step N of M 计数、明暗双主题、👍/👎 反馈、末步 Finish tour |
| **`CookieConsent`** | Cookie 偏好 | 可折叠分类、Always Active 锁定、cookie 名 mono 列表、三操作批量确认 |
| **`SettingsSideDrawer`** | 侧边设置抽屉 | fixed 遮罩 + 侧面板、tab 条、设置行（toggle/select/按钮三色调）、粘性底部 |
| **`ClarifyQuestionCard`** | 澄清问题卡 | indigo 边框 + "?" 圆标、‹ N of M › 分页、已答态 pill、Enter 提交答案 |
| **`AgentTaskProgress`** | Agent 任务进度 | 上下文横幅、步骤卡（done/active+substeps/pending）、反馈链接 + Refine/Next |
| **`UsageQuotaCard`** | 用量配额卡 | 卡片/横幅双变体、sky 进度条、upgradeLine、全宽或内联 CTA |
| **`WorkspaceSwitcherMenu`** | 工作区切换 | 渐变首字母 tile、成员数 + 角色文案、current 高亮、创建 + 登出 |
| **`AttachmentChip`** | 附件芯片 | kind 色调徽章（pdf/doc/csv/image）、mono 字形、size·meta、圆形 X 移除 |
| **`DeploymentCard`** | 部署记录卡 | 状态 pill（building 脉冲/live/failed）、mono commit 行、Cancel/Visit 双态操作 |
| **`LiveTailLogConsole`** | 实时日志终端 | neutral-950 终端、来源下拉 + 搜索 + Live tail 开关、severity 圆点行 |
| **`PipelineStageList`** | CI 流水线 | 分组手风琴、组头当前步骤 + 累计时长、stage 行 mono 状态 |
| **`ChangedFilesList`** | 变更文件列表 | 折叠头 + 总 diffstat、扩展名徽章 + 状态 tag、每文件 +N/−N、文件夹分组 |
| **`ServiceStatusList`** | 服务状态清单 | 命令 code chip + 四态状态 + URL chip、验证清单（绿勾/灰点）、耗时行 |
| **`FilterQueryBuilder`** | 过滤器构建器 | where/and 连接词 chip、字段/操作符 select（mono 字形）、无边框值输入、圆形 X 删除 |
| **`ColumnVisibilityMenu`** | 列显隐菜单 | Showing X of Y 头、锁列 + 眼睛切换 + 上下排序、instant / apply-button 双模式 |
| **`StatusCountTabs`** | 状态计数标签条 | 与表格齐平对接的分段 tab、实时计数括号、激活白底内嵌阴影 |
| **`EntityMultiSelectPicker`** | 实体多选器 | 可搜索 checkbox 列表、头像行（图片/首字母/system 圆点）、选中行蓝底 |
| **`FederatedSearchResultsPanel`** | 联邦搜索面板 | 来源过滤 chips、`<mark>` 摘要高亮、键盘图例 + Ask AI 药丸 |
| **`TimeSlotPicker`** | 时间段选择器 | 日期 chip 条、Morning/Afternoon/Evening 分组网格、可用数（绿 N / 灰满）、选中 indigo |
| **`OrderTracker`** | 订单物流追踪 | 圆点连线 / 进度条双变体、emerald 到达勾 + 当前 ring、取消态全灰 + 原因 |
| **`OrderSummaryPanel`** | 订单摘要面板 | 价格行（折扣绿/总计粗+顶边框/删除线/括注）、promo chip + 输入行、带金额 CTA + 锁 footer |
| **`PaymentMethodCard`** | 支付方式卡片 | 品牌 tile（VISA/MC/AMEX）、Ending in 遮蔽号、金额右对齐、Change/Add 动作 |
| **`OrderCard`** | 订单卡片 | 灰底头带 Order# + View details、履约动词 + ETA 加粗 + 门店行、六态徽章、条目缩略图 |
| **`ColorPickerPopover`** | 取色器弹层 | 6 行色调网格选中 ring+勾、hex 实时解析 + RGB 三通道、吸管、Document/Custom 分区 + 虚线添加 |
| **`EditorToolPalette`** | 画布工具栏 | 图标工具按钮 + kbd 数字提示、激活蓝底、选中计数徽标、水平胶囊 / 垂直工具条 |
| **`ShortcutCheatSheet`** | 快捷键速查表 | 两列分组列表、markdown 语法 mono 提示、keycap 芯片组、实时搜索 + 空态 |
| **`ZoomControlBar`** | 画布缩放条 | stepper / dropdown / slider 三变体、上翻预设菜单 + Fit、undo/redo 对、值 clamp |
| **`AIInlineMenu`** | AI 内联菜单 | 选择锚定药丸、AI 徽章芯片双色调、动作下拉、loading 脉冲 / error 红描边、dismiss |
| **`EmptyStateStarter`** | 首次使用空态卡 | 插画插槽、plain/dashed/card 三变体、md/sm 双尺寸、solid/outline/link 三种 CTA |
| **`AuthGatePrompt`** | 软登录门 | 上下文理由标题、SSO 药丸栈三色调、发丝分隔线、次级药丸、"Not now" 跳过 |
| **`AuthSplitPanel`** | 分栏认证壳 | 灰底品牌面板（标题+副题）或深色 cover 变体、子节点自动捕获、法务 footer 链接 |
| **`SuccessToast`** | 成功确认条 | mint 绿底 + 深绿 check、自动消失计时、close 圆钮、sticky 模式、show() 重显 |
| **`EditableHeading`** | 行内编辑标题 | 点击变输入框（黄底高亮 + teal 焦点框）、Enter 提交 / Esc 取消、breadcrumb + meta 行 |
| **`PlanComparisonTable`** | 方案特性对比矩阵 | 深色分节标题带、单元格 ✓/灰减/✓+备注三态、highlighted 列浅底、每方案 CTA 行 |
| **`UpgradeCheckoutPanel`** | 升级结算面板 | 计费周期分段开关、席位步进器 min/max 钳制、行项目划线原价 + 折扣行 + 条款小字 + emerald Confirm |
| **`TrialBanner`** | 试用倒计时横幅 | 天数胶囊（≤3 天脉冲催促）、默认文案自动带 plan 名、indigo/amber 双色调、可关闭可恢复 |
| **`MembershipTierGrid`** | 创作者会员层级 | 封面图 + 徽章 + 大价格、"Limited (N remaining)" 库存提示、全宽试用 CTA、perk 圆点列表、2/3 列自适应 |
| **`AddonPicker`** | 附加项选择器 | 复选行选中 indigo 浅底、价格右对齐或 "Let's talk" 联系链接、disabled 行降透明、底部合计行 |
| **`ImageGenGallery`** | AI 生图工作台 | 提示词条 + Generate CTA、2/3 列 tile 网格（比例/模型徽章）、hover 操作（下载/变体/删除）、generating 骨架脉冲 |
| **`SharedChatViewer`** | 分享聊天公开页 | 品牌 header + meta、用户/助手气泡（右 indigo / 左灰）、只读提示 + 底部 CTA 条 |
| **`MemoryPanel`** | AI 记忆管理 | 记忆条目 + 来源小字、行内编辑（Save/Cancel）、删除/清空、底部新增输入行 |
| **`ConnectorGrid`** | 应用连接器面板 | 图标卡 + 描述、Connect/Connected 切换按钮、实时 N/M connected 徽章、2 列自适应 |
| **`ModelComparePane`** | 双模型对比 | 共享 Prompt 条、左右两列输出（streaming 点阵 / error 红字）、底部 A/Tie/B 投票栏 |
| **`SystemPromptEditor`** | System prompt 编辑器 | Saved/Unsaved 状态标签、token 估算 + {{变量}} chips、temperature 滑杆、Reset / Save（干净态禁用） |
| **`ToolSchemaEditor`** | 工具 Schema 注册表 | 工具卡（method 徽章 + endpoint）、typed 参数 chips（required 红星）、enable 开关 + N/M 徽章、逐卡 Validate |
| **`FineTuneJobList`** | Fine-tune 任务列表 | queued/training/completed/failed 状态 chips、进度条 + 百分比、cost + ETA、active 行 Cancel、New fine-tune CTA |
| **`PersonaPresetGrid`** | Persona 预设网格 | 渐变 emoji 卡 + 描述 + temp chip、选中 indigo 描边 + ring-2 + 对勾气泡 |
| **`AgentBuilderCard`** | Agent 工作流卡 | 竖向节点链（trigger/tool/llm/output 图标 + type chips）、状态圆点（active 脉冲）、Edit + Run agent CTA（running 禁用） |
| **`VoiceOrb`** | 语音对话球 | 状态渐变圆盘（listening/speaking/thinking/idle 各自渐变 + 脉冲）、波形条读出、Mute / End call 控件、sm/md/lg 尺寸 |
| **`ShareChatDialog`** | 分享对话弹窗 | 私有 / 公开链接二选一卡、链接 code 行 + Copy link、未生成链接时 Create link CTA、open=false 不渲染 |
| **`BrandPromptTable`** | 品牌 Prompt 表格 | 可见性 % / 情感分色（emerald/amber/red）/ 排名 #N、quota 徽章、+ Add Prompt CTA、空状态提示 |
| **`PromptSaveDialog`** | 保存 Prompt 弹窗 | 文件夹选择、标题 + prompt 正文、{{变量}} chips、可见性说明、Cancel / Save prompt |
| **`AiTemplatePicker`** | AI 模板选择器 | 分类侧栏（计数徽章）、模板卡 Try it 网格、分类过滤、Run custom AI prompt |
| **`CreationComposer`** | 创作输入条 | Image Assist 开关、prompt 多行输入、分辨率/数量选择、Create CTA（violet） |
| **`TraceSpanWaterfall`** | 调用瀑布图 | 水平 span 时间条（LLM/tool/retrieval 分色）、层级缩进、时长 + 成本标注、图例、span 点击回调 |
| **`EvalScoreTable`** | 评测得分表 | 运行得分行（pass/warn/fail 分色 chip + 进度条）、测试标准卡、Add criteria 虚线 CTA |
| **`TokenCostBreakdown`** | Token 成本拆解 | 堆叠消费条 + 分段图例（金额/占比）、Token 用量行（输入/输出/推理）、总额进度 |
| **`PromptVariantDiff`** | Prompt 版本对比 | 双栏 A/B 面板、{{变量}} indigo chips、+N/−N/~text 变更统计、Use this version 按钮、变量增删 chips |
| **`GuardrailReviewQueue`** | 审核队列 | 待审卡（作者 + 置信度 + 规则 chip + 内容面板 + 原因 tags）、Approve/Reject、已决项折叠一行 |
| **`ContentReviewTable`** | 内容审核表 | 编号行 + ✓/⚠ 状态、tag chip + +N、发布时间、头部 valid/errors 计数、Save as Drafts / Schedule Posts CTA |
| **`QaTestTable`** | QA 测试表 | 行复选框、✓/— 回答状态、Good/Acceptable/Poor 评级 chips、"N questions / M answered" 头部计数 |
| **`AppealRestrictionDialog`** | 限制申诉弹窗 | 原因卡（标题 + 详情）、180 天申诉提示、Content Policy 链接、rose Appeal CTA、← 返回 / ✕ 关闭 |
| **`ModelPricingCard`** | 模型定价卡 | 等宽模型名、可复制 Model ID（⧉ 按钮 + copy-id 事件）、每百万 token 输入/输出定价行 |
| **`AiResearchPanel`** | AI 研究面板 | Apollo "Research with AI" 侧滑面板：研究模板卡片栈、每卡 Try it CTA、Run custom AI prompt 底部操作、空态提示 |
| **`ApiKeyTable`** | API 密钥表 | OpenAI Platform 风格密钥管理：掩码 key 预览、创建日期、Active / Revoked 状态徽章、行级 Copy / Revoke 操作、Create CTA 与活跃计数 |
| **`VoiceSessionHistory`** | 语音会话历史 | ElevenLabs Voice 历史侧栏：标题 / 日期 / 时长行、Completed / Running / Failed 状态徽章、行级重播按钮、计数头部与空态 |
| **`AiRewriteMenu`** | AI 改写菜单 | Intercom 创作器 AI 菜单：Expand / Rephrase / 语气变体 / Fix grammar / Translate 动作、功能徽章、触发按钮开合与 select / toggle 事件 |
| **`PromptPerformanceTable`** | 提示词表现表 | Peec AI 提示词追踪表：Visibility %、Sentiment 分（含 ▲▼— 趋势）、Position #、Mentions 列、行点击与 Export CTA |
| **`ShareAccessDialog`** | 分享访问弹窗 | Superhuman 分享对话弹窗：邀请输入框、有权成员行（头像 / 姓名 / 邮箱 / 权限角色 + 移除）、Copy link 页脚与开合控制 |
| **`AiNoteAnswer`** | AI 笔记回答卡 | Voicenotes Ask AI 回答卡：波形提问行、回答段落、"Other sources" 引用列表与 Copy 按钮 |
| **`AudioNotePlayer`** | 音频笔记播放器 | Voicenotes 底部音频条：播放/暂停按钮、波形条带（播放时前半段高亮）与标题 / 时长元信息行 |
| **`ImageActionMenu`** | 图片操作菜单 | Krea 生成图右键菜单：Fullscreen / Vary / Edit / Upscale & enhance / Make video / Download 动作、每项图标与 Download 前分隔线 |
| **`FalRunCard`** | 运行信息卡 | fal 生成任务卡：任务类型徽标、模型数 + 相对时间、Prompt 段落、AspectRatio / TotalCost 元信息行与复制 / 重跑 / 删除 / 分享动作行 |
| **`ImageGenMetaBar`** | 生成结果元信息条 | fal 结果页脚：左下模型徽标浮层 + 等宽 job id / 时长 / 单图费用元信息行 |
| **`GammaImageDetail`** | 图片详情面板 | Gamma AI 图片详情：大图预览、下载 / 缩放 / 删除与点赞 / 点踩工具行、完整 Prompt 阅读块 |
| **`WriterStyleGuide`** | 写作风格指南卡 | Writer 术语/风格指南：Company / Team / My 标签页、编号指南条目（标题 / 描述 / 阅读时长）与虚线新增 CTA |
| **`AiSuggestionCard`** | AI 建议卡 | Mindtrip 主动建议：✦ 头像、建议消息段落、跟进操作 chips 与 ✕ 关闭按钮 |
| **`JumpBackIn`** | 续聊卡片行 | Mindtrip "Jump back in"：缩略图（或渐变占位）、Trip/Chat 类型徽章、标题与副标题卡片行 |
| **`HelpResourcesPanel`** | 帮助资源面板 | Graphite Help 侧栏：Reference/Tutorial 徽章资源卡（可选阅读时长）与底部链接行 |
| **`VisionAnalysisCard`** | 视觉分析卡 | Claude 图片分析结构化回复：可点击分区标题 + key/value 属性行网格 |
| **`PrReviewQueue`** | PR 评审队列 | Graphite 分组 PR 队列：可折叠分组（计数徽章 + 标签）、作者首字母头像行、`作者 · 仓库 #编号` 元信息 |
| **`IterationActionBar`** | 迭代操作条 | Luma 生成迭代条：Show More / Brainstorm / Reply 圆角 pills、··· 溢出位与 ‹ › 翻页器（页码标签） |
| **`MonitorRunList`** | 监控运行列表 | Adaline Monitor 运行历史：Filter + 时段 pills、请求量迷你直方图、状态图标 + 时间戳 + 延迟行 |
| **`EvalTurnBuilder`** | 评估回合编排器 | Vapi Evals 角色回合块：SYSTEM/USER/ASSISTANT/TOOL 徽章、Mock 标签、Turn 序号与 + Add 回合页脚 |
| **`AgentSessionTimeline`** | 会话时间线 | Browserbase 会话：状态/时长/步骤 chips、分段活动条、Reason/Tool 步骤列表与请求面板 |
| **`EvalRunResults`** | 评估运行结果 | Adaline Evals：通过率大字 + 通过/未知/失败/总数计数、Status 过滤 chip、按 evaluator 分节的结果表（状态 pill / 原因 / 响应 / 变量 chips） |
| **`EventTagGrid`** | 事件标签网格 | Sentry Tags：scope pills、双列 key/value 网格（mono 键 + 可检索值链接样式） |
| **`PromptTunerResult`** | 提示词调优结果 | Cohere Prompt Tuner：OPTIMIZED PROMPT 暗色代码面板 + Copy、COMPLETIONS 选择器与完成文本查看器 |
| **`SessionDeviceTable`** | 登录会话/设备列表 | Airwallex Login Sessions：六列 OS/应用/位置/IP/最近活跃/状态表，Current/Logged out 徽章，分页器与每页行数选择 |
| **`TaskDetailPanel`** | 任务详情面板 | ClickUp 任务详情：类型胶囊 + AI 建议条、状态胶囊 + 双列字段网格、动作列表与 Activity 侧栏评论框 |
| **`DeliveryTrackingPanel`** | 配送追踪面板 | DoorDash 配送追踪：地图占位 + ETA + 四段 stepper、骑手卡片（📞/💬）、订单折叠与分享链接双按钮 |
| **`MapPropertyCard`** | 地图房源卡片 | Airbnb 地图房源：价格 pin + 悬浮预览卡（轮播点、收藏/关闭、标题评分、价格日期） |
| **`ApiReferenceViewer`** | API 参考文档 | GitBook API 参考：方法徽章端点头部、参数定义行、可折叠响应列表 + 右侧代码面板（语言切换/样例/JSON） |
| **`WeekCalendarGrid`** | 周视图日历网格 | Clockwise 周历：小时槽 + 日列事件块（实心/虚线）、红色当前时刻线、Day/Week 切换 + Find time + 作曲输入框 |
| **`VideoProjectSettings`** | 视频项目设置 | Vimeo 视频设置：Chapters 侧面板（空态 + 添加章节）、Title/Description 表单、缩略图选择器 + 存储徽章 |
| **`EventStreamPanel`** | 审计事件流 | WorkOS Events：过滤输入 + 双列事件列表、Metadata 面板 + View event、带行号 JSON 详情 + Previous/Next 分页 |
| **`AuditLogTable`** | 审计日志表 | Okta System Log：日期/关键词筛选 pills、迷你柱状趋势、事件计数 + 视图切换、四列事件表（SUCCESS/FAILURE/PENDING 徽章） |
| **`ChangelogTimeline`** | 产品更新日志 | Canny Changelog：大标题头部、搜索 + Filters 控件、左日期栏 + 四色分类 tag、点赞/浏览/分享 meta 行 |
| **`CampsiteHandoff`** | 设计交付面板 | Campsite 设计 handoff：完成态检查清单（负责人首字母头像 + 截止日期）、x/y done 计数与 AI 摘要块 |
| **`ZendeskFieldSuggest`** | 工单字段建议条 | Zendesk AI 字段建议：琥珀色建议条、字段 chips（标签: 值 + 置信度 %）点击即应用、Ignore 忽略按钮 |
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
│   ├── AlertBanner.tsx
│   ├── ComboBox.tsx
│   ├── Navbar.tsx
│   ├── ActivityFeed.tsx
│   ├── UsageMeter.tsx
│   ├── ToggleSwitch.tsx
│   ├── Stepper.tsx
│   ├── SearchInput.tsx
│   ├── Tag.tsx
│   ├── Modal.tsx
│   ├── ProfileHeader.tsx
│   ├── BillingPanel.tsx
│   ├── StepSlider.tsx
│   ├── InboxList.tsx
│   ├── MetricStrip.tsx
│   ├── RankList.tsx
│   ├── SideNav.tsx
│   ├── PageHeader.tsx
│   ├── TimeframePicker.tsx
│   ├── WizardSteps.tsx
│   ├── FormField.tsx
│   ├── GanttTimeline.tsx
│   ├── ApprovalCard.tsx
│   ├── ResourceList.tsx
│   ├── SegmentBreakdownBars.tsx
│   ├── TargetGauge.tsx
│   ├── HealthDonutStats.tsx
│   ├── ForecastTrendChart.tsx
│   ├── GroupedBarCompare.tsx
│   ├── QuoteMasonry.tsx
│   ├── SiteFooter.tsx
│   ├── MarqueeWall.tsx
│   ├── OnboardingStepper.tsx
│   ├── FilterToolbar.tsx
│   ├── OtpInput.tsx
│   ├── SearchTypeahead.tsx
│   ├── TourTooltip.tsx
│   ├── CookieConsent.tsx
│   ├── ClarifyQuestionCard.tsx
│   ├── AgentTaskProgress.tsx
│   ├── UsageQuotaCard.tsx
│   ├── WorkspaceSwitcherMenu.tsx
│   ├── SettingsSideDrawer.tsx
│    ├── DeploymentCard.tsx
│    ├── LiveTailLogConsole.tsx
│    ├── PipelineStageList.tsx
│    ├── ChangedFilesList.tsx
│    ├── ServiceStatusList.tsx
│    ├── FilterQueryBuilder.tsx
│    ├── ColumnVisibilityMenu.tsx
│    ├── StatusCountTabs.tsx
│    ├── EntityMultiSelectPicker.tsx
│    ├── FederatedSearchResultsPanel.tsx
│    ├── TimeSlotPicker.tsx
│    ├── OrderTracker.tsx
│    ├── OrderSummaryPanel.tsx
│    ├── PaymentMethodCard.tsx
│    ├── OrderCard.tsx
│    ├── ColorPickerPopover.tsx
│    ├── EditorToolPalette.tsx
│    ├── ShortcutCheatSheet.tsx
│    ├── ZoomControlBar.tsx
│    ├── AIInlineMenu.tsx
│    ├── EmptyStateStarter.tsx
│    ├── AuthGatePrompt.tsx
│    ├── AuthSplitPanel.tsx
│    ├── SuccessToast.tsx
│    ├── PlanComparisonTable.tsx
│    ├── UpgradeCheckoutPanel.tsx
│    ├── TrialBanner.tsx
│    ├── MembershipTierGrid.tsx
│    ├── ImageGenGallery.tsx
│    ├── SharedChatViewer.tsx
│    ├── MemoryPanel.tsx
│    ├── ConnectorGrid.tsx
│    ├── ModelComparePane.tsx
│    ├── SystemPromptEditor.tsx
│    ├── ToolSchemaEditor.tsx
│    ├── FineTuneJobList.tsx
│    ├── PersonaPresetGrid.tsx
│    └── AgentBuilderCard.tsx
│    ├── VoiceOrb.tsx
│    ├── ShareChatDialog.tsx
│    └── BrandPromptTable.tsx
│    ├── PromptSaveDialog.tsx
│    ├── AiTemplatePicker.tsx
│   ├── PromptVariantDiff.tsx
│   ├── GuardrailReviewQueue.tsx
│   ├── ContentReviewTable.tsx
│   ├── QaTestTable.tsx
│   ├── AppealRestrictionDialog.tsx
│   ├── ModelPricingCard.tsx
│   ├── AiResearchPanel.tsx
│   ├── ApiKeyTable.tsx
│   ├── VoiceSessionHistory.tsx
│   ├── AiRewriteMenu.tsx
│   ├── PromptPerformanceTable.tsx
│   ├── ShareAccessDialog.tsx
│   ├── AiNoteAnswer.tsx
│   ├── AudioNotePlayer.tsx
│   ├── ImageActionMenu.tsx
│   ├── FalRunCard.tsx
│   ├── ImageGenMetaBar.tsx
│   ├── GammaImageDetail.tsx
│   ├── WriterStyleGuide.tsx
│   ├── CampsiteHandoff.tsx
│   ├── ZendeskFieldSuggest.tsx
│   ├── AiSuggestionCard.tsx
│   ├── JumpBackIn.tsx
│   ├── HelpResourcesPanel.tsx
│   ├── VisionAnalysisCard.tsx
│   ├── PrReviewQueue.tsx
│   ├── IterationActionBar.tsx
│   ├── MonitorRunList.tsx
│   ├── EvalTurnBuilder.tsx
│   └── AgentSessionTimeline.tsx
│   ├── EvalRunResults.tsx
│   ├── EventTagGrid.tsx
│   └── PromptTunerResult.tsx
│   ├── SessionDeviceTable.tsx
│   ├── AuditLogTable.tsx
│   ├── ChangelogTimeline.tsx
│   ├── TaskDetailPanel.tsx
│   ├── DeliveryTrackingPanel.tsx
│   ├── MapPropertyCard.tsx
│   ├── ApiReferenceViewer.tsx
│   ├── WeekCalendarGrid.tsx
│   ├── VideoProjectSettings.tsx
│   └── EventStreamPanel.tsx
│    └── CreationComposer.tsx
│    ├── TraceSpanWaterfall.tsx
│    ├── EvalScoreTable.tsx
│    └── TokenCostBreakdown.tsx
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
│   ├── AlertBanner.vue
│   ├── ComboBox.vue
│   ├── Navbar.vue
│   ├── ActivityFeed.vue
│   ├── UsageMeter.vue
│   ├── ToggleSwitch.vue
│   ├── Stepper.vue
│   ├── SearchInput.vue
│   ├── Tag.vue
│   ├── Modal.vue
│   ├── ProfileHeader.vue
│   ├── BillingPanel.vue
│   ├── StepSlider.vue
│   ├── InboxList.vue
│   ├── MetricStrip.vue
│   ├── RankList.vue
│   ├── SideNav.vue
│   ├── PageHeader.vue
│   ├── TimeframePicker.vue
│   ├── WizardSteps.vue
│   ├── FormField.vue
│   ├── GanttTimeline.vue
│   ├── ApprovalCard.vue
│   ├── ResourceList.vue
│   ├── SegmentBreakdownBars.vue
│   ├── TargetGauge.vue
│   ├── HealthDonutStats.vue
│   ├── ForecastTrendChart.vue
│   ├── GroupedBarCompare.vue
│   ├── QuoteMasonry.vue
│   ├── SiteFooter.vue
│   ├── MarqueeWall.vue
│   ├── OnboardingStepper.vue
│   ├── FilterToolbar.vue
│   ├── OtpInput.vue
│   ├── SearchTypeahead.vue
│   ├── TourTooltip.vue
│   ├── CookieConsent.vue
│   ├── ClarifyQuestionCard.vue
│   ├── AgentTaskProgress.vue
│   ├── UsageQuotaCard.vue
│   ├── WorkspaceSwitcherMenu.vue
│   ├── SettingsSideDrawer.vue
│    ├── DeploymentCard.vue
│    ├── LiveTailLogConsole.vue
│    ├── PipelineStageList.vue
│    ├── ChangedFilesList.vue
│    ├── ServiceStatusList.vue
│    ├── FilterQueryBuilder.vue
│    ├── ColumnVisibilityMenu.vue
│    ├── StatusCountTabs.vue
│    ├── EntityMultiSelectPicker.vue
│    ├── FederatedSearchResultsPanel.vue
│    ├── TimeSlotPicker.vue
│    ├── OrderTracker.vue
│    ├── OrderSummaryPanel.vue
│    ├── PaymentMethodCard.vue
│    ├── OrderCard.vue
│    ├── ColorPickerPopover.vue
│    ├── EditorToolPalette.vue
│    ├── ShortcutCheatSheet.vue
│    ├── ZoomControlBar.vue
│    ├── AIInlineMenu.vue
│    ├── EmptyStateStarter.vue
│    ├── AuthGatePrompt.vue
│    ├── AuthSplitPanel.vue
│    ├── SuccessToast.vue
│    ├── PlanComparisonTable.vue
│    ├── UpgradeCheckoutPanel.vue
│    ├── TrialBanner.vue
│    ├── MembershipTierGrid.vue
│    ├── ImageGenGallery.vue
│    ├── SharedChatViewer.vue
│    ├── MemoryPanel.vue
│    ├── ConnectorGrid.vue
│    ├── ModelComparePane.vue
│    ├── SystemPromptEditor.vue
│    ├── ToolSchemaEditor.vue
│    ├── FineTuneJobList.vue
│    ├── PersonaPresetGrid.vue
│    └── AgentBuilderCard.vue
│    ├── VoiceOrb.vue
│    ├── ShareChatDialog.vue
│    └── BrandPromptTable.vue
│    ├── PromptSaveDialog.vue
│    ├── AiTemplatePicker.vue
│   ├── PromptVariantDiff.vue
│   ├── GuardrailReviewQueue.vue
│   ├── ContentReviewTable.vue
│   ├── QaTestTable.vue
│   ├── AppealRestrictionDialog.vue
│   ├── ModelPricingCard.vue
│   ├── AiResearchPanel.vue
│   ├── ApiKeyTable.vue
│   ├── VoiceSessionHistory.vue
│   ├── AiRewriteMenu.vue
│   ├── PromptPerformanceTable.vue
│   ├── ShareAccessDialog.vue
│   ├── AiNoteAnswer.vue
│   ├── AudioNotePlayer.vue
│   ├── ImageActionMenu.vue
│   ├── FalRunCard.vue
│   ├── ImageGenMetaBar.vue
│   ├── GammaImageDetail.vue
│   ├── WriterStyleGuide.vue
│   ├── CampsiteHandoff.vue
│   ├── ZendeskFieldSuggest.vue
│   ├── AiSuggestionCard.vue
│   ├── JumpBackIn.vue
│   ├── HelpResourcesPanel.vue
│   ├── VisionAnalysisCard.vue
│   ├── PrReviewQueue.vue
│   ├── IterationActionBar.vue
│   ├── MonitorRunList.vue
│   ├── EvalTurnBuilder.vue
│   └── AgentSessionTimeline.vue
│   ├── EvalRunResults.vue
│   ├── EventTagGrid.vue
│   └── PromptTunerResult.vue
│   ├── SessionDeviceTable.vue
│   ├── AuditLogTable.vue
│   ├── ChangelogTimeline.vue
│   ├── TaskDetailPanel.vue
│   ├── DeliveryTrackingPanel.vue
│   ├── MapPropertyCard.vue
│   ├── ApiReferenceViewer.vue
│   ├── WeekCalendarGrid.vue
│   ├── VideoProjectSettings.vue
│   └── EventStreamPanel.vue
│    └── CreationComposer.vue
│    ├── TraceSpanWaterfall.vue
│    ├── EvalScoreTable.vue
│    └── TokenCostBreakdown.vue
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
    ├── AlertBanner.js
    ├── ComboBox.js
    ├── Navbar.js
    ├── ActivityFeed.js
    ├── UsageMeter.js
    ├── ToggleSwitch.js
    ├── Stepper.js
    ├── SearchInput.js
    ├── Tag.js
    ├── Modal.js
    ├── ProfileHeader.js
    ├── BillingPanel.js
    ├── StepSlider.js
    ├── InboxList.js
    ├── MetricStrip.js
    ├── RankList.js
    ├── SideNav.js
    ├── PageHeader.js
    ├── TimeframePicker.js
    ├── WizardSteps.js
    ├── FormField.js
    ├── GanttTimeline.js
    ├── ApprovalCard.js
    ├── ResourceList.js
    ├── SegmentBreakdownBars.js
    ├── TargetGauge.js
    ├── HealthDonutStats.js
    ├── ForecastTrendChart.js
    ├── GroupedBarCompare.js
    ├── QuoteMasonry.js
    ├── SiteFooter.js
    ├── MarqueeWall.js
    ├── OnboardingStepper.js
    ├── FilterToolbar.js
    ├── OtpInput.js
    ├── SearchTypeahead.js
    ├── TourTooltip.js
    ├── CookieConsent.js
    ├── ClarifyQuestionCard.js
    ├── AgentTaskProgress.js
    ├── UsageQuotaCard.js
    ├── WorkspaceSwitcherMenu.js
    ├── SettingsSideDrawer.js
     ├── DeploymentCard.js
     ├── LiveTailLogConsole.js
     ├── PipelineStageList.js
     ├── ChangedFilesList.js
     ├── ServiceStatusList.js
     ├── FilterQueryBuilder.js
     ├── ColumnVisibilityMenu.js
     ├── StatusCountTabs.js
     ├── EntityMultiSelectPicker.js
     ├── FederatedSearchResultsPanel.js
     ├── TimeSlotPicker.js
     ├── OrderTracker.js
     ├── OrderSummaryPanel.js
     ├── PaymentMethodCard.js
     ├── OrderCard.js
     ├── ColorPickerPopover.js
     ├── EditorToolPalette.js
     ├── ShortcutCheatSheet.js
     ├── ZoomControlBar.js
     ├── AIInlineMenu.js
     ├── EmptyStateStarter.js
     ├── AuthGatePrompt.js
     ├── AuthSplitPanel.js
     ├── SuccessToast.js
     ├── PlanComparisonTable.js
     ├── UpgradeCheckoutPanel.js
     ├── TrialBanner.js
     ├── MembershipTierGrid.js
     ├── ImageGenGallery.js
     ├── SharedChatViewer.js
     ├── MemoryPanel.js
     ├── ConnectorGrid.js
     ├── ModelComparePane.js
     ├── SystemPromptEditor.js
     ├── ToolSchemaEditor.js
     ├── FineTuneJobList.js
     ├── PersonaPresetGrid.js
     └── AgentBuilderCard.js
     ├── VoiceOrb.js
     ├── ShareChatDialog.js
     └── BrandPromptTable.js
     ├── PromptSaveDialog.js
     ├── AiTemplatePicker.js
│   ├── PromptVariantDiff.js
│   ├── GuardrailReviewQueue.js
│   ├── ContentReviewTable.js
│   ├── QaTestTable.js
│   ├── AppealRestrictionDialog.js
│   ├── ModelPricingCard.js
│   ├── AiResearchPanel.js
│   ├── ApiKeyTable.js
│   └── VoiceSessionHistory.js
│   ├── AiRewriteMenu.js
│   ├── PromptPerformanceTable.js
│   └── ShareAccessDialog.js
│   ├── AiNoteAnswer.js
│   ├── AudioNotePlayer.js
│   └── ImageActionMenu.js
│   ├── FalRunCard.js
│   ├── ImageGenMetaBar.js
│   └── GammaImageDetail.js
│   ├── WriterStyleGuide.js
│   ├── CampsiteHandoff.js
│   └── ZendeskFieldSuggest.js
│   ├── AiSuggestionCard.js
│   ├── JumpBackIn.js
│   └── HelpResourcesPanel.js
│   ├── VisionAnalysisCard.js
│   ├── PrReviewQueue.js
│   └── IterationActionBar.js
│   ├── MonitorRunList.js
│   ├── EvalTurnBuilder.js
│   └── AgentSessionTimeline.js
│   ├── EvalRunResults.js
│   ├── EventTagGrid.js
│   └── PromptTunerResult.js
│   ├── SessionDeviceTable.js
│   ├── AuditLogTable.js
│   ├── ChangelogTimeline.js
│   ├── TaskDetailPanel.js
│   ├── DeliveryTrackingPanel.js
│   ├── MapPropertyCard.js
│   ├── ApiReferenceViewer.js
│   ├── WeekCalendarGrid.js
│   ├── VideoProjectSettings.js
│   └── EventStreamPanel.js
     └── CreationComposer.js
     ├── TraceSpanWaterfall.js
     ├── EvalScoreTable.js
     └── TokenCostBreakdown.js
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
