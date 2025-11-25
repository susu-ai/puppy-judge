
import React from 'react';
import { HistoryItem, JudgePersona } from '../types';
import { X, Trash2, Search, Clock, ChevronRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  persona: JudgePersona;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect, onDelete, persona }) => {
  if (!isOpen) return null;

  const isCute = persona === JudgePersona.CUTE;
  
  const bgClass = isCute ? "bg-white" : "bg-stone-900 border border-stone-700";
  const textClass = isCute ? "text-stone-800" : "text-stone-200";
  const subTextClass = isCute ? "text-stone-500" : "text-stone-400";
  const hoverClass = isCute ? "hover:bg-yellow-50" : "hover:bg-stone-800";
  const scrollbarClass = isCute ? "scrollbar-cute" : "scrollbar-toxic"; // Assuming custom scrollbars defined in global CSS or ignored for now

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${bgClass}`}>
        
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isCute ? 'border-stone-100 bg-yellow-50' : 'border-stone-800 bg-stone-950'}`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isCute ? 'text-yellow-600' : 'text-purple-500'}`} />
            <h3 className={`font-bold text-lg ${textClass}`}>
              {isCute ? '过往卷宗' : '黑历史档案'}
            </h3>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isCute ? 'hover:bg-yellow-200 text-stone-500' : 'hover:bg-stone-800 text-stone-400'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {history.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-48 gap-3 ${subTextClass}`}>
              <Search className="w-8 h-8 opacity-50" />
              <p>{isCute ? '还没有判决记录哦 🐾' : '暂无记录，清白得很 🧹'}</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${hoverClass} ${isCute ? 'border-stone-100' : 'border-stone-800'}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      item.persona === JudgePersona.CUTE 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                        : 'bg-purple-900/30 text-purple-300 border-purple-800'
                    }`}>
                      {item.persona === JudgePersona.CUTE ? '暖心' : '毒舌'}
                    </span>
                    <span className={`text-xs ${subTextClass}`}>
                      {new Date(item.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm font-bold truncate ${textClass}`}>
                    {item.verdict.coreConflict || item.caseData.background}
                  </p>
                  <p className={`text-xs truncate opacity-70 mt-0.5 ${subTextClass}`}>
                    {item.caseData.background}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => onDelete(item.id, e)}
                     className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                        isCute ? 'text-red-400 hover:bg-red-50' : 'text-red-500 hover:bg-red-900/20'
                     }`}
                     title="删除记录"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <ChevronRight className={`w-4 h-4 opacity-30 ${textClass}`} />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;
