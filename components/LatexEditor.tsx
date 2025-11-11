import React, { useState, useEffect, useRef } from 'react';
import { ActionButton } from './ui/ActionButton';

export const LatexEditor: React.FC = () => {
  const [latexInput, setLatexInput] = useState(
    'Soạn thảo văn bản và công thức toán học tại đây.\n\n' +
    'Để viết một công thức toán, hãy đặt nó trong cặp dấu đô la ($).\n' +
    'Ví dụ: $E = mc^2$.\n\n' +
    'Để tạo một phân số, hãy dùng lệnh \\frac. Công thức đầy đủ sẽ là: $\\frac{tử số}{mẫu số}$.\n\n' +
    'Mẹo: Sử dụng nút "Thêm Phân số" để chèn nhanh mẫu này!'
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const renderMath = () => {
      if (previewRef.current && (window as any).renderMathInElement) {
        // Sử dụng textContent để tránh XSS và render lại một cách chính xác
        previewRef.current.textContent = latexInput;
        try {
            (window as any).renderMathInElement(previewRef.current, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
              ],
              throwOnError: false
            });
        } catch (error) {
            console.error("KaTeX rendering error:", error);
        }
      }
    };
    renderMath();
  }, [latexInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLatexInput(event.target.value);
  };
  
  const insertFractionTemplate = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = latexInput;
      const template = '$\\frac{tử số}{mẫu số}$';
      const newText = text.substring(0, start) + template + text.substring(end);
      
      setLatexInput(newText);
      
      // Use a timeout to ensure the state update is rendered before we set selection.
      setTimeout(() => {
        const selectionStart = start + 7; // after "$\\frac{"
        const selectionEnd = selectionStart + 5; // length of "tử số"
        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionEnd);
      }, 0);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 border-b pb-4 mb-6">
        Công cụ Soạn thảo LaTeX
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Nhập nội dung vào ô bên dưới. Sử dụng ký hiệu <code>$...$</code> hoặc <code>$$...$$</code> để bao quanh các công thức toán học và xem trước trực tiếp.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* KHUNG SOẠN THẢO */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Phần Soạn thảo</h2>
          <textarea
            ref={textareaRef}
            value={latexInput}
            onChange={handleInputChange}
            className="w-full h-96 p-4 text-base font-mono border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 resize-y"
            placeholder="Ví dụ: Tính giá trị của $\frac{1}{2} + \frac{3}{4}$"
            aria-label="Trình soạn thảo LaTeX"
          />
           <div className="mt-3 flex gap-2">
            <ActionButton
                onClick={insertFractionTemplate}
                text="Thêm Phân số"
                color="gray"
                small
            />
          </div>
        </div>

        {/* KHUNG XEM TRƯỚC */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Phần Xem trước</h2>
          <div 
            ref={previewRef}
            className="w-full h-96 p-4 bg-white border border-indigo-200 rounded-lg shadow-inner prose max-w-none overflow-y-auto"
            style={{ whiteSpace: 'pre-wrap' }}
            aria-live="polite"
          >
            {/* Nội dung được render bởi useEffect */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatexEditor;