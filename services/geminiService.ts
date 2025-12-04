import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, VerdictData, JudgePersona, CourtLevel, AppealData } from "../types";
import { Logger } from "../utils/logger";

const verdictSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cuteOpening: {
      type: Type.STRING,
      description: "Opening sentence. Must reflect the specific Court Level persona (Initial/Intermediate/High).",
    },
    coreConflict: {
      type: Type.STRING,
      description: "Concise summary of conflict.",
    },
    eventAnalysis: {
      type: Type.STRING,
      description: "Detailed analysis. For Intermediate: expose excuses. For High: relationship first aid.",
    },
    analysisPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 bullet points. The 3rd point must lead to the verdict.",
    },
    userPercentage: {
      type: Type.NUMBER,
      description: "User's score (0-100). Meaning depends on persona (Support vs Roast).",
    },
    partnerPercentage: {
      type: Type.NUMBER,
      description: "Partner's score. Must add up to 100.",
    },
    userSideSummary: {
      type: Type.STRING,
      description: "One sentence summary of User's side.",
    },
    partnerSideSummary: {
      type: Type.STRING,
      description: "One sentence summary of Partner's side.",
    },
    shortAdvice: {
      type: Type.STRING,
      description: "Short term advice. Empty string for Toxic Initial/Intermediate, but REQUIRED for Toxic High Court and ALL Cute Courts.",
    },
    longAdvice: {
      type: Type.STRING,
      description: "Long term advice.",
    },
  },
  required: ["cuteOpening", "coreConflict", "eventAnalysis", "analysisPoints", "userPercentage", "partnerPercentage", "userSideSummary", "partnerSideSummary", "shortAdvice", "longAdvice"],
};

// --- PROMPT TEMPLATES ---

const CUTE_INITIAL_PROMPT = `
  你是“小狗判官”汪～，一位长着毛茸茸尾巴的情侣AI调解师（初级调解室）。
  **核心理念**：“赢得感情比赢得争吵更重要”。
  **语气**：娇憨、暖心、中立。
  **任务**：分析矛盾，提供温暖的建议，安抚双方情绪。
`;

const CUTE_INTERMEDIATE_PROMPT = `
  你是“中级暖心调解员”汪汪～（二审）。
  **背景**：用户提交了上诉和新证据，希望能得到更公平的对待。
  **任务**：非常认真地重新查阅所有证据，包括新提交的图片/理由。
  **语气**：更加耐心、温柔，像一个耐心的倾听者。
  **例句**：“汪！收到新的证据啦？让我再仔细看看～原来还有这样的细节呀。”
`;

const CUTE_HIGH_PROMPT = `
  你是“最高暖心大法官”呜呜～（终审）。
  **背景**：这是最后一次调解机会，双方都很在乎这段感情，希望能彻底解开心结。
  **任务**：给出最终极、最治愈的解决方案。
  **语气**：充满智慧与爱意，庄重但温暖。
  **例句**：“感情遇到小坎坷很正常，本法官决定给你们颁发‘最可爱情侣奖’，只要你们愿意互相抱抱！”
`;

const TOXIC_INITIAL_PROMPT = `
  你是“初级狗民法院”的“毒舌小狗判官”哼唧～（毒舌指数★★★）。
  **任务**：扒光情侣吵架的遮羞布，戳破矫情和算计。
  **风格**：深入犀利的吐槽，聚焦事件表面事实裁决，深挖矛盾根源。
  **要求**：
  1. 别端水，必须拉开分差（如80/20）。
  2. 不需要给“当下止损招”（shortAdvice留空），只给长期指南。
  3. 语气要拽，像看穿了一切的吃瓜群众。
`;

const TOXIC_INTERMEDIATE_PROMPT = `
  你是“中级狗民法院”的“毒舌二审法官”嗷呜～（毒舌指数★★★）。
  **背景**：用户对一审结果不服，发起了上诉，并提供了新理由/证据。
  **任务**：结合【上诉理由】和【新证据】，精准戳破用户的借口。
  **风格**：嘲讽拉满，专治“嘴硬”。
  **例句**：“上诉理由写‘TA根本不爱我’？拜托，上次TA发烧还爬起来给你做夜宵怎么不说？新证据里这聊天记录摆着，你就是借题发挥闹脾气。”
  **要求**：
  1. 必须引用上诉内容进行驳斥或改判。
  2. 依旧不给“当下止损招”（shortAdvice留空）。
  3. 语气要像个不耐烦的法官：“又来？行吧，让我看看你又编了什么理由。”
`;

const TOXIC_HIGH_PROMPT = `
  你是“高级狗民法院”的“终审大法官”汪呜～（毒舌指数★★★★★）。
  **背景**：这是最后一次上诉机会，两人为了点破事纠缠到了终审。
  **任务**：虽然嘴毒，但目的是为了“关系急救”。直击问题本质，强制执行“亲密惩罚”。
  **风格**：毒舌但暖心，恨铁不成钢。
  **例句**：“都上诉到我这了？俩成年人为‘谁先挂电话’掰扯两小时，说出去丢不丢狗脸？终审判决：现在立刻视频，先笑一个再说话！”
  **要求**：
  1. 必须给出“当下止损招”（shortAdvice），内容为具体的“强制互动指令”（如罚抄我爱你、强制拥抱5分钟）。
  2. 这里的分析要升华，指出两人真正的问题（如缺乏安全感、太闲了）。
  3. 语气要有威严感，但最后要流露出一丝对这份感情的珍惜。
`;

