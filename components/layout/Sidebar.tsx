import React, { useState } from 'react';
import { IconMenu, IconX } from '../ui/Icons';
import { SIDEBAR_ITEMS } from '../../constants';

interface SidebarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    handlePreviewImage: (url: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen, handlePreviewImage }) => {
    
    // Add state for system status, default to 'activated' as requested.
    const [systemStatus, setSystemStatus] = useState<'activated' | 'error'>('activated');

    const handleNavClick = (page: string) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    }

    const ultraViewerLogoUrl = "https://i.postimg.cc/DZ42c92C/istockphoto-1008984554-612x612.jpg";
    
    return (
        <>
        {/* Mobile menu bar */}
        <div className="bg-white text-gray-800 flex justify-between md:hidden border-b">
            <a href="#" className="block p-4 text-gray-700 font-bold">Trí Tuệ Khảo Thí</a>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 focus:outline-none focus:bg-gray-200">
                {isSidebarOpen ? <IconX /> : <IconMenu />}
            </button>
        </div>
        
        <div
            className={`bg-slate-100 border-r border-slate-200 w-64 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 flex flex-col h-full`}
        >
            <div className="py-7 space-y-6">
                 <div className="p-2 bg-white rounded-lg mx-2">
                     <a href="#">
                        <img src="https://i.postimg.cc/52Rs7zXP/5cb391db50eadab483fb-1.jpg" alt="Trí Tuệ Khảo Thí Logo" className="w-40 h-auto rounded-md mx-auto" />
                    </a>
                </div>

                <nav>
                    {SIDEBAR_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center py-2.5 px-4 my-2 rounded-lg transition duration-200 ${currentPage === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-100 text-slate-700'}`}
                        >
                            {React.cloneElement(item.icon as React.ReactElement<any>, { className: `w-6 h-6 mr-3 ${currentPage === item.id ? 'text-white' : 'text-slate-600'}`})}
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Branding Section */}
            <div className="mt-auto p-4 text-center">
                 <div className="inline-flex items-center p-2 bg-white rounded-lg">
                    <img src="https://i.postimg.cc/xj4zPcM1/png-clipart-emoji-icon-graduation-ceremony-emoji-square-academic-cap-graduation-smiley-glasses.png" alt="Logo" className="w-8 h-8 mr-3" />
                    <span className="font-extrabold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-transparent bg-clip-text transition-all hover:brightness-110">
                        Trí Tuệ Khảo Thí
                    </span>
                 </div>
                 
                 <div className="mt-4 flex justify-start">
                    <div className="inline-flex items-center space-x-3 text-gray-600">
                        {/* UltraViewer Logo */}
                        <button
                            onClick={() => handlePreviewImage(ultraViewerLogoUrl)}
                            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                            title="Bấm vào ảnh để xem review kích thước gốc"
                        >
                            <img src={ultraViewerLogoUrl} alt="Hỗ trợ UltraViewer" className="w-14 h-14 rounded-md" />
                        </button>
                        <div className="text-left">
                            {/* UltraViewer Link */}
                            <a
                                href="https://www.ultraviewer.net/vi/download.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Hỗ trợ từ xa qua UltraViewer"
                                className="block mt-1 hover:text-blue-600 transition-colors"
                            >
                                <span className="font-semibold text-base">UltraViewer</span>
                            </a>
                        </div>
                    </div>
                 </div>

                 <div className="mt-2 text-xs text-gray-500/80">
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <span>Hệ thống tự động sửa lỗi:</span>
                        {systemStatus === 'activated' ? (
                            <div className="flex items-center space-x-1 text-green-700 font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span>Đã kích hoạt</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-1 text-red-700 font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span>Báo lỗi hệ thống</span>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
        </>
    );
};