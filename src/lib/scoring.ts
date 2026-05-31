import type { PredictionResult } from '@/types';

export const POINTS = {
  EXACT_SCORE: 3,
  CORRECT_RESULT: 1,
  WRONG: 0,
} as const;

export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): PredictionResult {
  if (predHome === realHome && predAway === realAway) {
    return { type: 'exact', points: POINTS.EXACT_SCORE };
  }

  const predResult = Math.sign(predHome - predAway);
  const realResult = Math.sign(realHome - realAway);

  if (predResult === realResult) {
    return { type: 'result', points: POINTS.CORRECT_RESULT };
  }

  return { type: 'miss', points: POINTS.WRONG };
}

export function getResultLabel(type: PredictionResult['type']): string {
  return {
    exact: '🎯 Score exact',
    result: '✓ Bon résultat',
    miss: '✗ Raté',
  }[type];
}

export function getResultColor(type: PredictionResult['type']): string {
  return {
    exact: 'text-green-600 dark:text-green-400',
    result: 'text-amber-600 dark:text-amber-400',
    miss: 'text-slate-400',
  }[type];
}
