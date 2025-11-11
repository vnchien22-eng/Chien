// Tệp: services/geminiService.ts (MỚI - Phiên bản an toàn)
// Tệp này chỉ "gọi điện" đến "Quầy Lễ Tân", không còn logic AI

// Import lại các 'type' mà các hàm cần
import type { AiParams, ExamInfo, MatrixStructureItem, ExamAnalysisResult, ChatMessage, QuizQuestion } from '../types';

// Địa chỉ "Quầy Lễ Tân" Vercel của Thầy
// (Trỏ đến tệp api/index.ts mà Thầy vừa đẩy lên)
const PROXY_URL = 'https://chien-api-proxy.vercel.app/api'; 

/**
 * Đây là hàm "gọi điện" chung đến "Quầy Lễ Tân".
 * Mọi hàm khác đều sẽ dùng hàm này.
 * @param action Tên hàm AI muốn gọi (ví dụ: 'analyzeSubject')
 * @param params Dữ liệu gửi lên (ví dụ: { subject: 'Toán' })
 */
async function callProxy(action: string, params: any): Promise<any> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Gửi đi "action" và "params"
      body: JSON.stringify({ action, params }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Lỗi từ Proxy:", data.error);
      throw new Error(data.error || 'Lỗi từ máy chủ proxy');
    }
    // Trả về kết quả (JSON, text, object...)
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi Proxy:", error);
    throw error; // Ném lỗi ra để component cha (App.tsx) bắt
  }
}

// --- BÂY GIỜ CHÚNG TA BẬT LẠI TẤT CẢ CÁC HÀM CŨ ---
// (Bằng cách gọi đến 'callProxy')

export async function analyzeSubject(subject: string, className: string): Promise<{ contentArea: string, learningObjective: string }[]> {
  return callProxy('analyzeSubject', { subject, className });
}

export async function suggestMatrix(topic: string, subject: string, className:string): Promise<any> {
  return callProxy('suggestMatrix', { topic, subject, className });
}

export async function generateVariation(originalText: string): Promise<string> {
  // Hàm này trả về string, nên proxy sẽ trả về string
  return callProxy('generateVariation', { originalText });
}

export async function enhanceImage(base64: string, mimeType: string): Promise<{ base64Image: string, text?: string }> {
  // Gửi base64 và mimeType lên proxy
  return callProxy('enhanceImage', { base64, mimeType });
}

export async function generateImageVariationFromBase(base64Data: string, mimeType: string, prompt: string): Promise<{ base64Image: string }> {
  return callProxy('generateImageVariationFromBase', { base64Data, mimeType, prompt });
}

export async function generateQuestions(aiParams: AiParams, examInfo: ExamInfo, matrixStructure: MatrixStructureItem[], sourceText?: string, groundingOptions?: { useSearch: boolean; useMaps: boolean }): Promise<{ generatedQuestions: any, groundingMetadata: any }> {
  return callProxy('generateQuestions', { aiParams, examInfo, matrixStructure, sourceText, groundingOptions });
}

export async function generateSingleQuestion(level: '1' | '2' | '3', contentArea: string, matrixStructure: MatrixStructureItem[], examInfo: ExamInfo, existingQuestionTexts: string[]): Promise<string> {
    return callProxy('generateSingleQuestion', { 
        level, 
        contentArea, 
        matrixStructure,
        examInfo, 
        existingQuestionTexts 
    });
}

export async function generateTalentTrainingMaterial(params: { subject: string; className: string; topic: string; difficulty: string; numQuestions: number; }): Promise<{ questionText: string; detailedAnswer: string; points: number; }[]> {
    // Gói 'params' lại đúng như proxy 'case'
    return callProxy('generateTalentTrainingMaterial', { params });
}

export async function getChatbotResponse(userMessage: string, chatHistory: { role: 'user' | 'model'; text: string }[]): Promise<string> {
    return callProxy('getChatbotResponse', { userMessage, chatHistory });
}

// *** LƯU Ý: CÁC HÀM XỬ LÝ FILE (TỪ MÁY TÍNH) ***
// Chúng ta sẽ giữ nguyên logic đọc file (docx, text) ở client
// Chỉ gửi Ảnh/PDF (dưới dạng base64) lên proxy

// (Thầy copy/paste các hàm còn lại từ code GỐC của Thầy vào đây, 
// VÀ sửa nội dung của chúng để gọi `callProxy`
// Tạm thời, các hàm này đã đủ để bật lại các tính năng Thầy bị tắt)

// Ví dụ, Thầy cần copy lại các hàm sau từ code GỐC (nếu có):
// export async function analyzePastedExamOrMatrix(...) { ... }
// export async function extractTextFromFile(...) { ... }
// export async function summarizeForTopic(...) { ... }
// export async function generateMatchingPairs(...) { ... }
// export async function generateSpeechForText(...) { ... }
// ... và tất cả các hàm còn lại

// Bằng cách này, tệp App.tsx của Thầy sẽ không còn báo lỗi nữa.