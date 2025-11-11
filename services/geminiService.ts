import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AiParams, ExamInfo, MatrixStructureItem, ExamAnalysisResult, ChatMessage, QuizQuestion } from '../types';

// Allow TypeScript to recognize the globally included mammoth.js library
declare const mammoth: any;

// FIX: Initialize the GoogleGenAI client according to the guidelines.
// The API key must be passed as a named parameter in an object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';
const proModel = 'gemini-2.5-pro';

// Helper to safely parse JSON from AI response
// FIX: Improved JSON parsing to handle conversational text and markdown fences from the AI.
// This function now robustly extracts the JSON object or array from the full response string.
const parseJsonResponse = <T>(jsonString: string, fallback: T): T => {
    try {
        // The model might return markdown with a json block or conversational text.
        // Find the start of the first JSON object '{' or array '['
        const firstBracket = jsonString.indexOf('{');
        const firstSquare = jsonString.indexOf('[');
        
        let startIndex = -1;
        
        if (firstBracket === -1 && firstSquare === -1) {
             throw new Error("No JSON object or array found in the string.");
        }

        if (firstBracket === -1) {
            startIndex = firstSquare;
        } else if (firstSquare === -1) {
            startIndex = firstBracket;
        } else {
            startIndex = Math.min(firstBracket, firstSquare);
        }

        // Find the end of the last JSON object '}' or array ']'
        const lastBracket = jsonString.lastIndexOf('}');
        const lastSquare = jsonString.lastIndexOf(']');
        
        const endIndex = Math.max(lastBracket, lastSquare);

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error("Invalid JSON structure found in the string.");
        }

        const jsonStr = jsonString.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonStr) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", jsonString, error);
        return fallback;
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};


