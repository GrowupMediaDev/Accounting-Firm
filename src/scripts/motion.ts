// Globale Motion-Primitive. Einmal im Layout geladen, steuert alles ueber
// data-Attribute, damit Sektionen kein eigenes JS fuer Standard-Effekte brauchen.
//
//   data-split[="load"]       Headline zeilenweise aus einer Maske schieben
//   data-reveal="up|fade"     Einblenden + leicht hochfahren (Geschwister staffeln sich)
//   data-reveal="image"       Bild per clip-path aufdecken, Inhalt skaliert zurueck
//   data-radius="10px"        Eckenradius fuer die image-Maske (Default 16px)
//   data-reveal-delay="0.2"   Zusatzverzoegerung in Sekunden
//   data-parallax="0.12"      Vertikale Parallaxe (Anteil der eigenen Hoehe)
//   data-counter              Zahl im Text hochzaehlen ("180+", "24 Std.")
//   data-magnetic             Element folgt dem Cursor leicht (nur Maus)
//
// Ohne JS oder mit prefers-reduced-motion bleibt alles sofort sichtbar
// (Startzustaende in global.css haengen an html.js + no-preference).

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EXPO = 'expo.out';
const START = 'top 88%';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function delayOf(el: Element): number {
  return parseFloat((el as HTMLElement).dataset.revealDelay ?? '0') || 0;
}

// ---------- Lenis ----------
function initLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as unknown as { lenis: Lenis }).lenis = lenis;

  // Anker-Links gleiten statt springen.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = a?.getAttribute('href');
    if (!a || !hash || hash === '#') return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    history.replaceState(null, '', hash);
    lenis.scrollTo(target, { offset: hash === '#start' ? 0 : -24, duration: 1.4 });
  });
}

// ---------- Headlines ----------
function initSplits() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const onLoad = el.dataset.split === 'load';
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.3,
          ease: EXPO,
          stagger: 0.09,
          delay: delayOf(el) + (onLoad ? 0.15 : 0),
          scrollTrigger: onLoad ? undefined : { trigger: el, start: START, once: true },
        });
      },
    });
  });
}

// ---------- Einblenden ----------
function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal="up"], [data-reveal="fade"]');
  // Geschwister, die gemeinsam ins Bild kommen, staffeln sich automatisch.
  ScrollTrigger.batch(items, {
    start: START,
    once: true,
    onEnter: (batch) => {
      // Staffel gedeckelt: bei Spruengen (Anker, Reload) feuern viele Elemente gleichzeitig.
      batch.forEach((el, i) => {
        const up = (el as HTMLElement).dataset.reveal === 'up';
        gsap.fromTo(
          el,
          { opacity: 0, y: up ? 36 : 0 },
          { opacity: 1, y: 0, duration: 1.1, ease: EXPO, delay: delayOf(el) + Math.min(i, 5) * 0.08, clearProps: 'transform' },
        );
      });
    },
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="image"]').forEach((el) => {
    const inner = el.querySelector('img, picture, video');
    const radius = el.dataset.radius ?? '16px';
    const tl = gsap.timeline({
      delay: delayOf(el),
      scrollTrigger: { trigger: el, start: START, once: true },
    });
    tl.fromTo(
      el,
      { clipPath: `inset(100% 0% 0% 0% round ${radius})` },
      { clipPath: `inset(0% 0% 0% 0% round ${radius})`, duration: 1.4, ease: 'expo.inOut' },
    );
    if (inner) tl.from(inner, { scale: 1.25, duration: 1.8, ease: EXPO }, 0);
  });
}

// ---------- Parallaxe ----------
function initParallax() {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '0.1');
    gsap.fromTo(
      el,
      { yPercent: -amount * 100 },
      {
        yPercent: amount * 100,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

// ---------- Zaehler ----------
function initCounters() {
  gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
    const match = el.textContent?.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/s);
    if (!match) return;
    const [, prefix, num, suffix] = match;
    const decimals = num.includes(',') || num.includes('.') ? num.split(/[.,]/)[1].length : 0;
    const target = parseFloat(num.replace(',', '.'));
    const sep = num.includes(',') ? ',' : '.';
    const state = { v: 0 };
    el.setAttribute('aria-label', el.textContent ?? '');
    gsap.to(state, {
      v: target,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: START, once: true },
      onUpdate: () => {
        el.textContent = prefix + state.v.toFixed(decimals).replace('.', sep) + suffix;
      },
    });
  });
}

// ---------- Magnetisch ----------
function initMagnetic() {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

async function init() {
  (window as unknown as { __motion: boolean }).__motion = true;
  if (reduceMotion) return;
  initLenis();
  // Zeilenumbrueche erst mit geladenen Fonts messen.
  await document.fonts.ready;
  initSplits();
  initReveals();
  initParallax();
  initCounters();
  initMagnetic();
  ScrollTrigger.refresh();
}

init();
