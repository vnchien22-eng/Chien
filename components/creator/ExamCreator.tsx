import React, { useState } from 'react';
import type { ExamInfo, Question, MatrixStructureItem, AiParams, ModalConfig, SavedExam, KnowledgeSource, StudioOutput } from '../../types';
import { InputField } from '../ui/InputField';
import { ActionButton } from '../ui/ActionButton';
import { IconPlus, IconSpinner, IconSave, IconHistory, IconKnowledgeBase } from '../ui/Icons';
import { AIAssistant } from './AIAssistant';
import { QuestionItem } from './QuestionItem';
import { NotebookView } from './NotebookView';

interface ExamCreatorProps {
    examInfo: ExamInfo;
    setExamInfo: React.Dispatch<React.SetStateAction<ExamInfo>>;
    questions: Question[];
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
    matrixStructure: MatrixStructureItem[];
    setMatrixStructure: React.Dispatch<React.SetStateAction<MatrixStructureItem[]>>;
    aiParams: AiParams;
    setAiParams: React.Dispatch<React.SetStateAction<AiParams>>;
    isLoadingAI: boolean;
    isLoadingMatrix: boolean;
    isAnalyzingSubject: boolean;
    varyingQuestionId: string | null;
    showNotification: (message: string, onConfirmCallback?: (() => void) | null) => void;
    addQuestion: (text?: string, level?: '1' | '2' | '3', points?: number) => void;
    removeQuestion: (id: string) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    handleAnalyzeSubject: () => Promise<void>;
    handleSuggestMatrix: () => Promise<void>;
    handleSuggestDistribution: (levelKey: 'level1' | 'level2' | 'level3') => void;
    handleGenerateVariation: (questionId: string, originalText: string) => Promise<void>;
    handleImageUploadAndProcess: (questionId: string, file: File) => Promise<void>;
    handleGenerateCharacterVariation: (questionId: string, prompt: string) => Promise<void>;
    handleGenerateAIQuestions: (options: { useSearch: boolean; useMaps: boolean }) => Promise<void>;
    setCurrentPage: (page: string) => void;
    handleSave: () => void;
    setModalConfig: React.Dispatch<React.SetStateAction<ModalConfig>>;
    generatingQuestionId: string | null;
    handleGenerateSingleQuestion: (questionId: string) => void;
    handlePreviewImage: (url: string | null) => void;
    setIsHistoryModalOpen: (isOpen: boolean) => void;
    pastedContent: string;
    setPastedContent: React.Dispatch<React.SetStateAction<string>>;
    handleAnalyzePastedContent: (pastedText: string) => Promise<void>;
    isAnalyzingPastedContent: boolean;
    handleAnalyzeFileContent: (files: FileList) => Promise<void>;
    isAnalyzingFile: boolean;
    currentAcademicYear: string;
    savedExams: SavedExam[];
    knowledgeSources: KnowledgeSource[];
    setKnowledgeSources: React.Dispatch<React.SetStateAction<KnowledgeSource[]>>;
    studioOutputs: StudioOutput[];
    setStudioOutputs: React.Dispatch<React.SetStateAction<StudioOutput[]>>;
    isDriveConnected: boolean;
    onDriveConnect: () => void;
    handleAiParamsChange: (levelKey: 'level1' | 'level2' | 'level3', typeKey: string, field: 'count' | 'points', value: number | string) => void;
    handleTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTopicSelect: (topic: string) => void;
    groundingSources: any[] | null;
}

