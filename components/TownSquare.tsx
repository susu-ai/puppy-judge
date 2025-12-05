
import React, { useState, useEffect } from 'react';
import { PublicCase, JudgePersona, SquareSortType } from '../types';
import { TownSquareService } from '../services/townSquareService';
import { Flame, Clock, Heart, MessageSquare, Eye } from 'lucide-react';

interface TownSquareProps {
  onCaseClick: (caseData: PublicCase) => void;
  currentPersona: JudgePersona;
}

const TownSquare: React.FC<TownSquareProps> = ({ onCaseClick, currentPersona }) => {
  const [cases, setCases] = useState<PublicCase[]>([]);
  const [sortType, setSortType] = useState<SquareSortType>(SquareSortType.NEWEST);
  const [filterPersona, setFilterPersona] = useState<JudgePersona | 'ALL'>('ALL');

  useEffect(() => {
    const data = TownSquareService.getCases(sortType);
    setCases(data);
  }, [sortType]);

  const filteredCases = cases.filter(c => filterPersona === 'ALL' || c.persona === filterPersona);

  const isCute = currentPersona === JudgePersona.CUTE;
  
  // Dynamic Styles
  const pageBg = isCute ? "bg-[#FFF9E5]" : "bg-[#1c1917]";
  const textColor = isCute ? "text-stone-800" : "text-stone-200";
  const activeTabClass = isCute ? "bg-yellow-400 text-stone-900" : "bg-purple-600 text-white";
  const inactiveTabClass = isCute ? "bg-white text-stone-500 hover:bg-yellow-50" : "bg-stone-800 text-stone-400 hover:bg-stone-700";

  return (
    <div className={`w-full max-w-5xl mx-auto p-4 pb-20 animate-fade-in-up`}>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Sort Tabs */}
        <div className={`p-1 rounded-xl flex gap-1 ${isCute ? 'bg-white shadow-sm' : 'bg-stone-800'}`}>
          <button 
            onClick={() => setSortType(SquareSortType.NEWEST)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${sortType === SquareSortType.NEWEST ? activeTabClass : 'text-stone-500'}`}
          >
            <Clock className="w-4 h-4" /> 最新案件
          </button>
          <button 
            onClick={() => setSortType(SquareSortType.HOTTEST)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${sortType === SquareSortType.HOTTEST ? activeTabClass : 'text-stone-500'}`}
          >
            <Flame className="w-4 h-4" /> 热门吃瓜
          </button>
        </div>

        {/* Persona Filter */}
        <div className="flex gap-2">
           <button onClick={() => setFilterPersona('ALL')} className={`px-3 py-1 text-xs rounded-full border ${filterPersona === 'ALL' ? (isCute ? 'bg-stone-800 text-white' : 'bg-white text-black') : 'opacity-50 border-current'}`}>全部</button>
           <button onClick={() => setFilterPersona(JudgePersona.CUTE)} className={`px-3 py-1 text-xs rounded-full border ${filterPersona === JudgePersona.CUTE ? 'bg-yellow-400 text-black border-yellow-400' : 'text-yellow-600 border-yellow-600'}`}>只看暖心</button>
           <button onClick={() => setFilterPersona(JudgePersona.TOXIC)} className={`px-3 py-1 text-xs rounded-full border ${filterPersona === JudgePersona.TOXIC ? 'bg-purple-600 text-white border-purple-600' : 'text-purple-400 border-purple-400'}`}>只看毒舌</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => {
          const isCaseCute = c.persona === JudgePersona.CUTE;
          const cardBg = isCaseCute ? "bg-white border-yellow-100" : "bg-stone-900 border-purple-900";
          const titleColor = isCaseCute ? "text-stone-800" : "text-stone-200";
          
          return (
            <div 
              key={c.id}
              onClick={() => onCaseClick(c)}
              className={`rounded-2xl p-5 border-2 shadow-sm hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 relative group overflow-hidden ${cardBg}`}
            >
              {/* Persona Badge */}
              <div className="absolute top-4 right-4 text-2xl opacity-80">
                 {isCaseCute ? '🐶' : '😈'}
              </div>

              {/* Timestamp */}
              <div className={`text-xs mb-3 font-medium ${isCaseCute ? 'text-stone-400' : 'text-stone-500'}`}>
                {new Date(c.timestamp).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}
              </div>

              {/* Content Summary */}
              <h3 className={`font-bold text-lg mb-2 line-clamp-2 leading-snug ${titleColor}`}>
                {c.caseData.background}
              </h3>
              
              <div className={`text-xs p-2 rounded-lg mb-4 line-clamp-1 ${
                isCaseCute ? 'bg-yellow-50 text-stone-600' : 'bg-purple-900/20 text-purple-300'
              }`}>
                判决: {c.verdict.coreConflict}
              </div>

              {/* Footer Stats */}
              <div className={`flex items-center justify-between text-xs font-bold pt-3 border-t ${
                isCaseCute ? 'border-stone-100 text-stone-400' : 'border-stone-800 text-stone-500'
              }`}>
                <div className="flex gap-3">
                   <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {c.views}</span>
                   <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {c.comments.length}</span>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                   <Heart className="w-3 h-3" /> {c.communityVotes.user + c.communityVotes.partner}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredCases.length === 0 && (
         <div className="text-center py-20 opacity-50">
            <p>还没有相关的案件哦，快去发布第一个吧！</p>
         </div>
      )}
    </div>
  );
};

export default TownSquare;