export async function analyzeSubject(subject: string, className: string): Promise<{ contentArea: string, learningObjective: string }[]> {
    const prompt = `Phân tích chương trình học môn ${subject} cho lớp ${className} theo chương trình giáo dục Việt Nam. Liệt kê các chủ đề kiến thức (contentArea) và yêu cầu cần đạt (learningObjective) tương ứng. Trả về dưới dạng một mảng JSON.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        contentArea: { type: Type.STRING },
                        learningObjective: { type: Type.STRING },
                    },
                    required: ["contentArea", "learningObjective"],
                },
            },
        },
    });

    return parseJsonResponse(response.text, []);
}

export async function suggestMatrix(topic: string, subject: string, className:string): Promise<any> {
    const prompt = `Dựa vào chủ đề trọng tâm "${topic}" cho môn ${subject} lớp ${className}, hãy gợi ý một ma trận phân bổ câu hỏi và điểm số theo 3 mức độ (level1, level2, level3) và 5 loại câu hỏi (mc, fill, match, tf, tuLuan). Mỗi loại có count (số câu) và points (điểm). Trả về dưới dạng đối tượng JSON.`;
    
    const detailsSchema = {
        type: Type.OBJECT,
        properties: {
            count: { type: Type.INTEGER },
            points: { type: Type.NUMBER },
        },
        required: ["count", "points"],
    };
    
    const levelSchema = {
        type: Type.OBJECT,
        properties: {
            mc: detailsSchema,
            fill: detailsSchema,
            match: detailsSchema,
            tf: detailsSchema,
            tuLuan: detailsSchema,
        },
        required: ["mc", "fill", "match", "tf", "tuLuan"],
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    level1: levelSchema,
                    level2: levelSchema,
                    level3: levelSchema,
                },
                required: ["level1", "level2", "level3"],
            },
        },
    });

    return parseJsonResponse(response.text, {});
}

export async function generateVariation(originalText: string): Promise<string> {
    const prompt = `Tạo một biến thể (variation) của câu hỏi sau đây, giữ nguyên ý nghĩa và độ khó nhưng thay đổi cách diễn đạt và số liệu (nếu có): "${originalText}"`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
}

// FIX: Adhered to API guidelines by separating image generation and text description into two calls.
// The `responseModalities` config for image models must only contain `Modality.IMAGE`.
export async function enhanceImage(base64: string, mimeType: string): Promise<{ base64Image: string, text?: string }> {
    const imagePart = { inlineData: { data: base64, mimeType } };
    const enhancePrompt = "Xóa tất cả chữ viết tay, chú thích hoặc văn bản không cần thiết khỏi hình ảnh sách giáo khoa này. Nâng cao chất lượng, độ rõ nét và màu sắc. Làm cho nó sạch sẽ và phù hợp cho một câu hỏi thi. Nếu có các nhân vật, hãy vẽ lại chúng theo phong cách hoạt hình thân thiện, phù hợp với học sinh tiểu học.";
    
    // First call: Enhance the image. This model can only return an image.
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: enhancePrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    let base64Image = '';
    let processedImagePart: any = null;

    for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
            processedImagePart = part;
            base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    if (!processedImagePart) {
        throw new Error("Không thể xử lý hình ảnh.");
    }
    
    // Second call: Get a description for the newly generated image.
    const descriptionPrompt = "Mô tả ngắn gọn nội dung của hình ảnh này.";
    const descriptionResponse = await ai.models.generateContent({
        model: proModel, // Using a text model for better description
        contents: { parts: [processedImagePart, { text: descriptionPrompt }] },
    });
    
    return { base64Image, text: descriptionResponse.text };
}

export async function generateImageVariationFromBase(base64Data: string, mimeType: string, prompt: string): Promise<{ base64Image: string }> {
    const imagePart = { inlineData: { data: base64Data, mimeType } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return { base64Image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
        }
    }
    throw new Error("Không thể tạo biến thể hình ảnh.");
}

export async function generateQuestions(aiParams: AiParams, examInfo: ExamInfo, matrixStructure: MatrixStructureItem[], sourceText?: string, groundingOptions?: { useSearch: boolean; useMaps: boolean }): Promise<{ generatedQuestions: any, groundingMetadata: any }> {
    let mathInstructions = '';
    const className = examInfo.className.toLowerCase();
    const subject = examInfo.subject.toLowerCase();

    // Check if the exam is for 4th or 5th grade Math
    if ((subject.includes('toán')) && (className.includes('4') || className.includes('5'))) {
        mathInstructions = `
---
**YÊU CẦU ĐẶC BIỆT CHO MÔN TOÁN LỚP 4 & 5:**

**Vai trò:** Bạn là một trợ lý chuyên gia, có kinh nghiệm ra đề kiểm tra môn Toán cấp Tiểu học theo Chương trình GDPT 2018, tuân thủ nghiêm ngặt Thông tư 27.
**Nhiệm vụ:** Soạn câu hỏi kiểm tra môn Toán cho học sinh lớp ${examInfo.className} về chủ đề "${aiParams.topic}".

**YÊU CẦU ĐỊNH DẠNG BẮT BUỘC VỀ TOÁN HỌC (SỬ DỤNG LATEX):**

1.  **Phân số:** Tất cả các phân số phải được viết bằng cú pháp LaTeX.
    *   Khi phân số đứng một mình (display mode), sử dụng cú pháp: \`$$\\frac{a}{b}$$\`. Ví dụ: \`$$\\frac{3}{4}$$\`.
    *   Khi phân số nằm trong câu văn (inline mode), sử dụng cú pháp: \`$\\frac{a}{b}$\`. Ví dụ: "...phân số \`$\\frac{1}{2}$\`...".

2.  **Hỗn số:** Tất cả các hỗn số phải được viết bằng cú pháp LaTeX.
    *   Sử dụng cú pháp: \`$$A\\frac{b}{c}$$\` (cho display mode). Ví dụ: \`$$5\\frac{1}{2}$$\`.
    *   Sử dụng cú pháp: \`$A\\frac{b}{c}$\` (cho inline mode). Ví dụ: "...hỗn số \`$3\\frac{1}{4}$\`...".

Ngôn ngữ phải rõ ràng, phù hợp với lứa tuổi học sinh và phải kèm đáp án chi tiết.
---
`;
    }
    
    const prompt = `Dựa trên các thông số sau, hãy tạo một bộ câu hỏi kiểm tra:
    - Thông tin đề thi: ${JSON.stringify(examInfo)}
    - Chủ đề/Nội dung trọng tâm: ${aiParams.topic}
    - Cấu trúc ma trận: ${JSON.stringify(matrixStructure)}
    - Phân bổ câu hỏi và điểm số: ${JSON.stringify(aiParams)}
    ${sourceText ? `- Dựa vào nội dung tài liệu tham khảo sau: """${sourceText}"""` : ''}

    ${mathInstructions}

    QUAN TRỌNG: Hãy tuân thủ nghiêm ngặt các quy định về ma trận đề và các mức độ nhận thức (Mức 1 - Nhận biết, Mức 2 - Thông hiểu, Mức 3 - Vận dụng) theo Thông tư 27/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo Việt Nam.
    
    Vui lòng trả về một đối tượng JSON có các khóa "level1_questions", "level2_questions", "level3_questions". 
    Mỗi khóa chứa các mảng câu hỏi cho các loại: "multiple_choice", "fill_in_the_blank", "matching", "true_false", "self_essay".
    Câu trắc nghiệm (multiple_choice) phải có: question_text, options (A, B, C, D), correct_answer.
    Các câu khác phải có: question_text, correct_answer.
    Câu tự luận (self_essay) phải có: question_text, answer_guide.
    Gắn thẻ loại câu hỏi vào đầu nội dung, ví dụ: [Trắc nghiệm], [Tự luận].
    Gắn đáp án hoặc hướng dẫn chấm vào cuối, trong cặp dấu *, ví dụ *Đáp án: A* hoặc *Hướng dẫn chấm: ...*
    `;

    const config: any = {};
    const tools: any[] = [];
    if (groundingOptions?.useSearch) tools.push({ googleSearch: {} });
    if (groundingOptions?.useMaps) tools.push({ googleMaps: {} });
    if (tools.length > 0) config.tools = tools;

    const response = await ai.models.generateContent({ model: proModel, contents: prompt, config });

    const generatedQuestions = parseJsonResponse(response.text, {});
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return { generatedQuestions, groundingMetadata };
}

