import React, { useState } from 'react';
import { IconX, IconBook } from '../ui/Icons';
import { mockDriveFiles } from '../../data';

interface GoogleDrivePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (files: { id: string, name: string }[]) => void;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleToggleFile = (fileId: string) => {
        setSelectedFiles(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const handleSelect = () => {
        const filesToImport = mockDriveFiles.filter(file => selectedFiles.includes(file.id));
        onSelect(filesToImport);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Chọn tệp từ Google Drive</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <IconX />
                    </button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    <ul className="space-y-2">
                        {mockDriveFiles.map(file => (
                            <li key={file.id} onClick={() => handleToggleFile(file.id)} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.id)}
                                    readOnly
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <IconBook className="w-5 h-5 mx-3 text-gray-500" />
                                <span className="text-sm text-gray-800">{file.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end items-center space-x-4">
                     <span className="text-sm text-gray-600">{selectedFiles.length} tệp đã chọn</span>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300">
                        Hủy
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={selectedFiles.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        Nhập
                    </button>
                </div>
            </div>
        </div>
    );
};
