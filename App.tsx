
import React, { useState, useEffect, useRef } from 'react';
import { FractionType, Operation, GameState, Problem, InteractiveStep } from './types';
import { generateProblem, checkAnswer, gcd, getSolution, generateStepsForProblem, toImproper } from './services/mathUtils';
import { playClick, playCorrect, playIncorrect, playStart } from './services/soundUtils';
import FractionDisplay from './components/FractionDisplay';
import Tutorial from './components/Tutorial';
import { 
  Play, Trophy, Star, ArrowLeft, HelpCircle, CheckCircle2, 
  XCircle, Divide, X, Plus, Minus, ArrowRightLeft, Scale, 
  ArrowDownUp, Lightbulb, AlertTriangle, ArrowDown
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [operation, setOperation] = useState<Operation>(Operation.ADD);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  
  // Interactive Steps State
  const [steps, setSteps] = useState<InteractiveStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Inputs for the current step
  const [leftWhole, setLeftWhole] = useState('');
  const [leftN, setLeftN] = useState('');
  const [leftD, setLeftD] = useState('');
  
  const [rightWhole, setRightWhole] = useState('');
  const [rightN, setRightN] = useState('');
  const [rightD, setRightD] = useState('');
  
  const [centerWhole, setCenterWhole] = useState('');
  const [centerN, setCenterN] = useState('');
  const [centerD, setCenterD] = useState('');

  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [currentStepIndex, steps]);

  const startGame = (op: Operation) => {
    playStart();
    setOperation(op);
    setScore(0);
    setStreak(0);
    setGameState('tutorial');
  };

  const nextProblem = () => {
    playClick();
    setFeedback('none');
    clearInputs();
    setActiveHint(null);
    
    const diff = score > 5 ? (score > 10 ? 3 : 2) : 1;
    const newProblem = generateProblem(operation, diff);
    const newSteps = generateStepsForProblem(newProblem);
    
    setProblem(newProblem);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setGameState('playing');
  };

  const clearInputs = () => {
    setLeftWhole(''); setLeftN(''); setLeftD('');
    setRightWhole(''); setRightN(''); setRightD('');
    setCenterWhole(''); setCenterN(''); setCenterD('');
  };

  const getCurrentStep = () => steps[currentStepIndex];

  const handleCheckStep = (compareVal?: string) => {
    if (!problem) return;
    const step = getCurrentStep();

    let isCorrect = true;

    // Validate Left Input
    if (step.inputConfig.left && step.expectedLeft) {
        const inputVal = { 
            whole: parseInt(leftWhole) || 0, 
            n: parseInt(leftN) || 0, 
            d: parseInt(leftD) || 1 
        };
        // Strict equality for intermediate steps
        if (inputVal.whole !== step.expectedLeft.whole || 
            inputVal.n !== step.expectedLeft.n || 
            inputVal.d !== step.expectedLeft.d) {
            isCorrect = false;
        }
    }

    // Validate Right Input
    if (step.inputConfig.right && step.expectedRight) {
        const inputVal = { 
            whole: parseInt(rightWhole) || 0, 
            n: parseInt(rightN) || 0, 
            d: parseInt(rightD) || 1 
        };
        if (inputVal.whole !== step.expectedRight.whole || 
            inputVal.n !== step.expectedRight.n || 
            inputVal.d !== step.expectedRight.d) {
            isCorrect = false;
        }
    }

    // Validate Center Input (Calculation Result or Conversion)
    if (step.inputConfig.center && step.expectedCenter) {
         const inputVal = { 
            whole: parseInt(centerWhole) || 0, 
            n: parseInt(centerN) || 0, 
            d: parseInt(centerD) || 1 
        };
        const expected = step.expectedCenter as FractionType;
        if (inputVal.whole !== expected.whole || 
            inputVal.n !== expected.n || 
            inputVal.d !== expected.d) {
            isCorrect = false;
        }
    }

    // Validate Comparison Sign
    if (step.inputConfig.sign && step.expectedCenter) {
        if (compareVal !== step.expectedCenter) isCorrect = false;
    }

    // --- NEW LOGIC: Accept Improper Fraction and Add "Extract Whole" Step ---
    // If user provided incorrect answer based on strict mixed number check, but provided a correct improper fraction
    if (!isCorrect && step.inputConfig.center && step.expectedCenter && typeof step.expectedCenter !== 'string') {
        const expected = step.expectedCenter as FractionType;
        // Only if expected result is a mixed number (has wholes)
        if (expected.whole > 0) {
            const inputVal = { 
                whole: parseInt(centerWhole) || 0, 
                n: parseInt(centerN) || 0, 
                d: parseInt(centerD) || 1 
            };
            
            // Convert both to improper for comparison
            const inputImp = toImproper(inputVal);
            const expectedImp = toImproper(expected);
            
            // If user entered valid improper fraction (whole=0, n and d match expected total)
            if (inputVal.whole === 0 && inputImp.n === expectedImp.n && inputImp.d === expectedImp.d) {
                // Update current step expectation to match what user entered (so it shows as correct in history)
                const updatedSteps = [...steps];
                updatedSteps[currentStepIndex] = {
                    ...step,
                    expectedCenter: { whole: 0, n: inputImp.n, d: inputImp.d }
                };
                
                // Create a NEW step for extracting wholes
                const newStep: InteractiveStep = {
                    id: Date.now(),
                    type: 'simplify',
                    title: 'Wyłącz całości',
                    hint: 'Licznik jest większy od mianownika. Podziel licznik przez mianownik, aby wyciągnąć całości.',
                    expectedCenter: expected, // The original mixed number is now the expectation for this new step
                    inputConfig: { center: true },
                    symbol: '='
                };
                
                // Insert new step after current
                updatedSteps.splice(currentStepIndex + 1, 0, newStep);
                
                // Apply changes
                setSteps(updatedSteps);
                isCorrect = true; // Mark as correct to trigger success flow
            }
        }
    }

    if (isCorrect) {
        playCorrect();
        setFeedback('correct');
        // Small delay before showing next step
        setTimeout(() => {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setFeedback('none');
                clearInputs();
                setActiveHint(null);
            } else {
                // Problem Finished!
                setScore(s => s + 1);
                setStreak(s => s + 1);
                // Increment index so render logic switches to completion state
                setCurrentStepIndex(prev => prev + 1);
                setFeedback('correct'); 
            }
        }, 1000);
    } else {
        playIncorrect();
        setFeedback('incorrect');
        setStreak(0);
    }
  };

  // --- RENDER HELPERS ---

  const FractionInput = ({ w, setW, n, setN, d, setD }: any) => (
    <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-indigo-200 shadow-sm">
        <input type="number" placeholder="0" value={w} onChange={e => setW(e.target.value)}
            className="w-10 h-10 md:w-12 md:h-12 text-xl font-bold text-center rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" />
        <div className="flex flex-col gap-1">
            <input type="number" placeholder="L" value={n} onChange={e => setN(e.target.value)}
                className="w-10 h-8 md:w-12 md:h-10 text-lg font-bold text-center rounded-md border border-slate-300 focus:border-indigo-500 outline-none" />
            <div className="h-0.5 bg-slate-800 rounded-full"></div>
            <input type="number" placeholder="M" value={d} onChange={e => setD(e.target.value)}
                className="w-10 h-8 md:w-12 md:h-10 text-lg font-bold text-center rounded-md border border-slate-300 focus:border-indigo-500 outline-none" />
        </div>
    </div>
  );

  const renderActiveStep = (step: InteractiveStep) => {
    const isCompare = step.inputConfig.sign;

    return (
        <div className="w-full bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 md:p-6 shadow-lg animate-fade-in relative">
            <div className="absolute -top-3 left-4 bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
               {step.title}
            </div>
            
            <div className="flex flex-col items-center gap-6 mt-4">
                
                {/* Hint Button */}
                <button onClick={() => { playClick(); setActiveHint(activeHint ? null : step.hint); }}
                    className="flex items-center text-blue-600 font-bold hover:underline text-sm">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    {activeHint ? 'Ukryj pomoc' : 'Co mam tu zrobić?'}
                </button>
                {activeHint && (
                    <div className="bg-white border border-blue-200 p-3 rounded-xl text-blue-800 text-sm shadow-sm">
                        {activeHint}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4">
                    {step.inputConfig.left && (
                        <FractionInput w={leftWhole} setW={setLeftWhole} n={leftN} setN={setLeftN} d={leftD} setD={setLeftD} />
                    )}
                    
                    {!step.inputConfig.center && <span className="text-3xl font-bold text-slate-400">{step.symbol}</span>}
                    
                    {step.inputConfig.right && (
                        <FractionInput w={rightWhole} setW={setRightWhole} n={rightN} setN={setRightN} d={rightD} setD={setRightD} />
                    )}

                    {step.inputConfig.center && (
                        <>
                         <span className="text-3xl font-bold text-slate-400">{step.symbol}</span>
                         <FractionInput w={centerWhole} setW={setCenterWhole} n={centerN} setN={setCenterN} d={centerD} setD={setCenterD} />
                        </>
                    )}
                </div>

                {/* Comparison Buttons */}
                {isCompare && (
                     <div className="flex gap-4">
                        <button onClick={() => handleCheckStep('<')} className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-xl text-3xl font-bold hover:bg-indigo-50">&lt;</button>
                        <button onClick={() => handleCheckStep('=')} className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-xl text-3xl font-bold hover:bg-indigo-50">=</button>
                        <button onClick={() => handleCheckStep('>')} className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-xl text-3xl font-bold hover:bg-indigo-50">&gt;</button>
                     </div>
                )}

                {!isCompare && (
                    <button onClick={() => { playClick(); handleCheckStep(); }}
                        className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-transform active:scale-95">
                        Sprawdź ten krok
                    </button>
                )}
            </div>
            
            {feedback === 'incorrect' && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-2xl animate-fade-in z-10">
                    <XCircle className="w-12 h-12 text-red-500 mb-2" />
                    <p className="font-bold text-red-600 text-lg">Spróbuj jeszcze raz!</p>
                    <button onClick={() => setFeedback('none')} className="mt-4 px-6 py-2 bg-slate-200 rounded-lg font-bold">Wróć</button>
                </div>
            )}
        </div>
    );
  };

  const renderSolvedStep = (step: InteractiveStep) => {
    return (
        <div className="w-full opacity-60 flex flex-col gap-2 mb-4">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">{step.title}</div>
             <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm justify-center">
                 {step.expectedLeft && <FractionDisplay fraction={step.expectedLeft} size="sm" />}
                 {!step.expectedCenter && <span className="font-bold text-slate-400">{step.symbol}</span>}
                 {step.expectedRight && <FractionDisplay fraction={step.expectedRight} size="sm" />}
                 {step.expectedCenter && (
                     <>
                        <span className="font-bold text-slate-400">{step.symbol}</span>
                        {typeof step.expectedCenter === 'string' 
                            ? <span className="text-xl font-bold">{step.expectedCenter}</span> 
                            : <FractionDisplay fraction={step.expectedCenter} size="sm" />
                        }
                     </>
                 )}
                 <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
             </div>
             <div className="flex justify-center">
                <ArrowDown className="w-5 h-5 text-slate-300" />
             </div>
        </div>
    );
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-5xl w-full text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Ułamkowa Przygoda
        </h1>
        <p className="text-slate-500 text-lg mb-8">Rozwiązuj zadania krok po kroku</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuButton title="Dodawanie" icon={<Plus />} color="bg-blue-500" onClick={() => startGame(Operation.ADD)} />
          <MenuButton title="Odejmowanie" icon={<Minus />} color="bg-red-500" onClick={() => startGame(Operation.SUBTRACT)} />
          <MenuButton title="Mnożenie" icon={<X />} color="bg-purple-500" onClick={() => startGame(Operation.MULTIPLY)} />
          <MenuButton title="Dzielenie" icon={<Divide />} color="bg-orange-500" onClick={() => startGame(Operation.DIVIDE)} />
          <MenuButton title="Wyłącz całości" icon={<ArrowDownUp />} color="bg-teal-500" onClick={() => startGame(Operation.CONVERT_TO_MIXED)} />
          <MenuButton title="Na niewłaściwy" icon={<ArrowRightLeft />} color="bg-pink-500" onClick={() => startGame(Operation.CONVERT_TO_IMPROPER)} />
          <MenuButton title="Porównywanie" icon={<Scale />} color="bg-indigo-500" onClick={() => startGame(Operation.COMPARE)} className="md:col-span-2 lg:col-span-3" />
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (!problem) return null;

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 font-sans pb-20">
        {/* Header */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-6 bg-white p-3 rounded-2xl shadow-sm sticky top-2 z-20">
          <button onClick={() => { playClick(); setGameState('menu'); }} className="text-slate-500 font-bold flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" /> Menu
          </button>
          <div className="flex gap-4">
             <div className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="fill-current w-5 h-5" /> {streak}</div>
             <div className="flex items-center gap-1 text-indigo-600 font-bold"><Trophy className="w-5 h-5" /> {score}</div>
          </div>
        </div>

        {/* Notebook Container */}
        <div className="w-full max-w-2xl bg-white min-h-[60vh] rounded-3xl shadow-xl p-6 md:p-10 notebook-paper relative">
            
            {/* The Main Problem Header */}
            <div className="flex items-center justify-center gap-4 mb-8 border-b-2 border-slate-200 pb-6 border-dashed">
                <div className="text-slate-400 font-bold uppercase text-sm tracking-widest absolute top-4 left-6">Zadanie</div>
                <FractionDisplay fraction={problem.left} size="lg" />
                <span className="text-4xl text-slate-700 font-bold">
                    {problem.type === Operation.ADD ? '+' : problem.type === Operation.SUBTRACT ? '-' : problem.type === Operation.MULTIPLY ? '·' : problem.type === Operation.DIVIDE ? ':' : problem.type === Operation.COMPARE ? '?' : '→'}
                </span>
                {problem.right && <FractionDisplay fraction={problem.right} size="lg" />}
            </div>

            {/* Solved Steps History */}
            {steps.slice(0, currentStepIndex).map((step, idx) => (
                <div key={idx}>{renderSolvedStep(step)}</div>
            ))}

            {/* Active Step */}
            {currentStepIndex < steps.length ? (
                <div ref={scrollRef}>
                    {renderActiveStep(steps[currentStepIndex])}
                </div>
            ) : (
                /* Completion State */
                <div className="flex flex-col items-center justify-center animate-bounce mt-8">
                     <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-600 mb-6">Zadanie rozwiązane!</h2>
                    <button onClick={nextProblem} className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                        Następne zadanie
                    </button>
                </div>
            )}

        </div>
      </div>
    );
  };

  if (gameState === 'menu') return renderMenu();
  if (gameState === 'tutorial') return <div className="min-h-screen bg-slate-50 p-4"><button onClick={() => setGameState('menu')} className="mb-4 text-slate-500 font-bold flex"><ArrowLeft className="mr-2"/> Menu</button><Tutorial operation={operation} onComplete={nextProblem} /></div>;
  return renderGame();
};

const MenuButton = ({ title, icon, color, onClick, className = '' }: any) => (
  <button onClick={() => { playClick(); onClick(); }} className={`${color} text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-between group ${className}`}>
    <div className="flex items-center gap-4"><div className="bg-white/20 p-3 rounded-xl">{icon}</div><span className="text-xl font-bold">{title}</span></div>
  </button>
);

export default App;