export async function generateSingleQuestion(level: '1' | '2' | '3', contentArea: string, matrixStructure: MatrixStructureItem[], examInfo: ExamInfo, existingQuestionTexts: string[]): Promise<string> {
    const topic = matrixStructure.find(area => area.id === contentArea);
    const prompt = `Tạo một câu hỏi duy nhất cho môn ${examInfo.subject}, lớp ${examInfo.className} ở mức độ ${level}.
    Chủ đề: ${topic?.name} - Yêu cầu cần đạt: ${topic?.yccd}.
    Không được trùng lặp với các câu hỏi đã có sau: ${existingQuestionTexts.join('; ')}.
    Gắn thẻ loại câu hỏi (ví dụ: [Trắc nghiệm]) và đáp án (ví dụ: *Đáp án: A*).`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
}

export async function analyzePastedExamOrMatrix(pastedText: string): Promise<{ aiParams: AiParams, matrixStructure: Omit<MatrixStructureItem, 'id'>[], examInfo: Partial<ExamInfo> }> {
    const prompt = `Phân tích văn bản sau, có thể là ma trận đề thi hoặc đề thi hoàn chỉnh. Trích xuất thông tin và trả về dưới dạng JSON với các khóa: "examInfo", "matrixStructure", "aiParams".
    - "examInfo": schoolName, className, subject, examTime, examTitle.
    - "matrixStructure": mảng các đối tượng với "name" (Nội dung/chủ đề) và "yccd" (Yêu cầu cần đạt).
    - "aiParams": topic (tóm tắt nội dung chính), và phân bổ câu hỏi (count, points) cho level1, level2, level3 và các loại (mc, fill, match, tf, tuLuan).
    
    Văn bản cần phân tích:
    """
    ${pastedText}
    """
    `;

    const response = await ai.models.generateContent({ model: proModel, contents: prompt });
    return parseJsonResponse(response.text, { aiParams: {} as AiParams, matrixStructure: [], examInfo: {} });
}

export async function extractTextFromFile(file: File): Promise<string> {
    if (file.type.startsWith('text/')) {
        return file.text();
    }

    // Handle .docx files with mammoth.js on the client-side
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!event.target?.result) {
                    return reject(new Error("Không thể đọc tệp."));
                }
                mammoth.extractRawText({ arrayBuffer: event.target.result })
                    .then((result: { value: string; messages: any[] }) => {
                        resolve(result.value);
                    })
                    .catch((error: any) => {
                        console.error("Lỗi khi trích xuất văn bản từ .docx:", error);
                        reject(new Error("Không thể trích xuất văn bản từ tệp .docx."));
                    });
            };
            reader.onerror = () => {
                reject(new Error("Đã xảy ra lỗi khi đọc tệp."));
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Handle images and PDF with Gemini API
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const filePart = await fileToGenerativePart(file);
        const prompt = "Trích xuất toàn bộ văn bản từ tài liệu/hình ảnh này. Giữ nguyên định dạng nhiều nhất có thể.";
        const response = await ai.models.generateContent({
            model: proModel,
            contents: { parts: [filePart, { text: prompt }] },
        });
        return response.text;
    }
    
    throw new Error(`Loại tệp không được hỗ trợ: ${file.type}`);
}

export async function summarizeForTopic(combinedText: string): Promise<string> {
    const prompt = `Tóm tắt nội dung sau thành một chủ đề/nội dung trọng tâm ngắn gọn (không quá 15 từ) để dùng làm tiêu đề cho một đề kiểm tra:
    """
    ${combinedText}
    """`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
}