export const getPuppyVerdict = async (
  data: CaseData, 
  persona: JudgePersona, 
  courtLevel: CourtLevel = CourtLevel.INITIAL,
  appealData?: AppealData,
  previousVerdict?: VerdictData
): Promise<VerdictData> => {
  
  if (!process.env.API_KEY) throw new Error("API Key missing");

  Logger.info(`Starting verdict generation. Persona: ${persona}, Level: ${courtLevel}`);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let systemInstruction = "";
  
  if (persona === JudgePersona.CUTE) {
    switch (courtLevel) {
      case CourtLevel.INTERMEDIATE:
        systemInstruction = CUTE_INTERMEDIATE_PROMPT;
        break;
      case CourtLevel.HIGH:
        systemInstruction = CUTE_HIGH_PROMPT;
        break;
      default:
        systemInstruction = CUTE_INITIAL_PROMPT;
        break;
    }
  } else {
    // TOXIC Persona
    switch (courtLevel) {
      case CourtLevel.INTERMEDIATE:
        systemInstruction = TOXIC_INTERMEDIATE_PROMPT;
        break;
      case CourtLevel.HIGH:
        systemInstruction = TOXIC_HIGH_PROMPT;
        break;
      default:
        systemInstruction = TOXIC_INITIAL_PROMPT;
        break;
    }
  }

  // Handle optional fields
  const userSideText = data.userSide && data.userSide.trim() !== "" ? data.userSide : "（未详细说明）";
  const partnerSideText = data.partnerSide && data.partnerSide.trim() !== "" ? data.partnerSide : "（未详细说明）";

  // Build Context for Appeal
  let appealContext = "";
  if (appealData) {
    appealContext = `
      **【上诉环节信息】**
      用户不服从上一级法院的判决，发起了上诉！
      - 上诉理由：${appealData.reason}
      - 上一级判决的核心矛盾认定：${previousVerdict?.coreConflict}
      - 上一级判决的吐槽/分析：${previousVerdict?.eventAnalysis}
      
      请重点根据【上诉理由】和【新证据图片】进行二审/终审裁决！
      ${persona === JudgePersona.CUTE ? "请仔细重新评估，看是否有新的委屈被忽略了。" : "如果是狡辩，请狠狠戳穿；如果真的有理，请酌情改判。"}
    `;
  }

  // Define score meaning based on persona
  const userScoreDesc = persona === JudgePersona.CUTE 
    ? "用户支持率/合理性占比 (0-100，分数越高越占理)" 
    : "用户槽点/笨蛋程度 (0-100，分数越高越离谱)";
  
  const partnerScoreDesc = persona === JudgePersona.CUTE 
    ? "对方支持率/合理性占比" 
    : "对方槽点/笨蛋程度";

  const textPrompt = `
    ${systemInstruction}

    **案件基础档案**
    - 吵架现场/背景：${data.background}
    - 你的观点（用户）：${userSideText}
    - TA的观点（对方）：${partnerSideText}
    ${data.chatImages?.length ? "- 基础证据：已提供初始聊天记录。" : ""}

    ${appealContext}

    ${appealData?.evidenceImages?.length ? "- **新提交的证据**：已提供上诉补充图片，请务必仔细查阅！" : ""}

    **输出JSON格式要求**
    - eventAnalysis: ${courtLevel === CourtLevel.INTERMEDIATE ? "结合上诉理由" + (persona === JudgePersona.CUTE ? "重新温和解析" : "戳穿借口") : "事件深度解析"}
    - analysisPoints: 3个要点。
    - userPercentage: ${userScoreDesc}. ${persona === JudgePersona.TOXIC ? "必须拉开差距！" : "根据事实公正分配。"}
    - partnerPercentage: ${partnerScoreDesc}.
    - userSideSummary: 用户观点一句话总结。
    - partnerSideSummary: 对方观点一句话总结。
    - shortAdvice: ${
       (persona === JudgePersona.TOXIC && courtLevel !== CourtLevel.HIGH) 
       ? "【必须留空】" 
       : "【必须填写】" + (courtLevel === CourtLevel.HIGH && persona === JudgePersona.TOXIC ? "具体的强制亲密互动指令" : "温暖的短期建议")
    }
    - longAdvice: 长期指南。
  `;

  // Build Parts
  const parts: any[] = [{ text: textPrompt }];

  // Add Initial Images
  if (data.chatImages && data.chatImages.length > 0) {
    data.chatImages.forEach(img => parts.push({ inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }));
  }
  
  // Add Appeal Images
  if (appealData?.evidenceImages && appealData.evidenceImages.length > 0) {
    appealData.evidenceImages.forEach(img => parts.push({ inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: verdictSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    
    const parsedData = JSON.parse(jsonText) as VerdictData;
    parsedData.courtLevel = courtLevel; // Tag the result
    parsedData.timestamp = Date.now();
    
    return parsedData;

  } catch (error) {
    Logger.error("API Error", error);
    throw error;
  }
};
