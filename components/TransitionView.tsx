
import React, { useEffect, useState } from 'react';
import { CourtLevel } from '../types';

interface TransitionViewProps {
  targetLevel: CourtLevel;
}

const TransitionView: React.FC<TransitionViewProps> = ({ targetLevel }) => {
  const [dots, setDots] = useState('.');

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
          title: "正在移交【中级狗民法院】",
          icon: "🏠",
          desc: "中级法官嗷呜～正在阅读您的上诉材料...",
          quote: "这家伙可比我难伺候多咯！——初级判官"
        };
      case CourtLevel.HIGH:
        return {
          title: "正在呈递【最高狗民法院】",
          icon: "🏛️",
          desc: "终审大法官汪呜～正在整理法槌...",
          quote: "最后一次机会，希望你们能听进去。——中级判官"
        };
      default:
        return { title: "开庭中", icon: "⚖️", desc: "...", quote: "" };
    }
  };

  const details = getDetails();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center text-white">
      <div className="relative w-full max-w-md h-32 mb-8 overflow-hidden">
        {/* Track */}
        <div className="absolute bottom-0 w-full h-1 bg-stone-800"></div>
        
        {/* Dog Animation */}
        <div className="absolute bottom-1 left-0 animate-[run_3s_linear_infinite] text-6xl">
          🐕 📂
        </div>
        
        {/* Destination */}
        <div className="absolute bottom-1 right-10 text-6xl">
           {details.icon}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-purple-400 mb-4 animate-pulse">
        {details.title}{dots}
      </h2>
      
      <p className="text-stone-400 mb-8">{details.desc}</p>

      <div className="bg-stone-900 border border-purple-900/50 p-4 rounded-xl max-w-xs text-center italic text-stone-500 text-sm">
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
