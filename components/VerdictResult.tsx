import React, { useState } from 'react';
import { VerdictData } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Share2, RotateCcw, HeartHandshake, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface VerdictResultProps {
  verdict: VerdictData;
  onReset: () => void;
}

const VerdictResult: React.FC<VerdictResultProps> = ({ verdict, onReset }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);

  const chartData = [
    { name: '女方立场', value: verdict.herPercentage, color: '#F472B6' }, // Pink-400
    { name: '男方立场', value: verdict.hisPercentage, color: '#60A5FA' }, // Blue-400
  ];

  const comfortingMessages = [
    "情侣吵架很正常，解决问题才最重要～",
    "赢了道理输了感情，可不划算哦！",
    "抱一下吧，没有什么是一个拥抱解决不了的。",
    "爱情需要磨合，今天的争吵是为了明天的默契。",
    "本汪觉得，你们都很在乎对方呢。"
  ];
  
  // Randomly select a message on mount (conceptually, here just picking one based on length for randomness-ish)
  const randomMessage = comfortingMessages[Math.floor(Math.random() * comfortingMessages.length)];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 pb-20 animate-fade-in-up">
      {/* Main Card */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-yellow-100">
        
        {/* Header / Opening */}
        <div className="bg-yellow-50 p-6 text-center border-b-2 border-yellow-100 relative">
          <div className="text-5xl mb-3 animate-bounce inline-block">🐶</div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-2 leading-relaxed">
            {verdict.cuteOpening}
          </h2>
          <div className="inline-block bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-200 mt-2 shadow-sm">
            <span className="text-stone-600 text-sm font-bold">🔑 核心矛盾：{verdict.coreConflict}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Stance Chart */}
          <div>
             <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚖️</span> 判官立场倾向
             </h3>
             <div className="h-48 w-full bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barSize={36}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: '#57534e', fontSize: 14, fontWeight: 700}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <p className="text-xs text-stone-400 text-center mt-2 italic">
               * 基于逻辑合理性、情感需求匹配度及沟通方式的综合评分
             </p>
          </div>

          {/* Detailed Analysis */}
          <div>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🧐</span> 判官详细分析
            </h3>
            <div className="bg-stone-50 rounded-2xl p-6 space-y-4 border border-stone-100">
              {verdict.analysisPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 hover:bg-white rounded-lg transition-colors duration-300">
                  <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <p className="text-stone-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {/* Short Term */}
             <div className="bg-[#F0FDF4] p-6 rounded-3xl border-2 border-[#DCFCE7] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10 text-green-500">💡</div>
                <h4 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                   ⚡ 短期行动
                </h4>
                <p className="text-green-900 font-bold text-lg leading-snug">"{verdict.shortAdvice}"</p>
             </div>
             {/* Long Term */}
             <div className="bg-[#FAF5FF] p-6 rounded-3xl border-2 border-[#F3E8FF] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10 text-purple-500">🌱</div>
                <h4 className="font-bold text-purple-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                   💬 长期沟通
                </h4>
                <p className="text-purple-900 text-sm leading-relaxed font-medium">{verdict.longAdvice}</p>
             </div>
          </div>

          {/* Feedback Section (PJO-007) */}
          {!feedbackGiven ? (
            <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-3">
              <p className="text-xs text-stone-400 font-medium">本次裁决是否合理？</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFeedbackGiven(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> 甚至有点准
                </button>
                <button 
                  onClick={() => setFeedbackGiven(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" /> 胡说八道
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center pt-4 pb-2 text-xs text-stone-400 animate-fade-in-up">
              感谢反馈！小狗判官正在持续学习人类复杂的感情... 🦴
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <button 
             onClick={onReset}
             className="w-full md:w-auto flex items-center justify-center gap-2 text-stone-500 hover:text-stone-800 font-bold px-6 py-3 rounded-xl hover:bg-stone-200 transition-colors"
           >
             <RotateCcw className="w-4 h-4" /> 再判一个
           </button>
           
           <button 
             onClick={() => alert("生成精美分享卡片功能正在开发中...敬请期待！")}
             className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1c1917] text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-700 transition-all shadow-lg hover:-translate-y-1 active:translate-y-0"
           >
             <Share2 className="w-4 h-4" /> 分享结果给TA
           </button>
        </div>
      </div>

      {/* Comforting Footer (PJO-008) */}
      <div className="mt-8 text-center text-stone-400 text-sm animate-pulse">
        <HeartHandshake className="w-4 h-4 inline mr-1" />
        {randomMessage}
      </div>
    </div>
  );
};

export default VerdictResult;