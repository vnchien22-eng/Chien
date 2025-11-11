// FIX: Create the Chatbot component.
// This component provides a floating AI assistant for user support.
import React, { useState, useRef, useEffect } from 'react';
import { IconChatBubbleLeftRight, IconX, IconSpinner } from '../ui/Icons';
import * as geminiService from '../../services/geminiService';
import type { ChatMessage } from '../../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Xin chào! Tôi là Trí Tuệ Bot. Tôi có thể giúp gì cho bạn về việc tạo đề thi theo quy định của Bộ GD&ĐT?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [isOpen, messages]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.getChatbotResponse(userInput, messages);
            setMessages([...newMessages, { role: 'model', text: response }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: 'model', text: 'Rất xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex-shrink-0 p-3 bg-indigo-600 text-white rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold">Trợ lý AI - Trí Tuệ Bot</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-indigo-700">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {/* FIX: Move prose classes to the parent div to resolve typing error on Markdown component. */}
                                <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'} prose prose-sm leading-snug`}>
                                    <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                    <IconSpinner className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>
                </div>
                {/* Input */}
                <div className="flex-shrink-0 p-3 border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            className="w-full py-2 pl-3 pr-12 text-sm bg-gray-100 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-indigo-500 hover:text-indigo-700 disabled:text-gray-400">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110 z-50"
                aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
            >
                {isOpen ? <IconX className="w-7 h-7" /> : <IconChatBubbleLeftRight className="w-7 h-7" />}
            </button>
        </>
    );
};