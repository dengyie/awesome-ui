# awesome-ui 设计规范 (Design Guidelines)

> 所有组件（React/Vue/Vanilla 三端）必须遵守的视觉、交互、无障碍规范。
> Pattern 来源：Mobbin 2026-11 研究报告（见 `docs/mobbin-patterns-2026-11.md`）。

## 1. 视觉基调

### 1.1 色彩
- 使用 Tailwind 原生色阶，不引入自定义 CSS 变量黑盒
- 主操作色：`indigo-600`（light）/ `indigo-500`（dark）；成功 `emerald-500`、警告 `amber-500`、危险 `red-500`
- 中性面：页面底 `white / zinc-950`，卡片 `white / zinc-900`，边框 `zinc-200 / zinc-800`
- 文字层级：主文 `zinc-900 / zinc-100`，次文 `zinc-500 / zinc-400`，禁用 `zinc-400 / zinc-500`
- 终端/代码面：`zinc-950` 底 + `zinc-300` 字（见 AgentRunLog、CodeBlock）
- 状态色必须同时有文字/图标辅助，不能只靠颜色区分

### 1.2 圆角与阴影
- 输入框/按钮：`rounded-lg`；卡片：`rounded-xl`；胶囊 chips：`rounded-full`
- 阴影克制：浮层用 `shadow-lg`，卡片默认无边框阴影（用边框 `border`），hover 才 `shadow-sm`

### 1.3 间距与密度
- 组件内间距遵循 4 的倍数（`p-2/3/4/6`）
- 信息密集组件（DataTable、AgentRunLog）可用 `text-sm` + `py-1.5` 紧凑密度
- 对话类组件（ChatMessageRow）用 `text-[15px]` 保证可读性

### 1.4 字体
- 代码块 / diff / 终端日志：`font-mono text-xs` 或 `text-sm`
- 数字大字（StatCard 价格）：`text-3xl font-semibold tracking-tight`

## 2. 交互模式（源自 Mobbin 顶级产品截图分析）

### 2.1 浮现式操作（ChatGPT/Claude 模式）
消息 hover 才显示操作条，非 hover 时 `opacity-0 group-hover:opacity-100 transition-opacity`，保留占位高度避免布局跳动。

### 2.2 渐进披露（Devin/Linear 模式）
- 步骤列表默认收起，仅显示状态图标 + 一行摘要 + 耗时
- 点击展开完整日志；展开区左侧画竖向连接线（`border-l` + 负 margin）
- 状态图标：Pending 空心圆 → Running 旋转 spinner → Done 实心勾 → Error 实心叉

### 2.3 命令面板（v0/Linear 模式）
- 顶部固定搜索框（自动聚焦），中部分组结果，底部快捷键提示条（`↑↓ 导航 · ↵ 选中 · esc 关闭`）
- 选中项与 hover 同样式；右列快捷键 `text-xs text-zinc-400` 右对齐

### 2.4 定价卡（Vercel/Whop 模式）
- 三列卡，推荐列 `ring-2 ring-indigo-600` + 顶部徽章 "Most popular"（`absolute -top-3` 居中胶囊）
- 价格大字 + `/mo` 小字；功能清单 ✓ 用 `text-emerald-500`，分 X 组带组标题
- 底部主按钮：推荐列实心，其余 `variant="outline"`

### 2.5 Toast（Vercel/Supabase 模式）
- 右下堆叠，新在上；类型色条在左侧 4px（`border-l-4`）
- 可加自动消失倒计时进度条（底部 `h-0.5`，宽度动画）
- `role="status"` / `aria-live="polite"`

### 2.6 空态（Typeform/Tally 模式）
- 大插图（可用简单 SVG 几何图形）+ 一句标题 + 一句描述 + 1 主 CTA（实心）+ 1 次级 ghost 链接
- 禁止在空态堆砌超过 2 个按钮

### 2.7 表格（Supabase/Xero 模式）
- 列头右侧筛选 icon（hover 显现）；行 hover 显示行内工具条
- 批量选中时底部浮现浮动条（`fixed bottom-6` 胶囊，含 "N selected" + 批量操作按钮）
- 斑马纹可选；数字列右对齐

### 2.8 侧边栏（Fibery/Plane 模式）
- 分组标题可折叠（chevron 旋转）；分组项 hover 显现操作 icon
- 底部固定用户卡（头像 + 名字 + 邮箱省略 + 设置齿轮）
- 当前项高亮：`bg-zinc-100 dark:bg-zinc-800`，左侧不加竖条（保持干净）

## 3. 动效规范

- 所有过渡 `transition` 默认 150ms，浮层出现 200ms
- 流式输出光标：`animate-pulse` 竖条
- 思考块流光：`background: linear-gradient(...)` + `animate-shimmer`（自定义 keyframes）
- 严禁超过 300ms 的装饰动效；`prefers-reduced-motion` 下全部禁用

## 4. 无障碍（硬性要求）

- 所有可交互元素必须是 `<button>` / `<a>` 或带 `role` + `tabindex`
- 图标按钮必须 `aria-label`
- 开关/手风琴用 `aria-expanded`；选中态用 `aria-selected` / `aria-current`
- Toast/dialog 用 `aria-live` / `role="dialog"` + Esc 关闭
- 焦点环统一 `focus-visible:ring-2 focus-visible:ring-indigo-500`

## 5. 工程约束

- 单文件、零运行时依赖；仅允许 React/Vue 官方 API
- Props 扁平：只收 `string | number | boolean | string[] | 平面对象数组`
- 事件命名对齐三端：`onClick/onSelect` (React) ↔ `@click/@select` (Vue) ↔ `options.onSelect` (Vanilla)
- 所有文案经由 props 传入（`title`、`description` 等），组件内置文案仅限无障碍标签
- Dark mode 用 `dark:` 前缀双写，不做 JS 检测

## 6. 图标

一律使用 `UiIcon`（三端同名组件）。新增组件需要的图标先检查 UiIcon 是否已有，没有则在 UiIcon 中补齐后再引用。禁止 emoji / Unicode 符号 / 组件内手写独立 SVG。

## 7. 组件验收清单（实现完成后逐项自查）

- [ ] 三端 API 一致（props 名、事件名、视觉一致）
- [ ] Light / Dark 双模式无对比度问题
- [ ] 键盘可达：Tab 顺序、Enter/Space 激活、Esc 关闭（浮层类）
- [ ] `aria-*` 齐全，图标按钮有 label
- [ ] 空态 / 加载态 / 错误态有处理（若适用）
- [ ] 传入超长文本不破版（`truncate` / `line-clamp`）
- [ ] 已加入 `index.html` Gallery 与 `llms.txt` 索引
- [ ] vanilla 冒烟测试通过（`tests/`）
