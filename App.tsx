import React, { useState, useEffect, useRef } from 'react';
import { FractionType, Operation, GameState, Problem } from './types';
import { generateProblem, checkAnswer, gcd, toImproper } from './services/mathUtils';
import FractionDisplay from './components/FractionDisplay';
import Tutorial from './components/Tutorial';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Star, 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Calculator,
  Divide,
  X,
  Plus,
  Minus
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [operation, setOperation] = useState<Operation>(Operation.ADD);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  
  // User Input State
  const [userWhole, setUserWhole] = useState<string>('');
  const [userN, setUserN] = useState<string>('');
  const [userD, setUserD] = useState<string>('');
  
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showHint, setShowHint] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const startGame = (op: Operation) => {
    setOperation(op);
    setScore(0);
    setStreak(0);
    setQuestionCount(0);
    setGameState('tutorial');
  };

  const nextProblem = () => {
    setFeedback('none');
    setUserWhole('');
    setUserN('');
    setUserD('');
    setShowHint(false);
    
    // Progressive difficulty
    const diff = score > 5 ? 2 : 1;
    const newProblem = generateProblem(operation, diff);
    setProblem(newProblem);
    setGameState('playing');
  };

  const handleCheck = () => {
    if (!problem) return;

    const w = parseInt(userWhole) || 0;
    const n = parseInt(userN) || 0;
    const d = parseInt(userD) || 1;

    // Basic validation
    if (d === 0) {
      alert("Mianownik nie może być zerem!");
      return;
    }

    const userFraction: FractionType = { whole: w, n, d };
    const isCorrect = checkAnswer(userFraction, problem.expected);

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setQuestionCount(c => c + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
  };

  const getHint = () => {
    if (!problem) return "Brak podpowiedzi.";
    
    if (operation === Operation.ADD || operation === Operation.SUBTRACT) {
      const commonD = (problem.left.d * problem.right.d) / gcd(problem.left.d, problem.right.d);
      return `Spróbuj sprowadzić ułamki do wspólnego mianownika: ${commonD}`;
    }
    if (operation === Operation.MULTIPLY) {
      return "Pomnóż licznik przez licznik, a mianownik przez mianownik.";
    }
    if (operation === Operation.DIVIDE) {
      return `Pomnóż pierwszy ułamek przez odwrotność drugiego: ${problem.right.d}/${problem.right.n}`;
    }
    return "Spróbuj zamienić liczby mieszane na ułamki niewłaściwe.";
  };

  // --- RENDER HELPERS ---

  const renderOperator = (op: Operation) => {
    switch (op) {
      case Operation.ADD: return <Plus className="w-8 h-8 text-blue-500" />;
      case Operation.SUBTRACT: return <Minus className="w-8 h-8 text-red-500" />;
      case Operation.MULTIPLY: return <X className="w-8 h-8 text-purple-500" />;
      case Operation.DIVIDE: return <Divide className="w-8 h-8 text-orange-500" />;
      default: return null;
    }
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Ułamkowa Przygoda
        </h1>
        <p className="text-slate-600 text-xl mb-12">Wybierz działanie i zostań mistrzem matematyki!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MenuButton 
            title="Dodawanie" 
            icon={<Plus className="w-10 h-10" />} 
            color="bg-blue-500 hover:bg-blue-600" 
            onClick={() => startGame(Operation.ADD)} 
          />
          <MenuButton 
            title="Odejmowanie" 
            icon={<Minus className="w-10 h-10" />} 
            color="bg-red-500 hover:bg-red-600" 
            onClick={() => startGame(Operation.SUBTRACT)} 
          />
          <MenuButton 
            title="Mnożenie" 
            icon={<X className="w-10 h-10" />} 
            color="bg-purple-500 hover:bg-purple-600" 
            onClick={() => startGame(Operation.MULTIPLY)} 
          />
          <MenuButton 
            title="Dzielenie" 
            icon={<Divide className="w-10 h-10" />} 
            color="bg-orange-500 hover:bg-orange-600" 
            onClick={() => startGame(Operation.DIVIDE)} 
          />
        </div>
        
        <div className="mt-12 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
           <p className="text-sm text-indigo-700 font-medium">Poziom: Klasa 5 Szkoły Podstawowej</p>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (!problem) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <button 
            onClick={() => setGameState('menu')}
            className="flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Menu
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-yellow-500">
              <Star className="fill-current w-6 h-6" />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <Trophy className="w-6 h-6" />
              <span className="text-2xl font-bold">{score} pkt</span>
            </div>
          </div>
        </div>

        {/* Problem Area */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-12 mt-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full">
            <FractionDisplay fraction={problem.left} size="lg" />
            {renderOperator(problem.type)}
            <FractionDisplay fraction={problem.right} size="lg" />
            <span className="text-4xl font-bold text-slate-400">=</span>
            
            {/* Input Area */}
            <div className="flex items-center gap-2 bg-slate-100 p-4 rounded-2xl border-2 border-slate-200">
              <input 
                type="number" 
                placeholder="0"
                value={userWhole}
                onChange={(e) => setUserWhole(e.target.value)}
                className="w-16 h-16 text-3xl font-bold text-center rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex flex-col gap-2">
                <input 
                  type="number" 
                  placeholder="L"
                  value={userN}
                  onChange={(e) => setUserN(e.target.value)}
                  className="w-16 h-12 text-2xl font-bold text-center rounded-lg border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                />
                <div className="h-1 bg-slate-800 rounded-full"></div>
                <input 
                  type="number" 
                  placeholder="M"
                  value={userD}
                  onChange={(e) => setUserD(e.target.value)}
                  className="w-16 h-12 text-2xl font-bold text-center rounded-lg border-2 border-slate-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="flex items-center px-6 py-4 bg-yellow-100 text-yellow-700 rounded-2xl font-bold hover:bg-yellow-200 transition-colors"
            >
              <HelpCircle className="w-6 h-6 mr-2" />
              {showHint ? 'Ukryj' : 'Podpowiedź'}
            </button>
            <button 
              onClick={handleCheck}
              disabled={feedback !== 'none'}
              className="flex items-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              Sprawdź
              <CheckCircle2 className="w-6 h-6 ml-2" />
            </button>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl max-w-lg text-center animate-fade-in">
              <p className="font-medium">{getHint()}</p>
            </div>
          )}

          {/* Feedback Modal / Overlay */}
          {feedback !== 'none' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center transform transition-all scale-100">
                {feedback === 'correct' ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-green-600 mb-2">Świetnie!</h2>
                    <p className="text-slate-500 mb-8">Dobra robota! Wynik jest poprawny.</p>
                    <button 
                      onClick={nextProblem}
                      className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
                    >
                      Następne zadanie
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-red-600 mb-2">Prawie...</h2>
                    <div className="bg-slate-50 p-6 rounded-xl w-full mb-6">
                      <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide font-bold">Poprawny wynik:</p>
                      <div className="flex justify-center">
                        <FractionDisplay fraction={problem.expected} size="md" />
                      </div>
                      <p className="mt-4 text-sm text-slate-400">Pamiętaj o skracaniu ułamków i wyłączaniu całości!</p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => {
                          setFeedback('none');
                          // Give them another try without resetting problem, or just show answer. 
                          // For this flow, let's let them move on or try again.
                        }}
                        className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                      >
                        Popraw
                      </button>
                      <button 
                        onClick={nextProblem}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                      >
                        Dalej
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  if (gameState === 'menu') return renderMenu();
  
  if (gameState === 'tutorial') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col">
        <button 
          onClick={() => setGameState('menu')}
          className="self-start mb-6 flex items-center text-slate-500 hover:text-slate-800 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Wróć do Menu
        </button>
        <Tutorial operation={operation} onComplete={nextProblem} />
      </div>
    );
  }

  return renderGame();
};

// Helper Component for Menu
const MenuButton = ({ title, icon, color, onClick }: { title: string, icon: React.ReactNode, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-between group`}
  >
    <div className="flex items-center gap-4">
      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
        {icon}
      </div>
      <span className="text-2xl font-bold">{title}</span>
    </div>
    <Play className="w-6 h-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
  </button>
);

export default App;