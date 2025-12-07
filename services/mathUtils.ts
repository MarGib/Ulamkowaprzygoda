import { FractionType, Operation, Problem } from '../types';

// Helper: Greatest Common Divisor
export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

// Helper: Least Common Multiple
export const lcm = (a: number, b: number): number => {
  return (a * b) / gcd(a, b);
};

// Helper: Convert mixed to improper fraction {n, d}
export const toImproper = (f: FractionType): { n: number; d: number } => {
  return { n: f.whole * f.d + f.n, d: f.d };
};

// Helper: Simplify a fraction
export const simplify = (n: number, d: number): FractionType => {
  const common = gcd(Math.abs(n), Math.abs(d));
  let simpleN = n / common;
  let simpleD = d / common;
  
  const whole = Math.floor(simpleN / simpleD);
  simpleN = simpleN % simpleD;

  return {
    whole: whole,
    n: simpleN,
    d: simpleD
  };
};

// Generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random fraction
const generateFraction = (maxWhole: number, maxDenom: number, forceImproper: boolean = false): FractionType => {
  const d = randomInt(2, maxDenom);
  let n: number;
  let whole: number;

  if (forceImproper) {
    whole = 0;
    n = randomInt(d + 1, d * (maxWhole || 3) + d - 1);
  } else {
    n = randomInt(1, d - 1);
    whole = randomInt(0, maxWhole);
  }
  
  return { whole, n, d };
};

export const generateProblem = (operation: Operation, difficulty: number): Problem => {
  let left: FractionType;
  let right: FractionType | null = null;
  let expected: FractionType | string;

  // Difficulty scaling
  const maxWhole = difficulty === 1 ? 1 : difficulty === 2 ? 3 : 5;
  const maxDenom = difficulty === 1 ? 6 : difficulty === 2 ? 12 : 25;

  if (operation === Operation.CONVERT_TO_MIXED) {
    // Generate improper fraction (e.g., 15/4)
    // Diff 1: Small numbers. Diff 3: Big numbers like in PDF (59/7, 119/26)
    const factor = difficulty === 3 ? 10 : difficulty === 2 ? 5 : 3;
    left = generateFraction(factor, maxDenom, true);
    // Ensure it's improper
    if (left.whole > 0) { // Should not happen with forceImproper but safety check
        left = { whole: 0, n: left.whole * left.d + left.n, d: left.d };
    }
    right = null;
    expected = simplify(left.n, left.d);
  } 
  else if (operation === Operation.CONVERT_TO_IMPROPER) {
    // Generate mixed number (e.g., 2 1/7)
    left = generateFraction(maxWhole || 1, maxDenom);
    if (left.whole === 0) left.whole = randomInt(1, 4); // Ensure we have a whole part
    right = null;
    const imp = toImproper(left);
    expected = { whole: 0, n: imp.n, d: imp.d };
  }
  else if (operation === Operation.COMPARE) {
    left = generateFraction(maxWhole, maxDenom);
    right = generateFraction(maxWhole, maxDenom);
    
    // PDF scenarios: Same denominator or Same numerator
    const scenario = Math.random();
    if (scenario < 0.3) {
      // Same denominator
      right.d = left.d;
      right.n = randomInt(1, right.d * 2); 
    } else if (scenario < 0.6) {
      // Same numerator
      if (left.n === 0 && left.whole === 0) left.n = 1;
      right.n = left.n;
      right.whole = left.whole;
      right.d = randomInt(2, maxDenom);
      while (right.d === left.d) right.d = randomInt(2, maxDenom);
    }

    const lVal = left.whole + left.n / left.d;
    const rVal = right.whole + right.n / right.d;
    
    // Avoid exact equality to make it more fun, unless intended
    if (Math.abs(lVal - rVal) < 0.0001) expected = '=';
    else expected = lVal > rVal ? '>' : '<';
  }
  else {
    // Standard Operations
    left = generateFraction(maxWhole, maxDenom);
    right = generateFraction(maxWhole, maxDenom);

    // Ensure denominators relate nicely for level 1
    if (difficulty === 1 && (operation === Operation.ADD || operation === Operation.SUBTRACT)) {
      right.d = left.d; 
    }

    const leftImp = toImproper(left);
    const rightImp = toImproper(right);
    
    let resN = 0;
    let resD = 1;

    switch (operation) {
      case Operation.ADD:
        resN = leftImp.n * rightImp.d + rightImp.n * leftImp.d;
        resD = leftImp.d * rightImp.d;
        break;
      case Operation.SUBTRACT:
        // Ensure result is positive
        if (leftImp.n / leftImp.d < rightImp.n / rightImp.d) {
          const temp = left;
          left = right;
          right = temp;
          const lI = toImproper(left);
          const rI = toImproper(right);
          resN = lI.n * rI.d - rI.n * lI.d;
          resD = lI.d * rI.d;
        } else {
          resN = leftImp.n * rightImp.d - rightImp.n * leftImp.d;
          resD = leftImp.d * rightImp.d;
        }
        break;
      case Operation.MULTIPLY:
        resN = leftImp.n * rightImp.n;
        resD = leftImp.d * rightImp.d;
        break;
      case Operation.DIVIDE:
        resN = leftImp.n * rightImp.d;
        resD = leftImp.d * rightImp.n;
        break;
      default:
        break;
    }

    expected = simplify(resN, resD);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: operation,
    left,
    right,
    expected,
    difficulty
  };
};

export const checkAnswer = (input: FractionType | string, expected: FractionType | string): boolean => {
  if (typeof expected === 'string') {
    return input === expected;
  }
  
  // For fraction comparison
  if (typeof input === 'string') return false; // Should not happen
  
  const inputImp = toImproper(input);
  const expectedImp = toImproper(expected);
  // Compare cross products
  return inputImp.n * expectedImp.d === expectedImp.n * inputImp.d;
};