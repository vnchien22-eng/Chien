// FIX: Create the main App component to resolve module and rendering errors.
// This component manages all application state and renders the appropriate page.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Sidebar } from './components/layout/Sidebar';
import { ExamCreator } from './components/creator/ExamCreator';
import { ExamPreview } from './components/preview/ExamPreview';
import { FullExamPackage } from './components/package/FullExamPackage';
import { ImageEnhancer } from './components/enhancer/ImageEnhancer';
import { ExamLibraryPage } from './components/matrix-library/MatrixLibraryPage';
import { NotebookView } from './components/creator/NotebookView';
import { TalentTrainingPage } from './components/talent-training/TalentTrainingPage';
import { ExamAnalyzer } from './components/analyzer/ExamAnalyzer';
import { SettingsPage } from './components/settings/SettingsPage';
import { NotificationModal, ImagePreviewModal } from './components/ui/Modal';
import { GenerationHistoryModal } from './components/creator/GenerationHistoryModal';
import { Chatbot } from './components/chatbot/Chatbot';
import { MatrixBackground } from './components/layout/MatrixBackground';

import type { ExamInfo, Question, MatrixStructureItem, AiParams, ModalConfig, SavedExam, AcademicYear, KnowledgeSource, CategoryItem, BackupData } from './types';
import * as geminiService from './services/geminiService';
import { systemExams, systemKnowledgeSources, mockCurriculumDatabase } from './data';

const initialExamInfo: ExamInfo = {
    schoolName: 'Trường Tiểu học Mẫu', className: 'Lớp 4', subject: 'Toán', examTime: '40 phút', examTitle: 'Kiểm tra Cuối học kỳ I'
};
const initialAiParams: AiParams = {
    topic: 'Ôn tập số tự nhiên, phân số, hình học cơ bản',
    level1: { mc: { count: 0, points: 0.5 }, fill: { count: 0, points: 1 }, match: { count: 0, points: 1 }, tf: { count: 0, points: 0.5 }, tuLuan: { count: 0, points: 1 } },
    level2: { mc: { count: 0, points: 0.5 }, fill: { count: 0, points: 1 }, match: { count: 0, points: 1 }, tf: { count: 0, points: 0.5 }, tuLuan: { count: 0, points: 2 } },
    level3: { mc: { count: 0, points: 0.5 }, fill: { count: 0, points: 1 }, match: { count: 0, points: 1 }, tf: { count: 0, points: 0.5 }, tuLuan: { count: 0, points: 2 } },
};
const initialQuestions: Question[] = [{ id: 'initial-1', level: '1', type: 'essay', text: '', points: 1, imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea: 'default_area', matchingData: Array(8).fill('') }];
const initialMatrix: MatrixStructureItem[] = [{ id: 'default_area', name: 'Chủ đề mặc định', yccd: 'Yêu cầu cần đạt mặc định' }];

