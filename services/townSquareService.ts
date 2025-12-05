
import { PublicCase, CaseData, VerdictData, JudgePersona, Comment, SquareSortType } from "../types";
import { Logger } from "../utils/logger";

const STORAGE_KEY = 'puppy_judge_square_data';

// Initial Mock Data Generator
const getMockData = (): PublicCase[] => {
  return [
    {
      id: 'mock-1',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      persona: JudgePersona.CUTE,
      caseData: {
        background: "男朋友打游戏不回消息，我生气了他还觉得我无理取闹。",
        userSide: "我觉得这是态度问题，回个消息只需几秒钟。",
        partnerSide: "我在打团战，真的切不出来，打完立刻就回了。",
        chatImages: []
      },
      verdict: {
        cuteOpening: "汪～ 游戏和女朋友确实是历史难题呢！",
        coreConflict: "即时回应需求 vs 沉浸式娱乐体验",
        eventAnalysis: "双方都没有错，只是时间颗粒度认知不同。",
        analysisPoints: ["女生需要安全感", "男生需要个人空间", "沟通时机不对"],
        userPercentage: 60,
        partnerPercentage: 40,
        userSideSummary: "要态度",
        partnerSideSummary: "要理解",
        shortAdvice: "男生设置游戏间隙自动回复",
        longAdvice: "约定游戏时间，互不打扰"
      },
      communityVotes: { user: 120, partner: 85 },
      comments: [
        { id: 'c1', author: '路过的小柯基', avatar: '🐶', content: '打团确实很难回消息...', timestamp: Date.now() - 3600000 },
        { id: 'c2', author: '暴躁吉娃娃', avatar: '🐕', content: '就是不在乎！分！', timestamp: Date.now() - 1800000 }
      ],
      views: 1205
    },
    {
      id: 'mock-2',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      persona: JudgePersona.TOXIC,
      caseData: {
        background: "因为谁去洗碗吵了一架，明明说好轮流的，他总赖账。",
        userSide: "原则问题，说好的事情就要做到。",
        partnerSide: "我很累，明天洗不行吗？非要逼我现在洗。",
      },
      verdict: {
        cuteOpening: "哼，懒就是懒，借口真多。",
        coreConflict: "契约精神 vs 拖延症",
        eventAnalysis: "典型的试探底线行为。",
        analysisPoints: ["承诺了就要做", "累不是借口", "执行力太差"],
        userPercentage: 10,  // User is logic
        partnerPercentage: 90, // Partner is lazy (Higher score = More toxic/stupid in Toxic Mode)
        userSideSummary: "按规矩办事",
        partnerSideSummary: "想偷懒",
        shortAdvice: "",
        longAdvice: "买个洗碗机，或者罚款"
      },
      communityVotes: { user: 340, partner: 12 },
      comments: [
        { id: 'c3', author: '吃瓜哈士奇', avatar: '🐺', content: '这种男的留着过年？', timestamp: Date.now() - 80000000 }
      ],
      views: 5600
    }
  ];
};

export const TownSquareService = {
  
  // Load cases from LocalStorage
  getCases: (sort: SquareSortType = SquareSortType.NEWEST): PublicCase[] => {
    let cases: PublicCase[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cases = JSON.parse(stored);
      } else {
        // Init mock data if empty
        cases = getMockData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      }
    } catch (e) {
      Logger.error("Failed to load square data", e);
      cases = getMockData();
    }

    // Sort
    return cases.sort((a, b) => {
      if (sort === SquareSortType.NEWEST) {
        return b.timestamp - a.timestamp;
      } else {
        // HOTTEST = views + votes + comments * 5
        const scoreA = a.views + (a.communityVotes.user + a.communityVotes.partner) + (a.comments.length * 5);
        const scoreB = b.views + (b.communityVotes.user + b.communityVotes.partner) + (b.comments.length * 5);
        return scoreB - scoreA;
      }
    });
  },

  // Publish a case
  publishCase: (caseData: CaseData, verdict: VerdictData, persona: JudgePersona): boolean => {
    try {
      const cases = TownSquareService.getCases();
      
      const newCase: PublicCase = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        persona,
        caseData,
        verdict,
        communityVotes: { user: 0, partner: 0 },
        comments: [],
        views: 0
      };

      cases.unshift(newCase);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      return true;
    } catch (e) {
      Logger.error("Failed to publish case", e);
      return false;
    }
  },

  // Vote
  voteCase: (id: string, side: 'user' | 'partner'): PublicCase | null => {
    try {
      const cases = TownSquareService.getCases();
      const index = cases.findIndex(c => c.id === id);
      if (index === -1) return null;

      cases[index].communityVotes[side] += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      return cases[index];
    } catch (e) {
      Logger.error("Failed to vote", e);
      return null;
    }
  },

  // Comment
  addComment: (id: string, content: string, persona: JudgePersona): PublicCase | null => {
    try {
      const cases = TownSquareService.getCases();
      const index = cases.findIndex(c => c.id === id);
      if (index === -1) return null;

      const newComment: Comment = {
        id: Date.now().toString(),
        author: persona === JudgePersona.CUTE ? `热心汪民${Math.floor(Math.random()*100)}号` : `毒舌路人${Math.floor(Math.random()*100)}号`,
        avatar: ['🐶','🐕','🐩','🐺','🦊'][Math.floor(Math.random()*5)],
        content,
        timestamp: Date.now()
      };

      cases[index].comments.unshift(newComment);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      return cases[index];
    } catch (e) {
      Logger.error("Failed to comment", e);
      return null;
    }
  },
  
  // View
  viewCase: (id: string) => {
    try {
      const cases = TownSquareService.getCases();
      const index = cases.findIndex(c => c.id === id);
      if (index !== -1) {
        cases[index].views += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      }
    } catch (e) {
      // Ignore view update errors
    }
  }
};
