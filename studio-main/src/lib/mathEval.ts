'use client';

import * as math from "mathjs";
import { normalizeExpression } from "./math-utils";

/** Strips leading 'y=' or 'y ==' etc and trims */
export function normalizeToExpr(input: string): string {
  if (!input) return "";
  const normalized = normalizeExpression(input);
  return normalized.replace(/^\s*y\s*=\s*/i, "").trim();
}

export function tryCompile(input: string) {
  const exprText = normalizeToExpr(input);
  const node = math.parse(exprText || "x");
  const compiled = node.compile();
  return { node, compiled, exprText };
}

/** Sample f(x) on [xmin,xmax] with step h. Returns finite points only, includes NaN gaps. */
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

export function isImplicit(input: string): boolean {
    const expr = normalizeToExpr(input).toLowerCase();
    // A simple heuristic: if 'y' appears after the initial 'y=' has been stripped,
    // it's likely an implicit equation, e.g., x^2 + y^2 = 9
    return expr.includes('y');
}
