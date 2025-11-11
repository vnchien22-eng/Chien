import type { GenerateContentResponse } from '@google/genai';

export type QuestionType = 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'true_false' | 'essay';

export interface ExamInfo {
    schoolName: string;
    className: string;
    subject: string;
    examTime: string;
    examTitle: string;
}

export interface Question {
    id: string;
    level: '1' | '2' | '3';
    type: QuestionType;
    text: string;
    points: number;
    imageUrl: string | null;
    baseCharacterImage: string | null;
    isGeneratingImage: boolean;
    contentArea: string;
    matchingData?: string[];
}

export interface MatrixStructureItem {
    id: string;
    name: string;
    yccd: string;
}

export interface AiParamDetails {
    count: number;
    points: number;
}

export interface AiParams {
    topic: string;
    level1: {
        mc: AiParamDetails;
        fill: AiParamDetails;
        match: AiParamDetails;
        tf: AiParamDetails;
        tuLuan: AiParamDetails;
    };
    level2: {
        mc: AiParamDetails;
        fill: AiParamDetails;
        match: AiParamDetails;
        tf: AiParamDetails;
        tuLuan: AiParamDetails;
    };
    level3: {
        mc: AiParamDetails;
        fill: AiParamDetails;
        match: AiParamDetails;
        tf: AiParamDetails;
        tuLuan: AiParamDetails;
    };
}

export interface ModalConfig {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    showCancel: boolean;
}

export interface SavedExam {
    id: string;
    name: string;
    createdAt: string;
    examInfo: ExamInfo;
    aiParams: AiParams;
    questions: Question[];
    matrixStructure: MatrixStructureItem[];
    category?: string;
    period?: 'mid_term_1' | 'end_term_1' | 'mid_term_2' | 'end_year' | 'other';
}

export interface ExamAnalysisResult {
    monHoc: string;
    tongSoCau: number;
    maTran: {
        chuDe: string;
        nhanBiet: number;
        thongHieu: number;
        vanDung: number;
        vanDungCao: number;
        tongCong: number;
    }[];
    chiTietCauHoi: {
        soThuTu: number;
        noiDung: string;
        luaChon?: { [key: string]: string };
        dapAnDung: string;
        chuDe: string;
        mucDo: string;
    }[];
}

export interface KnowledgeSource {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
    content?: string;
}

export interface AcademicYear {
    id: string;
    name: string;
    isCurrent: boolean;
}

export interface CategoryItem {
    id: string;
    name: string;
}

export interface TalentQuestion {
    id: string;
    questionText: string;
    detailedAnswer: string;
    points: number;
}

export interface TalentExamForSave {
    id?: string;
    title: string;
    questions: TalentQuestion[];
    totalPoints: number;
    duration: number;
    grade: string;
    subject: string;
}

export interface BackupData {
    exams?: SavedExam[];
    matrices?: SavedExam[];
    academicYears?: AcademicYear[];
    knowledgeSources?: KnowledgeSource[];
}

// --- Types for NotebookView ---

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface StudioOutput {
    id: string;
    sourceId: string;
    sourceName: string;
    type: 'audio_summary' | 'mind_map' | 'quiz' | 'note';
    title: string;
    content: any; // string for markdown, QuizQuestion[] for quiz, base64 for audio
}