export async function generateMatchingPairs(mainText: string, subject: string, className: string, topicName: string): Promise<{ pairs: string[], key: string }> {
    const prompt = `Dựa trên câu hỏi "${mainText}" và chủ đề "${topicName}" của môn ${subject} lớp ${className}, hãy tạo 4 cặp nối logic liên quan. 
    Trả về một đối tượng JSON với 2 khóa:
    - "pairs": một mảng gồm 8 chuỗi, xen kẽ mục cột trái và cột phải.
    - "key": một chuỗi đáp án đúng, ví dụ "1-B, 2-D, 3-A, 4-C".`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pairs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    key: { type: Type.STRING },
                },
                required: ["pairs", "key"],
            },
        },
    });

    return parseJsonResponse(response.text, { pairs: [], key: '' });
}

export async function generateSpeechForText(text: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Đọc một cách rõ ràng, tốc độ vừa phải: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Không thể tạo âm thanh.");
    }
    return base64Audio;
}

export async function analyzeExamText(textToAnalyze: string): Promise<ExamAnalysisResult> {
    const prompt = `Phân tích văn bản đề thi sau đây và trích xuất thông tin chi tiết. Trả về dưới dạng một đối tượng JSON.
    Văn bản: """${textToAnalyze}"""`;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    monHoc: { type: Type.STRING },
                    tongSoCau: { type: Type.INTEGER },
                    maTran: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                chuDe: { type: Type.STRING },
                                nhanBiet: { type: Type.INTEGER },
                                thongHieu: { type: Type.INTEGER },
                                vanDung: { type: Type.INTEGER },
                                vanDungCao: { type: Type.INTEGER },
                                tongCong: { type: Type.INTEGER },
                            },
                        },
                    },
                    chiTietCauHoi: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                soThuTu: { type: Type.INTEGER },
                                noiDung: { type: Type.STRING },
                                luaChon: { type: Type.OBJECT },
                                dapAnDung: { type: Type.STRING },
                                chuDe: { type: Type.STRING },
                                mucDo: { type: Type.STRING },
                            },
                        },
                    },
                },
                required: ["monHoc", "tongSoCau", "maTran", "chiTietCauHoi"],
            },
        },
    });

    return parseJsonResponse(response.text, {} as ExamAnalysisResult);
}

export async function generateImageFromPrompt(prompt: string, aspectRatio: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio,
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}

export async function generateTalentTrainingMaterial(params: { subject: string; className: string; topic: string; difficulty: string; numQuestions: number; }): Promise<{ questionText: string; detailedAnswer: string; points: number; }[]> {
    const prompt = `Tạo ${params.numQuestions} câu hỏi bồi dưỡng học sinh giỏi môn ${params.subject} lớp ${params.className}, chủ đề "${params.topic}", độ khó cấp ${params.difficulty}. 
    Mỗi câu hỏi phải có:
    - "questionText": Nội dung câu hỏi.
    - "detailedAnswer": Hướng dẫn giải chi tiết, từng bước và thang điểm gợi ý.
    - "points": Tổng số điểm cho câu hỏi đó.
    Trả về dưới dạng mảng JSON.`;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: { type: Type.STRING },
                        detailedAnswer: { type: Type.STRING },
                        points: { type: Type.NUMBER },
                    },
                    required: ["questionText", "detailedAnswer", "points"],
                },
            },
        },
    });

    return parseJsonResponse(response.text, []);
}

export async function getChatbotResponse(userMessage: string, chatHistory: { role: 'user' | 'model'; text: string }[]): Promise<string> {
    const systemInstruction = `Bạn là Trí Tuệ Bot, một trợ lý AI thân thiện chuyên hướng dẫn người dùng sử dụng ứng dụng 'Trí Tuệ Khảo Thí' để tạo đề thi cho học sinh tiểu học.
    Bạn được trang bị kiến thức chuyên sâu về các văn bản pháp quy của Bộ Giáo dục và Đào tạo Việt Nam, bao gồm:
    1. **Chương trình Giáo dục phổ thông 2018 (ban hành theo Thông tư 32/2018/TT-BGDĐT):** Nắm vững quan điểm, mục tiêu, yêu cầu cần đạt về phẩm chất và năng lực, kế hoạch giáo dục và định hướng nội dung cho các cấp học.
    2. **Thông tư 27/2020/TT-BGDĐT:** Hiểu rõ quy định về đánh giá học sinh tiểu học, đặc biệt là 3 mức độ nhận thức khi ra đề kiểm tra:
       - Mức 1 (Nhận biết): Nhắc lại, mô tả kiến thức đã học.
       - Mức 2 (Thông hiểu/Kết nối): Sắp xếp, kết nối kiến thức để giải quyết vấn đề tương tự.
       - Mức 3 (Vận dụng): Vận dụng kiến thức vào các vấn đề mới, tình huống thực tế.
    
    Nhiệm vụ của bạn là giải đáp các thắc mắc của người dùng liên quan đến chức năng của ứng dụng và các quy định giáo dục nêu trên. Nếu người dùng hỏi ngoài chủ đề, hãy lịch sự từ chối và hướng dẫn họ quay lại chủ đề chính.`;
    
    // Convert to the format expected by the API
    const contents: any[] = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
        model,
        contents: contents,
        config: {
            systemInstruction,
        },
    });

    return response.text;
}

