import React from 'react';
import { IconSpinner } from './Icons';

interface NotificationModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    showCancel: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, message, onConfirm, onCancel, showCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-sm shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Thông báo</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">{message}</p>
                    </div>
                    <div className="items-center px-4 py-3 flex justify-center space-x-4">
                        {showCancel && (
                             <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                                 Hủy bỏ
                            </button>
                        )}
                        <button onClick={onConfirm} className={`px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${showCancel ? 'w-1/2' : 'w-full'}`}>
                            {showCancel ? 'Xác nhận' : 'Đã hiểu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ImagePreviewModalProps {
    src: string | null;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh kích thước gốc"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-5xl font-bold z-10 hover:opacity-75"
                aria-label="Đóng"
            >
                &times;
            </button>
            <div 
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
            >
                <img 
                    src={src} 
                    alt="Xem ảnh kích thước gốc" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                />
            </div>
        </div>
    );
};