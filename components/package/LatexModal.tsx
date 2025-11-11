import React from 'react';
import { IconX } from '../ui/Icons';

interface LatexModalProps {
    isOpen: boolean;
    onClose: () => void;
    latexCode: string;
}

export const LatexModal: React.FC<LatexModalProps> = ({ isOpen, onClose, latexCode }) => {
    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(latexCode).then(() => {
            alert('Đã sao chép mã LaTeX vào clipboard!');
        }, (err) => {
            alert('Lỗi khi sao chép. Vui lòng thử lại.');
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Mã LaTeX của Đề thi</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <IconX />
                    </button>
                </div>
                <div className="p-4 flex-grow overflow-hidden">
                    <textarea
                        readOnly
                        value={latexCode}
                        className="w-full h-full p-2 border border-gray-300 rounded-md font-mono text-xs resize-none bg-gray-50"
                        aria-label="Mã LaTeX"
                    />
                </div>
                <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                        <strong>Hướng dẫn:</strong> 1. Sao chép mã. 2. Dán vào trang Bibcit để biên dịch.
                    </p>
                    <div className="flex gap-2">
                         <button 
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            Sao chép Mã
                        </button>
                        <a 
                            href="https://www.bibcit.com/en/massivemark" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700"
                        >
                            Mở Bibcit
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
