import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ExamInfo, Question, AiParams, MatrixStructureItem } from '../../types';
import { ActionButton } from '../ui/ActionButton';
import { IconDownload, IconSpinner, IconSave, IconGoogleDrive } from '../ui/Icons';
import { MatrixTable } from '../creator/MatrixTable';

interface FullExamPackageProps {
    examInfo: ExamInfo;
    questions: Question[];
    aiParams: AiParams;
    matrixStructure: MatrixStructureItem[];
    answerKeyContent: string;
    onBack: () => void;
    onSaveToExamLibrary: () => void;
    currentAcademicYear: string;
    onSaveToDrive: () => void;
    isDriveConnected: boolean;
}

// Helper function to clean question text for student view
const cleanQuestionForStudent = (text: string): string => {
    return text
        .replace(/\[(Trắc nghiệm|Tự luận|Điền khuyết|Đúng\/Sai|Nối)\]/g, '')
        .replace(/\*Đáp án:.*?\*/g, '')
        .replace(/\*Hướng dẫn chấm:.*?\*/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Keep bold formatting for correct answers if any
        .trim();
};

export const FullExamPackage: React.FC<FullExamPackageProps> = ({
    examInfo, questions, aiParams, matrixStructure, answerKeyContent, onBack, onSaveToExamLibrary, currentAcademicYear, onSaveToDrive, isDriveConnected
}) => {
    const packageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (packageRef.current && (window as any).renderMathInElement) {
            (window as any).renderMathInElement(packageRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }, [questions, answerKeyContent]);

    const calculatedMatrixData = useMemo(() => {
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
            let type = 'tl';
            if (/\[(Trắc nghiệm|Điền khuyết|Nối|Đúng\/Sai)\]/i.test(q.text)) type = 'tn';
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

    const handleDownloadDocx = () => {
        const contentElement = document.getElementById('full-package-content');
        if (!contentElement) return;

        const styles = `
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 13pt; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid black; padding: 5px; }
                .page-break { page-break-before: always; }
                .exam-header, .centered-title { text-align: center; }
                .exam-header p, .centered-title p { margin: 0; }
                .question-item { margin-bottom: 12px; }
                .no-print { display: none; }
            </style>
        `;
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    ${styles}
                </head>
                <body>
                    ${contentElement.innerHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bo-De-Thi-${examInfo.subject.replace(/\s/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-8 font-serif">
            <div className="flex justify-center items-center gap-4 mb-8 no-print">
                <ActionButton onClick={onBack} text="Quay lại" color="gray" />
                <ActionButton onClick={onSaveToExamLibrary} text="Lưu vào Thư viện" color="green">
                    <IconSave />
                    <span className="ml-2">Lưu vào Thư viện</span>
                </ActionButton>
                 <ActionButton onClick={onSaveToDrive} text="Lưu vào Google Drive" color="purple" secondary={!isDriveConnected} title={isDriveConnected ? "Lưu gói đề thi vào Google Drive" : "Vui lòng kết nối Google Drive trong Cài đặt"}>
                    <IconGoogleDrive />
                    <span className="ml-2">Lưu vào Google Drive</span>
                </ActionButton>
                <ActionButton onClick={handleDownloadDocx} text="Tải về file Docx" color="blue">
                    <IconDownload /> Tải về file Docx
                </ActionButton>
            </div>

            <div id="full-package-content" ref={packageRef} className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg p-12 shadow-lg doc-container">
                {/* --- SECTION 1: MATRIX --- */}
                <section id="matrix-section">
                    <MatrixTable data={calculatedMatrixData} structure={matrixStructure} onYccdChange={() => {}} examInfo={examInfo} aiParams={aiParams} currentAcademicYear={currentAcademicYear} />
                </section>

                <div className="page-break"></div>

                {/* --- SECTION 2: EXAM PAPER --- */}
                <section id="exam-paper-section">
                    <div className="exam-header">
                        <p className="font-bold">{examInfo.schoolName.toUpperCase()}</p>
                        <p>Lớp: {examInfo.className}</p>
                    </div>
                    <div className="centered-title mt-4">
                        <p className="font-bold">BÀI KIỂM TRA {examInfo.subject.toUpperCase()}</p>
                        <p className="font-semibold">{examInfo.examTitle}</p>
                        <p><i>Thời gian làm bài: {examInfo.examTime}</i></p>
                    </div>
                    <div className="mt-4">
                        <p>Họ và tên:...................................................................</p>
                    </div>
                    <hr className="my-4 border-black" />
                    <div className="space-y-4">
                        {questions.map((q, index) => {
                            const matchingData = q.matchingData || [];
                            const hasMatchingData = matchingData.some(item => item && item.trim() !== '');
                            const numPairs = Math.floor(matchingData.length / 2);
                            const pairs = Array.from({ length: numPairs }, (_, i) => ({
                                a: matchingData[i * 2],
                                b: matchingData[i * 2 + 1],
                            }));

                            return (
                                <div key={q.id} className="question-item">
                                    <p>
                                        <strong>Câu {index + 1}:</strong> ({q.points || 0} điểm) <span dangerouslySetInnerHTML={{ __html: cleanQuestionForStudent(q.text) }} />
                                    </p>
                                    {q.type === 'matching' && hasMatchingData && (
                                        <div className="mt-2 p-2" style={{border: '1px solid #eee'}}>
                                            <table style={{width: '100%', border: 'none'}}>
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '50%', textAlign: 'center', fontWeight: 'bold', border: 'none'}}>CỘT A</th>
                                                        <th style={{width: '50%', textAlign: 'center', fontWeight: 'bold', border: 'none'}}>CỘT B</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pairs.map((pair, i) => (
                                                        <tr key={i}>
                                                            <td style={{border: 'none', padding: '4px'}}>{`${i + 1}. ${pair.a || ''}`}</td>
                                                            <td style={{border: 'none', padding: '4px'}}>{`${String.fromCharCode(65 + i)}. ${pair.b || ''}`}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {q.imageUrl && <img src={q.imageUrl} alt={`Hình minh họa câu ${index + 1}`} className="max-w-xs my-2" />}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center font-bold mt-6">--- HẾT ---</p>
                </section>

                <div className="page-break"></div>

                {/* --- SECTION 3: ANSWER KEY --- */}
                <section id="answer-key-section">
                    <div className="centered-title">
                        <p className="font-bold">HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN</p>
                        <p className="font-semibold">BÀI KIỂM TRA {examInfo.subject.toUpperCase()} - {examInfo.examTitle}</p>
                        <p>Môn: {examInfo.subject} - Lớp: {examInfo.className}</p>
                    </div>
                    <div className="mt-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: answerKeyContent.replace(/\n/g, '<br />') }} />
                </section>
            </div>
             <style>{`
                .doc-container {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 13pt;
                    line-height: 1.5;
                }
                .page-break { 
                    page-break-before: always; 
                }
                @media print {
                    body {
                        background-color: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .doc-container {
                        box-shadow: none;
                        margin: 0;
                        max-width: 100%;
                        padding: 0;
                        border: none;
                    }
                }
            `}</style>
        </div>
    );
};