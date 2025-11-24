import React, { useState } from 'react';
import { CaseData } from '../types';
import { Sparkles, MessageCircleHeart, ScrollText, ShieldCheck } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: CaseData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CaseData>({
    background: '',
    herSide: '',
    hisSide: '',
    extraInfo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.background || !formData.herSide || !formData.hisSide) return;
    onSubmit(formData);
  };

  const isFormValid = formData.background.trim().length > 0 && 
                      formData.herSide.trim().length > 0 && 
                      formData.hisSide.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border-4 border-yellow-100 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 text-9xl opacity-5 select-none pointer-events-none">🐾</div>

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-block bg-yellow-100 p-3 rounded-full mb-3 shadow-inner">
             <span className="text-4xl">🐶</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">案情录入</h2>
          <p className="text-stone-500 text-sm">请公正客观地告诉本汪发生了什么...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Background */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-stone-700">
              <ScrollText className="w-5 h-5 text-yellow-500" />
              事件背景 <span className="text-red-400 text-xs">*</span>
            </label>
            <textarea
              name="background"
              value={formData.background}
              onChange={handleChange}
              placeholder="时间、地点、核心事件是什么？请尽量客观描述..."
              className="w-full h-24 p-4 rounded-2xl bg-stone-50 border-2 border-stone-100 focus:border-yellow-400 focus:ring-0 transition-colors resize-none text-stone-700 placeholder:text-stone-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Her Side */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-pink-500">
                <MessageCircleHeart className="w-5 h-5" />
                女方观点 <span className="text-pink-300 text-xs">*</span>
              </label>
              <textarea
                name="herSide"
                value={formData.herSide}
                onChange={handleChange}
                placeholder="详述感受、逻辑、诉求及情绪原因..."
                className="w-full h-40 p-4 rounded-2xl bg-pink-50 border-2 border-pink-100 focus:border-pink-300 focus:ring-0 transition-colors resize-none text-stone-700 placeholder:text-pink-300/70"
                required
              />
            </div>

            {/* His Side */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-blue-500">
                <MessageCircleHeart className="w-5 h-5" />
                男方观点 <span className="text-blue-300 text-xs">*</span>
              </label>
              <textarea
                name="hisSide"
                value={formData.hisSide}
                onChange={handleChange}
                placeholder="详述逻辑、感受、诉求及情绪原因..."
                className="w-full h-40 p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 focus:border-blue-300 focus:ring-0 transition-colors resize-none text-stone-700 placeholder:text-blue-300/70"
                required
              />
            </div>
          </div>

          {/* Extra Info */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-stone-600 text-sm">
              <Sparkles className="w-4 h-4" />
              补充信息 (可选)
            </label>
            <input
              type="text"
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleChange}
              placeholder="既往矛盾、特殊约定、生理期等影响因素..."
              className="w-full p-4 rounded-2xl bg-stone-50 border-2 border-stone-100 focus:border-yellow-400 focus:ring-0 transition-colors text-stone-700 placeholder:text-stone-400"
            />
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400 py-1">
            <ShieldCheck className="w-3 h-3" />
            <span>匿名提交，数据仅用于本次裁决，绝不保留</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 sticky bottom-4 z-20">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2
                ${isFormValid && !isLoading 
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-stone-900 hover:-translate-y-1' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-2xl">🦴</span> 正在分析逻辑与情感...
                </>
              ) : (
                <>
                  <span>🐾</span> 提交给小狗判官
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