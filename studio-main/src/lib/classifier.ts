
import * as math from 'mathjs';
import { normalizeToExpr } from './mathEval';

export function classifyEquation(input: string): string {
    const expr = normalizeToExpr(input).toLowerCase();

    if (!expr) return 'Unclassified';

    try {
        const node: any = math.parse(expr);
        
        // Very basic checks first
        if (expr.includes('x^2') && expr.includes('y^2')) return 'Circle / Ellipse';
        if (expr.includes('sin(') || expr.includes('cos(') || expr.includes('tan(')) return 'Trigonometric';
        if (expr.includes('log(') || expr.includes('ln(')) return 'Logarithmic';
        if (expr.includes('exp(')) return 'Exponential';
        if (node.type === 'OperatorNode' && node.op === '/') return 'Rational';

        let degree = 0;
        let hasX = false;
        node.traverse(function (n: any) {
            if (n.isSymbolNode && n.name === 'x') {
                hasX = true;
            }
            if (n.isOperatorNode && n.op === '^') {
                if (n.args[0]?.isSymbolNode && n.args[0]?.name === 'x' && n.args[1]?.isConstantNode) {
                    degree = Math.max(degree, n.args[1].value);
                }
            }
        });

        if (!hasX) return 'Constant';

        // Check for simple polynomial degrees if no higher degree was found
        if (degree === 0 && hasX) {
             const isLinear = node.isOperatorNode || (node.isFunctionNode && node.name === 'multiply') || node.isSymbolNode;
             if (isLinear && expr.includes('x') && !expr.includes('x^')) {
                degree = 1;
             }
        }
        
        if (node.isOperatorNode && node.op === 'pow' && node.args[0]?.name === 'x') {
            degree = Math.max(degree, node.args[1]?.value)
        }

        if (expr.match(/x\^2/)) degree = Math.max(degree, 2);
        if (expr.match(/x\^3/)) degree = Math.max(degree, 3);


        switch (degree) {
            case 1:
                return 'Linear';
            case 2:
                return 'Quadratic';
            case 3:
                return 'Cubic';
            default:
                return degree > 3 ? `Polynomial (degree ${degree})` : 'Unclassified';
        }

    } catch (e) {
        return 'Invalid Equation';
    }
}
