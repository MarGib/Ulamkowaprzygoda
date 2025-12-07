
import React, { useState } from 'react';
import { Operation } from '../types';
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import FractionDisplay from './FractionDisplay';
import { playClick } from '../services/soundUtils';

interface Props {
  operation: Operation;
  onComplete: () => void;
}

const Tutorial: React.FC<Props> = ({ operation, onComplete }) => {
  const [step, setStep] = useState(0);

  const getSteps = () => {
    switch (operation) {
      case Operation.ADD:
      case Operation.SUBTRACT:
        return [
          {
            title: "Wspólny Mianownik",
            description: "Aby dodać lub odjąć ułamki, muszą mieć ten sam dół (mianownik).",
            example: (
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 2 }} />
                <span className="text-slate-800 font-bold">≠</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 4 }} />
              </div>
            )
          },
          {
            title: "Rozszerzanie Ułamków",
            description: "Musimy pomnożyć licznik i mianownik przez tę samą liczbę, aby mianowniki były równe.",
            example: (
              <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex-wrap justify-center">
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 2 }} />
                <span className="text-slate-800 font-bold">=</span>
                <div className="flex flex-col text-sm text-center text-slate-700 font-bold">
                  <span>1 · 2</span>
                  <div className="h-px bg-slate-800 w-full my-1"></div>
                  <span>2 · 2</span>
                </div>
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 4 }} />
              </div>
            )
          },
          {
            title: "Dodawanie/Odejmowanie",
            description: "Gdy mianowniki są równe, dodajemy (lub odejmujemy) tylko liczniki. Mianownik bez zmian!",
            example: (
              <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl border border-green-100">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 4 }} />
                <span className="text-slate-800 font-bold">+</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 4 }} />
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 4 }} />
              </div>
            )
          }
        ];
      case Operation.MULTIPLY:
        return [
          {
            title: "Mnożenie jest proste!",
            description: "Mnożymy górę razy górę (liczniki) i dół razy dół (mianowniki).",
            example: (
              <div className="flex items-center gap-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span className="text-slate-800 font-bold">·</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
              </div>
            )
          },
          {
            title: "Wynik",
            description: "2 razy 4 to 8. 3 razy 5 to 15.",
            example: (
              <div className="flex items-center gap-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span className="text-slate-800 font-bold">·</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 0, n: 8, d: 15 }} />
              </div>
            )
          }
        ];
      case Operation.DIVIDE:
        return [
          {
            title: "Odwrotność",
            description: "Dzielenie to mnożenie przez odwrotność. Drugi ułamek odwracamy 'do góry nogami'.",
            example: (
              <div className="flex items-center gap-2 bg-orange-50 p-4 rounded-xl border border-orange-100">
                 <span className="text-slate-700">Dzielimy przez</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span className="text-slate-700">→ Mnożymy przez</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 2 }} />
              </div>
            )
          },
          {
            title: "Zasada",
            description: "Zamieniamy dzielenie na mnożenie i odwracamy drugi ułamek.",
            example: (
              <div className="flex items-center gap-2 bg-orange-50 p-4 rounded-xl border border-orange-100 flex-wrap">
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span className="text-slate-800 font-bold">:</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span className="text-slate-800 font-bold">·</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 2 }} />
              </div>
            )
          }
        ];
      case Operation.CONVERT_TO_MIXED:
        return [
          {
            title: "Wyłączanie całości",
            description: "Gdy licznik jest większy od mianownika, ułamek ma w sobie całości. Dzielimy licznik przez mianownik.",
            example: (
              <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-xl border border-teal-100">
                <FractionDisplay fraction={{ whole: 0, n: 7, d: 2 }} />
                <span className="text-slate-800 font-bold">→</span>
                <span className="text-slate-700">Ile dwójek w siódemce? (3)</span>
              </div>
            )
          },
          {
            title: "Reszta to licznik",
            description: "3 całe dwójki to 6. Zostaje nam 1 reszty (7 - 6 = 1).",
            example: (
              <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-xl border border-teal-100">
                <FractionDisplay fraction={{ whole: 0, n: 7, d: 2 }} />
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 3, n: 1, d: 2 }} />
              </div>
            )
          }
        ];
      case Operation.CONVERT_TO_IMPROPER:
        return [
          {
            title: "Włączanie całości",
            description: "Chcemy zamienić liczbę mieszaną na ułamek niewłaściwy. Mnożymy całość przez mianownik i dodajemy licznik.",
            example: (
              <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-xl border border-pink-100">
                <FractionDisplay fraction={{ whole: 2, n: 1, d: 3 }} />
                <span className="text-slate-800 font-bold">→</span>
                <span className="text-slate-700 font-bold">2 · 3 + 1 = 7</span>
              </div>
            )
          },
          {
            title: "Wynik",
            description: "Licznik to nasz wynik (7), a mianownik pozostaje bez zmian (3).",
            example: (
              <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-xl border border-pink-100">
                <FractionDisplay fraction={{ whole: 2, n: 1, d: 3 }} />
                <span className="text-slate-800 font-bold">=</span>
                <FractionDisplay fraction={{ whole: 0, n: 7, d: 3 }} />
              </div>
            )
          }
        ];
      case Operation.COMPARE:
        return [
          {
            title: "Ten sam mianownik",
            description: "Jeśli doły (mianowniki) są takie same, większy jest ten ułamek, który ma większy licznik.",
            example: (
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 5 }} />
                <span className="text-2xl font-bold text-slate-800">&gt;</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 5 }} />
              </div>
            )
          },
          {
            title: "Ten sam licznik",
            description: "Jeśli góry (liczniki) są takie same, większy jest ten, który ma MNIEJSZY mianownik (mniejsze kawałki).",
            example: (
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 2 }} />
                <span className="text-2xl font-bold text-slate-800">&gt;</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 4 }} />
              </div>
            )
          }
        ];
      default:
        return [];
    }
  };

  const steps = getSteps();

  if (steps.length === 0) return <div className="p-4">Brak samouczka dla tego trybu.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-indigo-100">
      <div className="bg-indigo-100 p-6 flex items-center justify-between border-b border-indigo-200">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
          <BookOpen className="w-6 h-6" />
          Szkoła Ułamków
        </h2>
        <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
          Krok {step + 1} z {steps.length}
        </span>
      </div>

      <div className="p-8 min-h-[300px] flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">{steps[step].title}</h3>
          <p className="text-lg text-slate-700 leading-relaxed font-medium">{steps[step].description}</p>
          <div className="flex justify-center py-6">
            {steps[step].example}
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              playClick();
              setStep(s => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="flex items-center px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Wstecz
          </button>
          
          {step < steps.length - 1 ? (
            <button
              onClick={() => {
                playClick();
                setStep(s => s + 1);
              }}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              Dalej
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
             <button
              onClick={() => {
                playClick();
                onComplete();
              }}
              className="flex items-center px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-200 transition-all hover:scale-105 animate-pulse"
            >
              Zrozumiałem, grajmy!
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