export const App: React.FC = () => {
    // --- Page and UI State ---
    const [currentPage, setCurrentPage] = useState('creator');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, message: '', onConfirm: () => {}, onCancel: () => {}, showCancel: false });
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
    const [isAnalyzingSubject, setIsAnalyzingSubject] = useState(false);
    const [varyingQuestionId, setVaryingQuestionId] = useState<string | null>(null);
    const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAnalyzingPastedContent, setIsAnalyzingPastedContent] = useState(false);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [pastedContent, setPastedContent] = useState('');
    const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
    const [isAnswerKeyLoading, setIsAnswerKeyLoading] = useState(false);
    const [isAnswerKeyVisible, setIsAnswerKeyVisible] = useState(false);
    const [answerKeyContent, setAnswerKeyContent] = useState('');
    const [isDriveConnected, setIsDriveConnected] = useState(false);
    const [driveUser, setDriveUser] = useState<{ email: string, name: string} | null>(null);
    const [groundingSources, setGroundingSources] = useState<any[] | null>(null);

    // --- Data State ---
    const [examInfo, setExamInfo] = useState<ExamInfo>(initialExamInfo);
    const [aiParams, setAiParams] = useState<AiParams>(initialAiParams);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [matrixStructure, setMatrixStructure] = useState<MatrixStructureItem[]>(initialMatrix);
    const [generationHistory, setGenerationHistory] = useState<Question[][]>([]);
    const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [categories, setCategories] = useState({
        subjects: [{ id: 's1', name: 'Toán'}, {id: 's2', name: 'Tiếng Việt'}],
        gradeLevels: [{ id: 'g1', name: 'Lớp 1'}, { id: 'g2', name: 'Lớp 2'}],
        examTypes: [{ id: 't1', name: 'Giữa kỳ'}, { id: 't2', name: 'Cuối kỳ'}]
    });
    
    // --- Data Persistence ---
    useEffect(() => {
        const loadData = () => {
            try {
                const savedDataString = localStorage.getItem('trituekhaothi_backup');
                if (savedDataString) {
                    const data: BackupData = JSON.parse(savedDataString);
                    setSavedExams([...systemExams, ...(data.exams || [])]);
                    setKnowledgeSources([...systemKnowledgeSources, ...(data.knowledgeSources || [])]);
                    setAcademicYears(data.academicYears || [{ id: '2023-2024', name: '2023-2024', isCurrent: true }]);
                } else {
                    setSavedExams(systemExams);
                    setKnowledgeSources(systemKnowledgeSources);
                    setAcademicYears([{ id: '2023-2024', name: '2023-2024', isCurrent: true }]);
                }
            } catch (e) { console.error("Failed to load data from localStorage", e); }
        };
        loadData();
    }, []);

    const backupData = useCallback(() => {
        try {
            const regularExams = savedExams.filter(e => e.category !== 'system');
            const userSources = knowledgeSources.filter(s => !s.id.startsWith('sys-'));
            const data: BackupData = {
                exams: regularExams,
                knowledgeSources: userSources,
                academicYears: academicYears
            };
            localStorage.setItem('trituekhaothi_backup', JSON.stringify(data));
        } catch (e) { console.error("Failed to save data to localStorage", e); }
    }, [savedExams, knowledgeSources, academicYears]);

    useEffect(() => {
        backupData();
    }, [backupData]);

    // FIX: Add useMemo to fix 'Cannot find name useMemo' error.
    const currentAcademicYear = useMemo(() => academicYears.find(y => y.isCurrent)?.name || 'N/A', [academicYears]);
    
    // --- Handlers ---
    const showNotification = (message: string, onConfirmCallback: (() => void) | null = null, showCancelButton = false) => {
        setModalConfig({
            isOpen: true,
            message: message,
            onConfirm: () => {
                if (onConfirmCallback) onConfirmCallback();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
            showCancel: !!onConfirmCallback && showCancelButton
        });
    };

    const handleAnalyzeSubject = async () => {
        if (!examInfo.subject || !examInfo.className) {
            showNotification('Vui lòng nhập Môn học và Lớp trước khi phân tích.');
            return;
        }
        setIsAnalyzingSubject(true);
        try {
            const key = `${examInfo.subject.toLowerCase().replace(/\s/g, '_')}_lớp_${examInfo.className.toLowerCase().match(/\d+/)?.[0] || '1'}`;
            const results = mockCurriculumDatabase[key] || await geminiService.analyzeSubject(examInfo.subject, examInfo.className);
            if (results.length > 0) {
                const newMatrix = results.map(r => ({ id: uuidv4(), name: r.contentArea, yccd: r.learningObjective }));
                setMatrixStructure(newMatrix);
                // Reset questions to use the new matrix structure
                setQuestions([{ id: 'initial-1', level: '1', type: 'essay', text: '', points: 1, imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea: newMatrix[0].id, matchingData: Array(8).fill('') }]);
                showNotification('Phân tích môn học thành công! Cấu trúc ma trận đã được cập nhật.');
            } else {
                showNotification('Không tìm thấy chương trình học cho môn này. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (e) {
            console.error(e);
            showNotification(`Lỗi khi phân tích môn học: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setIsAnalyzingSubject(false);
        }
    };
    
    const addQuestion = (text = '', level: '1'|'2'|'3' = '1', points = 1) => {
        const newQuestion: Question = {
            id: uuidv4(),
            level: level,
            type: 'essay',
            text: text,
            points: points,
            imageUrl: null,
            baseCharacterImage: null,
            isGeneratingImage: false,
            contentArea: matrixStructure[0]?.id || 'default_area',
            matchingData: Array(8).fill(''),
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    };
    
    const handleSuggestMatrix = async () => {
        if (!aiParams.topic) {
            showNotification('Vui lòng nhập Chủ đề/Nội dung trọng tâm trước.');
            return;
        }
        setIsLoadingMatrix(true);
        try {
            const suggestedParams = await geminiService.suggestMatrix(aiParams.topic, examInfo.subject, examInfo.className);
            if (suggestedParams.level1) {
                setAiParams(prev => ({...prev, ...suggestedParams}));
                showNotification('AI đã gợi ý xong ma trận phân bổ câu hỏi và điểm số.');
            } else {
                showNotification('AI không thể đưa ra gợi ý. Vui lòng thử lại với chủ đề khác.');
            }
        } catch(e) {
            console.error(e);
            showNotification(`Lỗi khi gợi ý ma trận: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setIsLoadingMatrix(false);
        }
    };

    const handleGenerateAIQuestions = async (options: { useSearch: boolean; useMaps: boolean }) => {
        setIsLoadingAI(true);
        setGroundingSources(null);
        try {
            const { generatedQuestions, groundingMetadata } = await geminiService.generateQuestions(aiParams, examInfo, matrixStructure, undefined, options);
            
            const newQuestions: Question[] = [];
            let contentAreaIndex = 0;

            const processLevel = (levelKey: 'level1' | 'level2' | 'level3', levelNum: '1' | '2' | '3') => {
                const questionData = generatedQuestions[`${levelKey}_questions`];
                if (!questionData) return;

                const add = (q: any, type: Question['type']) => {
                    const contentArea = matrixStructure[contentAreaIndex % matrixStructure.length].id;
                    contentAreaIndex++;
                    newQuestions.push({
                        id: uuidv4(),
                        level: levelNum,
                        type,
                        text: q.question_text || '',
                        points: aiParams[levelKey][{
                            'multiple_choice': 'mc', 'fill_in_the_blank': 'fill', 'matching': 'match', 'true_false': 'tf', 'essay': 'tuLuan'
                        }[type] as 'mc']?.points || 1,
                        imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea, matchingData: []
                    });
                };

                questionData.multiple_choice?.forEach((q: any) => add(q, 'multiple_choice'));
                questionData.fill_in_the_blank?.forEach((q: any) => add(q, 'fill_in_the_blank'));
                questionData.matching?.forEach((q: any) => add(q, 'matching'));
                questionData.true_false?.forEach((q: any) => add(q, 'true_false'));
                questionData.self_essay?.forEach((q: any) => add(q, 'essay'));
            };

            processLevel('level1', '1');
            processLevel('level2', '2');
            processLevel('level3', '3');
            
            if (newQuestions.length > 0) {
                setQuestions(newQuestions);
                setGenerationHistory(prev => [[...newQuestions], ...prev].slice(0, 10));
                showNotification(`AI đã tạo thành công ${newQuestions.length} câu hỏi.`);
                if (groundingMetadata?.groundingChunks) {
                    setGroundingSources(groundingMetadata.groundingChunks);
                }
            } else {
                showNotification('Không thể tạo câu hỏi từ các tham số đã cho. Vui lòng thử lại.');
            }
        } catch(e) {
            console.error(e);
            showNotification(`Lỗi khi tạo câu hỏi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handleGenerateVariation = async (questionId: string, originalText: string) => {
        setVaryingQuestionId(questionId);
        try {
            const variation = await geminiService.generateVariation(originalText);
            updateQuestion(questionId, { text: variation });
        } catch(e) {
            console.error(e);
            showNotification(`Lỗi khi tạo biến thể: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setVaryingQuestionId(null);
        }
    };
    
    const handleImageUploadAndProcess = async (questionId: string, file: File) => {
        updateQuestion(questionId, { isGeneratingImage: true, imageUrl: URL.createObjectURL(file) });
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const mimeType = file.type;
                const { base64Image, text } = await geminiService.enhanceImage(base64, mimeType);
                updateQuestion(questionId, { imageUrl: base64Image, baseCharacterImage: base64Image, text: `${questions.find(q=>q.id===questionId)?.text}\n\n*Mô tả ảnh: ${text}*` });
            };
        } catch (e) {
            console.error(e);
            showNotification(`Lỗi khi xử lý ảnh: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            updateQuestion(questionId, { isGeneratingImage: false });
        }
    };
    
    const handleGenerateCharacterVariation = async (questionId: string, prompt: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question?.baseCharacterImage) return;

        updateQuestion(questionId, { isGeneratingImage: true });
        try {
            const base64Data = question.baseCharacterImage.split(',')[1];
            const mimeType = question.baseCharacterImage.match(/data:(.*);/)?.[1] || 'image/png';
            const { base64Image } = await geminiService.generateImageVariationFromBase(base64Data, mimeType, prompt);
            updateQuestion(questionId, { imageUrl: base64Image });
        } catch(e) {
            console.error(e);
            showNotification(`Lỗi khi tạo biến thể ảnh: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            updateQuestion(questionId, { isGeneratingImage: false });
        }
    };
    
    const handleGenerateSingleQuestion = async (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        setGeneratingQuestionId(questionId);
        try {
            const existingTexts = questions.map(q => q.text).filter(t => t.trim());
            const newText = await geminiService.generateSingleQuestion(question.level, question.contentArea, matrixStructure, examInfo, existingTexts);
            updateQuestion(questionId, { text: newText });
        } catch (e) {
            console.error(e);
            showNotification(`Lỗi khi tạo câu hỏi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setGeneratingQuestionId(null);
        }
    };

    const handleSaveExam = () => {
        const newExam: SavedExam = {
            id: uuidv4(),
            name: `${examInfo.subject} - ${examInfo.className} - ${examInfo.examTitle}`,
            createdAt: new Date().toISOString(),
            examInfo, aiParams, questions, matrixStructure, category: 'regular'
        };
        setSavedExams(prev => [...prev, newExam]);
        showNotification('Đề thi đã được lưu vào thư viện!');
    };

    const handleGenerateAnswerKey = async () => {
        if(isAnswerKeyVisible) {
            setIsAnswerKeyVisible(false);
            return;
        }
        setIsAnswerKeyLoading(true);
        setIsAnswerKeyVisible(true);
        try {
            const prompt = `Tạo đáp án và hướng dẫn chấm chi tiết cho bộ câu hỏi sau. Định dạng đẹp, rõ ràng, chia theo từng câu. Câu nào có hướng dẫn chấm thì trình bày chi tiết các bước và thang điểm.
            ---
            ${questions.map((q, i) => `Câu ${i+1} (${q.points} điểm):\n${q.text}`).join('\n\n')}
            ---`;
            const response = await geminiService.generateVariation(prompt);
            setAnswerKeyContent(response);
        } catch (e) {
            console.error(e);
            setAnswerKeyContent(`Lỗi khi tạo đáp án: ${e instanceof Error ? e.message : 'Lỗi không xác định'}.`);
        } finally {
            setIsAnswerKeyLoading(false);
        }
    };

    const handleShuffleExam = () => {
        const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
        showNotification('Đã xáo trộn thứ tự các câu hỏi.');
    };

    const handleLoadExam = (id: string) => {
        const examToLoad = savedExams.find(e => e.id === id);
        if (examToLoad) {
            setExamInfo(examToLoad.examInfo);
            setAiParams(examToLoad.aiParams);
            setQuestions(examToLoad.questions);
            setMatrixStructure(examToLoad.matrixStructure);
            setCurrentPage('creator');
            showNotification(`Đã tải đề thi "${examToLoad.name}".`);
        }
    };
    
    const handleDeleteExam = (id: string) => {
        showNotification('Bạn có chắc muốn xóa đề thi này?', () => {
            setSavedExams(prev => prev.filter(e => e.id !== id));
        }, true);
    };

    const handleCategoryChange = (category: 'subjects' | 'gradeLevels' | 'examTypes', action: 'add' | 'delete', payload: { id?: string; name?: string }) => {
        setCategories(prev => {
            const newCategories = { ...prev };
            if (action === 'add' && payload.name) {
                newCategories[category] = [...newCategories[category], { id: uuidv4(), name: payload.name }];
            }
            if (action === 'delete' && payload.id) {
                newCategories[category] = newCategories[category].filter(item => item.id !== payload.id);
            }
            return newCategories;
        });
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'creator':
                return <ExamCreator 
                    examInfo={examInfo} setExamInfo={setExamInfo}
                    questions={questions} setQuestions={setQuestions}
                    matrixStructure={matrixStructure} setMatrixStructure={setMatrixStructure}
                    aiParams={aiParams} setAiParams={setAiParams}
                    isLoadingAI={isLoadingAI} isLoadingMatrix={isLoadingMatrix} isAnalyzingSubject={isAnalyzingSubject}
                    varyingQuestionId={varyingQuestionId} showNotification={showNotification}
                    addQuestion={addQuestion} removeQuestion={removeQuestion} updateQuestion={updateQuestion}
                    handleAnalyzeSubject={handleAnalyzeSubject} handleSuggestMatrix={handleSuggestMatrix}
                    handleGenerateVariation={handleGenerateVariation} handleImageUploadAndProcess={handleImageUploadAndProcess}
                    handleGenerateCharacterVariation={handleGenerateCharacterVariation}
                    handleGenerateAIQuestions={handleGenerateAIQuestions}
                    setCurrentPage={setCurrentPage}
                    handleSave={handleSaveExam}
                    setModalConfig={setModalConfig}
                    generatingQuestionId={generatingQuestionId} handleGenerateSingleQuestion={handleGenerateSingleQuestion}
                    handlePreviewImage={setPreviewImageUrl} setIsHistoryModalOpen={setIsHistoryModalOpen}
                    pastedContent={pastedContent} setPastedContent={setPastedContent}
                    handleAnalyzePastedContent={async () => {}}
                    isAnalyzingPastedContent={isAnalyzingPastedContent}
                    handleAnalyzeFileContent={async () => {}}
                    isAnalyzingFile={isAnalyzingFile}
                    currentAcademicYear={currentAcademicYear}
                    savedExams={savedExams}
                    knowledgeSources={knowledgeSources}
                    handleAiParamsChange={(levelKey, typeKey, field, value) => {
                         setAiParams(p => ({...p, [levelKey]: {...p[levelKey], [typeKey]: {...p[levelKey][typeKey as 'mc'], [field]: value}}}));
                    }}
                    handleTopicChange={e => setAiParams(p => ({ ...p, topic: e.target.value}))}
                    handleTopicSelect={topic => setAiParams(p => ({ ...p, topic }))}
                    handleSuggestDistribution={()=>{}}
                    groundingSources={groundingSources}
                />;
            case 'preview':
                 return <ExamPreview 
                    examInfo={examInfo} questions={questions} onBack={() => setCurrentPage('creator')}
                    onGenerateAnswerKey={handleGenerateAnswerKey}
                    onSaveToExamLibrary={handleSaveExam}
                    onPreviewImage={setPreviewImageUrl}
                    onExportToGoogleForms={() => {}}
                    onNavigateToFullPackage={() => setCurrentPage('full-package')}
                    isGeneratingPackage={isGeneratingPackage}
                    answerKeyContent={answerKeyContent}
                    isAnswerKeyLoading={isAnswerKeyLoading}
                    isAnswerKeyVisible={isAnswerKeyVisible}
                    onSaveToDrive={()=>{}}
                    isDriveConnected={isDriveConnected}
                    onShuffleExam={handleShuffleExam}
                />;
            case 'full-package':
                return <FullExamPackage
                    examInfo={examInfo} questions={questions} aiParams={aiParams} matrixStructure={matrixStructure}
                    answerKeyContent={answerKeyContent} onBack={() => setCurrentPage('preview')} onSaveToExamLibrary={handleSaveExam}
                    currentAcademicYear={currentAcademicYear} onSaveToDrive={()=>{}} isDriveConnected={isDriveConnected}
                />;
            case 'image-enhancer':
                return <ImageEnhancer />;
            case 'exam-library':
                return <ExamLibraryPage exams={savedExams} onLoad={handleLoadExam} onDelete={handleDeleteExam} />;
            case 'notebook-view':
                return <NotebookView knowledgeSources={knowledgeSources} setKnowledgeSources={setKnowledgeSources} isDriveConnected={isDriveConnected} onDriveConnect={()=>{}} />;
            case 'talent-training':
                return <TalentTrainingPage />;
            case 'exam-analyzer':
                return <ExamAnalyzer />;
            case 'settings':
                return <SettingsPage
                    onBack={() => setCurrentPage('creator')}
                    academicYears={academicYears}
                    onAddAcademicYear={name => setAcademicYears(p => [...p, {id: uuidv4(), name, isCurrent: false}])}
                    onSetCurrentAcademicYear={id => setAcademicYears(p => p.map(y => ({...y, isCurrent: y.id === id})))}
                    onDeleteAcademicYear={id => setAcademicYears(p => p.filter(y => y.id !== id))}
                    isDriveConnected={isDriveConnected}
                    driveUser={driveUser}
                    onDriveConnect={() => {setIsDriveConnected(true); setDriveUser({name: 'Demo User', email: 'demo@example.com'})}}
                    onDriveDisconnect={() => {setIsDriveConnected(false); setDriveUser(null)}}
                    subjects={categories.subjects} gradeLevels={categories.gradeLevels} examTypes={categories.examTypes}
                    onCategoryChange={handleCategoryChange}
                 />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <MatrixBackground />
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                handlePreviewImage={setPreviewImageUrl}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative z-10">
                {renderPage()}
            </main>
            <NotificationModal {...modalConfig} />
            <ImagePreviewModal src={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
            <GenerationHistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                history={generationHistory}
                onRestore={(questionsToRestore) => {
                    setQuestions(questionsToRestore);
                    setIsHistoryModalOpen(false);
                    showNotification('Đã khôi phục phiên bản câu hỏi đã chọn.');
                }}
            />
            <Chatbot />
        </div>
    );
};