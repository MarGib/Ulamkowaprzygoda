import React from 'react';

export interface FractionType {
  whole: number;
  n: number; // numerator (licznik)
  d: number; // denominator (mianownik)
}

export enum Operation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
  CONVERT_TO_MIXED = 'convert_mixed',     // Wyłączanie całości
  CONVERT_TO_IMPROPER = 'convert_improper', // Zamiana na niewłaściwy
  COMPARE = 'compare'                     // Porównywanie
}

export interface Problem {
  id: string;
  type: Operation;
  left: FractionType;
  right: FractionType | null; // Right is null for conversions
  expected: FractionType | string; // Result can be a fraction or a sign (<, >, =)
  difficulty: number; // 1-3
}

export type GameState = 'menu' | 'tutorial' | 'playing' | 'summary';

export interface TutorialStep {
  title: string;
  description: string;
  example: React.ReactNode;
}