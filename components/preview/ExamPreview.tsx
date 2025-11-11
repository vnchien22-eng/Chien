import React, { useEffect, useRef, useState } from 'react';
import type { ExamInfo, Question } from '../../types';
import { ActionButton } from '../ui/ActionButton';
import { IconSave, IconGoogleForms, IconSpinner, IconGoogleDocs, IconGoogleDrive, IconHeadphones, IconShuffle } from '../ui/Icons';
import * as geminiService from '../../services/geminiService';

interface ExamPreviewProps {
    examInfo: ExamInfo;
    questions: Question[];
    onBack: () => void;
    onGenerateAnswerKey: () => void;
    onSaveToExamLibrary: () => void;
    onPreviewImage: (url: string | null) => void;
    onExportToGoogleForms: () => void;
    onNavigateToFullPackage: () => void;
    isGeneratingPackage: boolean;
    answerKeyContent: string;
    isAnswerKeyLoading: boolean;
    isAnswerKeyVisible: boolean;
    onSaveToDrive: () => void;
    isDriveConnected: boolean;
    onShuffleExam: () => void;
}

// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const ExamPreview: React.FC<ExamPreviewProps> = ({ 
    examInfo, questions, onBack, onGenerateAnswerKey, onSaveToExamLibrary, 
    onPreviewImage, onExportToGoogleForms, onNavigateToFullPackage, isGeneratingPackage,
    answerKeyContent, isAnswerKeyLoading, isAnswerKeyVisible, onSaveToDrive, isDriveConnected,
    onShuffleExam
}) => {
    const level1 = questions.filter(q => q.level === '1');
    const level2 = questions.filter(q => q.level === '2');
    const level3 = questions.filter(q => q.level === '3');
    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    let questionIndex = 0;
    
    const previewRef = useRef<HTMLDivElement>(null);
    const [playingQuestion, setPlayingQuestion] = useState<{ id: string; source: AudioBufferSourceNode; } | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (previewRef.current && (window as any).renderMathInElement) {
            (window as any).renderMathInElement(previewRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }, [questions, examInfo, answerKeyContent, isAnswerKeyVisible]);

    const handleReadAloud = async (question: Question) => {
        if (loadingAudio) return;

        if (playingQuestion?.id === question.id) {
            playingQuestion.source.stop();
            setPlayingQuestion(null);
            return;
        } else if (playingQuestion) {
            playingQuestion.source.stop();
            setPlayingQuestion(null);
        }

        setLoadingAudio(question.id);
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = audioContextRef.current;
            
            const cleanText = question.text
                .replace(/\[(Trắc nghiệm|Tự luận|Điền khuyết|Đúng\/Sai|Nối)\]/g, '')
                .replace(/\*Đáp án:.*?\*/gs, '')
                .replace(/\*Hướng dẫn chấm:.*?\*/gs, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\n[A-D]\.\s/g, '. ');


            const base64Audio = await geminiService.generateSpeechForText(cleanText);
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = () => {
                setPlayingQuestion(prev => (prev?.id === question.id ? null : prev));
            };
            source.start();
            setPlayingQuestion({ id: question.id, source });

        } catch (error) {
            console.error('Error generating or playing audio:', error);
            alert(`Lỗi khi tạo âm thanh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        } finally {
            setLoadingAudio(null);
        }
    };

    const renderLevel = (levelData: Question[], levelTitle: string) => {
        if (levelData.length === 0) return null;
        return (
            <>
                <div className="mb-4"><p className="font-bold italic">{levelTitle}</p></div>
                {levelData.map(q => {
                    questionIndex++;
                    const formattedText = q.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    const matchingData = q.matchingData || [];
                    const hasMatchingData = matchingData.some(item => item && item.trim() !== '');
                    const colA = matchingData.filter((_, i) => i % 2 === 0);
                    const colB = matchingData.filter((_, i) => i % 2 !== 0);

                    return (
                        <div key={q.id} className="ml-4 mb-4 break-inside-avoid">
                            <p><strong>Câu {questionIndex}:</strong> ({q.points || 0} điểm) 
                                <button onClick={() => handleReadAloud(q)} className={`ml-2 mr-1 inline-block align-middle no-print text-gray-500 hover:text-indigo-600 disabled:opacity-50 ${playingQuestion?.id === q.id ? 'text-green-600' : ''}`} title="Đọc câu hỏi" disabled={!!loadingAudio}>
                                    {loadingAudio === q.id ? <IconSpinner className="h-5 w-5 animate-spin" /> : <IconHeadphones className="h-5 w-5"/>}
                                </button>
                                <span dangerouslySetInnerHTML={{ __html: formattedText }} />
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
                                <button type="button" onClick={() => onPreviewImage(q.imageUrl)} className="mt-2 block w-auto transition-transform duration-200 hover:scale-105" title="Bấm để xem ảnh gốc">
                                    <img src={q.imageUrl} alt={`Hình minh họa cho câu ${questionIndex}`} className="rounded-lg border border-gray-200 max-w-xs" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </>
        );
    };

    return (
        <div id="preview-container" ref={previewRef} className="container mx-auto p-8 bg-white shadow-lg rounded-xl">
            <div className="prose max-w-none">
                 <div className="flex justify-between items-start text-sm">
                     <div className="text-center">
                         <p className="font-bold">{(examInfo.schoolName || 'TRƯỜNG:.....................').toUpperCase()}</p>
                         <p>Lớp: {examInfo.className || '.....................'}</p>
                    </div>
                     <div className="text-center">
                         <p className="font-bold">BÀI KIỂM TRA {examInfo.subject.toUpperCase() || '...'}</p>
                         <p className="font-semibold">{examInfo.examTitle || '.....................'}</p>
                         <p><i>Thời gian làm bài: {examInfo.examTime || '...... phút'}</i></p>
                    </div>
                </div>
                 <div className="mt-4">
                     <p>Họ và tên:...................................................................</p>
                </div>
                 <hr className="my-6" />
                 <div className="space-y-6">
                     {renderLevel(level1, 'Mức 1: Nhận biết')}
                     {renderLevel(level2, 'Mức 2: Kết nối')}
                     {renderLevel(level3, 'Mức 3: Vận dụng')}
                </div>
                 
                 {isAnswerKeyVisible && (
                    <div className="mt-8 no-print">
                        <hr className="my-6" />
                        <div className="p-6 bg-indigo-50/50 rounded-lg border border-indigo-100">
                             <h3 className="text-xl font-bold text-center text-indigo-800">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM</h3>
                             {isAnswerKeyLoading ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                                    <p>AI đang soạn đáp án, vui lòng chờ trong giây lát...</p>
                                </div>
                             ) : (
                                <div className="mt-4 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: answerKeyContent.replace(/\n/g, '<br />') }} />
                             )}
                        </div>
                    </div>
                )}

                 <hr className="my-6" />
                  <div className="flex justify-between items-center font-bold">
                      <div className="flex flex-wrap gap-2">
                          <ActionButton onClick={onBack} text="Quay lại chỉnh sửa" color="gray" className="no-print" />
                          <ActionButton
                                onClick={onShuffleExam}
                                text="Chộn Đề Thi"
                                color="blue"
                                secondary
                                className="no-print"
                                title="Xáo trộn thứ tự câu hỏi và đáp án trắc nghiệm"
                           >
                                <IconShuffle className="w-5 h-5 mr-2" />
                                Chộn Đề Thi
                           </ActionButton>
                          <ActionButton onClick={onSaveToExamLibrary} text="Lưu vào Thư viện" color="green" className="no-print">
                              <div className="flex items-center"><IconSave /><span className="ml-2">Lưu vào Thư viện</span></div>
                          </ActionButton>
                          <ActionButton 
                                onClick={onSaveToDrive} 
                                text="Lưu vào Google Drive"
                                color="blue"
                                className="no-print"
                                secondary={!isDriveConnected}
                                title={isDriveConnected ? "Lưu đề thi và đáp án vào Google Drive" : "Vui lòng kết nối Google Drive trong Cài đặt"}
                            >
                                <div className="flex items-center"><IconGoogleDrive /><span className="ml-2">Lưu vào Google Drive</span></div>
                            </ActionButton>
                          <ActionButton 
                            onClick={onGenerateAnswerKey} 
                            text={isAnswerKeyVisible ? 'Ẩn đáp án' : '✨ Gợi ý đáp án với AI'}
                            color="blue" 
                            className="no-print"
                          />
                          <ActionButton 
                            onClick={onNavigateToFullPackage} 
                            text={isGeneratingPackage ? 'Đang chuẩn bị...' : 'Hoàn thiện & Xuất file'} 
                            color="purple" 
                            className="no-print"
                          >
                            <div className="flex items-center">
                                {isGeneratingPackage ? <IconSpinner /> : <IconGoogleDocs />}
                                <span className="ml-2">{isGeneratingPackage ? 'Đang chuẩn bị...' : 'Hoàn thiện & Xuất file'}</span>
                            </div>
                          </ActionButton>
                      </div>
                      <div className="text-center">
                         <p>--- HẾT ---</p>
                         <p>Tổng điểm: {totalPoints.toFixed(2)}</p>
                     </div>
                 </div>
            </div>
        </div>
    );
};