const GroundingSourcesDisplay: React.FC<{ sources: any[] }> = ({ sources }) => {
    const webSources = sources.filter(s => s.web);
    const mapSources = sources.filter(s => s.maps);

    if (webSources.length === 0 && mapSources.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-4">
            {webSources.length > 0 && (
                <div>
                    <h4 className="font-bold text-blue-800">Nguồn tham khảo từ Google Search</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        {webSources.map((source, index) => (
                            <li key={`web-${index}`} className="text-sm">
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {mapSources.length > 0 && (
                 <div>
                    <h4 className="font-bold text-green-800">Nguồn tham khảo từ Google Maps</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        {mapSources.map((source, index) => (
                           (source.maps.uri || source.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.uri) && (
                                <li key={`map-${index}`} className="text-sm">
                                    <a 
                                        href={source.maps.uri || source.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:underline"
                                    >
                                        {source.maps.title || source.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.title || 'Vị trí trên bản đồ'}
                                    </a>
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


export const ExamCreator: React.FC<ExamCreatorProps> = (props) => {
    
    const { 
        examInfo, setExamInfo, questions, setQuestions, matrixStructure, setMatrixStructure,
        aiParams, setAiParams, isLoadingAI, isLoadingMatrix, isAnalyzingSubject,
        varyingQuestionId, showNotification, addQuestion, removeQuestion, updateQuestion,
        handleAnalyzeSubject, handleSuggestMatrix, handleSuggestDistribution,
        handleGenerateVariation, handleImageUploadAndProcess, handleGenerateCharacterVariation, 
        handleGenerateAIQuestions, setCurrentPage, generatingQuestionId, 
        handleGenerateSingleQuestion, handlePreviewImage, handleSave, setIsHistoryModalOpen,
        pastedContent, setPastedContent,
        handleAnalyzePastedContent, isAnalyzingPastedContent, handleAnalyzeFileContent, isAnalyzingFile,
        currentAcademicYear, savedExams, knowledgeSources, setKnowledgeSources, studioOutputs, setStudioOutputs, isDriveConnected, onDriveConnect,
        handleAiParamsChange, handleTopicChange, handleTopicSelect, groundingSources
    } = props;

    const [isNotebookVisible, setIsNotebookVisible] = useState(true);

    const calculatedMatrixData = React.useMemo(() => {
        const data: { [key: string]: any } = {};
        matrixStructure.forEach(area => {
            const initialRow = { tn1: '', tl1: '', tn2: '', tl2: '', tn3: '', tl3: '' };
            data[area.id] = { soCau: { ...initialRow }, cauSo: { ...initialRow }, diem: { ...initialRow } };
            for (const col in data[area.id].soCau) {
                data[area.id].soCau[col] = 0;
                data[area.id].diem[col] = 0;
            }
        });

        questions.forEach((q, index) => {
            if (!q.text.trim()) return;
            const section = q.contentArea;
            const type = q.type === 'essay' ? 'tl' : 'tn';
            const level = q.level || '1';
            const colKey = `${type}${level}`;
            
            if (data[section] && data[section].soCau.hasOwnProperty(colKey)) {
                data[section].soCau[colKey]++;
                data[section].diem[colKey] += Number(q.points) || 0;
                data[section].cauSo[colKey] += `${data[section].cauSo[colKey] ? ', ' : ''}${index + 1}`;
            }
        });

        return data;
    }, [questions, matrixStructure]);

    const handleExamInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setExamInfo(prev => ({ ...prev, [id]: value }));
    };

    const handleYccdChange = (areaId: string, newYccd: string) => {
        setMatrixStructure(prev => prev.map(area => 
            area.id === areaId ? { ...area, yccd: newYccd } : area
        ));
    };
    
    const clearForm = () => {
        showNotification(
            'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?',
            () => {
                setExamInfo({ schoolName: '', className: '', subject: '', examTime: '', examTitle: '' });
                const firstContentArea = matrixStructure[0]?.id || 'default';
                setQuestions([{ id: 'initial-1', level: '1', type: 'essay', text: '', points: 1, imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea: firstContentArea, matchingData: Array(8).fill('') }]);
                setCurrentPage('creator');
            }
        );
    };

    return (
        <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                <button onClick={() => setIsNotebookVisible(!isNotebookVisible)} className="w-full flex justify-between items-center text-left focus:outline-none">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                        <IconKnowledgeBase className="w-8 h-8 mr-3 text-indigo-600" />
                        Sổ tay AI (Notebook)
                    </h2>
                    <svg className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isNotebookVisible ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                 {isNotebookVisible && (
                    <div className="mt-6">
                        <NotebookView 
                            knowledgeSources={knowledgeSources}
                            setKnowledgeSources={setKnowledgeSources}
                            studioOutputs={studioOutputs}
                            setStudioOutputs={setStudioOutputs}
                            isDriveConnected={isDriveConnected}
                            onDriveConnect={onDriveConnect}
                        />
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="text-center mb-8">
                    <h1 
                        className="text-2xl sm:text-3xl font-bold uppercase bg-gradient-to-r from-blue-500 via-blue-800 to-black text-transparent bg-clip-text transition-opacity hover:opacity-80"
                        style={{ textShadow: '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.3)' }}
                    >
                        Ứng dụng Tạo Đề Kiểm Tra Thông Minh
                    </h1>
                    <p className="text-gray-500 mt-2">Hỗ trợ giáo viên tiểu học theo Thông tư 27 & 32</p>
                </div>
                

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <InputField label="Tên trường" id="schoolName" value={examInfo.schoolName} onChange={handleExamInfoChange} placeholder="VD: Trường Tiểu học Mẫu"/>
                        <InputField label="Lớp" id="className" value={examInfo.className} onChange={handleExamInfoChange} placeholder="VD: Lớp 5A"/>
                        <InputField label="Môn học" id="subject" value={examInfo.subject} onChange={handleExamInfoChange} placeholder="VD: Toán"/>
                        <div className="flex space-x-2">
                            <div className="flex-grow">
                                <InputField label="Thời gian làm bài" id="examTime" value={examInfo.examTime} onChange={handleExamInfoChange} placeholder="VD: 40 phút"/>
                            </div>
                            <button onClick={handleAnalyzeSubject} disabled={isAnalyzingSubject} className="self-end mb-1 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400">
                               {isAnalyzingSubject ? <IconSpinner/> : '✨ Phân tích Môn học'}
                            </button>
                        </div>
                    </div>
                    <InputField label="Tiêu đề/Tên bài kiểm tra" id="examTitle" value={examInfo.examTitle} onChange={handleExamInfoChange} placeholder="VD: Kiểm tra cuối học kỳ I"/>
                </div>
                
                <AIAssistant 
                    examInfo={examInfo}
                    params={aiParams} 
                    onParamsChange={handleAiParamsChange}
                    onTopicChange={handleTopicChange}
                    onGenerateFromMatrix={handleGenerateAIQuestions}
                    isLoading={isLoadingAI}
                    onSuggestMatrix={handleSuggestMatrix}
                    onSuggestDistribution={handleSuggestDistribution}
                    isLoadingMatrix={isLoadingMatrix}
                    matrixData={calculatedMatrixData}
                    matrixStructure={matrixStructure}
                    onYccdChange={handleYccdChange}
                    showNotification={showNotification}
                    onTopicSelect={handleTopicSelect}
                    pastedContent={pastedContent} setPastedContent={setPastedContent}
                    onAnalyzePastedContent={handleAnalyzePastedContent}
                    isAnalyzingPastedContent={isAnalyzingPastedContent}
                    onAnalyzeFile={handleAnalyzeFileContent}
                    isAnalyzingFile={isAnalyzingFile}
                    currentAcademicYear={currentAcademicYear}
                    savedExams={savedExams}
                    knowledgeSources={knowledgeSources}
                />

                <div id="questions-container" className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Soạn thảo Câu hỏi</h3>
                        <button
                            type="button"
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <IconHistory className="w-5 h-5 mr-2" />
                            Lịch sử
                        </button>
                    </div>

                {questions.map((q, index) => (
                        <QuestionItem 
                            key={q.id}
                            question={q} 
                            index={index + 1}
                            onUpdate={updateQuestion}
                            onRemove={removeQuestion}
                            onGenerateVariation={handleGenerateVariation}
                            onImageUploadAndProcess={handleImageUploadAndProcess}
                            onGenerateCharacterVariation={handleGenerateCharacterVariation}
                            isVarying={varyingQuestionId === q.id}
                            matrixStructure={matrixStructure}
                            onGenerateSingleQuestion={handleGenerateSingleQuestion}
                            isGenerating={generatingQuestionId === q.id}
                            onPreviewImage={handlePreviewImage}
                            examInfo={examInfo}
                        />
                ))}
                </div>
                
                {groundingSources && groundingSources.length > 0 && <GroundingSourcesDisplay sources={groundingSources} />}

                <div className="flex justify-start mt-6 space-x-2">
                    <button type="button" onClick={() => addQuestion()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        <IconPlus /> Thêm câu hỏi thủ công
                    </button>
                </div>


                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0">
                    <ActionButton onClick={clearForm} text="Xóa toàn bộ" color="gray" />
                    <ActionButton onClick={handleSave} text="Lưu" color="blue">
                         <>
                            <IconSave />
                            <span className="ml-2">Lưu</span>
                        </>
                    </ActionButton>
                    <ActionButton onClick={() => setCurrentPage('preview')} text="Xem trước & Tạo đề" color="green" />
                </div>
            </div>
        </div>
    );
}