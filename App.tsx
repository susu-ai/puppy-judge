
import React, { useState, useEffect } from 'react';
import { AppState, CaseData, VerdictData, JudgePersona, HistoryItem } from './types';
import { getPuppyVerdict } from './services/geminiService';
import InputForm from './components/InputForm';
import VerdictResult from './components/VerdictResult';
import HistoryModal from './components/HistoryModal';
import { Logger } from './utils/logger';
import { ScrollText, Download } from 'lucide-react';

const HISTORY_KEY = 'puppy_judge_history';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [persona, setPersona] = useState<JudgePersona>(JudgePersona.CUTE);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load History on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      Logger.error("Failed to load history from localStorage", e);
    }
    
    Logger.info("App mounted, history loaded", { count: history.length });
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
      Logger.info("History saved", { id: newItem.id });
    } catch (e) {
      Logger.error("Failed to save history to localStorage", e);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    Logger.info("History item deleted", { id });
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCurrentCase(item.caseData);
    setVerdict(item.verdict);
    setPersona(item.persona); // Switch to the persona used for that case
    setAppState(AppState.RESULT);
    setShowHistory(false);
    Logger.info("History item loaded", { id: item.id });
  };

  const handleCaseSubmit = async (data: CaseData) => {
    setCurrentCase(data);
    setAppState(AppState.PROCESSING);
    Logger.info("Form submitted", data);

    try {
      const result = await getPuppyVerdict(data, persona);
      setVerdict(result);
      saveToHistory(data, result, persona);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      Logger.error("Verdict generation failed", error);
      alert(persona === JudgePersona.CUTE 
        ? "小狗判官去吃骨头了，请检查API Key或稍后再试！(API Error)"
        : "本判官懒得理你，网络出问题了，自己检查去！(API Error)"
      );
      setAppState(AppState.INPUT);
    }
  };

  const handleReset = () => {
    setVerdict(null);
    setCurrentCase(null);
    setAppState(AppState.INPUT);
    window.scrollTo(0, 0);
    Logger.info("App reset to input state");
  };

  // Dynamic Background based on Persona
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
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-500 ${
              persona === JudgePersona.CUTE ? 'bg-yellow-400' : 'bg-purple-600'
            }`}>
              <span className="text-2xl">{persona === JudgePersona.CUTE ? '🐶' : '😈'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight brand-font">
              {persona === JudgePersona.CUTE ? '小狗判官' : '毒舌判官'} 
              <span className={`font-normal text-sm ml-1 ${
                persona === JudgePersona.CUTE ? 'text-stone-400' : 'text-stone-500'
              }`}>
                Puppy Judge
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${
                persona === JudgePersona.CUTE 
                  ? 'hover:bg-yellow-100 text-stone-600' 
                  : 'hover:bg-stone-800 text-stone-400'
              }`}
              title="查看历史记录"
            >
              <ScrollText className="w-5 h-5" /> 
              <span className="hidden sm:inline">卷宗</span>
            </button>

            {appState === AppState.RESULT && (
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
          
          {/* Hero Section (Only show on input) */}
          {appState === AppState.INPUT && (
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
                <span className={`block mt-2 text-xs py-1 rounded-full mx-auto w-fit px-3 transition-colors duration-500 ${
                   persona === JudgePersona.CUTE 
                    ? 'text-stone-400 bg-white/50' 
                    : 'text-purple-300 bg-purple-900/30 border border-purple-900/50'
                }`}>
                  {persona === JudgePersona.CUTE 
                    ? "100% 中立 · 100% 可爱 · AI 智能分析" 
                    : "100% 毒舌 · 0% 废话 · 专治恋爱脑"
                  }
                </span>
              </p>
            </div>
          )}

          {/* Conditional Rendering */}
          {appState === AppState.INPUT && (
            <InputForm 
              onSubmit={handleCaseSubmit} 
              isLoading={false} 
              persona={persona} 
              setPersona={setPersona} 
            />
          )}

          {appState === AppState.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="text-6xl mb-6 animate-bounce">
                {persona === JudgePersona.CUTE ? '🦴' : '🔥'}
              </div>
              <h3 className={`text-2xl font-bold ${
                persona === JudgePersona.CUTE ? 'text-stone-800' : 'text-white'
              }`}>
                {persona === JudgePersona.CUTE ? '正在研读案卷...' : '正在准备审判...'}
              </h3>
              <p className={`mt-2 ${
                persona === JudgePersona.CUTE ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {persona === JudgePersona.CUTE ? '小狗判官正在思考双方的情绪诉求' : '正在寻找你们逻辑里的漏洞'}
              </p>
              <div className={`w-64 h-2 rounded-full mt-8 overflow-hidden ${
                persona === JudgePersona.CUTE ? 'bg-stone-200' : 'bg-stone-800'
              }`}>
                <div className={`h-full animate-[progress_2s_ease-in-out_infinite] ${
                   persona === JudgePersona.CUTE ? 'bg-yellow-400' : 'bg-purple-600'
                }`} style={{width: '50%'}}></div>
              </div>
            </div>
          )}

          {appState === AppState.RESULT && verdict && currentCase && (
            <VerdictResult 
              verdict={verdict} 
              caseData={currentCase} 
              onReset={handleReset} 
              persona={persona}
            />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-500 text-sm opacity-60">
        <p>© 2024 Puppy Judge Project. Powered by Gemini 2.5 Flash.</p>
        <p className="mt-1 text-xs">
          {persona === JudgePersona.CUTE ? "结果仅供参考，真爱需要沟通。" : "骂归骂，日子还得过，自己看着办。"}
        </p>
        <button 
          onClick={() => Logger.downloadLogs()}
          className="mt-4 flex items-center justify-center gap-1 mx-auto text-[10px] hover:text-stone-800 transition-colors"
        >
          <Download className="w-3 h-3" /> 下载调试日志
        </button>
      </footer>
      
      {/* History Modal */}
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={loadHistoryItem}
        onDelete={deleteHistoryItem}
        persona={persona}
      />

      {/* Global CSS for custom animations */}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
