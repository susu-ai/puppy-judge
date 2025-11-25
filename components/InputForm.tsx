import React, { useState } from 'react';
import { CaseData, JudgePersona } from '../types';
import { Sparkles, MessageCircleHeart, ScrollText, ShieldCheck, Heart, Zap, Skull, User, UserCheck } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: CaseData) => void;
  isLoading: boolean;
  persona: JudgePersona;
  setPersona: (p: JudgePersona) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, persona, setPersona }) => {
  const [formData, setFormData] = useState<CaseData>({
    background: '',
    userSide: '',
    partnerSide: ''
  });

  const isCute = persona === JudgePersona.CUTE;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.background.trim()) return;
    onSubmit(formData);
  };

  // Only background is strictly required now
  const isFormValid = formData.background.trim().length > 0;

  // Theme Configs
  const cardClass = isCute 
    ? "bg-white border-yellow-100 shadow-xl" 
    : "bg-stone-900 border-purple-900 shadow-purple-900/20";
  
  const labelClass = isCute ? "text-stone-700" : "text-stone-300";
  const inputBgClass = isCute 
    ? "bg-stone-50 border-stone-100 text-stone-700 focus:border-yellow-400 placeholder:text-stone-400" 
    : "bg-stone-800 border-stone-700 text-stone-200 focus:border-purple-500 placeholder:text-stone-600";
  
  const userLabelColor = isCute ? "text-pink-500" : "text-pink-400";
  const userInputClass = isCute
    ? "bg-pink-50 border-pink-100 text-stone-700 focus:border-pink-300 placeholder:text-pink-300/70"
    : "bg-[#2a1b24] border-pink-900/50 text-pink-100 focus:border-pink-700 placeholder:text-pink-800";

  const partnerLabelColor = isCute ? "text-blue-500" : "text-blue-400";
  const partnerInputClass = isCute
    ? "bg-blue-50 border-blue-100 text-stone-700 focus:border-blue-300 placeholder:text-blue-300/70"
    : "bg-[#1b222a] border-blue-900/50 text-blue-100 focus:border-blue-700 placeholder:text-blue-800";

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in-up">
      
      {/* Persona Toggle */}
      <div className="flex justify-center mb-6">
        <div className={`p-1 rounded-full flex gap-1 transition-colors duration-300 ${isCute ? 'bg-white border border-yellow-100 shadow-sm' : 'bg-stone-800 border border-stone-700'}`}>
          <button
            onClick={() => setPersona(JudgePersona.CUTE)}
            className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
              isCute 
                ? 'bg-yellow-400 text-stone-900 shadow-sm' 
                : 'text-stone-500 hover:text-stone-400'
            }`}
          >
            <span>🐶</span> 暖心小狗
          </button>
          <button
            onClick={() => setPersona(JudgePersona.TOXIC)}
            className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
              !isCute 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            <span>😈</span> 毒舌小狗
          </button>
        </div>
      </div>

      <div className={`rounded-[2rem] p-6 md:p-8 border-4 relative overflow-hidden transition-colors duration-500 ${cardClass}`}>
        
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 text-9xl opacity-5 select-none pointer-events-none">
          {isCute ? '🐾' : '🔥'}
        </div>

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className={`inline-block p-3 rounded-full mb-3 shadow-inner transition-colors duration-500 ${isCute ? 'bg-yellow-100' : 'bg-stone-800'}`}>
             <span className="text-4xl">{isCute ? '🐶' : '😈'}</span>
          </div>
          <h2 className={`text-2xl font-bold mb-2 brand-font ${isCute ? 'text-stone-800' : 'text-purple-100'}`}>
            {isCute ? '案情录入' : '呈上罪证'}
          </h2>
          <p className={`text-sm ${isCute ? 'text-stone-500' : 'text-stone-400'}`}>
            {isCute ? '小狗判官会认真倾听你们心里的委屈 汪～' : '有话快说，本判官没耐心听你们编故事 哼～'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Background */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 font-bold ${labelClass}`}>
              {isCute ? <ScrollText className="w-5 h-5 text-yellow-500" /> : <Skull className="w-5 h-5 text-purple-500" />}
              {isCute ? '事件经过' : '吵架现场还原'} <span className="text-red-400 text-xs">*</span>
            </label>
            <textarea
              name="background"
              value={formData.background}
              onChange={handleChange}
              placeholder={isCute 
                ? "发生了什么事？（例：约会迟到、家务分配、沟通语气...）请尽量客观描述经过。"
                : "别美化自己，老实交代谁先挑的事？到底为了什么破事吵起来的？"
              }
              className={`w-full h-24 p-4 rounded-2xl border-2 focus:ring-0 transition-colors resize-none ${inputBgClass}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Side */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 font-bold ${userLabelColor}`}>
                <User className="w-5 h-5" />
                {isCute ? '你的观点' : '你的小算盘'} 
                <span className="text-xs opacity-60 font-normal ml-auto">(选填)</span>
              </label>
              <textarea
                name="userSide"
                value={formData.userSide || ''}
                onChange={handleChange}
                placeholder={isCute 
                  ? "你觉得哪里受委屈了？你希望TA怎么做？"
                  : "是不是想让TA服软？是不是在翻旧账？老实写出来。"
                }
                className={`w-full h-40 p-4 rounded-2xl border-2 focus:ring-0 transition-colors resize-none ${userInputClass}`}
              />
            </div>

            {/* Partner Side */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 font-bold ${partnerLabelColor}`}>
                <UserCheck className="w-5 h-5" />
                {isCute ? 'TA的观点' : 'TA的借口'}
                <span className="text-xs opacity-60 font-normal ml-auto">(选填)</span>
              </label>
              <textarea
                name="partnerSide"
                value={formData.partnerSide || ''}
                onChange={handleChange}
                placeholder={isCute
                  ? "TA当时是怎么说的？TA的理由是什么？"
                  : "是不是觉得你无理取闹？TA是不是在敷衍？别装深情。"
                }
                className={`w-full h-40 p-4 rounded-2xl border-2 focus:ring-0 transition-colors resize-none ${partnerInputClass}`}
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className={`flex items-center justify-center gap-2 text-xs py-1 ${isCute ? 'text-stone-400' : 'text-stone-600'}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>匿名提交，不留痕迹，{isCute ? '请放心倾诉' : '烂在肚子里'}</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 sticky bottom-4 z-20">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2
                ${isFormValid && !isLoading 
                  ? (isCute 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-stone-900 hover:-translate-y-1' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white hover:-translate-y-1 shadow-purple-900/50')
                  : (isCute 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-800 text-stone-600 cursor-not-allowed')
                }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-2xl">{isCute ? '🦴' : '🔥'}</span> 
                  {isCute ? '正在用心分析诉求...' : '正在准备“处刑”...'}
                </>
              ) : (
                <>
                  <span>{isCute ? '🐾' : '⚡'}</span> 
                  {isCute ? '提交给小狗判官' : '开始毒舌审判'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default InputForm;