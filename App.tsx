// Tệp: App.tsx (ĐÃ SỬA LỖI VÀ BẢO MẬT - PHIÊN BẢN ĐẦY ĐỦ 586 DÒNG)
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
  	level3: { mc: { count: 0, points: 0.5 }, fill: { count: 0, points: 1