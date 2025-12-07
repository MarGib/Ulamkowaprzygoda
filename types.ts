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
  MIXED = 'mixed'
}

export interface Problem {
  id: string;
  type: Operation;
  left: FractionType;
  right: FractionType;
  expected: FractionType;
  difficulty: number; // 1-3
}

export type GameState = 'menu' | 'tutorial' | 'playing' | 'summary';

export interface TutorialStep {
  title: string;
  description: string;
  example: React.ReactNode;
}