// --- NEW FUNCTIONS FOR NOTEBOOK ---

export async function getChatResponseAboutSource(userMessage: string, sourceContent: string, chatHistory: ChatMessage[]): Promise<string> {
    const systemInstruction = `Bạn là một trợ lý AI chuyên gia. Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng DỰA VÀO NỘI DUNG của tài liệu được cung cấp. Trả lời một cách ngắn gọn, chính xác và chỉ sử dụng thông tin từ tài liệu. Nếu câu trả lời không có trong tài liệu, hãy nói rõ "Thông tin này không có trong tài liệu."`;

    const historyForApi = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const fullHistory = [
        ...historyForApi,
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    const prompt = `DỰA VÀO TÀI LIỆU SAU:
    ---
    ${sourceContent}
    ---
    HÃY TRẢ LỜI CÂU HỎI CỦA NGƯỜI DÙNG.`;
    
    const contents = [{ role: 'user', parts: [{ text: prompt }] }, ...fullHistory];

    const response = await ai.models.generateContent({
        model,
        contents: contents,
        config: {
            systemInstruction,
        },
    });

    return response.text;
}

export async function generateMindMap(sourceContent: string): Promise<string> {
    const prompt = `Tóm tắt nội dung sau thành một SƠ ĐỒ TƯ DUY (mind map) dưới dạng một danh sách markdown lồng nhau. Sử dụng dấu gạch đầu dòng (-) và thụt lề để biểu thị các cấp độ. Bắt đầu với một nút trung tâm duy nhất.
    Nội dung: """${sourceContent}"""`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
}

export async function generateQuiz(sourceContent: string): Promise<QuizQuestion[]> {
    const prompt = `Dựa vào nội dung sau, tạo 5 câu hỏi trắc nghiệm để kiểm tra kiến thức. Mỗi câu hỏi phải có 4 lựa chọn (A, B, C, D) và chỉ một đáp án đúng.
    Nội dung: """${sourceContent}"""
    
    Vui lòng trả về một mảng JSON. Mỗi phần tử là một đối tượng có các khóa: "question" (chuỗi), "options" (mảng 4 chuỗi), và "answer" (chuỗi, là nội dung của đáp án đúng).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING },
                    },
                    required: ["question", "options", "answer"],
                },
            },
        },
    });
    
    return parseJsonResponse(response.text, []);
}

export async function summarizeUrlContent(url: string): Promise<{ title: string, content: string }> {
    const prompt = `Vui lòng tóm tắt nội dung chính từ URL sau đây. Trả về một đối tượng JSON với hai khóa: "title" (tiêu đề của trang) và "content" (bản tóm tắt chi tiết). URL: ${url}`;
    
    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    // The model with grounding might not return clean JSON directly in text.
    // It's better to ask it to describe and then parse.
    // A more robust approach would be a two-step prompt, but let's try a direct one.
     const prompt2 = `Dựa vào kết quả tìm kiếm cho URL "${url}", hãy tạo một đối tượng JSON với hai khóa: "title" (tiêu đề của trang) và "content" (bản tóm tắt chi tiết).`;
     const response2 = await ai.models.generateContent({
        model: model,
        contents: [response.candidates[0].content, {role: 'user', parts: [{text: prompt2}]}],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                 type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                },
                required: ["title", "content"],
            }
        }
     });

    return parseJsonResponse(response2.text, { title: url, content: "Không thể tóm tắt nội dung từ URL này." });
}

export async function generateContentForDriveFile(fileName: string): Promise<string> {
    const prompt = `Tạo nội dung chi tiết cho một tài liệu giáo dục cấp tiểu học có tên là "${fileName}". Nội dung cần đầy đủ, có cấu trúc rõ ràng, và phù hợp để làm tài liệu tham khảo cho giáo viên.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
}