import React, { useState, useMemo } from 'react';
import type { SavedExam } from '../../types';
import { IconTrash, IconBook, IconEye, IconX, IconFolder } from '../ui/Icons';

// --- New Modal Component for Quick View ---
interface ExamQuickViewModalProps {
    exam: SavedExam | null;
    onClose: () => void;
}

const cleanQuestionText = (text: string): string => {
    return text
        .replace(/\[(Trắc nghiệm|Tự luận|Điền khuyết|Đúng\/Sai|Nối)\]/g, '')
        .replace(/\*Đáp án:.*?\*/g, '')
        .replace(/\*Hướng dẫn chấm:.*?\*/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .trim();
};

const ExamQuickViewModal: React.FC<ExamQuickViewModalProps> = ({ exam, onClose }) => {
    if (!exam) return null;

    const { examInfo, questions } = exam;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Xem nhanh: {exam.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <IconX />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto prose max-w-none">
                    <div className="text-center mb-6">
                        <p className="font-bold">{examInfo.schoolName.toUpperCase()}</p>
                        <p>Lớp: {examInfo.className}</p>
                        <p className="font-bold">BÀI KIỂM TRA {examInfo.subject.toUpperCase()}</p>
                        <p className="font-semibold">{examInfo.examTitle}</p>
                        <p><i>Thời gian làm bài: {examInfo.examTime}</i></p>
                    </div>
                    <hr className="my-4" />
                    <div className="space-y-4">
                        {questions.map((q, index) => {
                            const matchingData = q.matchingData || [];
                            const hasMatchingData = matchingData.some(item => item && item.trim() !== '');
                            const colA = matchingData.filter((_, i) => i % 2 === 0);
                            const colB = matchingData.filter((_, i) => i % 2 !== 0);
                            return (
                                <div key={q.id} className="break-inside-avoid">
                                    <p>
                                        <strong>Câu {index + 1}:</strong> ({q.points || 0} điểm) <span dangerouslySetInnerHTML={{ __html: cleanQuestionText(q.text) }} />
                                    </p>
                                    {q.type === 'matching' && hasMatchingData && (
                                        <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                                            <div className="grid grid-cols-2 gap-x-8">
                                                {/* Column A */}
                                                <div>
                                                    <p className="font-bold text-center">CỘT A</p>
                                                    <ol className="list-decimal list-inside ml-4">
                                                        {colA.map((item, idx) => (
                                                            <li key={`a-${idx}`} className="mt-1">{item}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                                {/* Column B */}
                                                <div>
                                                    <p className="font-bold text-center">CỘT B</p>
                                                    <ol type="A" className="list-[upper-alpha] list-inside ml-4">
                                                        {colB.map((item, idx) => (
                                                            <li key={`b-${idx}`} className="mt-1">{item}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {q.imageUrl && (
                                        <img src={q.imageUrl} alt={`Hình minh họa câu ${index + 1}`} className="max-w-xs my-2 rounded-lg border" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center font-bold mt-6">--- HẾT ---</p>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ExamLibraryPageProps {
    exams: SavedExam[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onClearRegularExams?: () => void;
}

const PeriodFolder: React.FC<{
    title: string;
    exams: SavedExam[];
    onDelete: (id: string) => void;
    onPreview: (exam: SavedExam) => void;
    onLoad: (id: string) => void;
}> = ({ title, exams, onDelete, onPreview, onLoad }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="pl-6 mb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center">
                    <IconFolder className="w-5 h-5 mr-2 text-gray-500" />
                    <h4 className="text-md font-semibold text-gray-600">{title} ({exams.length})</h4>
                </div>
                 <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    {exams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
                                    <div className="p-3 flex-grow">
                                        <h5 className="text-sm font-bold text-gray-800 truncate" title={exam.name}>{exam.name}</h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {exam.examInfo.subject} - {exam.examInfo.className}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Lưu lúc: {new Date(exam.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-gray-50 border-t flex justify-end items-center space-x-1">
                                         <button
                                            onClick={() => onDelete(exam.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                            title="Xóa đề thi"
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onPreview(exam)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                            title="Xem nhanh"
                                        >
                                            <IconEye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onLoad(exam.id)}
                                            className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Tải
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Không có đề thi nào trong mục này.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export const ExamLibraryPage: React.FC<ExamLibraryPageProps> = ({ exams, onLoad, onDelete, onClearRegularExams }) => {
    const [quickViewExam, setQuickViewExam] = useState<SavedExam | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExams = useMemo(() => {
        if (!searchQuery.trim()) {
            return exams;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return exams.filter(exam =>
            exam.name.toLowerCase().includes(lowercasedQuery) ||
            exam.examInfo.subject.toLowerCase().includes(lowercasedQuery) ||
            exam.examInfo.className.toLowerCase().includes(lowercasedQuery)
        );
    }, [exams, searchQuery]);

    const periodMap = useMemo(() => {
        const map: { [key in NonNullable<SavedExam['period']> | 'other']: SavedExam[] } = {
            mid_term_1: [],
            end_term_1: [],
            mid_term_2: [],
            end_year: [],
            other: []
        };

        filteredExams.forEach(exam => {
            const period = exam.period || 'other';
            if (map[period]) {
                map[period].push(exam);
            } else {
                map['other'].push(exam);
            }
        });
        return map;
    }, [filteredExams]);

    const periodTitles = {
        mid_term_1: 'Giữa Học kì I',
        end_term_1: 'Cuối Học kì I',
        mid_term_2: 'Giữa Học kì II',
        end_year: 'Cuối năm học',
        other: 'Khác',
    };

    return (
        <>
            <ExamQuickViewModal exam={quickViewExam} onClose={() => setQuickViewExam(null)} />
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="text-center flex-grow">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Thư viện Đề thi</h1>
                        <p className="text-gray-500 mt-2">Quản lý và tái sử dụng các đề thi đã tạo.</p>
                    </div>
                    {onClearRegularExams && (
                        <button 
                            onClick={onClearRegularExams}
                            className="p-2 text-red-500 bg-red-100 rounded-full hover:bg-red-200 hover:text-red-700 transition-colors"
                            title="Xóa tất cả đề thi thông thường"
                        >
                            <IconTrash />
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm theo tên đề, môn học, hoặc lớp..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {exams.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <IconBook className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Thư viện trống</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Tạo một đề thi trong trang 'Tạo Đề Kiểm Tra' và nhấn nút lưu để thêm vào đây.
                        </p>
                    </div>
                ) : filteredExams.length === 0 ? (
                     <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Vui lòng thử một từ khóa tìm kiếm khác.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(Object.keys(periodMap) as Array<keyof typeof periodMap>).map(period =>
                            periodMap[period].length > 0 && (
                                <PeriodFolder
                                    key={period}
                                    title={periodTitles[period]}
                                    exams={periodMap[period]}
                                    onDelete={onDelete}
                                    onPreview={setQuickViewExam}
                                    onLoad={onLoad}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </>
    );
};
