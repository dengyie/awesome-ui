/**
 * Paper Atelier & Trail Theme System (aitubook.cn 风格设计资产规范与预设)
 * 纯 CSS 注入 / Tailwind 拓展方案
 */

export const PaperTrailThemeCSS = `
/* -------------------------------------------------------------
 * 1. 核心变量系统 (Paper, Ink & 8-Stage Colors)
 * ------------------------------------------------------------- */
:root {
  --font-serif: "Songti SC", "Noto Serif SC", "STSong", "SimSun", Georgia, serif;
  --font-sans: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  --font-mono: "SF Mono", ui-monospace, "Cascadia Code", Menlo, monospace;

  /* 基础纸墨调色盘 (Light Mode) */
  --paper: #f1efe7;
  --paper-raised: #faf8f1;
  --paper-sunken: #e7e4d7;
  --ink: #22262d;
  --ink-soft: #545b64;
  --ink-faint: #8d9298;
  --line: #d6d2c2;
  --line-strong: #b3ac97;
  --accent: #c2410c;
  --accent-ink: #1d4ed8;
  --danger: #b91c1c;

  /* 8 阶段里程碑色阶 */
  --stage-1: #1d4ed8;
  --stage-2: #0f766e;
  --stage-3: #4d7c0f;
  --stage-4: #a16207;
  --stage-5: #c2410c;
  --stage-6: #0e7490;
  --stage-7: #be185d;
  --stage-8: #b91c1c;

  /* 材质微纹理 */
  --contour: rgba(34, 38, 45, 0.055);
  --graticule: rgba(29, 78, 216, 0.05);

  /* 投影与动效 */
  --shadow-card: 0 1px 0 rgba(34, 38, 45, .07), 0 5px 16px rgba(34, 38, 45, .07);
  --shadow-lift: 0 2px 0 rgba(34, 38, 45, .08), 0 12px 28px rgba(34, 38, 45, .12);
  --ease-survey: cubic-bezier(.16, 1, .3, 1);
  --ease-stake: cubic-bezier(.34, 1.4, .64, 1);
}

:root[data-theme="dark"], .dark {
  --paper: #14171c;
  --paper-raised: #1b1f26;
  --paper-sunken: #0f1216;
  --ink: #e9e6db;
  --ink-soft: #a9a89c;
  --ink-faint: #6f7268;
  --line: #2b3038;
  --line-strong: #3e444e;
  --accent: #f0692e;
  --accent-ink: #6ea8fe;
  --danger: #f87171;

  --stage-1: #6ea8fe;
  --stage-2: #2dd4bf;
  --stage-3: #84cc16;
  --stage-4: #eab308;
  --stage-5: #f0692e;
  --stage-6: #22d3ee;
  --stage-7: #f472b6;
  --stage-8: #f87171;

  --contour: rgba(233, 230, 219, 0.06);
  --graticule: rgba(110, 168, 254, 0.06);
  --shadow-card: 0 1px 0 rgba(0, 0, 0, .4), 0 8px 22px rgba(0, 0, 0, .42);
  --shadow-lift: 0 2px 0 rgba(0, 0, 0, .4), 0 14px 32px rgba(0, 0, 0, .52);
}

/* -------------------------------------------------------------
 * 2. 大地等高线与坐标网格背景 (Topography Texture)
 * ------------------------------------------------------------- */
.bg-paper-topography {
  background-color: var(--paper);
  background-image:
    repeating-radial-gradient(circle at 18% 12%, transparent 0 46px, var(--contour) 46px 47px),
    repeating-radial-gradient(circle at 86% 88%, transparent 0 64px, var(--contour) 64px 65px),
    linear-gradient(90deg, var(--graticule) 1px, transparent 1px),
    linear-gradient(180deg, var(--graticule) 1px, transparent 1px);
  background-size: auto, auto, 120px 120px, 120px 120px;
}
`;
