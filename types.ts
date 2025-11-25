
export interface CaseData {
  background: string;
  userSide?: string;
  partnerSide?: string;
  chatImages?: string[]; // Array of Base64 strings (Data URLs)
}

export interface VerdictData {
  cuteOpening: string;
  coreConflict: string;
  eventAnalysis: string;
  analysisPoints: string[];
  userPercentage: number;
  partnerPercentage: number;
  userSideSummary: string;
  partnerSideSummary: string;
  shortAdvice: string;
  longAdvice: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  caseData: CaseData;
  verdict: VerdictData;
  persona: JudgePersona;
}

export enum AppState {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum JudgePersona {
  CUTE = 'CUTE',
  TOXIC = 'TOXIC'
}

export const MOCK_VERDICT: VerdictData = {
  cuteOpening: "汪！本小狗法官已经闻到了火药味，不过别担心，让我来评评理！",
  coreConflict: "需求未被感知 vs 表达方式过于激烈",
  eventAnalysis: "在这起事件中，双方其实都没有原则性的错误。主要是因为在疲惫的状态下，对于晚餐的选择产生了分歧，进而上升到了'是否在乎我'的高度。其实只是两个又饿又累的小朋友在闹别扭。",
  analysisPoints: [
    "一方希望得到情感上的共鸣，而不是冷冰冰的逻辑建议。",
    "另一方试图快速解决问题，但忽略了对方此刻的情绪价值需求。",
    "双方都没有原则性错误，但在沟通频道上出现了错位。"
  ],
  userPercentage: 60,
  partnerPercentage: 40,
  userSideSummary: "觉得被忽视，希望得到情绪回应。",
  partnerSideSummary: "觉得很冤枉，只想快速解决吃饭问题。",
  shortAdvice: "抱抱TA，先别讲道理！",
  longAdvice: "建议先处理情绪，再处理事情。可以直接表达需求，而不是通过情绪发泄让对方猜测。在这个周末一起去吃顿好的，忘掉不愉快吧！"
};
