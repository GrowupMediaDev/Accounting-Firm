// Musterformen als SVG-Kacheln. Ohne Abhaengigkeiten, damit auch der Konfigurator
// (integrations/configurator) sie fuer die Vorschau-Kacheln laden kann.
// Masse wie im Shader (scripts/chevron-shader.ts, gleiche Reihenfolge = Index).

export const PATTERNS = ['zigzag', 'diagonal', 'dots', 'grid', 'waves', 'none'] as const;
export type PatternType = (typeof PATTERNS)[number];

// Statische Kacheln (gleiche Masse wie im Shader).
export const tiles: Record<Exclude<PatternType, 'none'>, (c: string) => string> = {
  zigzag: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='10'><path d='M0 9 7 2l7 7' fill='none' stroke='${c}' stroke-opacity='.32' stroke-width='1.2'/></svg>`,
  diagonal: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M-3 3 3-3M0 12 12 0M9 15l6-6' stroke='${c}' stroke-opacity='.32' stroke-width='1.2'/></svg>`,
  dots: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='1.3' fill='${c}' fill-opacity='.4'/></svg>`,
  grid: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M0 .5h16M.5 0v16' stroke='${c}' stroke-opacity='.32'/></svg>`,
  waves: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='10'><path d='M0 5c5-3 5-3 10 0s5 3 10 0 5-3 10 0 5 3 10 0' fill='none' stroke='${c}' stroke-opacity='.32' stroke-width='1.2'/></svg>`,
};

