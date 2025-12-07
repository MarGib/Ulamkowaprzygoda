import React, { useState } from 'react';
import { Operation } from '../types';
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import FractionDisplay from './FractionDisplay';

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
            desc: "Aby dodać lub odjąć ułamki, muszą mieć ten sam dół (mianownik).",
            example: (
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 2 }} />
                <span>nie pasuje do</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 4 }} />
              </div>
            )
          },
          {
            title: "Rozszerzanie Ułamków",
            desc: "Musimy pomnożyć licznik i mianownik przez tę samą liczbę, aby doły były równe.",
            example: (
              <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-xl flex-wrap justify-center">
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 2 }} />
                <span>=</span>
                <div className="flex flex-col text-sm text-center">
                  <span>1 · 2</span>
                  <div className="h-px bg-black w-full my-1"></div>
                  <span>2 · 2</span>
                </div>
                <span>=</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 4 }} />
              </div>
            )
          },
          {
            title: "Dodawanie/Odejmowanie",
            desc: "Gdy mianowniki są równe, dodajemy (lub odejmujemy) tylko liczniki. Mianownik bez zmian!",
            example: (
              <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 4 }} />
                <span>+</span>
                <FractionDisplay fraction={{ whole: 0, n: 1, d: 4 }} />
                <span>=</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 4 }} />
              </div>
            )
          }
        ];
      case Operation.MULTIPLY:
        return [
          {
            title: "Mnożenie jest proste!",
            desc: "Mnożymy górę razy górę (liczniki) i dół razy dół (mianowniki).",
            example: (
              <div className="flex items-center gap-2 bg-purple-50 p-4 rounded-xl">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span>·</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
              </div>
            )
          },
          {
            title: "Wynik",
            desc: "2 razy 4 to 8. 3 razy 5 to 15.",
            example: (
              <div className="flex items-center gap-2 bg-purple-50 p-4 rounded-xl">
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span>·</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span>=</span>
                <FractionDisplay fraction={{ whole: 0, n: 8, d: 15 }} />
              </div>
            )
          },
          {
            title: "Liczby Mieszane",
            desc: "Jeśli masz całości (np. 1 1/2), zamień je najpierw na ułamek niewłaściwy!",
            example: (
              <div className="flex items-center gap-2 bg-yellow-50 p-4 rounded-xl">
                <FractionDisplay fraction={{ whole: 1, n: 1, d: 2 }} />
                <span>→</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 2 }} />
              </div>
            )
          }
        ];
      case Operation.DIVIDE:
        return [
          {
            title: "Odwrotność",
            desc: "Dzielenie to mnożenie przez odwrotność drugiej liczby. Odwracamy drugi ułamek 'do góry nogami'.",
            example: (
              <div className="flex items-center gap-2 bg-orange-50 p-4 rounded-xl">
                 <span>Dzielimy przez</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span>→ Mnożymy przez</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 2 }} />
              </div>
            )
          },
          {
            title: "Przykład",
            desc: "Zamieniamy dzielenie na mnożenie i odwracamy drugi ułamek.",
            example: (
              <div className="flex items-center gap-2 bg-orange-50 p-4 rounded-xl flex-wrap">
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span>:</span>
                <FractionDisplay fraction={{ whole: 0, n: 2, d: 3 }} />
                <span>=</span>
                <FractionDisplay fraction={{ whole: 0, n: 4, d: 5 }} />
                <span>·</span>
                <FractionDisplay fraction={{ whole: 0, n: 3, d: 2 }} />
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
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Szkoła Ułamków
        </h2>
        <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm">
          Krok {step + 1} z {steps.length}
        </span>
      </div>

      <div className="p-8 min-h-[300px] flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">{steps[step].title}</h3>
          <p className="text-lg text-slate-600 leading-relaxed">{steps[step].desc}</p>
          <div className="flex justify-center py-6">
            {steps[step].example}
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Wstecz
          </button>
          
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              Dalej
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
             <button
              onClick={onComplete}
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