
import React, { useState, useEffect, useRef } from 'react';
import { FractionType, Operation, GameState, Problem, InteractiveStep } from './types';
import { generateProblem, generateStepsForProblem, toImproper } from './services/mathUtils';
import { playClick, playCorrect, playIncorrect, playStart } from './services/soundUtils';
import FractionDisplay from './components/FractionDisplay';
import Tutorial from './components/Tutorial';
import { 
  Trophy, Star, ArrowLeft, HelpCircle, CheckCircle2, 
  XCircle, Divide, X, Plus, Minus, ArrowRightLeft, Scale, 
  ArrowDownUp, ArrowDown, ChevronUp, ChevronDown
} from 'lucide-react';

// --- KOMPONENT DO WPISYWANIA LICZB Z PRZYCISKAMI ---
const NumberInput = ({ value, onChange, placeholder, size = 'md' }: { value: string, onChange: (v: string) => void, placeholder: string, size?: 'md' | 'lg' }) => {
  const isLarge = size === 'lg';
  const [animState, setAnimState] = useState<'idle' | 'up' | 'down'>('idle');

  // Wymiary dla dużego (całości) i średniego (ułamek) inputa
  const widthClass = isLarge ? 'w-20 md:w-24' : 'w-16 md:w-20';
  const heightClass = isLarge ? 'h-16 md:h-20' : 'h-12 md:h-14';
  const textSize = isLarge ? 'text-3xl' : 'text-xl';
  
  const update = (delta: number) => {
    const current = value === '' ? 0 : parseInt(value);
    if (isNaN(current)) {
        onChange((delta).toString());
    } else {
        const next = current + delta;
        onChange(next.toString());
    }
    
    // Trigger animation based on direction
    setAnimState(delta > 0 ? 'up' : 'down');
    setTimeout(() => setAnimState('idle'), 200);
  };

  // Oblicz klasy animacji
  let animClass = 'translate-y-0 text-slate-800 scale-100';
  if (animState === 'up') animClass = '-translate-y-1 text-green-600 scale-110';
  if (animState === 'down') animClass = 'translate-y-1 text-red-500 scale-90';

  return (
    <div className={`flex ${heightClass} shadow-sm rounded-xl overflow-hidden border-2 border-indigo-100 focus-within:border-indigo-400 bg-white transition-colors group`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${widthClass} h-full text-center ${textSize} font-bold outline-none bg-transparent remove-arrow placeholder:text-slate-300 transition-all duration-200 ease-out transform ${animClass}`}
      />
      <div className="flex flex-col border-l border-indigo-100 bg-indigo-50 w-8 md:w-10">
        <button 
            onClick={() => { playClick(); update(1); }} 
            className="flex-1 flex items-center justify-center hover:bg-indigo-200 active:bg-indigo-300 text-indigo-600 transition-colors focus:outline-none"
            tabIndex={-1}
        >
            <ChevronUp size={isLarge ? 20 : 16} strokeWidth={3} />
        </button>
        <div className="h-px bg-indigo-200"></div>
        <button 
            onClick={() => { playClick(); update(-1); }} 
            className="flex-1 flex items-center justify-center hover:bg-indigo-200 active:bg-indigo-300 text-indigo-600 transition-colors focus:outline-none"
            tabIndex={-1}
        >
            <ChevronDown size={isLarge ? 20 : 16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

// --- FRACTION INPUT COMPONENT (Moved outside App to prevent re-renders losing focus) ---
interface FractionInputProps {
    w: string; setW: (v: string) => void;
    n: string; setN: (v: string) => void;
    d: string; setD: (v: string) => void;
}

const FractionInput = ({ w, setW, n, setN, d, setD }: FractionInputProps) => (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/40 border border-slate-200/50 shadow-sm hover:shadow-md hover:bg-white/60 transition-all shrink-0">
        {/* Whole Number Input */}
        <div className="flex flex-col justify-center">
             <NumberInput value={w} onChange={setW} placeholder="0" size="lg" />
        </div>
        
        {/* Fraction Part Inputs */}
        <div className="flex flex-col items-center gap-1.5">
            <NumberInput value={n} onChange={setN} placeholder="L" size="md" />
            <div className="h-1 bg-slate-800 rounded-full w-full min-w-[3.5rem] opacity-90"></div>
            <NumberInput value={d} onChange={setD} placeholder="M" size="md" />
        </div>
    </div>
);

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

    // --- Logic for Accepting Improper Fractions as Intermediate Steps ---
    if (!isCorrect && step.inputConfig.center && step.expectedCenter && typeof step.expectedCenter !== 'string') {
        const expected = step.expectedCenter as FractionType;
        if (expected.whole > 0) {
            const inputVal = { 
                whole: parseInt(centerWhole) || 0, 
                n: parseInt(centerN) || 0, 
                d: parseInt(centerD) || 1 
            };
            const inputImp = toImproper(inputVal);
            const expectedImp = toImproper(expected);
            
            if (inputVal.whole === 0 && inputImp.n === expectedImp.n && inputImp.d === expectedImp.d) {
                const updatedSteps = [...steps];
                updatedSteps[currentStepIndex] = {
                    ...step,
                    expectedCenter: { whole: 0, n: inputImp.n, d: inputImp.d }
                };
                const newStep: InteractiveStep = {
                    id: Date.now(),
                    type: 'simplify',
                    title: 'Wyłącz całości',
                    hint: 'Licznik jest większy od mianownika. Podziel licznik przez mianownik.',
                    expectedCenter: expected,
                    inputConfig: { center: true },
                    symbol: '='
                };
                updatedSteps.splice(currentStepIndex + 1, 0, newStep);
                setSteps(updatedSteps);
                isCorrect = true;
            }
        }
    }

    if (isCorrect) {
        playCorrect();
        setFeedback('correct');
        setTimeout(() => {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setFeedback('none');
                clearInputs();
                setActiveHint(null);
            } else {
                setScore(s => s + 1);
                setStreak(s => s + 1);
                setCurrentStepIndex(prev => prev + 1);
                setFeedback('correct'); 
            }
        }, 800);
    } else {
        playIncorrect();
        setFeedback('incorrect');
        setStreak(0);
    }
  };

  const renderActiveStep = (step: InteractiveStep) => {
    const isCompare = step.inputConfig.sign;

    return (
        <div className="w-full bg-blue-50/80 border-2 border-blue-400/50 rounded-2xl p-4 md:p-8 shadow-xl animate-fade-in relative backdrop-blur-sm mt-4">
            <div className="absolute -top-4 left-4 md:left-8 bg-blue-100 text-blue-900 border border-blue-300 px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 transform -rotate-1">
               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
               {step.title}
            </div>
            
            <div className="flex flex-col items-center gap-8 mt-4">
                
                <button onClick={() => { playClick(); setActiveHint(activeHint ? null : step.hint); }}
                    className="flex items-center text-blue-600 font-bold hover:underline text-sm transition-colors hover:text-blue-700 bg-white/50 px-3 py-1 rounded-lg">
                    <HelpCircle className="w-4 h-4 mr-1.5" />
                    {activeHint ? 'Ukryj pomoc' : 'Podpowiedź'}
                </button>
                
                {activeHint && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-slate-800 text-sm shadow-md flex gap-3 animate-fade-in max-w-lg">
                        <div className="bg-yellow-100 p-2 rounded-full h-fit"><HelpCircle className="w-5 h-5 text-yellow-600" /></div>
                        <p className="leading-relaxed font-medium">{activeHint}</p>
                    </div>
                )}

                <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 md:gap-6">
                    {step.inputConfig.left && (
                        <FractionInput w={leftWhole} setW={setLeftWhole} n={leftN} setN={setLeftN} d={leftD} setD={setLeftD} />
                    )}
                    
                    {!step.inputConfig.center && <span className="text-4xl font-black text-slate-400 mx-2">{step.symbol}</span>}
                    
                    {step.inputConfig.right && (
                        <FractionInput w={rightWhole} setW={setRightWhole} n={rightN} setN={setRightN} d={rightD} setD={setRightD} />
                    )}

                    {step.inputConfig.center && (
                        <>
                         <span className="text-4xl font-black text-slate-400 mx-2">{step.symbol}</span>
                         <FractionInput w={centerWhole} setW={setCenterWhole} n={centerN} setN={setCenterN} d={centerD} setD={setCenterD} />
                        </>
                    )}
                </div>

                {/* Comparison Buttons */}
                {isCompare && (
                     <div className="flex gap-4">
                        <button onClick={() => handleCheckStep('<')} className="w-20 h-20 bg-white border-b-4 border-indigo-200 rounded-2xl text-4xl font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-1 transition-all text-slate-700 shadow-sm">&lt;</button>
                        <button onClick={() => handleCheckStep('=')} className="w-20 h-20 bg-white border-b-4 border-indigo-200 rounded-2xl text-4xl font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-1 transition-all text-slate-700 shadow-sm">=</button>
                        <button onClick={() => handleCheckStep('>')} className="w-20 h-20 bg-white border-b-4 border-indigo-200 rounded-2xl text-4xl font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-1 transition-all text-slate-700 shadow-sm">&gt;</button>
                     </div>
                )}

                {!isCompare && (
                    <button onClick={() => { playClick(); handleCheckStep(); }}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95 text-lg flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6" />
                        Sprawdź wynik
                    </button>
                )}
            </div>
            
            {feedback === 'incorrect' && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-2xl animate-fade-in z-20 backdrop-blur-sm">
                    <XCircle className="w-16 h-16 text-red-500 mb-4 drop-shadow-sm" />
                    <p className="font-extrabold text-red-600 text-xl mb-6">Spróbuj jeszcze raz!</p>
                    <button onClick={() => setFeedback('none')} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors shadow-sm">
                        Wróć do zadania
                    </button>
                </div>
            )}
        </div>
    );
  };

  const renderSolvedStep = (step: InteractiveStep) => {
    return (
        <div className="w-full opacity-70 flex flex-col gap-2 mb-6 group hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 ml-4">
                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{step.title}</div>
             </div>
             
             <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-sm justify-center relative overflow-hidden flex-wrap lg:flex-nowrap">
                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-400"></div>
                 {step.expectedLeft && <FractionDisplay fraction={step.expectedLeft} size="sm" />}
                 {!step.expectedCenter && <span className="font-black text-slate-300 text-xl">{step.symbol}</span>}
                 {step.expectedRight && <FractionDisplay fraction={step.expectedRight} size="sm" />}
                 {step.expectedCenter && (
                     <>
                        <span className="font-black text-slate-300 text-xl">{step.symbol}</span>
                        {typeof step.expectedCenter === 'string' 
                            ? <span className="text-2xl font-bold text-slate-700">{step.expectedCenter}</span> 
                            : <FractionDisplay fraction={step.expectedCenter} size="sm" />
                        }
                     </>
                 )}
                 <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
             </div>
             <div className="flex justify-center -mb-2 mt-2">
                <ArrowDown className="w-6 h-6 text-slate-200" />
             </div>
        </div>
    );
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
      <div className="bg-white/90 backdrop-blur p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-w-5xl w-full text-center border border-white/50">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-3 tracking-tight">
          Ułamkowa Przygoda
        </h1>
        <p className="text-slate-500 text-lg md:text-xl mb-10 font-medium">Interaktywny zeszyt ćwiczeń dla klasy 5</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-2 md:p-4 font-sans pb-24">
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-sm sticky top-2 z-30 border border-slate-200">
          <button onClick={() => { playClick(); setGameState('menu'); }} className="text-slate-500 font-bold flex items-center hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 mr-1" /> Menu
          </button>
          <div className="flex gap-6">
             <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full"><Star className="fill-current w-5 h-5" /> {streak}</div>
             <div className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full"><Trophy className="w-5 h-5" /> {score}</div>
          </div>
        </div>

        {/* Notebook Container */}
        <div className="w-full max-w-4xl bg-white min-h-[70vh] rounded-[2rem] shadow-2xl p-6 md:p-12 md:pl-16 notebook-paper relative overflow-hidden border border-slate-200">
            
            {/* The Main Problem Header */}
            <div className="flex items-center justify-center gap-4 mb-10 border-b-2 border-slate-100 pb-8 relative z-10">
                <div className="absolute top-0 left-0 bg-slate-100 text-slate-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">Zadanie</div>
                <div className="flex items-center gap-4 scale-110 transform origin-center">
                    <FractionDisplay fraction={problem.left} size="lg" />
                    <span className="text-5xl text-indigo-400 font-black">
                        {problem.type === Operation.ADD ? '+' : problem.type === Operation.SUBTRACT ? '-' : problem.type === Operation.MULTIPLY ? '·' : problem.type === Operation.DIVIDE ? ':' : problem.type === Operation.COMPARE ? '?' : '→'}
                    </span>
                    {problem.right && <FractionDisplay fraction={problem.right} size="lg" />}
                </div>
            </div>

            {/* Solved Steps History */}
            <div className="relative z-10">
                {steps.slice(0, currentStepIndex).map((step, idx) => (
                    <div key={idx} className="animate-fade-in">{renderSolvedStep(step)}</div>
                ))}

                {/* Active Step */}
                {currentStepIndex < steps.length ? (
                    <div ref={scrollRef}>
                        {renderActiveStep(steps[currentStepIndex])}
                    </div>
                ) : (
                    /* Completion State */
                    <div className="flex flex-col items-center justify-center animate-fade-in mt-12 mb-8 bg-green-50/80 p-8 rounded-3xl border-2 border-green-100 backdrop-blur-sm">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce text-green-500">
                        <Trophy className="w-12 h-12 fill-current" />
                        </div>
                        <h2 className="text-3xl font-black text-green-700 mb-2">Świetna robota!</h2>
                        <p className="text-green-600 font-medium mb-8">Zadanie rozwiązane poprawnie.</p>
                        <button onClick={nextProblem} className="px-10 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-200 hover:scale-105 hover:bg-green-600 transition-all flex items-center gap-2">
                            Następne zadanie <ArrowLeft className="rotate-180 w-5 h-5"/>
                        </button>
                    </div>
                )}
            </div>

        </div>
      </div>
    );
  };

  if (gameState === 'menu') return renderMenu();
  if (gameState === 'tutorial') return <div className="min-h-screen bg-slate-50 p-4"><button onClick={() => setGameState('menu')} className="mb-4 text-slate-500 font-bold flex hover:text-indigo-600 transition-colors"><ArrowLeft className="mr-2"/> Powrót do menu</button><Tutorial operation={operation} onComplete={nextProblem} /></div>;
  return renderGame();
};

const MenuButton = ({ title, icon, color, onClick, className = '' }: any) => (
  <button onClick={() => { playClick(); onClick(); }} className={`${color} text-white p-6 rounded-3xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group border-b-4 border-black/10 ${className}`}>
    <div className="flex items-center gap-5"><div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">{icon}</div><span className="text-2xl font-bold tracking-tight">{title}</span></div>
  </button>
);

export default App;
