import type { Unit } from '../types';

const LB_PER_KG = 2.20462262;

export function toDisplay(kg: number, unit: Unit): number {
  const v = unit === 'kg' ? kg : kg * LB_PER_KG;
  return Math.round(v * 10) / 10;
}

export function fromDisplay(value: number, unit: Unit): number {
  const kg = unit === 'kg' ? value : value / LB_PER_KG;
  return Math.round(kg * 100) / 100;
}

export function formatWeight(kg: number, unit: Unit): string {
  return `${toDisplay(kg, unit)} ${unit}`;
}

export function parseNumber(text: string): number {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
