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

// *** THAY ĐỔI QUAN TRỌNG: CHỈ IMPORT HÀM AN TOÀN ***
import { runGenerationAnToan } from './services/geminiService';
// import * as geminiService from './services/geminiService'; // (Dòng cũ đã bị xóa)

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
  	}, [savedExams