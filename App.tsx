import React, { useState } from 'react';
import { FractionType, Operation, GameState, Problem } from './types';
import { generateProblem, checkAnswer, gcd } from './services/mathUtils';
import FractionDisplay from './components/FractionDisplay';
import Tutorial from './components/Tutorial';
import { 
  Play, 
  Trophy, 
  Star, 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Divide,
  X,
  Plus,
  Minus,
  ArrowRightLeft,
  Scale,
  ArrowDownUp
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

  const startGame = (op: Operation) => {
    setOperation(op);
    setScore(0);
    setStreak(0);
    setGameState('tutorial');
  };

  const nextProblem = () => {
    setFeedback('none');
    setUserWhole('');
    setUserN('');
    setUserD('');
    setShowHint(false);
    
    // Progressive difficulty
    const diff = score > 5 ? (score > 10 ? 3 : 2) : 1;
    const newProblem = generateProblem(operation, diff);
    setProblem(newProblem);
    setGameState('playing');
  };

  const handleCheck = (compareInput?: string) => {
    if (!problem) return;

    let isCorrect = false;

    if (operation === Operation.COMPARE) {
      if (!compareInput) return;
      isCorrect = checkAnswer(compareInput, problem.expected);
    } else {
      const w = parseInt(userWhole) || 0;
      const n = parseInt(userN) || 0;
      const d = parseInt(userD) || 1;

      if (d === 0) {
        alert("Mianownik nie może być zerem!");
        return;
      }

      const userFraction: FractionType = { whole: w, n, d };
      // Check as fraction
      const expectedFrac = problem.expected as FractionType;
      isCorrect = checkAnswer(userFraction, expectedFrac);
    }

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
  };

  const getHint = () => {
    if (!problem) return "Brak podpowiedzi.";
    
    if (operation === Operation.CONVERT_TO_MIXED) {
      return `Podziel licznik (${problem.left.n}) przez mianownik (${problem.left.d}). Wynik to całości, reszta to licznik.`;
    }
    if (operation === Operation.CONVERT_TO_IMPROPER) {
      return `Pomnóż całość (${problem.left.whole}) przez mianownik (${problem.left.d}) i dodaj licznik (${problem.left.n}).`;
    }
    if (operation === Operation.COMPARE) {
      const l = problem.left.whole * problem.left.d + problem.left.n;
      const r = (problem.right?.whole || 0) * (problem.right?.d || 1) + (problem.right?.n || 0);
      return "Możesz sprowadzić ułamki do wspólnego mianownika lub zamienić na ułamki niewłaściwe.";
    }
    if (operation === Operation.ADD || operation === Operation.SUBTRACT) {
      if (!problem.right) return "";
      const commonD = (problem.left.d * problem.right.d) / gcd(problem.left.d, problem.right.d);
      return `Spróbuj sprowadzić ułamki do wspólnego mianownika: ${commonD}`;
    }
    if (operation === Operation.DIVIDE) {
      if (!problem.right) return "";
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
      case Operation.CONVERT_TO_MIXED:
      case Operation.CONVERT_TO_IMPROPER: return <ArrowRightLeft className="w-8 h-8 text-teal-500" />;
      case Operation.COMPARE: return <div className="w-12 h-12 flex items-center justify-center bg-slate-200 rounded-lg text-2xl font-bold text-slate-500">?</div>;
      default: return null;
    }
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-5xl w-full text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Ułamkowa Przygoda
        </h1>
        <p className="text-slate-500 text-lg mb-8">Trening przed sprawdzianem (Klasa 5)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuButton 
            title="Dodawanie" 
            icon={<Plus className="w-6 h-6" />} 
            color="bg-blue-500 hover:bg-blue-600" 
            onClick={() => startGame(Operation.ADD)} 
          />
          <MenuButton 
            title="Odejmowanie" 
            icon={<Minus className="w-6 h-6" />} 
            color="bg-red-500 hover:bg-red-600" 
            onClick={() => startGame(Operation.SUBTRACT)} 
          />
          <MenuButton 
            title="Mnożenie" 
            icon={<X className="w-6 h-6" />} 
            color="bg-purple-500 hover:bg-purple-600" 
            onClick={() => startGame(Operation.MULTIPLY)} 
          />
          <MenuButton 
            title="Dzielenie" 
            icon={<Divide className="w-6 h-6" />} 
            color="bg-orange-500 hover:bg-orange-600" 
            onClick={() => startGame(Operation.DIVIDE)} 
          />
          <MenuButton 
            title="Wyłącz całości" 
            icon={<ArrowDownUp className="w-6 h-6" />} 
            color="bg-teal-500 hover:bg-teal-600" 
            onClick={() => startGame(Operation.CONVERT_TO_MIXED)} 
          />
           <MenuButton 
            title="Na niewłaściwy" 
            icon={<ArrowRightLeft className="w-6 h-6" />} 
            color="bg-pink-500 hover:bg-pink-600" 
            onClick={() => startGame(Operation.CONVERT_TO_IMPROPER)} 
          />
           <MenuButton 
            title="Porównywanie" 
            icon={<Scale className="w-6 h-6" />} 
            color="bg-indigo-500 hover:bg-indigo-600" 
            onClick={() => startGame(Operation.COMPARE)} 
            className="md:col-span-2 lg:col-span-3"
          />
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (!problem) return null;

    const isComparison = problem.type === Operation.COMPARE;
    const isConversion = problem.type === Operation.CONVERT_TO_MIXED || problem.type === Operation.CONVERT_TO_IMPROPER;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
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
        <div className="w-full max-w-4xl flex flex-col items-center gap-8 mt-4">
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 md:gap-10 bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>

            <FractionDisplay fraction={problem.left} size="lg" />
            
            {renderOperator(problem.type)}
            
            {problem.right && (
              <FractionDisplay fraction={problem.right} size="lg" />
            )}

            {!isComparison && (
               <>
                <span className="text-4xl font-bold text-slate-400">=</span>
                
                {/* Fraction Input Area */}
                <div className="flex items-center gap-2 bg-slate-100 p-4 rounded-2xl border-2 border-slate-200">
                  {operation !== Operation.CONVERT_TO_IMPROPER && (
                    <input 
                      type="number" 
                      placeholder="0"
                      value={userWhole}
                      onChange={(e) => setUserWhole(e.target.value)}
                      className="w-16 h-16 text-3xl font-bold text-center rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none bg-white"
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <input 
                      type="number" 
                      placeholder="L"
                      value={userN}
                      onChange={(e) => setUserN(e.target.value)}
                      className="w-16 h-12 text-2xl font-bold text-center rounded-lg border-2 border-slate-300 focus:border-indigo-500 focus:outline-none bg-white"
                    />
                    <div className="h-1 bg-slate-800 rounded-full"></div>
                    <input 
                      type="number" 
                      placeholder="M"
                      value={userD}
                      onChange={(e) => setUserD(e.target.value)}
                      className="w-16 h-12 text-2xl font-bold text-center rounded-lg border-2 border-slate-300 focus:border-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
               </>
            )}
          </div>

          {/* Controls */}
          {isComparison ? (
             <div className="flex gap-4 w-full justify-center">
                <button onClick={() => handleCheck('<')} className="w-20 h-20 bg-indigo-100 rounded-2xl text-4xl font-bold text-indigo-700 hover:bg-indigo-200 shadow-md">&lt;</button>
                <button onClick={() => handleCheck('=')} className="w-20 h-20 bg-indigo-100 rounded-2xl text-4xl font-bold text-indigo-700 hover:bg-indigo-200 shadow-md">=</button>
                <button onClick={() => handleCheck('>')} className="w-20 h-20 bg-indigo-100 rounded-2xl text-4xl font-bold text-indigo-700 hover:bg-indigo-200 shadow-md">&gt;</button>
             </div>
          ) : (
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-yellow-100 text-yellow-700 rounded-2xl font-bold hover:bg-yellow-200 transition-colors"
              >
                <HelpCircle className="w-6 h-6 mr-2" />
                {showHint ? 'Ukryj' : 'Pomoc'}
              </button>
              <button 
                onClick={() => handleCheck()}
                disabled={feedback !== 'none'}
                className="flex-1 md:flex-none flex items-center justify-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                Sprawdź
                <CheckCircle2 className="w-6 h-6 ml-2" />
              </button>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl max-w-lg text-center animate-fade-in shadow-sm">
              <p className="font-medium">{getHint()}</p>
            </div>
          )}

          {/* Feedback Modal */}
          {feedback !== 'none' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center transform transition-all scale-100 border-4 border-white">
                {feedback === 'correct' ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <Trophy className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-green-600 mb-2">Brawo!</h2>
                    <p className="text-slate-500 mb-8">Zadanie rozwiązane poprawnie.</p>
                    <button 
                      onClick={nextProblem}
                      className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
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
                      <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide font-bold">Prawidłowa odpowiedź:</p>
                      <div className="flex justify-center text-2xl font-bold text-slate-800">
                        {typeof problem.expected === 'string' ? (
                          <span className="text-4xl">{problem.expected}</span>
                        ) : (
                          <FractionDisplay fraction={problem.expected} size="md" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => setFeedback('none')}
                        className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                      >
                        Popraw
                      </button>
                      <button 
                        onClick={nextProblem}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col font-sans">
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

const MenuButton = ({ title, icon, color, onClick, className = '' }: { title: string, icon: React.ReactNode, color: string, onClick: () => void, className?: string }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-between group ${className}`}
  >
    <div className="flex items-center gap-4">
      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
        {icon}
      </div>
      <span className="text-xl md:text-2xl font-bold">{title}</span>
    </div>
    <Play className="w-6 h-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
  </button>
);

export default App;