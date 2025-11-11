import React, { useState } from 'react';
import { textbookTopics } from '../../data';

interface ExamLibraryProps {
    onSelectTopic: (topic: string) => void;
}

export const ExamLibrary: React.FC<ExamLibraryProps> = ({ onSelectTopic }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="my-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-4 py-2 text-left text-sm font-medium text-gray-700 bg-black/5 rounded-lg hover:bg-black/10 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
            >
                <span>📚 Gợi ý Chủ đề/Nội dung từ Sách Giáo Khoa</span>
                <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="mt-2 p-3 bg-white/50 border border-gray-300/50 rounded-lg max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                        {textbookTopics.map((subjectGroup, index) => (
                            <div key={index}>
                                <h5 className="font-bold text-sm text-indigo-700 mb-1">{subjectGroup.subject}</h5>
                                <ul className="space-y-1 pl-2">
                                    {subjectGroup.topics.map((item, topicIndex) => (
                                        <li key={topicIndex}>
                                            <button 
                                                onClick={() => { onSelectTopic(item.topic); }} 
                                                className="w-full text-left p-1.5 rounded-md text-sm text-gray-800 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100 transition-colors"
                                            >
                                                {item.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
