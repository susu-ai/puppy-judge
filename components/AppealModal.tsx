import React, { useState, useRef } from 'react';
import { AppealData, JudgePersona } from '../types';
import { Gavel, ImagePlus, X, AlertTriangle } from 'lucide-react';

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppealData) => void;
  isHighCourt: boolean; 
  persona: JudgePersona;
}

const AppealModal: React.FC<AppealModalProps> = ({ isOpen, onClose, onSubmit, isHighCourt, persona }) => {
  const [reason, setReason] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isCute = persona === JudgePersona.CUTE;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidenceImages(prev => [...prev, reader.result as string].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({ reason, evidenceImages });
  };

  // Styles
  const bgClass = isCute ? "bg-white border-yellow-200" : "bg-stone-900 border-purple-600";
  const textClass = isCute ? "text-stone-800" : "text-stone-200";
  const inputBgClass = isCute ? "bg-stone-50 border-stone-200 text-stone-700" : "bg-stone-800 border-stone-700 text-stone-200";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className={`w-full max-w-lg border-2 rounded-2xl shadow-2xl overflow-hidden ${bgClass}`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
           isCute ? 'border-yellow-100 bg-yellow-50/50' : 'border-purple-900 bg-purple-900/20'
        }`}>
          <div className={`flex items-center gap-2 ${isCute ? 'text-yellow-700' : 'text-purple-200'}`}>
            <Gavel className="w-6 h-6" />
            <h3 className="text-xl font-bold font-sans">
              {isHighCourt ? '终审上诉申请' : '提起上诉'}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className={`p-4 rounded-lg flex gap-3 border ${
             isCute ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
             <div className="text-2xl">{isCute ? '🐶' : '🧐'}</div>
             <p className={`text-sm ${isCute ? 'text-stone-600' : 'text-yellow-200/80'}`}>
               {isCute 
                 ? "汪！收到新的证据啦？让我再仔细看看～ 不要急，小狗判官会认真重新评估的！"
                 : "行吧，给你一次翻案的机会，但别拿没营养的废话凑数——新证据懂？"
               }
               {isHighCourt && <span className="block font-bold text-red-400 mt-1">注意：这是最后一次机会，将由终审大法官直接裁决！</span>}
             </p>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-bold ${textClass}`}>
               {isCute ? '还有什么委屈想说？' : '上诉理由 / 不服的点'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isCute 
                ? "比如：还有个细节忘了说... 其实我的初衷是..." 
                : "比如：TA虽然...但是...（请提供有力的新视角）"
              }
              className={`w-full h-24 rounded-xl p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none ${inputBgClass}`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-bold flex justify-between ${textClass}`}>
              <span>补充新证据 (可选)</span>
              <span className="opacity-60 font-normal">{evidenceImages.length}/5</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-16 h-16 shrink-0 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                   isCute 
                   ? 'border-stone-300 hover:border-yellow-400 hover:bg-yellow-50 text-stone-400' 
                   : 'border-stone-600 hover:border-purple-500 hover:bg-stone-800 text-stone-400'
                }`}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">添加</span>
              </button>
              {evidenceImages.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-stone-700">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEvidenceImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 bg-black/60 p-0.5 text-white hover:bg-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          </div>

          <button
            type="submit"
            className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ${
              isCute 
                ? 'bg-yellow-400 hover:bg-yellow-500 text-stone-900' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'
            }`}
          >
            提交上诉申请
          </button>
        </form>

      </div>
    </div>
  );
};

export default AppealModal;