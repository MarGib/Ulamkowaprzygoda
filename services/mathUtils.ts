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
const generateFraction = (maxWhole: number, maxDenom: number): FractionType => {
  const d = randomInt(2, maxDenom);
  const n = randomInt(1, d - 1);
  const whole = randomInt(0, maxWhole);
  return { whole, n, d };
};

export const generateProblem = (operation: Operation, difficulty: number): Problem => {
  let left: FractionType;
  let right: FractionType;
  let expected: FractionType;

  // Difficulty scaling
  const maxWhole = difficulty === 1 ? 0 : difficulty === 2 ? 3 : 5;
  const maxDenom = difficulty === 1 ? 6 : difficulty === 2 ? 12 : 20;

  // Basic generation
  left = generateFraction(maxWhole, maxDenom);
  right = generateFraction(maxWhole, maxDenom);

  // Ensure denominators relate nicely for level 1 addition/subtraction
  if (difficulty === 1 && (operation === Operation.ADD || operation === Operation.SUBTRACT)) {
    right.d = left.d; // Same denominator for easy mode
  } else if (difficulty === 2 && (operation === Operation.ADD || operation === Operation.SUBTRACT)) {
     // Make one denominator a multiple of the other often
     if (Math.random() > 0.5) {
        right.d = left.d * randomInt(2, 3);
     }
  }

  // Operation logic
  const leftImp = toImproper(left);
  const rightImp = toImproper(right);
  
  let resN = 0;
  let resD = 1;

  switch (operation) {
    case Operation.ADD:
      // (n1*d2 + n2*d1) / (d1*d2)
      resN = leftImp.n * rightImp.d + rightImp.n * leftImp.d;
      resD = leftImp.d * rightImp.d;
      break;
    case Operation.SUBTRACT:
      // Ensure result is positive for 5th grade level usually
      if (leftImp.n / leftImp.d < rightImp.n / rightImp.d) {
        const temp = left;
        left = right;
        right = temp;
        // recalculate improper
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
      // Flip second fraction
      resN = leftImp.n * rightImp.d;
      resD = leftImp.d * rightImp.n;
      break;
    default:
      break;
  }

  expected = simplify(resN, resD);

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: operation,
    left,
    right,
    expected,
    difficulty
  };
};

export const checkAnswer = (input: FractionType, expected: FractionType): boolean => {
  const inputImp = toImproper(input);
  const expectedImp = toImproper(expected);
  // Compare cross products to avoid floating point issues
  return inputImp.n * expectedImp.d === expectedImp.n * inputImp.d;
};