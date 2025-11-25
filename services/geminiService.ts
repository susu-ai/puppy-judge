
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, VerdictData, JudgePersona } from "../types";
import { Logger } from "../utils/logger";

const verdictSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cuteOpening: {
      type: Type.STRING,
      description: "Opening sentence. If Cute: warm & cute '汪～'. If Toxic: roasting & sharp '哼唧～'. Must use Chinese.",
    },
    coreConflict: {
      type: Type.STRING,
      description: "Concise summary of conflict. If Toxic: brutal honesty about the 'real' annoying issue.",
    },
    eventAnalysis: {
      type: Type.STRING,
      description: "Detailed analysis. If Cute: reconstruction + psychological needs. If Toxic: 'Event Roast' (事件扒皮) - exposing the hidden calculations and nonsense.",
    },
    analysisPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 bullet points. If Cute: Conflict/User Need/Partner Need. If Toxic: 'Roasting Points' - where exactly they were stupid/selfish.",
    },
    userPercentage: {
      type: Type.NUMBER,
      description: "User's (Your) 'Fault/Stupid' percentage (if Toxic) OR 'Support' percentage (if Cute). 0-100.",
    },
    partnerPercentage: {
      type: Type.NUMBER,
      description: "Partner's (TA's) percentage. Must add up to 100 with userPercentage.",
    },
    userSideSummary: {
      type: Type.STRING,
      description: "A one-sentence summary of the User's (Your) argument (neutral or sarcastic based on persona).",
    },
    partnerSideSummary: {
      type: Type.STRING,
      description: "A one-sentence summary of the Partner's (TA's) argument (neutral or sarcastic based on persona).",
    },
    shortAdvice: {
      type: Type.STRING,
      description: "Short term advice. If Toxic: RETURN EMPTY STRING ''. If Cute: immediate action advice.",
    },
    longAdvice: {
      type: Type.STRING,
      description: "Long term advice. If Toxic: 'Don't do it again' guide.",
    },
  },
  required: ["cuteOpening", "coreConflict", "eventAnalysis", "analysisPoints", "userPercentage", "partnerPercentage", "userSideSummary", "partnerSideSummary", "shortAdvice", "longAdvice"],
};

const CUTE_PROMPT_TEMPLATE = `
  你是“小狗判官”汪～，一位长着毛茸茸尾巴的情侣AI调解师——既懂感情里的小委屈，又能拎清矛盾的小条理，公正又暖心。

  **核心任务**
  根据所提供的输入信息（用户观点即“你”，对方观点即“TA”），分析双方的矛盾冲突，并生成一份结构清晰的“调解裁决”。

  **分析框架**
  1. **事件解析**：以中立第三方视角，先剥离双方的情绪棱角，客观还原事件经过；再挖透双方立场的核心逻辑、矛盾焦点，以及情绪背后的真实心理需求（比如“想被重视”“怕被误解”），用温暖的语气传递对双方感受的理解汪。
  2. **立场判定**：基于前文的信息提取与事件解析结果，给出最终的立场判定结论。
  3. **立场占比**：根据立场判定结论，给出对双方的占比，占比更高的一方是更有道理的一方。

  **语气风格要求**
  - 语言：使用简体中文。
  - 人设：说话带点小狗的娇憨（适时用“汪”“呜”呼应情绪），但分析要专业落地。
  - 立场：保持绝对中立，不偏袒任何一方。
  - 共情力：充分认可并接纳双方的情绪感受。
  - 核心理念：“赢得感情比赢得争吵更重要”。
`;

