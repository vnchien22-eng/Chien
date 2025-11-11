import React, { useState, useRef } from 'react';
import * as geminiService from '../../services/geminiService';
import type { ExamAnalysisResult } from '../../types';
import { IconSpinner, IconPlus } from '../ui/Icons';

const AnalysisResultDisplay: React.FC<{ result: ExamAnalysisResult }> = ({ result }) => (
    <div className="mt-8 space-y-8">
        {/* --- Summary --- */}
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800">Phân tích Tổng quan</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Môn học:</strong> {result.monHoc}</p>
                <p><strong>Tổng số câu hỏi:</strong> {result.tongSoCau}</p>
            </div>
        </div>

        {/* --- Matrix Table --- */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Ma trận Đề thi</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Chủ đề</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Nhận biết</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Thông hiểu</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Vận dụng</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Vận dụng cao</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tổng cộng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {result.maTran.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.chuDe}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">{row.nhanBiet || 0}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">{row.thongHieu || 0}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">{row.vanDung || 0}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">{row.vanDungCao || 0}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-900 font-bold">{row.tongCong || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- Detailed Questions --- */}
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết Câu hỏi</h3>
            <div className="space-y-4">
                {result.chiTietCauHoi.map(q => (
                    <div key={q.soThuTu} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <p className="font-bold text-gray-800">Câu {q.soThuTu}:</p>
                        <p className="mt-1 text-gray-700">{q.noiDung}</p>
                        {q.luaChon && (
                            <ul className="mt-2 space-y-1 pl-4">
                                {Object.entries(q.luaChon).map(([key, value]) => (
                                    <li key={key} className={`text-sm ${key === q.dapAnDung ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                                        <strong>{key}.</strong> {value} {key === q.dapAnDung && ' (Đáp án đúng)'}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="font-semibold">Chủ đề: <span className="font-normal bg-gray-100 px-2 py-0.5 rounded-full">{q.chuDe}</span></span>
                            <span className="font-semibold">Mức độ: <span className="font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{q.mucDo}</span></span>
                             <span className="font-semibold">Đáp án: <span className="font-normal bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{q.dapAnDung}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export const ExamAnalyzer: React.FC = () => {
    const [examText, setExamText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<ExamAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyzeText = async (textToAnalyze: string) => {
        if (!textToAnalyze.trim()) {
            setError('Vui lòng dán nội dung đề thi vào ô bên dưới.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await geminiService.analyzeExamText(textToAnalyze);
            setAnalysisResult(result);
        } catch (err) {
            console.error("Error analyzing exam:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi không xác định xảy ra.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setExamText('');

        try {
            setExamText(`[Đang phân tích nội dung từ tệp: ${file.name}...]`);
            const extractedText = await geminiService.extractTextFromFile(file);
            setExamText(extractedText);
            const result = await geminiService.analyzeExamText(extractedText);
            setAnalysisResult(result);
        } catch (err) {
            console.error("Error analyzing file:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi không xác định xảy ra.");
            setExamText('');
        } finally {
            setIsLoading(false);
        }
        
        if (event.target) event.target.value = '';
    };
    
    return (
        <>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="text-center mb-6 border-b pb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Phân tích Đề thi có sẵn</h1>
                    <p className="text-gray-500 mt-2">Dán nội dung đề thi hoặc tải lên tệp để AI tự động bóc tách ma trận và phân tích chi tiết.</p>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <label htmlFor="exam-content" className="block text-sm font-medium text-gray-700 mb-1">
                            Nội dung đề thi
                        </label>
                        <textarea 
                            id="exam-content"
                            rows={15}
                            value={examText}
                            onChange={(e) => setExamText(e.target.value)}
                            placeholder="Dán toàn bộ nội dung văn bản của đề thi vào đây..."
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => handleAnalyzeText(examText)} 
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                             {isLoading ? 'Đang phân tích...' : '✨ Phân tích với AI'}
                             {isLoading && <IconSpinner />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p><strong>Lỗi:</strong> {error}</p>
                    </div>
                )}
                
                {analysisResult && <AnalysisResultDisplay result={analysisResult} />}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.pdf,image/*"
            />
            
            <button
                onClick={() => fileInputRef.current?.click()}
                className="fixed bottom-8 left-8 z-20 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110"
                aria-label="Tải đề thi từ máy tính"
                title="Tải đề thi từ máy tính"
            >
                <IconPlus className="w-8 h-8 mr-0" />
            </button>
        </>
    );
};