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

// --- NEW TYPES FOR INTERACTIVE SOLVING ---

export type StepType = 
  | 'convert_improper' 
  | 'common_denominator' 
  | 'reciprocal' 
  | 'calculate' 
  | 'simplify' 
  | 'compare_final';

export interface StepInputConfig {
    left?: boolean;   // Does this step require input for the left number?
    right?: boolean;  // Does this step require input for the right number?
    center?: boolean; // Does this step require a single central input (the result)?
    sign?: boolean;   // For comparison (<, >, =)
}

export interface InteractiveStep {
    id: number;
    type: StepType;
    title: string;       // E.g., "Zamień na ułamek niewłaściwy"
    hint: string;        // The specific helper text for the ? icon
    
    // The expected values for this specific step
    expectedLeft?: FractionType;
    expectedRight?: FractionType;
    expectedCenter?: FractionType | string; 
    
    inputConfig: StepInputConfig;
    
    // Visual symbol between left/right for this step (e.g., +, -, *, :)
    symbol: string; 
}
