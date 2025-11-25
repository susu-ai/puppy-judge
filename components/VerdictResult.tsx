import React, { useState, useRef, useEffect } from 'react';
import { VerdictData, CaseData, JudgePersona, CourtLevel } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Share2, RotateCcw, HeartHandshake, CheckCircle2, ThumbsUp, ThumbsDown, BrainCircuit, Flame, AlertTriangle, User, UserCheck, X, Copy, Download, Check, Gavel, Timer } from 'lucide-react';
import html2canvas from 'html2canvas';

interface VerdictResultProps {
  verdict: VerdictData;
  caseData: CaseData;
  onReset: () => void;
  onAppeal?: () => void; // Callback to trigger appeal
  persona: JudgePersona;
}

const VerdictResult: React.FC<VerdictResultProps> = ({ verdict, caseData, onReset, onAppeal, persona }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  // Timer for Appeal (15 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const shareCardRef = useRef<HTMLDivElement>(null);

  const isCute = persona === JudgePersona.CUTE;
  
  // Current Court Level
  const courtLevel = verdict.courtLevel || CourtLevel.INITIAL;
  
  // Enable appeal for both personas, as long as it's not the final court
  const canAppeal = courtLevel !== CourtLevel.HIGH && onAppeal;

  // Initialize Timer
  useEffect(() => {
    if (canAppeal && verdict.timestamp) {
      const appealWindow = 15 * 60 * 1000; // 15 mins
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = now - verdict.timestamp!;
        const remaining = Math.max(0, appealWindow - elapsed);
        setTimeLeft(remaining);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [verdict.timestamp, canAppeal]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const chartData = [
    { name: isCute ? '你的立场' : '你的槽点', value: verdict.userPercentage, color: isCute ? '#F472B6' : '#EC4899' },
    { name: isCute ? 'TA的立场' : 'TA的槽点', value: verdict.partnerPercentage, color: isCute ? '#60A5FA' : '#3B82F6' },
  ];

  const handleGenerateShare = async () => {
    if (!shareCardRef.current) return;
    setIsGeneratingCard(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: isCute ? '#FFF9E5' : '#0c0a09',
        height: shareCardRef.current.scrollHeight,
        windowHeight: shareCardRef.current.scrollHeight + 100
      });
      
      const image = canvas.toDataURL("image/png");
      setShareImage(image);
      setShareModalOpen(true);
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("卡片生成失败，请截屏分享吧！");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleCopyImage = async () => {
    if (!shareImage) return;
    try {
      const response = await fetch(shareImage);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy image", err);
      alert("复制失败，请尝试“保存图片”或长按图片保存。");
    }
  };

  const handleDownloadImage = () => {
    if (!shareImage) return;
    const link = document.createElement('a');
    link.href = shareImage;
    link.download = `${isCute ? '小狗' : '毒舌'}_裁决书_${new Date().getTime()}.png`;
    link.click();
  };

  // Theme Configs
  const cardBg = isCute ? "bg-white border-yellow-100" : "bg-stone-900 border-purple-900 text-stone-200";
  const headerBg = isCute ? "bg-yellow-50 border-yellow-100 text-stone-800" : "bg-stone-800 border-stone-700 text-purple-100";
  const sectionBg = isCute ? "bg-stone-50 border-stone-100" : "bg-stone-800/50 border-stone-700";
  const textColor = isCute ? "text-stone-800" : "text-stone-200";
  const subTextColor = isCute ? "text-stone-600" : "text-stone-400";

  // Logic for the Stamp
  const getStampData = () => {
    const diff = verdict.userPercentage - verdict.partnerPercentage;
    if (isCute) {
        if (diff > 10) return { text: '你更有理', color: 'text-pink-500 border-pink-500', rotate: '-rotate-12' };
        if (diff < -10) return { text: 'TA更有理', color: 'text-blue-500 border-blue-500', rotate: 'rotate-12' };
        return { text: '和平调解', color: 'text-yellow-600 border-yellow-600', rotate: 'rotate-0' };
    } else {
        // Toxic Mode logic
        if (diff > 10) return { text: '你太作', color: 'text-pink-500 border-pink-500', rotate: '-rotate-12' };
        if (diff < -10) return { text: 'TA太蠢', color: 'text-blue-500 border-blue-500', rotate: 'rotate-12' };
        return { text: '全员笨蛋', color: 'text-purple-500 border-purple-500', rotate: 'rotate-6' };
    }
  };

  const stamp = getStampData();
  
  // Show Short Advice: Always in Cute Mode, only in High Court for Toxic Mode
  const showShortAdvice = isCute || (courtLevel === CourtLevel.HIGH && verdict.shortAdvice && verdict.shortAdvice.length > 2);

  // Court Header Info
  const getCourtInfo = () => {
    switch (courtLevel) {
      case CourtLevel.INTERMEDIATE: return { name: isCute ? "中级暖心调解" : "中级狗民法院", icon: "🏠" };
      case CourtLevel.HIGH: return { name: isCute ? "最高暖心裁决" : "最高狗民法院", icon: "🏛️" };
      default: return { name: isCute ? "小狗调解室" : "初级狗民法院", icon: isCute ? "🦴" : "⛺" };
    }
  };
  const courtInfo = getCourtInfo();

  return (
    <div className="w-full max-w-3xl mx-auto p-4 pb-20 animate-fade-in-up">
      
      {/* Main Card */}
      <div className={`rounded-[2rem] shadow-xl overflow-hidden border-4 relative ${cardBg}`}>
        
        {/* Header / Opening */}
        <div className={`p-6 text-center border-b-2 relative ${headerBg}`}>
          <div className="absolute top-4 right-4 text-xs font-bold opacity-50 border px-2 py-1 rounded-full flex items-center gap-1">
            <span>{courtInfo.icon}</span> {courtInfo.name}
          </div>
          
          <div className="text-5xl mb-3 animate-bounce inline-block">{isCute ? '🐶' : '😈'}</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 leading-relaxed brand-font">
            {verdict.cuteOpening}
          </h2>
          <div className={`inline-block backdrop-blur-sm px-4 py-2 rounded-xl border mt-2 shadow-sm ${
            isCute ? 'bg-white/80 border-yellow-200' : 'bg-stone-900/80 border-purple-800'
          }`}>
            <span className={`text-sm font-bold ${isCute ? 'text-stone-600' : 'text-purple-300'}`}>
               {isCute ? '🔑 核心矛盾：' : '💣 矛盾根儿：'}{verdict.coreConflict}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8">

          {/* 1. Event Analysis */}
          <div className={`border-2 rounded-2xl p-6 shadow-sm relative overflow-hidden ${isCute ? 'bg-white border-stone-100' : 'bg-stone-800 border-stone-700'}`}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
                {isCute ? <BrainCircuit className="w-16 h-16 text-stone-400" /> : <Flame className="w-16 h-16 text-red-500" />}
             </div>
             <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 relative z-10 ${textColor}`}>
               <span className="text-xl">{isCute ? '🔍' : '🔥'}</span> 
               {isCute ? '事件还原 & 心理解析' : '事件戳穿 & 遮羞布粉碎'}
             </h3>
             <p className={`leading-relaxed text-justify relative z-10 ${subTextColor}`}>
               {verdict.eventAnalysis}
             </p>
          </div>
          
          {/* 2. Stance Chart */}
          <div>
             <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textColor}`}>
                <span className="text-xl">⚖️</span> {isCute ? '判官立场倾向' : '槽点与笨蛋占比'}
             </h3>
             <div className={`h-48 w-full rounded-2xl p-6 border ${sectionBg}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barSize={36}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: isCute ? '#57534e' : '#a8a29e', fontSize: 14, fontWeight: 700}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={{
                            borderRadius: '12px', 
                            border: 'none', 
                            backgroundColor: isCute ? '#fff' : '#292524',
                            color: isCute ? '#000' : '#fff',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }} 
                    />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 3. Detailed Analysis */}
          <div>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textColor}`}>
              <span className="text-xl">🎯</span> {isCute ? '核心矛盾 & 诉求拆解' : '矛盾扎心点 & 槽点清单'}
            </h3>
            <div className={`rounded-2xl p-6 space-y-4 border ${sectionBg}`}>
              {verdict.analysisPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 hover:bg-black/5 rounded-lg transition-colors duration-300">
                  <div className="mt-1 shrink-0">
                    {idx === 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCute ? 'bg-yellow-100 text-yellow-700' : 'bg-red-900 text-red-200'}`}>{isCute ? '焦点' : '致命'}</span>}
                    {idx === 1 && <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCute ? 'bg-pink-100 text-pink-600' : 'bg-pink-900 text-pink-200'}`}>你</span>}
                    {idx === 2 && <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCute ? 'bg-blue-100 text-blue-600' : 'bg-blue-900 text-blue-200'}`}>TA</span>}
                  </div>
                  <p className={`leading-relaxed text-sm md:text-base ${isCute ? 'text-stone-700' : 'text-stone-300'}`}>{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Solutions */}
          <div className={`grid grid-cols-1 ${showShortAdvice ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-5`}>
             {/* Short Term */}
             {showShortAdvice && (
                <div className={`p-6 rounded-3xl border-2 relative overflow-hidden ${isCute ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-[#14532d]/20 border-green-900'}`}>
                    <div className={`absolute -right-4 -top-4 text-6xl opacity-10 ${isCute ? 'text-green-500' : 'text-green-400'}`}>💡</div>
                    <h4 className={`font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 ${isCute ? 'text-green-800' : 'text-green-400'}`}>
                    {isCute ? '⚡ 1-2天内行动' : (courtLevel === CourtLevel.HIGH ? '🚨 强制执行指令' : '⚡ 当下止损招')}
                    </h4>
                    <p className={`font-bold text-lg leading-snug ${isCute ? 'text-green-900' : 'text-green-100'}`}>"{verdict.shortAdvice}"</p>
                </div>
             )}

             {/* Long Term */}
             <div className={`p-6 rounded-3xl border-2 relative overflow-hidden ${isCute ? 'bg-[#FAF5FF] border-[#F3E8FF]' : 'bg-[#3b0764]/20 border-purple-900'}`}>
                <div className={`absolute -right-4 -top-4 text-6xl opacity-10 ${isCute ? 'text-purple-500' : 'text-purple-400'}`}>🌱</div>
                <h4 className={`font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 ${isCute ? 'text-purple-800' : 'text-purple-400'}`}>
                   {isCute ? '💬 长期沟通习惯' : '🚫 别再犯蠢指南'}
                </h4>
                <p className={`text-sm leading-relaxed font-medium ${isCute ? 'text-purple-900' : 'text-purple-100'}`}>{verdict.longAdvice}</p>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex flex-col md:flex-row gap-4 items-center justify-between ${
           isCute ? 'bg-stone-50 border-stone-100' : 'bg-stone-800 border-stone-700'
        }`}>
           <button 
             onClick={onReset}
             className={`w-full md:w-auto flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl transition-colors ${
                isCute 
                ? 'text-stone-500 hover:text-stone-800 hover:bg-stone-200' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700'
             }`}
           >
             <RotateCcw className="w-4 h-4" /> 重判
           </button>
           
           <div className="flex w-full md:w-auto gap-3">
             {canAppeal && (
               <button
                 onClick={timeLeft > 0 ? onAppeal : undefined}
                 disabled={timeLeft === 0}
                 className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${
                   timeLeft > 0 
                     ? (isCute ? 'bg-white text-stone-700 border-yellow-300 hover:bg-yellow-50' : 'bg-stone-900 text-purple-400 border-purple-600/50 hover:bg-stone-800')
                     : 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed opacity-70'
                 }`}
               >
                 <Gavel className="w-4 h-4" />
                 {timeLeft > 0 ? (
                   <span>我要上诉 ({formatTime(timeLeft)})</span>
                 ) : (
                   <span>上诉已超时</span>
                 )}
               </button>
             )}

             <button 
               onClick={handleGenerateShare}
               disabled={isGeneratingCard}
               className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait ${
                  isCute
                  ? 'bg-yellow-400 text-stone-900 hover:bg-yellow-500'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
               }`}
             >
               {isGeneratingCard ? <span className="animate-spin">⏳</span> : <Share2 className="w-4 h-4" />}
               {isGeneratingCard ? "生成中..." : "保存卡片"}
             </button>
           </div>
        </div>
      </div>

      {/* Share Preview Modal */}
      {shareModalOpen && shareImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
          <div className={`w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] ${
            isCute ? 'bg-white' : 'bg-stone-900 border border-stone-700'
          }`}>
             {/* Header */}
             <div className={`p-4 flex items-center justify-between border-b ${isCute ? 'border-stone-100' : 'border-stone-800'}`}>
                <h3 className={`font-bold ${isCute ? 'text-stone-800' : 'text-stone-200'}`}>卡片预览</h3>
                <button 
                  onClick={() => setShareModalOpen(false)}
                  className={`p-2 rounded-full ${isCute ? 'hover:bg-stone-100 text-stone-500' : 'hover:bg-stone-800 text-stone-400'}`}
                >
                  <X className="w-5 h-5" />
                </button>
             </div>
             {/* Image */}
             <div className={`flex-1 overflow-y-auto p-4 flex justify-center ${isCute ? 'bg-stone-100' : 'bg-black'}`}>
                <img src={shareImage} alt="Verdict Card" className="rounded-xl shadow-lg max-w-full h-auto object-contain" />
             </div>
             {/* Actions */}
             <div className={`p-4 flex flex-col gap-3 border-t ${isCute ? 'border-stone-100 bg-white' : 'border-stone-800 bg-stone-900'}`}>
                <button
                  onClick={handleCopyImage}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    copySuccess 
                     ? (isCute ? 'bg-green-500 text-white' : 'bg-green-600 text-white')
                     : (isCute ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-stone-800 text-stone-300 hover:bg-stone-700')
                  }`}
                >
                   {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   {copySuccess ? "已复制到剪贴板" : "复制图片"}
                </button>
                <button
                  onClick={handleDownloadImage}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    isCute ? 'bg-yellow-400 text-stone-900 hover:bg-yellow-500' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                   <Download className="w-4 h-4" /> 保存到本地
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Hidden Share Card Template */}
      <div 
        ref={shareCardRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '600px' }}
        className={`p-8 ${isCute ? 'bg-[#FFF9E5] text-stone-800' : 'bg-[#0c0a09] text-stone-200'}`}
      >
        <div className={`rounded-[2rem] shadow-none border-4 p-8 relative flex flex-col ${
            isCute ? 'bg-white border-yellow-400' : 'bg-[#1c1917] border-purple-600'
        }`}>
           
           <div className={`absolute top-8 right-8 w-32 h-32 border-4 rounded-full flex items-center justify-center opacity-30 pointer-events-none select-none z-0 transform ${stamp.rotate} ${stamp.color}`}>
              <div className="w-28 h-28 border-2 border-current rounded-full flex items-center justify-center border-dashed">
                 <span className="text-2xl font-black">{stamp.text}</span>
              </div>
           </div>

           <div className="text-center mb-6 relative z-10">
             <div className="text-6xl mb-2">{isCute ? '🐶' : '😈'}</div>
             <h1 className={`text-3xl font-black tracking-tight brand-font ${isCute ? 'text-stone-800' : 'text-purple-100'}`}>
                {isCute ? '小狗判官裁决书' : '毒舌判官处刑书'}
             </h1>
             <div className="flex justify-center mt-2">
               <span className="text-xs px-2 py-0.5 border rounded opacity-60">
                 {courtInfo.name}
               </span>
             </div>
           </div>

           <div className={`h-0.5 w-full mb-6 mx-auto relative z-10 ${isCute ? 'bg-yellow-100' : 'bg-purple-900'}`}></div>

           <div className={`mb-6 p-5 rounded-xl border relative z-10 ${isCute ? 'bg-stone-50 border-stone-100' : 'bg-stone-900 border-stone-800'}`}>
             <h3 className={`font-bold text-xs uppercase mb-2 flex items-center gap-1 ${isCute ? 'text-stone-500' : 'text-stone-400'}`}>
                {isCute ? '案件背景' : '罪证回放'}
             </h3>
             <p className={`text-sm whitespace-pre-wrap leading-relaxed italic ${isCute ? 'text-stone-700' : 'text-stone-300'}`}>
               "{caseData.background}"
             </p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className={`p-4 rounded-xl border ${isCute ? 'bg-pink-50 border-pink-100' : 'bg-pink-900/10 border-pink-900/30'}`}>
                 <h4 className="text-xs font-bold text-pink-500 mb-1">你的观点</h4>
                 <p className={`text-xs ${isCute ? 'text-stone-600' : 'text-stone-400'}`}>{verdict.userSideSummary || "（未提供）"}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isCute ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-900/30'}`}>
                 <h4 className="text-xs font-bold text-blue-500 mb-1">TA的观点</h4>
                 <p className={`text-xs ${isCute ? 'text-stone-600' : 'text-stone-400'}`}>{verdict.partnerSideSummary || "（未提供）"}</p>
              </div>
           </div>

           <div className="mb-6 relative z-10">
             <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${isCute ? 'text-stone-800' : 'text-stone-200'}`}>
               {isCute ? <BrainCircuit className="w-5 h-5 text-yellow-500" /> : <Flame className="w-5 h-5 text-red-500" />}
               {isCute ? '事件还原 & 心理解析' : '事件戳穿 & 遮羞布粉碎'}
             </h3>
             <p className={`text-sm leading-relaxed text-justify border p-3 rounded-lg ${
                 isCute ? 'bg-white border-stone-100 text-stone-700' : 'bg-stone-800 border-stone-700 text-stone-300'
             }`}>
               {verdict.eventAnalysis}
             </p>
           </div>

           <div className="mb-8 relative z-10">
             <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${isCute ? 'text-stone-800' : 'text-stone-200'}`}>
                <span className="text-xl">⚖️</span> {isCute ? '判官立场倾向' : '槽点与笨蛋占比'}
             </h3>
             <div className={`flex justify-between text-xs font-bold mb-1 ${isCute ? 'text-stone-500' : 'text-stone-400'}`}>
                <span>你 {verdict.userPercentage}%</span>
                <span>TA {verdict.partnerPercentage}%</span>
             </div>
             <div className={`w-full h-5 rounded-full overflow-hidden flex shadow-inner ${isCute ? 'bg-stone-100' : 'bg-stone-900'}`}>
               <div style={{width: `${verdict.userPercentage}%`}} className={`h-full ${isCute ? 'bg-pink-400' : 'bg-pink-600'}`}></div>
               <div style={{width: `${verdict.partnerPercentage}%`}} className={`h-full ${isCute ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
             </div>
           </div>

           <div className="space-y-4 relative z-10">
             {showShortAdvice && (
                <div className={`p-5 rounded-2xl border ${
                    isCute ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-[#14532d]/20 border-green-900'
                }`}>
                    <h4 className={`font-bold text-xs mb-2 ${isCute ? 'text-green-800' : 'text-green-400'}`}>
                        {isCute ? '⚡ 1-2天内行动' : (courtLevel === CourtLevel.HIGH ? '🚨 强制执行指令' : '⚡ 当下止损招')}
                    </h4>
                    <p className={`font-bold text-lg ${isCute ? 'text-green-900' : 'text-green-100'}`}>"{verdict.shortAdvice}"</p>
                </div>
             )}
             <div className={`p-5 rounded-2xl border ${
                    isCute ? 'bg-[#FAF5FF] border-[#F3E8FF]' : 'bg-[#3b0764]/20 border-purple-900'
                }`}>
                    <h4 className={`font-bold text-xs mb-2 ${isCute ? 'text-purple-800' : 'text-purple-400'}`}>
                        {isCute ? '💬 长期沟通习惯' : '🚫 别再犯蠢指南'}
                    </h4>
                    <p className={`text-sm font-medium ${isCute ? 'text-purple-900' : 'text-purple-100'}`}>{verdict.longAdvice}</p>
             </div>
           </div>

           <div className={`text-center mt-8 pt-6 border-t border-dashed relative z-10 ${isCute ? 'border-stone-200' : 'border-stone-800'}`}>
             <p className={`text-xs ${isCute ? 'text-stone-400' : 'text-stone-500'}`}>扫码找{isCute ? '小狗' : '毒舌'}判官评理</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictResult;