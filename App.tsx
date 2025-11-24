import React, { useState } from 'react';
import { AppState, CaseData, VerdictData } from './types';
import { getPuppyVerdict } from './services/geminiService';
import InputForm from './components/InputForm';
import VerdictResult from './components/VerdictResult';
import { Gavel } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);

  const handleCaseSubmit = async (data: CaseData) => {
    setAppState(AppState.PROCESSING);
    try {
      const result = await getPuppyVerdict(data);
      setVerdict(result);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      alert("小狗判官去吃骨头了，请检查API Key或稍后再试！(API Error)");
      setAppState(AppState.INPUT);
    }
  };

  const handleReset = () => {
    setVerdict(null);
    setAppState(AppState.INPUT);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#FFF9E5] text-stone-800 font-sans selection:bg-yellow-200">
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FFF9E5]/80 border-b border-yellow-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl">🐶</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-stone-800 brand-font">
              小狗判官 <span className="text-stone-400 font-normal text-sm ml-1">Puppy Judge</span>
            </h1>
          </div>
          {appState === AppState.RESULT && (
             <button 
               onClick={handleReset} 
               className="text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm hover:bg-stone-50 text-stone-600"
             >
               新案件
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section (Only show on input) */}
          {appState === AppState.INPUT && (
            <div className="text-center mb-10 space-y-3 animate-fade-in-down">
              <h2 className="text-3xl md:text-4xl font-black text-stone-800 leading-tight">
                情侣吵架？<br className="md:hidden"/>让小狗判官来评评理！
              </h2>
              <p className="text-stone-500 md:text-lg max-w-lg mx-auto">
                不要冷战，不要内耗。输入双方观点，本汪将给出最公正、最萌的裁决建议。
                <span className="block mt-2 text-xs text-stone-400 bg-white/50 py-1 rounded-full mx-auto w-fit px-3">
                  100% 中立 · 100% 可爱 · AI 智能分析
                </span>
              </p>
            </div>
          )}

          {/* Conditional Rendering */}
          {appState === AppState.INPUT && (
            <InputForm onSubmit={handleCaseSubmit} isLoading={false} />
          )}

          {appState === AppState.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="text-6xl mb-6 animate-bounce">🦴</div>
              <h3 className="text-2xl font-bold text-stone-800">正在研读案卷...</h3>
              <p className="text-stone-500 mt-2">小狗判官正在思考双方的情绪诉求</p>
              <div className="w-64 h-2 bg-stone-200 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-yellow-400 animate-[progress_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
              </div>
            </div>
          )}

          {appState === AppState.RESULT && verdict && (
            <VerdictResult verdict={verdict} onReset={handleReset} />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-400 text-sm">
        <p>© 2024 Puppy Judge Project. Powered by Gemini 2.5 Flash.</p>
        <p className="mt-1 text-xs">结果仅供参考，真爱需要沟通。</p>
      </footer>
      
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