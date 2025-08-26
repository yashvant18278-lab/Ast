
'use client';

import * as math from "mathjs";
import { normalizeToExpr } from "./mathEval";

export function tryCompile(input: string) {
  const exprText = normalizeToExpr(input);
  const node = math.parse(exprText || "x");
  const compiled = node.compile();
  return { node, compiled, exprText };
}

/** Sample f(x) on [xmin,xmax] with step h. Returns finite points only. */
export function sampleExplicit(
  compiled: math.EvalFunction,
  xmin = -10,
  xmax = 10,
  h = 0.05
) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let x = xmin; x <= xmax + 1e-12; x = +(x + h).toFixed(12)) {
    let y: number;
    try {
      const v = compiled.evaluate({ x });
      y = typeof v === "number" && isFinite(v) ? v : NaN;
    } catch {
      y = NaN;
    }
    xs.push(x);
    ys.push(y);
  }
  return { xs, ys };
}

export function calculateDomainAndRange(xs: number[], ys: number[]): {
  domain: { min: number; max: number };
  range: { min: number; max: number };
} {
  const finiteYs = ys.filter(y => isFinite(y));

  return {
    domain: {
      min: Math.min(...xs),
      max: Math.max(...xs),
    },
    range: {
      min: finiteYs.length > 0 ? Math.min(...finiteYs) : -Infinity,
      max: finiteYs.length > 0 ? Math.max(...finiteYs) : Infinity,
    },
  };
}
