import React, { useState, useMemo } from 'react';
import type { Question, MatrixStructureItem, QuestionType, ExamInfo } from '../../types';
import { IconSparkles, IconImage, IconSpinner, IconX, IconTrash, IconArrowUpCircle, IconArrowDownCircle, IconPlus } from '../ui/Icons';
import { SpeechInputButton } from '../ui/InputField';
import * as geminiService from '../../services/geminiService';

interface QuestionItemProps {
    question: Question;
    index: number;
    onUpdate: (id: string, updates: Partial<Question>) => void;
    onRemove: (id: string) => void;
    onGenerateVariation: (id: string, text: string) => void;
    onImageUploadAndProcess: (id: string, file: File) => void;
    onGenerateCharacterVariation: (id: string, prompt: string) => void;
    isVarying: boolean;
    matrixStructure: MatrixStructureItem[];
    onGenerateSingleQuestion: (id: string) => void;
    isGenerating: boolean;
    onPreviewImage: (url: string | null) => void;
    examInfo: ExamInfo;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ 
    question, index, onUpdate, onRemove, onGenerateVariation, 
    onImageUploadAndProcess, onGenerateCharacterVariation, isVarying, 
    matrixStructure, onGenerateSingleQuestion, isGenerating, onPreviewImage,
    examInfo
}) => {
    const [variationPrompt, setVariationPrompt] = useState('');
    const [isGeneratingMatching, setIsGeneratingMatching] = useState(false);

    const questionTypeOptions: { value: QuestionType, label: string }[] = [
        { value: 'multiple_choice', label: 'Trắc nghiệm (Khoanh)' },
        { value: 'fill_in_the_blank', label: 'Điền khuyết' },
        { value: 'matching', label: 'Nối' },
        { value: 'true_false', label: 'Đúng/Sai' },
        { value: 'essay', label: 'Tự luận' },
    ];
    
    const typeToPrefix: Record<QuestionType, string> = {
        essay: '[Tự luận]',
        multiple_choice: '[Trắc nghiệm]',
        fill_in_the_blank: '[Điền khuyết]',
        matching: '[Nối]',
        true_false: '[Đúng/Sai]',
    };

    const parsedParts = useMemo(() => {
        const text = question.text || '';
        const type = question.type;

        const answerRegex = /\*Đáp án:\s*(.*?)\*/s;
        const guideRegex = /\*Hướng dẫn chấm:\s*(.*?)\*/s;
        const optionsRegex = /\n([A-D])\.\s(.*?)(?=\n[A-D]\.|\*Đáp án:|\*Hướng dẫn chấm:|$)/gs;
        const prefixRegex = /^\[(Trắc nghiệm|Tự luận|Điền khuyết|Đúng sai|Nối)\]\s*/i;

        const answerMatch = text.match(answerRegex);
        const guideMatch = text.match(guideRegex);

        const options: { [key: string]: string } = { A: '', B: '', C: '', D: '' };
        let optionsText = '';
        if (type === 'multiple_choice') {
            const matches = text.matchAll(optionsRegex);
            for (const match of matches) {
                options[match[1] as keyof typeof options] = match[2].trim();
                optionsText += match[0];
            }
        }
        
        let mainText = text
            .replace(prefixRegex, '')
            .replace(optionsText, '')
            .replace(answerRegex, '')
            .replace(guideRegex, '')
            .trim();

        return {
            mainText,
            options,
            answer: answerMatch ? answerMatch[1].trim() : '',
            guide: guideMatch ? guideMatch[1].trim() : ''
        };
    }, [question.text, question.type]);

    const reconstructText = (parts: typeof parsedParts, type: QuestionType): string => {
        let fullText = parts.mainText.trim();
        const prefix = typeToPrefix[type] || '';
        
        if (type === 'multiple_choice') {
            fullText += `\nA. ${parts.options.A || ''}\nB. ${parts.options.B || ''}\nC. ${parts.options.C || ''}\nD. ${parts.options.D || ''}`;
            fullText += `\n*Đáp án: ${parts.answer || ''}*`;
        } else if (type === 'essay') {
            fullText += `\n*Hướng dẫn chấm: ${parts.guide || ''}*`;
        } else {
             fullText += `\n*Đáp án: ${parts.answer || ''}*`;
        }

        return `${prefix} ${fullText.trim()}`;
    };

    const handlePartChange = (part: Partial<typeof parsedParts>) => {
        const newParts = { ...parsedParts, ...part };
        if (part.options) {
            newParts.options = { ...parsedParts.options, ...part.options };
        }
        const newText = reconstructText(newParts, question.type);
        onUpdate(question.id, { text: newText });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as QuestionType;
        const newParts = {
            mainText: parsedParts.mainText,
            options: { A: '', B: '', C: '', D: '' },
            answer: '',
            guide: ''
        };
        const newText = reconstructText(newParts, newType);
        onUpdate(question.id, { type: newType, text: newText });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUploadAndProcess(question.id, e.target.files[0]);
        }
    };
    
    const handleMatchingDataChange = (itemIndex: number, value: string) => {
        const newMatchingData = [...(question.matchingData || [])];
        newMatchingData[itemIndex] = value;
        onUpdate(question.id, { matchingData: newMatchingData });
    };

    const handleAddPair = (rowIndex?: number, position: 'above' | 'below' | 'end' = 'end') => {
        const currentData = [...(question.matchingData || [])];
        if (position === 'end') {
            currentData.push('', '');
        } else if (typeof rowIndex === 'number') {
            const spliceIndex = position === 'above' ? rowIndex * 2 : (rowIndex * 2) + 2;
            currentData.splice(spliceIndex, 0, '', '');
        }
        onUpdate(question.id, { matchingData: currentData });
    };

    const handleRemovePair = (rowIndex: number) => {
        const currentData = [...(question.matchingData || [])];
        if (currentData.length <= 2) {
            // Or show a notification
            return;
        }
        currentData.splice(rowIndex * 2, 2);
        onUpdate(question.id, { matchingData: currentData });
    };

    const handleGenerateMatchingContent = async () => {
        const topicName = matrixStructure.find(s => s.id === question.contentArea)?.name || '';
        
        setIsGeneratingMatching(true);
        try {
            const result = await geminiService.generateMatchingPairs(
                parsedParts.mainText,
                examInfo.subject,
                examInfo.className,
                topicName
            );
            
            onUpdate(question.id, { matchingData: result.pairs });
            handlePartChange({ answer: result.key });

        } catch (error) {
            console.error("Error generating matching content:", error);
            alert(`Lỗi khi tạo nội dung nối: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        } finally {
            setIsGeneratingMatching(false);
        }
    };

    const matchingPairs = useMemo(() => {
        const data = question.matchingData || [];
        const pairs = [];
        for (let i = 0; i < data.length; i += 2) {
            pairs.push({ a: data[i], b: data[i + 1] ?? '', originalIndex: i });
        }
        return pairs;
    }, [question.matchingData]);

    return (
        <div className="p-4 border border-gray-200/50 rounded-lg space-y-3 bg-black/5 backdrop-blur-sm">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-700">Câu hỏi {index}</h3>
                <div className="flex space-x-2">
                    <button type="button" onClick={() => onGenerateVariation(question.id, question.text)} disabled={isVarying} className="text-sm p-1 inline-flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50">
                        {isVarying ? <IconSpinner /> : <IconSparkles />}
                        <span className="ml-1">Tạo biến thể chữ</span>
                    </button>
                    <button type="button" onClick={() => onRemove(question.id)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor={`level-${question.id}`} className="block text-sm font-medium text-gray-700">Mức độ</label>
                    <select id={`level-${question.id}`} value={question.level} onChange={(e) => onUpdate(question.id, { level: e.target.value as '1'|'2'|'3' })} className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="1">Mức 1: Nhận biết</option>
                        <option value="2">Mức 2: Kết nối</option>
                        <option value="3">Mức 3: Vận dụng</option>
                    </select>
                </div>
                <div>
                    <label htmlFor={`type-${question.id}`} className="block text-sm font-medium text-gray-700">Hình thức</label>
                    <select id={`type-${question.id}`} value={question.type} onChange={handleTypeChange} className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        {questionTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor={`points-${question.id}`} className="block text-sm font-medium text-gray-700">Điểm</label>
                     <input type="number" step="0.25" id={`points-${question.id}`} value={question.points} onChange={(e) => onUpdate(question.id, { points: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="VD: 1.5" />
                </div>
                 <div>
                    <label htmlFor={`contentArea-${question.id}`} className="block text-sm font-medium text-gray-700">Nội dung</label>
                    <select id={`contentArea-${question.id}`} value={question.contentArea} onChange={(e) => onUpdate(question.id, { contentArea: e.target.value })} className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        {matrixStructure.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor={`text-${question.id}`} className="block text-sm font-medium text-gray-700">Nội dung câu hỏi</label>
                    <button 
                        type="button" 
                        onClick={() => onGenerateSingleQuestion(question.id)}
                        disabled={isGenerating}
                        className="inline-flex items-center text-xs px-2 py-1 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                        title="Tự động tạo câu hỏi dựa trên Mức độ và Nội dung đã chọn"
                    >
                        {isGenerating ? <IconSpinner /> : <IconSparkles />}
                        <span className="ml-1">{isGenerating ? 'Đang tạo...' : 'AI tạo câu hỏi'}</span>
                    </button>
                </div>
                <div className="relative">
                    <textarea 
                        id={`text-${question.id}`} 
                        rows={3} 
                        value={parsedParts.mainText} 
                        onChange={(e) => handlePartChange({ mainText: e.target.value })} 
                        className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                        placeholder="Nhập nội dung hoặc nhấn nút 'AI tạo câu hỏi' ở trên..."
                    />
                    <div className="absolute bottom-2 right-2">
                        <SpeechInputButton onTranscript={(transcript) => handlePartChange({ mainText: parsedParts.mainText + ' ' + transcript })} />
                    </div>
                </div>
            </div>

            {/* --- Inline Editor for Question Parts --- */}
            {question.type === 'multiple_choice' && (
                <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Các lựa chọn & Đáp án</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {['A', 'B', 'C', 'D'].map(key => (
                            <div key={key} className="flex items-center">
                                <label className="font-semibold mr-2 text-gray-700">{key}.</label>
                                <input 
                                    type="text" 
                                    value={parsedParts.options[key]}
                                    onChange={(e) => handlePartChange({ options: { [key]: e.target.value } })}
                                    className="block w-full rounded-md border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder={`Nội dung đáp án ${key}`}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center pt-2">
                        <label className="text-sm font-medium text-gray-700 mr-2">Đáp án đúng:</label>
                        <select 
                            value={parsedParts.answer}
                            onChange={(e) => handlePartChange({ answer: e.target.value })}
                             className="block rounded-md border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Chọn</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            )}
             {question.type === 'matching' && (
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Nội dung Nối (2 cột)</h4>
                        <button
                            type="button"
                            onClick={handleGenerateMatchingContent}
                            disabled={isGeneratingMatching}
                            className="inline-flex items-center text-xs px-2 py-1 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                            title="AI tự động tạo 4 cặp nối dựa trên nội dung câu hỏi và chủ đề"
                        >
                            {isGeneratingMatching ? <IconSpinner /> : <IconSparkles />}
                            <span className="ml-1">{isGeneratingMatching ? 'Đang tạo...' : 'AI điền nội dung'}</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {matchingPairs.map((pair, rowIndex) => (
                            <div key={rowIndex} className="flex items-center space-x-2 group">
                                <div className="relative flex-1">
                                    <textarea
                                        value={pair.a}
                                        onChange={(e) => handleMatchingDataChange(pair.originalIndex, e.target.value)}
                                        rows={2}
                                        className="w-full p-2 pr-6 bg-white rounded-md border-gray-300/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                                        placeholder={`Nội dung cột trái ${rowIndex + 1}`}
                                    />
                                    {pair.a && (
                                        <button onClick={() => handleMatchingDataChange(pair.originalIndex, '')} className="absolute top-1 right-1 p-0.5 bg-gray-300 text-white rounded-full hover:bg-red-500 transition-colors" title="Xoá mục này">
                                            <IconX className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="relative flex-1">
                                     <textarea
                                        value={pair.b}
                                        onChange={(e) => handleMatchingDataChange(pair.originalIndex + 1, e.target.value)}
                                        rows={2}
                                        className="w-full p-2 pr-6 bg-white rounded-md border-gray-300/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
                                        placeholder={`Nội dung cột phải ${String.fromCharCode(65 + rowIndex)}`}
                                    />
                                    {pair.b && (
                                        <button onClick={() => handleMatchingDataChange(pair.originalIndex + 1, '')} className="absolute top-1 right-1 p-0.5 bg-gray-300 text-white rounded-full hover:bg-red-500 transition-colors" title="Xoá mục này">
                                            <IconX className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleAddPair(rowIndex, 'above')} className="p-1 text-gray-500 hover:text-blue-600" title="Thêm hàng trên"><IconArrowUpCircle className="w-5 h-5" /></button>
                                    <button onClick={() => handleAddPair(rowIndex, 'below')} className="p-1 text-gray-500 hover:text-blue-600" title="Thêm hàng dưới"><IconArrowDownCircle className="w-5 h-5" /></button>
                                    <button onClick={() => handleRemovePair(rowIndex)} disabled={matchingPairs.length <= 1} className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-20" title="Xoá hàng"><IconTrash className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                         <div className="flex justify-center mt-2">
                            <button onClick={() => handleAddPair(undefined, 'end')} className="inline-flex items-center px-3 py-1.5 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">
                                <IconPlus className="w-4 h-4 mr-2" />
                                Thêm cặp nối
                            </button>
                        </div>
                    </div>
                     <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700">Đáp án</label>
                        <input 
                            type="text" 
                            value={parsedParts.answer}
                            onChange={(e) => handlePartChange({ answer: e.target.value })}
                            className="mt-1 block w-full sm:w-1/2 rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ví dụ: 1-B, 2-A, 3-D, 4-C"
                        />
                    </div>
                </div>
            )}
            {question.type === 'essay' && (
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <label className="block text-sm font-medium text-gray-700">Hướng dẫn chấm</label>
                    <textarea 
                        value={parsedParts.guide}
                        onChange={(e) => handlePartChange({ guide: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                        placeholder="Nhập hướng dẫn chấm điểm chi tiết cho câu hỏi tự luận..."
                    />
                </div>
            )}
            {['fill_in_the_blank', 'true_false'].includes(question.type) && (
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <label className="block text-sm font-medium text-gray-700">Đáp án</label>
                    <input 
                        type="text" 
                        value={parsedParts.answer}
                        onChange={(e) => handlePartChange({ answer: e.target.value })}
                         className="mt-1 block w-full sm:w-1/2 rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                         placeholder="Nhập đáp án ngắn..."
                    />
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-3 border-t">
                {/* Image Display and Upload */}
                <div className="space-y-2">
                     <h4 className="text-sm font-medium text-gray-700">Hình ảnh minh họa</h4>
                     {question.isGeneratingImage && <div className="flex items-center text-sm text-gray-500"><IconSpinner /> AI đang xử lý hình ảnh, vui lòng chờ...</div>}
                     
                     {question.imageUrl ? (
                        <button type="button" onClick={() => onPreviewImage(question.imageUrl)} className="block w-auto transition-transform duration-200 hover:scale-105" title="Bấm để xem ảnh gốc">
                            <img src={question.imageUrl} alt="Hình ảnh minh họa" className="mt-2 rounded-lg border border-gray-200 max-h-48 w-auto" />
                        </button>
                     ) : !question.isGeneratingImage && (
                        <p className="text-xs text-gray-500 bg-black/10 p-2 rounded-md">Chưa có ảnh. Tải lên để AI tự động xóa chữ và tăng chất lượng.</p>
                     )}

                     <div className="flex items-center">
                        <label htmlFor={`file-${question.id}`} className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                            <IconImage />
                            <span className="ml-2">Tải & Xử lý ảnh SGK</span>
                        </label>
                        <input type="file" id={`file-${question.id}`} onChange={handleFileChange} className="hidden" accept="image/*" disabled={question.isGeneratingImage} />
                    </div>
                </div>

                {/* Character Variation Generation */}
                {question.baseCharacterImage && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Tạo biến thể từ ảnh gốc</h4>
                        <div className="flex items-start space-x-2">
                             <button type="button" onClick={() => onPreviewImage(question.baseCharacterImage)} className="block flex-shrink-0 transition-transform duration-200 hover:scale-110" title="Bấm để xem ảnh gốc">
                                <img src={question.baseCharacterImage} alt="Nhân vật gốc" className="w-16 h-16 rounded-md border object-cover" />
                             </button>
                             <textarea 
                                value={variationPrompt}
                                onChange={(e) => setVariationPrompt(e.target.value)}
                                rows={2}
                                className="block w-full rounded-lg border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                                placeholder="VD: đang đọc sách..."
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => onGenerateCharacterVariation(question.id, variationPrompt)}
                            disabled={question.isGeneratingImage}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400"
                        >
                            <IconSparkles />
                            <span className="ml-2">Tạo biến thể ảnh</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}