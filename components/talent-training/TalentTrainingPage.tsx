// FIX: Create the TalentTrainingPage component to provide the "Luyện Đội Tuyển HSG" feature.
// This resolves module not found errors for this page.
import React, { useState, useMemo, useRef } from 'react';
import type { TalentQuestion, TalentExamForSave } from '../../types';
import * as geminiService from '../../services/geminiService';
import { IconSpinner, IconPlus, IconSave, IconDownload, IconTrash } from '../ui/Icons';
import { ActionButton } from '../ui/ActionButton';

const DEFAULT_QUESTIONS = 3;

export const TalentTrainingPage: React.FC = () => {
    const [params, setParams] = useState({
        subject: 'Toán',
        className: 'Lớp 5',
        topic: 'Các bài toán về tỉ số phần trăm',
        difficulty: 'Nâng cao',
        numQuestions: DEFAULT_QUESTIONS,
    });
    const [title, setTitle] = useState('Đề bồi dưỡng HSG - Tỉ số phần trăm');
    const [duration, setDuration] = useState(90);

    const [questions, setQuestions] = useState<TalentQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedExams, setSavedExams] = useState<TalentExamForSave[]>([]);
    
    const previewRef = useRef<HTMLDivElement>(null);

    const totalPoints = useMemo(() => {
        return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    }, [questions]);
    
    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateTalentTrainingMaterial({
                ...params,
                numQuestions: Number(params.numQuestions)
            });
            const questionsWithIds = result.map(q => ({ ...q, id: `q-${Math.random()}` }));
            setQuestions(questionsWithIds);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUpdateQuestion = (id: string, field: keyof Omit<TalentQuestion, 'id'>, value: string | number) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleAddQuestion = () => {
        setQuestions(prev => [...prev, {
            id: `q-${Math.random()}`,
            questionText: '',
            detailedAnswer: '',
            points: 1
        }]);
    };

    const handleRemoveQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };
    
    const handleSaveExam = () => {
        const newExam: TalentExamForSave = {
            id: `talent-${Date.now()}`,
            title,
            questions,
            totalPoints,
            duration,
            grade: params.className,
            subject: params.subject,
        };
        setSavedExams(prev => [...prev, newExam]);
        alert('Đã lưu chuyên đề vào danh sách!');
    };

    const handleDownload = () => {
        const content = previewRef.current?.innerHTML;
        if (!content) return;
        const blob = new Blob([`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Times New Roman', serif; font-size: 13pt; }
                        .preview { max-width: 800px; margin: auto; padding: 20px; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s/g, '_')}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Left Panel: Controls */}
            <div className="lg:col-span-1 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 space-y-6 self-start">
                 <h1 className="text-xl font-bold text-center text-gray-800 border-b pb-3">Tạo Chuyên đề Bồi dưỡng HSG</h1>
                 
                 {/* Generation Params */}
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Môn học</label>
                        <input type="text" name="subject" id="subject" value={params.subject} onChange={handleParamChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="className" className="block text-sm font-medium text-gray-700">Khối lớp</label>
                        <input type="text" name="className" id="className" value={params.className} onChange={handleParamChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Chủ đề / Chuyên đề</label>
                        <input type="text" name="topic" id="topic" value={params.topic} onChange={handleParamChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Độ khó</label>
                        <select name="difficulty" id="difficulty" value={params.difficulty} onChange={handleParamChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm">
                            <option>Cơ bản</option>
                            <option>Nâng cao</option>
                            <option>Chuyên sâu</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">Số lượng câu hỏi</label>
                        <input type="number" name="numQuestions" id="numQuestions" value={params.numQuestions} onChange={handleParamChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                    </div>
                 </div>

                 <div className="text-center pt-4 border-t">
                    <ActionButton onClick={handleGenerate} disabled={isLoading} text={isLoading ? 'Đang tạo...' : '✨ Tạo với AI'}>
                        {isLoading && <IconSpinner />}
                    </ActionButton>
                 </div>
                 {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
            </div>

            {/* Right Panel: Exam Preview & Edit */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Nội dung Chuyên đề</h2>
                    <div className="flex items-center space-x-2">
                        <ActionButton onClick={handleSaveExam} small><IconSave/></ActionButton>
                        <ActionButton onClick={handleDownload} small><IconDownload/></ActionButton>
                    </div>
                </div>

                <div ref={previewRef} className="preview prose max-w-none">
                    <div className="text-center mb-8">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="text-center text-xl font-bold w-full border-b-2 border-transparent focus:border-indigo-500 outline-none"/>
                        <p className="text-sm">Môn: {params.subject} - Lớp: {params.className}</p>
                        <div className="text-sm">Thời gian: <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-16 text-center border-b-2 border-transparent focus:border-indigo-500 outline-none"/> phút</div>
                    </div>

                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={q.id} className="mb-6 relative group">
                                <button onClick={() => handleRemoveQuestion(q.id)} className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><IconTrash className="w-4 h-4" /></button>
                                <p><strong>Câu {index + 1} </strong> 
                                    (<input type="number" value={q.points} onChange={e => handleUpdateQuestion(q.id, 'points', Number(e.target.value))} className="w-16 p-0.5 text-center border-b-2 border-transparent focus:border-gray-300 outline-none" /> điểm):
                                </p>
                                <textarea value={q.questionText} onChange={e => handleUpdateQuestion(q.id, 'questionText', e.target.value)} rows={3} className="w-full p-1 border-2 border-transparent focus:border-gray-200 rounded-md outline-none resize-y"/>
                                <p className="font-semibold mt-2">Hướng dẫn giải:</p>
                                <textarea value={q.detailedAnswer} onChange={e => handleUpdateQuestion(q.id, 'detailedAnswer', e.target.value)} rows={5} className="w-full p-1 text-sm border-2 border-transparent focus:border-gray-200 rounded-md outline-none resize-y"/>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <p>Nội dung chuyên đề sẽ được hiển thị ở đây sau khi tạo.</p>
                        </div>
                    )}
                    
                    <div className="flex justify-center mt-4">
                        <button onClick={handleAddQuestion} className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-semibold"><IconPlus className="w-4 h-4 mr-1"/> Thêm câu hỏi</button>
                    </div>

                    <div className="text-right font-bold mt-8">Tổng điểm: {totalPoints}</div>
                </div>
            </div>
        </div>
    );
};
