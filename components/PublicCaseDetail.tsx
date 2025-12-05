
import React, { useState, useEffect } from 'react';
import { PublicCase, JudgePersona, Comment } from '../types';
import { TownSquareService } from '../services/townSquareService';
import { ArrowLeft, User, UserCheck, MessageCircle, Send, ThumbsUp, BrainCircuit, Flame } from 'lucide-react';

interface PublicCaseDetailProps {
  publicCase: PublicCase;
  onBack: () => void;
  currentPersona: JudgePersona; // Used for UI theming
}

const PublicCaseDetail: React.FC<PublicCaseDetailProps> = ({ publicCase, onBack, currentPersona }) => {
  const [caseData, setCaseData] = useState<PublicCase>(publicCase);
  const [commentText, setCommentText] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Increment view on mount
    TownSquareService.viewCase(caseData.id);
  }, []);

  const handleVote = (side: 'user' | 'partner') => {
    if (hasVoted) return;
    const updated = TownSquareService.voteCase(caseData.id, side);
    if (updated) {
      setCaseData(updated);
      setHasVoted(true);
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const updated = TownSquareService.addComment(caseData.id, commentText, currentPersona);
    if (updated) {
      setCaseData(updated);
      setCommentText('');
    }
  };

  const isCaseCute = caseData.persona === JudgePersona.CUTE;
  
  // Theme based on THE CASE'S persona, not the user's current persona (to respect the original vibe)
  const bgClass = isCaseCute ? "bg-[#FFF9E5]" : "bg-[#1c1917]";
  const cardBg = isCaseCute ? "bg-white" : "bg-stone-900 border-stone-800";
  const textColor = isCaseCute ? "text-stone-800" : "text-stone-200";
  const subText = isCaseCute ? "text-stone-500" : "text-stone-400";
  
  // Vote Percentages
  const totalVotes = caseData.communityVotes.user + caseData.communityVotes.partner;
  const userVotePct = totalVotes === 0 ? 50 : Math.round((caseData.communityVotes.user / totalVotes) * 100);
  const partnerVotePct = totalVotes === 0 ? 50 : 100 - userVotePct;

  return (
    <div className={`min-h-screen ${bgClass} animate-fade-in-up pb-20`}>
      <div className="max-w-3xl mx-auto p-4">
        
        {/* Nav */}
        <button onClick={onBack} className={`flex items-center gap-2 mb-6 font-bold ${isCaseCute ? 'text-stone-600 hover:text-stone-900' : 'text-stone-400 hover:text-white'}`}>
           <ArrowLeft className="w-5 h-5" /> 返回法庭广场
        </button>

        {/* Case Content */}
        <div className={`rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-4 ${isCaseCute ? 'border-yellow-200 bg-white' : 'border-purple-900 bg-stone-900'}`}>
           <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{isCaseCute ? '🐶' : '😈'}</div>
              <div>
                 <h2 className={`text-xl font-bold ${textColor}`}>{caseData.verdict.coreConflict}</h2>
                 <p className={`text-xs ${subText}`}>{new Date(caseData.timestamp).toLocaleString('zh-CN')}</p>
              </div>
           </div>

           <div className={`p-4 rounded-xl mb-6 text-sm whitespace-pre-wrap leading-relaxed ${isCaseCute ? 'bg-stone-50 text-stone-700' : 'bg-stone-800 text-stone-300'}`}>
              "{caseData.caseData.background}"
           </div>

           {/* AI Verdict Summary */}
           <div className={`p-5 rounded-2xl border mb-8 ${isCaseCute ? 'bg-yellow-50 border-yellow-100' : 'bg-stone-950 border-stone-800'}`}>
              <h3 className={`font-bold mb-2 flex items-center gap-2 ${isCaseCute ? 'text-stone-800' : 'text-stone-200'}`}>
                 {isCaseCute ? <BrainCircuit className="w-4 h-4"/> : <Flame className="w-4 h-4"/>}
                 判官裁决摘要
              </h3>
              <p className={`text-sm ${isCaseCute ? 'text-stone-600' : 'text-stone-400'}`}>
                 {caseData.verdict.eventAnalysis}
              </p>
           </div>

           {/* Community Vote */}
           <div className="mb-8">
              <h3 className={`font-bold mb-4 flex items-center justify-between ${textColor}`}>
                 <span>⚖️ 大众评审团 ({totalVotes}票)</span>
                 {hasVoted && <span className="text-xs text-green-500">已投票</span>}
              </h3>
              
              <div className="flex justify-between items-end mb-2 text-xs font-bold">
                 <span className="text-pink-500">站你 ({userVotePct}%)</span>
                 <span className="text-blue-500">站TA ({partnerVotePct}%)</span>
              </div>
              
              <div className="h-4 rounded-full flex overflow-hidden mb-4">
                 <div style={{width: `${userVotePct}%`}} className="bg-pink-500 transition-all duration-500"></div>
                 <div style={{width: `${partnerVotePct}%`}} className="bg-blue-500 transition-all duration-500"></div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => handleVote('user')}
                   disabled={hasVoted}
                   className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      hasVoted 
                      ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400' 
                      : (isCaseCute ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' : 'bg-pink-900/20 text-pink-400 hover:bg-pink-900/40')
                   }`}
                 >
                    <User className="w-4 h-4" /> 站你
                 </button>
                 <button 
                   onClick={() => handleVote('partner')}
                   disabled={hasVoted}
                   className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      hasVoted 
                      ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400' 
                      : (isCaseCute ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40')
                   }`}
                 >
                    <UserCheck className="w-4 h-4" /> 站TA
                 </button>
              </div>
           </div>

           {/* Comment Section */}
           <div className="border-t pt-8 border-dashed border-stone-200">
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${textColor}`}>
                 <MessageCircle className="w-5 h-5" /> 
                 吃瓜评论 ({caseData.comments.length})
              </h3>

              {/* Input */}
              <form onSubmit={handleComment} className="flex gap-2 mb-8">
                 <input 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   placeholder="发表你的看法..."
                   className={`flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 ${
                      isCaseCute 
                      ? 'bg-stone-50 focus:ring-yellow-300 text-stone-800' 
                      : 'bg-stone-800 focus:ring-purple-600 text-stone-200 placeholder:text-stone-500'
                   }`}
                 />
                 <button 
                   type="submit"
                   disabled={!commentText.trim()}
                   className={`p-3 rounded-xl font-bold transition-all ${
                      isCaseCute 
                      ? 'bg-yellow-400 text-stone-900 hover:bg-yellow-500' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                   }`}
                 >
                    <Send className="w-5 h-5" />
                 </button>
              </form>

              {/* List */}
              <div className="space-y-4">
                 {caseData.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                       <div className="text-2xl pt-1 select-none">{comment.avatar}</div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`text-xs font-bold ${isCaseCute ? 'text-stone-600' : 'text-stone-400'}`}>{comment.author}</span>
                             <span className="text-[10px] opacity-40 text-stone-500">{new Date(comment.timestamp).toLocaleString()}</span>
                          </div>
                          <p className={`text-sm ${isCaseCute ? 'text-stone-800' : 'text-stone-300'}`}>{comment.content}</p>
                       </div>
                    </div>
                 ))}
                 {caseData.comments.length === 0 && (
                    <p className="text-center opacity-40 text-sm py-4">还没有评论，快来抢沙发！</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCaseDetail;
