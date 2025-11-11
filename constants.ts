import React from 'react';
import {
    IconDocumentAdd,
    IconArchive,
    IconWand,
    IconStar,
    IconBook,
    IconSettings,
    IconKnowledgeBase,
    IconClipboardCheck,
} from './components/ui/Icons';

export const SIDEBAR_ITEMS = [
    { id: 'creator', label: 'Tạo Đề Kiểm Tra', icon: React.createElement(IconDocumentAdd) },
    { id: 'full-package', label: 'Gói Đề thi Hoàn chỉnh', icon: React.createElement(IconArchive) },
    { id: 'image-enhancer', label: 'Xử lý Hình ảnh', icon: React.createElement(IconWand) },
    { id: 'exam-library', label: 'Thư viện Đề thi', icon: React.createElement(IconBook) },
    { id: 'talent-training', label: 'Luyện Đội Tuyển HSG', icon: React.createElement(IconStar) },
    { id: 'exam-analyzer', label: 'Phân tích Đề thi', icon: React.createElement(IconClipboardCheck) },
    { id: 'settings', label: 'Cài đặt & Liên kết', icon: React.createElement(IconSettings) },
];