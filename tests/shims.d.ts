/**
 * Ambient declarations for dependencies the components expect from the host app
 * (or a CDN in the gallery). They are intentionally not installed here: the
 * components stay copy-paste single files, and this file only keeps `tsc` honest.
 */
declare module 'marked' {
  export const marked: {
    parse(input: string, options?: Record<string, unknown>): string | Promise<string>;
    setOptions(options: Record<string, unknown>): void;
    /** Renderer class is subclassed by StreamMarkdown to override `code`. */
    Renderer: new () => { code?: (token: { text: string; lang?: string }) => string };
  };
}

declare module 'prismjs' {
  const Prism: {
    highlight(code: string, grammar: unknown, language: string): string;
    languages: Record<string, unknown>;
  };
  export default Prism;
}

declare module '*.css';
