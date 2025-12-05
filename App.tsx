
import React, { useState, useEffect } from 'react';
import { AppState, CaseData, VerdictData, JudgePersona, HistoryItem, CourtLevel, AppealData, PublicCase } from './types';
import { getPuppyVerdict } from './services/geminiService';
import InputForm from './components/InputForm';
import VerdictResult from './components/VerdictResult';
import HistoryModal from './components/HistoryModal';
import AppealModal from './components/AppealModal';
import TransitionView from './components/TransitionView';
import TownSquare from './components/TownSquare';
import PublicCaseDetail from './components/PublicCaseDetail';
import { Logger } from './utils/logger';
import { ScrollText, Globe2 } from 'lucide-react';

const HISTORY_KEY = 'puppy_judge_history';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  // Default changed to TOXIC
  const [persona, setPersona] = useState<JudgePersona>(JudgePersona.TOXIC);
  
  // Square State
  const [selectedPublicCase, setSelectedPublicCase] = useState<PublicCase | null>(null);

  // Appeal & Transition State
  const [isAppealing, setIsAppealing] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<CourtLevel | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      Logger.error("Failed to load history from localStorage", e);
    }
  }, []);

  const saveToHistory = (caseData: CaseData, verdictData: VerdictData, usedPersona: JudgePersona) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      caseData,
      verdict: verdictData,
      persona: usedPersona
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      Logger.error("Failed to save history", e);
    }
  };

  const handleCaseSubmit = async (data: CaseData) => {
    setCurrentCase(data);
    setAppState(AppState.PROCESSING);
    
    try {
      // First submission is always Initial Court
      const result = await getPuppyVerdict(data, persona, CourtLevel.INITIAL);
      setVerdict(result);
      saveToHistory(data, result, persona);
      setAppState(AppState.RESULT);
    } catch (error) {
      Logger.error("Initial verdict generation failed", error);
      alert("判官去休息了，请稍后再试！");
      setAppState(AppState.INPUT);
    }
  };

  const handleAppealSubmit = async (appealData: AppealData) => {
    if (!currentCase || !verdict) return;
    
    setIsAppealing(false);
    
    // Determine next level
    const nextLevel = verdict.courtLevel === CourtLevel.INITIAL ? CourtLevel.INTERMEDIATE : CourtLevel.HIGH;
    
    setTransitionTarget(nextLevel);

    try {
      // Wait for animation (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = await getPuppyVerdict(currentCase, persona, nextLevel, appealData, verdict);
      setVerdict(result);
      setTransitionTarget(null);
    } catch (error) {
      setTransitionTarget(null);
      Logger.error("Appeal verdict failed", error);
      alert("上诉受理失败，请检查网络！");
    }
  };

  const handleReset = () => {
    setVerdict(null);
    setCurrentCase(null);
    setAppState(AppState.INPUT);
    setTransitionTarget(null);
    window.scrollTo(0, 0);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCurrentCase(item.caseData);
    setVerdict(item.verdict);
    setPersona(item.persona);
    setAppState(AppState.RESULT);
    setShowHistory(false);
  };

  const handleSquareClick = () => {
    setAppState(AppState.SQUARE);
    window.scrollTo(0, 0);
  };

  const handlePublicCaseClick = (pc: PublicCase) => {
    setSelectedPublicCase(pc);
    setAppState(AppState.SQUARE_DETAIL);
    window.scrollTo(0, 0);
  };

  // Dynamic Background
  // If in square mode, background might be neutral or based on current persona setting
  const bgColor = persona === JudgePersona.CUTE ? 'bg-[#FFF9E5]' : 'bg-[#1c1917]';
  const textColor = persona === JudgePersona.CUTE ? 'text-stone-800' : 'text-stone-200';
  const selectionColor = persona === JudgePersona.CUTE ? 'selection:bg-yellow-200' : 'selection:bg-purple-900 selection:text-white';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} font-sans ${selectionColor} transition-colors duration-500`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${
        persona === JudgePersona.CUTE 
          ? 'bg-[#FFF9E5]/80 border-yellow-100' 
          : 'bg-[#1c1917]/80 border-stone-800'
      }`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.INPUT)}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-500 ${
              persona === JudgePersona.CUTE ? 'bg-yellow-400' : 'bg-purple-600'
            }`}>
              <span className="text-2xl">{persona === JudgePersona.CUTE ? '🐶' : '😈'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight brand-font">
              {persona === JudgePersona.CUTE ? '小狗判官' : '毒舌判官'} 
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSquareClick}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${
                appState === AppState.SQUARE 
                  ? (persona === JudgePersona.CUTE ? 'bg-yellow-200 text-stone-800' : 'bg-purple-900 text-white')
                  : (persona === JudgePersona.CUTE ? 'hover:bg-yellow-100 text-stone-600' : 'hover:bg-stone-800 text-stone-400')
              }`}
            >
              <Globe2 className="w-5 h-5" /> 
              <span className="hidden sm:inline">广场</span>
            </button>

            <button 
              onClick={() => setShowHistory(true)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${
                persona === JudgePersona.CUTE 
                  ? 'hover:bg-yellow-100 text-stone-600' 
                  : 'hover:bg-stone-800 text-stone-400'
              }`}
            >
              <ScrollText className="w-5 h-5" /> 
              <span className="hidden sm:inline">卷宗</span>
            </button>
            {appState === AppState.RESULT && !transitionTarget && (
               <button 
                 onClick={handleReset} 
                 className={`text-sm font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-colors ${
                   persona === JudgePersona.CUTE 
                     ? 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                     : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                 }`}
               >
                 新案件
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {appState === AppState.INPUT && (
            <>
            <div className="text-center mb-10 space-y-3 animate-fade-in-down">
              <h2 className={`text-3xl md:text-4xl font-black leading-tight ${
                 persona === JudgePersona.CUTE ? 'text-stone-800' : 'text-white'
              }`}>
                {persona === JudgePersona.CUTE 
                  ? <>情侣吵架？<br className="md:hidden"/>让小狗判官来评评理！</>
                  : <>还在因为那点破事吵？<br className="md:hidden"/>让本判官骂醒你们！</>
                }
              </h2>
              <p className={`md:text-lg max-w-lg mx-auto ${
                 persona === JudgePersona.CUTE ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {persona === JudgePersona.CUTE 
                  ? "不要冷战，不要内耗。输入双方观点，本汪将给出最公正、最萌的裁决建议。"
                  : "别指望我哄人。输入你们那些矫情借口，本汪会用最扎心的实话戳破你们的幻想。"
                }
              </p>
            </div>
            <InputForm 
              onSubmit={handleCaseSubmit} 
              isLoading={false} 
              persona={persona} 
              setPersona={setPersona} 
            />
            </>
          )}

          {appState === AppState.PROCESSING && !transitionTarget && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="text-6xl mb-6 animate-bounce">
                {persona === JudgePersona.CUTE ? '🦴' : '🔥'}
              </div>
              <h3 className={`text-2xl font-bold ${
                persona === JudgePersona.CUTE ? 'text-stone-800' : 'text-white'
              }`}>
                正在研读案卷...
              </h3>
            </div>
          )}

          {/* Transition View */}
          {transitionTarget && (
            <TransitionView 
              targetLevel={transitionTarget} 
              persona={persona} 
            />
          )}

          {appState === AppState.RESULT && verdict && currentCase && !transitionTarget && (
            <VerdictResult 
              verdict={verdict} 
              caseData={currentCase} 
              onReset={handleReset} 
              onAppeal={() => setIsAppealing(true)}
              persona={persona}
            />
          )}

          {/* Town Square */}
          {appState === AppState.SQUARE && (
             <TownSquare 
               onCaseClick={handlePublicCaseClick}
               currentPersona={persona}
             />
          )}

          {/* Town Square Detail */}
          {appState === AppState.SQUARE_DETAIL && selectedPublicCase && (
             <PublicCaseDetail 
               publicCase={selectedPublicCase}
               onBack={() => setAppState(AppState.SQUARE)}
               currentPersona={persona}
             />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-500 text-sm opacity-60">
        <p>© 2024 Puppy Judge Project.</p>
      </footer>
      
      {/* Modals */}
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={loadHistoryItem}
        onDelete={() => {}} 
        persona={persona}
      />

      <AppealModal
        isOpen={isAppealing}
        onClose={() => setIsAppealing(false)}
        onSubmit={handleAppealSubmit}
        isHighCourt={verdict?.courtLevel === CourtLevel.INTERMEDIATE}
        persona={persona}
      />

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
