
import React, { useState, useRef } from 'react';
import { AppealData } from '../types';
import { Gavel, ImagePlus, X, AlertTriangle } from 'lucide-react';

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppealData) => void;
  isHighCourt: boolean; // If true, this is the final appeal
}

const AppealModal: React.FC<AppealModalProps> = ({ isOpen, onClose, onSubmit, isHighCourt }) => {
  const [reason, setReason] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="w-full max-w-lg bg-stone-900 border-2 border-purple-600 rounded-2xl shadow-2xl shadow-purple-900/50 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-900 bg-purple-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-200">
            <Gavel className="w-6 h-6 text-purple-400" />
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
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
             <div className="text-2xl">🧐</div>
             <p className="text-sm text-yellow-200/80">
               行吧，给你一次翻案的机会，但别拿没营养的废话凑数——新证据懂？
               {isHighCourt && <span className="block font-bold text-red-400 mt-1">注意：这是最后一次机会，将由终审大法官直接裁决！</span>}
             </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-300">上诉理由 / 不服的点</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="比如：TA虽然...但是...（请提供有力的新视角）"
              className="w-full h-24 bg-stone-800 border-stone-700 rounded-xl p-3 text-stone-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-300 flex justify-between">
              <span>补充新证据 (可选)</span>
              <span className="text-stone-500 font-normal">{evidenceImages.length}/5</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-stone-600 flex flex-col items-center justify-center gap-1 hover:border-purple-500 hover:bg-stone-800 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-stone-400" />
                <span className="text-[10px] text-stone-400">添加</span>
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
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all hover:-translate-y-0.5"
          >
            提交上诉申请
          </button>
        </form>

      </div>
    </div>
  );
};

export default AppealModal;