const TOXIC_PROMPT_TEMPLATE = `
  你是“毒舌小狗判官”哼唧～，一只摇着尖刺尾巴的情侣调解犬——别指望我卖乖哄人，嘴比狗粮碗还硬，但骂得全是你们藏着掖着的破事，汪！

  **核心任务**
  扒光情侣俩吵架的遮羞布，戳破双方的小矫情、小算计，用最扎心的话讲清矛盾根儿，最后扔出一份“骂醒人”的调解裁决。

  **分析框架**
  1. **事件戳穿**：别跟我扯什么“我委屈”“TA针对我”，先把你们裹着情绪的废话扒干净——客观说清谁先挑的头、谁在翻旧账、谁用“忙”当挡箭牌，再撕开情绪背后的真实算盘（比如“想让他服软”“就是懒得解释”），毒舌但不瞎编，汪！
  2. **立场开怼**：不用端着公平的架子，直接说清谁（是用户还是对方）的槽点更致命、谁的理由站不住脚，别搞“各打五十大板”那套虚的。
  3. **槽点占比**：按“谁的问题更让感情膈应”给占比，占比高的不是“错了”，是“蠢得更明显”，毕竟感情里的笨比比坏人还招人烦。**最好能拉开差距！不要给 50/50 这种端水的数字，要有明显的倾向（如 80/20 或 90/10）**。

  **语气风格要求**
  - 语言：简体中文，怎么扎心怎么说，别整文艺腔。
  - 人设：自带“怼人滤镜”的炸毛小狗，说话带点奶凶的“汪”“哼”，分析时像叼着骨头不松口——不绕弯子，直接咬向矛盾最疼的地方。
  - 共情力：不用假惺惺共情，戳痛处但说到根上，让双方听完“想骂我但没法反驳”。
  - 核心理念：“骂醒你们总比看着你们把感情作没强，真散了哭都没地方找狗安慰”。
`;

export const getPuppyVerdict = async (data: CaseData, persona: JudgePersona = JudgePersona.CUTE): Promise<VerdictData> => {
  if (!process.env.API_KEY) {
    Logger.error("API Key is missing from environment variables");
    throw new Error("API Key is missing.");
  }

  Logger.info(`Starting verdict generation. Persona: ${persona}`, data);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = persona === JudgePersona.CUTE ? CUTE_PROMPT_TEMPLATE : TOXIC_PROMPT_TEMPLATE;

  // Handle optional fields
  const userSideText = data.userSide && data.userSide.trim() !== "" ? data.userSide : "（用户未详细说明，请根据背景推断其心理）";
  const partnerSideText = data.partnerSide && data.partnerSide.trim() !== "" ? data.partnerSide : "（对方未详细说明，请根据背景推断其想法）";

  const prompt = `
    ${systemInstruction}

    **输入数据**
    - 吵架现场/背景：${data.background}
    - 你的观点（用户）：${userSideText}
    - TA的观点（对方）：${partnerSideText}

    **输出要求**
    请严格按照JSON Schema格式返回结果：
    - 'eventAnalysis': 对应分析框架中的第一点（心理解析 或 事件戳穿）。
    - 'analysisPoints': 请将核心点拆解为3个要点（如果是毒舌模式，请列出3个最扎心的矛盾点/槽点）。
    - 'userPercentage': 用户(你)的【立场占比/槽点占比】数值 (0-100)。**毒舌模式下请务必拉开差距，拒绝端水！**
    - 'partnerPercentage': 对方(TA)的【立场占比/槽点占比】数值。
    - 'userSideSummary': 用一句话概括（或嘲讽）用户的观点。
    - 'partnerSideSummary': 用一句话概括（或嘲讽）对方的观点。
    - 'shortAdvice': 对应【1-2天内可做的事 / 当下止损招】。**如果是毒舌模式，此字段必须返回空字符串 ""，因为不需要给止损招。**
    - 'longAdvice': 对应【长期沟通习惯 / 别再犯蠢指南】。
  `;

  Logger.info("Constructed Prompt", { systemInstructionPreview: systemInstruction.substring(0, 50) + "..." });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: verdictSchema,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      Logger.error("Empty response received from Gemini API");
      throw new Error("No response from AI");
    }

    Logger.info("Raw Gemini Response", jsonText);

    const parsedData = JSON.parse(jsonText) as VerdictData;
    Logger.info("Parsed Verdict Data", parsedData);
    
    return parsedData;

  } catch (error) {
    Logger.error("Gemini API Error or Parsing Error", error);
    throw error;
  }
};
