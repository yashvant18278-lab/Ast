// A simple normalizer for math expressions
export function normalizeExpression(input: string): string {
  let normalized = input;
  // Replace user-friendly symbols with parser-friendly equivalents
  normalized = normalized.replace(/×/g, '*');
  normalized = normalized.replace(/÷/g, '/');
  normalized = normalized.replace(/−/g, '-');
  normalized = normalized.replace(/π/g, 'pi');
  normalized = normalized.replace(/√/g, 'sqrt');
  normalized = normalized.replace(/∞/g, 'Infinity');
  normalized = normalized.replace(/θ/g, 'theta');
  normalized = normalized.replace(/²/g, '^2');
  normalized = normalized.replace(/³/g, '^3');

  return normalized;
}
