export interface CaseData {
  background: string;
  herSide: string;
  hisSide: string;
  extraInfo?: string;
}

export interface VerdictData {
  cuteOpening: string;
  coreConflict: string;
  analysisPoints: string[];
  herPercentage: number;
  hisPercentage: number;
  shortAdvice: string;
  longAdvice: string;
}

export enum AppState {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export const MOCK_VERDICT: VerdictData = {
  cuteOpening: "汪！本小狗法官已经闻到了火药味，不过别担心，让我来评评理！",
  coreConflict: "需求未被感知 vs 表达方式过于激烈",
  analysisPoints: [
    "女方希望得到情感上的共鸣，而不是冷冰冰的逻辑建议。",
    "男方试图快速解决问题，但忽略了对方此刻的情绪价值需求。",
    "双方都没有原则性错误，但在沟通频道上出现了错位。"
  ],
  herPercentage: 60,
  hisPercentage: 40,
  shortAdvice: "抱抱她，先别讲道理！",
  longAdvice: "建议男方先处理情绪，再处理事情。女方可以尝试直接表达需求，而不是通过情绪发泄让对方猜测。在这个周末一起去吃顿好的，忘掉不愉快吧！"
};