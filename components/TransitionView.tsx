import React, { useEffect, useState } from 'react';
import { CourtLevel, JudgePersona } from '../types';

interface TransitionViewProps {
  targetLevel: CourtLevel;
  persona: JudgePersona;
}

const TransitionView: React.FC<TransitionViewProps> = ({ targetLevel, persona }) => {
  const [dots, setDots] = useState('.');
  const isCute = persona === JudgePersona.CUTE;

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getDetails = () => {
    switch (targetLevel) {
      case CourtLevel.INTERMEDIATE:
        return {
          title: isCute ? "正在移交【中级暖心调解】" : "正在移交【中级狗民法院】",
          icon: "🏠",
          desc: isCute 
            ? "汪汪队长正在重新梳理大家的诉求..." 
            : "中级法官嗷呜～正在阅读您的上诉材料...",
          quote: isCute 
            ? "别急别急，让我再仔细听听～ ——初级小狗"
            : "这家伙可比我难伺候多咯！——初级判官"
        };
      case CourtLevel.HIGH:
        return {
          title: isCute ? "正在呈递【最高暖心裁决】" : "正在呈递【最高狗民法院】",
          icon: "🏛️",
          desc: isCute
            ? "终审大法官呜呜～正在准备最温暖的拥抱..."
            : "终审大法官汪呜～正在整理法槌...",
          quote: isCute
            ? "一定会有一个大家都满意的结果的！——中级小狗"
            : "最后一次机会，希望你们能听进去。——中级判官"
        };
      default:
        return { title: "开庭中", icon: "⚖️", desc: "...", quote: "" };
    }
  };

  const details = getDetails();

  const bgClass = isCute ? "bg-[#FFF9E5] text-stone-800" : "bg-stone-950 text-white";
  const titleClass = isCute ? "text-yellow-600" : "text-purple-400";
  const quoteClass = isCute ? "bg-white border-yellow-200 text-stone-500" : "bg-stone-900 border-purple-900/50 text-stone-500";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgClass}`}>
      <div className="relative w-full max-w-md h-32 mb-8 overflow-hidden">
        {/* Track */}
        <div className={`absolute bottom-0 w-full h-1 ${isCute ? 'bg-yellow-200' : 'bg-stone-800'}`}></div>
        
        {/* Dog Animation */}
        <div className="absolute bottom-1 left-0 animate-[run_3s_linear_infinite] text-6xl">
          🐕 📂
        </div>
        
        {/* Destination */}
        <div className="absolute bottom-1 right-10 text-6xl">
           {details.icon}
        </div>
      </div>

      <h2 className={`text-2xl font-bold mb-4 animate-pulse ${titleClass}`}>
        {details.title}{dots}
      </h2>
      
      <p className={`mb-8 ${isCute ? 'text-stone-500' : 'text-stone-400'}`}>{details.desc}</p>

      <div className={`border p-4 rounded-xl max-w-xs text-center italic text-sm ${quoteClass}`}>
        "{details.quote}"
      </div>
      
      <style>{`
        @keyframes run {
          0% { left: -20%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TransitionView;