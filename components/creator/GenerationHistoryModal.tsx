import React from 'react';
import type { Question } from '../../types';
import { IconX } from '../ui/Icons';

interface GenerationHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: Question[][];
    onRestore: (questions: Question[]) => void;
}

export const GenerationHistoryModal: React.FC<GenerationHistoryModalProps> = ({ isOpen, onClose, history, onRestore }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-2xl bg-white h-[80vh] flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b">
                    <h3 className="text-xl leading-6 font-bold text-gray-900">Lịch sử Tạo câu hỏi</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <IconX />
                    </button>
                </div>
                <div className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p className="text-lg">Chưa có lịch sử nào.</p>
                            <p className="text-sm mt-2">Mỗi khi bạn tạo câu hỏi bằng AI, một phiên bản sẽ được lưu tại đây.</p>
                        </div>
                    ) : (
                        history.map((questionSet, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                <div>
                                    <p className="font-semibold text-gray-800">Phiên bản {history.length - index}</p>
                                    <p className="text-sm text-gray-600">{questionSet.length} câu hỏi</p>
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                        Câu hỏi đầu tiên: "{questionSet[0]?.text.substring(0, 60) || '[Trống]'}{questionSet[0]?.text.length > 60 ? '...' : ''}"
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRestore(questionSet)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Khôi phục
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 pt-4 border-t text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};