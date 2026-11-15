# awesome-ui v1.16.0 — 全量 UI 备份

> 备份时间：2026-11-14
> 源版本：v1.16.0（P3 基础原语第二批：Tooltip / Breadcrumb / Pagination / AlertBanner）
> 源仓库快照：`main` @ `e0f6d50` + 未提交工作区（149 项改动）
> 测试状态：`npm test` 258 项全通过 · `typecheck` 干净 · Vue SFC 全量编译通过

## 内容清单

| 目录 / 文件 | 文件数 | 说明 |
|---|---|---|
| `index.html` | 1 | 交互式 Gallery，含 53 个演示区块 |
| `react/` | 65 | 64 个组件 + `paper-theme.ts` |
| `vue/` | 64 | 与 React 一一对应的 SFC |
| `vanilla/` | 64 | 同名 Web Components |
| `docs/` | 3 | 设计规范、组件路线图、Mobbin pattern 研究 |
| `tests/` | 32 | `*.test.mjs` + `package.json` / `tsconfig.json` / `shims.d.ts` |
| `README.md` / `SKILL.md` / `llms.txt` / `llms-full.txt` | 4 | 索引文档（llms-full 为 192 文件全源码打包） |

合计 233 个文件，约 2.7 MB。

**未包含**（体积大且非 UI 产物，仍在项目根目录）：`references/`（14 类共 24 MB Mobbin 设计素材）、`tests/node_modules/`、`tools/`。

## 预览

在项目根目录启动任意静态服务器后打开：

```text
http://127.0.0.1:8123/backup/v1.16.0/index.html
```

备份内 `index.html` 使用 `./vanilla/*.js` 相对路径与 Tailwind CDN，因此该目录可独立运行完整 Gallery。

## 恢复

将需要回滚的文件覆盖回项目根目录即可，例如：

```bash
cp -r backup/v1.16.0/react backup/v1.16.0/vue backup/v1.16.0/vanilla .
cp backup/v1.16.0/index.html .
```

覆盖前建议先确认工作区无未保存改动；`backup/` 目录本身不会被组件代码引用。
