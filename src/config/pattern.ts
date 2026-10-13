// Hintergrundmuster der Kontakt-Sektion aus dem Kanzlei-Profil. Dieselben
// Formen gibt es zweimal: animiert im Shader (chevron-shader.ts, per Index) und
// als statische SVG-Kachel fuer Geraete ohne WebGL.

import { firm } from './firm';
import { hexToRgb, themeColors } from './theme';
import { PATTERNS, tiles, type PatternType } from './pattern-tiles';

export { PATTERNS };

const p = firm.theme.pattern;
const type: PatternType = (PATTERNS as readonly string[]).includes(p.type) ? (p.type as PatternType) : 'zigzag';
const svg = type === 'none' ? '' : tiles[type](themeColors.pattern);

export const pattern = {
  type,
  index: PATTERNS.indexOf(type),
  // Staerke 0 bis 1.5 (1 = Original).
  intensity: Math.max(0, Math.min(1.5, Number(p.intensity) || 1)),
  // Farbe fuer den Shader als "r,g,b" in 0..1.
  rgb: hexToRgb(themeColors.pattern).map((v) => (v / 255).toFixed(3)).join(','),
  // Grundfarbe des Canvas = dunkle Flaeche, damit der Uebergang nahtlos ist.
  bg: hexToRgb(themeColors.ink).map((v) => (v / 255).toFixed(3)).join(','),
  svg: svg ? `url("data:image/svg+xml,${encodeURIComponent(svg)}")` : 'none',
};
