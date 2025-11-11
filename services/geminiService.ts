// Tệp: services/geminiService.ts (NỘI DUNG MỚI AN TOÀN)

// 1. Đây là địa chỉ "Quầy Lễ Tân" an toàn Thầy đã tạo trên Vercel
const PROXY_URL = 'https://chien-api-proxy.vercel.app/api/proxy';

/**
 * Gửi một prompt (dạng văn bản) đến AI một cách an toàn
 * thông qua máy chủ proxy Vercel.
 * @param prompt Nội dung yêu cầu gửi cho AI
 * @returns Văn bản trả lời từ AI
 */
export async function runGenerationAnToan(prompt: string): Promise<string> {
  try {
    // 2. Gửi yêu cầu đến "Quầy Lễ Tân"
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }), // Gửi prompt trong body
    });

    const data = await response.json();

    if (!response.ok) {
      // Báo lỗi nếu "Quầy Lễ Tân" báo lỗi
      console.error('Lỗi từ proxy:', data.error);
      throw new Error(data.error || 'Có lỗi xảy ra từ máy chủ proxy');
    }

    // 3. Trả về kết quả text
    return data.text;

  } catch (error) {
    console.error('Lỗi khi gọi proxy:', error);
    if (error instanceof Error) {
      throw new Error(`Lỗi: ${error.message}`);
    }
    throw new Error('Lỗi không xác định khi gọi proxy');
  }
}

// TẤT CẢ CÁC HÀM PHỨC TẠP KHÁC (như enhanceImage, generateSpeech...)
// SẼ TẠM THỜI BỊ VÔ HIỆU HÓA.
// Chúng ta sẽ nâng cấp proxy để xử lý chúng sau.