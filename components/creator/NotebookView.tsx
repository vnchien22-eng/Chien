// FIX: Create the NotebookView component as the replacement for AIKnowledgeBase.
// This component provides the 3-panel notebook interface.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { KnowledgeSource, ChatMessage, QuizQuestion, StudioOutput } from '../../types';
import * as geminiService from '../../services/geminiService';
import { IconSpinner, IconPlus, IconTrash, IconLink, IconUpload, IconGoogleDrive, IconClipboardText, IconSitemap, IconChecklist, IconAudioWave, IconFileText, IconWand, IconX, IconEye } from '../ui/Icons';
import { GoogleDrivePickerModal } from '../integrations/GoogleDrivePickerModal';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotebookViewProps {
    knowledgeSources: KnowledgeSource[];
    setKnowledgeSources: React.Dispatch<React.SetStateAction<KnowledgeSource[]>>;
    studioOutputs: StudioOutput[];
    setStudioOutputs: React.Dispatch<React.SetStateAction<StudioOutput[]>>;
    isDriveConnected: boolean;
    onDriveConnect: () => void;
}

// --- Left Panel: Source List ---
const SourceListPanel: React.FC<{
    sources: KnowledgeSource[];
    selectedSourceId: string | null;
    onSelectSource: (id: string) => void;
    onAddSource: (type: 'text' | 'file' | 'url' | 'drive') => void;
    onDeleteSource: (id: string) => void;
}> = ({ sources, selectedSourceId, onSelectSource, onAddSource, onDeleteSource }) => {
    return (
        <div className="bg-slate-50/70 border-r border-slate-200 flex flex-col h-full">
            <div className="p-3 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Tri thức AI</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                {sources.map(source => (
                    <button key={source.id} onClick={() => onSelectSource(source.id)}
                        className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between group transition-colors ${selectedSourceId === source.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-200'}`}>
                        <div className="flex-grow overflow-hidden">
                           <p className="text-sm font-semibold truncate">{source.name}</p>
                           <p className="text-xs text-slate-500">{new Date(source.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteSource(source.id); }} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <IconTrash className="w-4 h-4"/>
                        </button>
                    </button>
                ))}
            </div>
            <div className="p-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                <button onClick={() => onAddSource('text')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100"><IconClipboardText className="w-5 h-5"/>Văn bản</button>
                <button onClick={() => onAddSource('file')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100"><IconUpload className="w-5 h-5"/>Tệp</button>
                <button onClick={() => onAddSource('url')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100"><IconLink className="w-5 h-5"/>URL</button>
                <button onClick={() => onAddSource('drive')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100"><IconGoogleDrive className="w-5 h-5"/>Drive</button>
            </div>
        </div>
    );
};

// --- Middle Panel: Content Viewer ---
const ContentViewerPanel: React.FC<{
    source: KnowledgeSource | null;
    onUpdateContent: (sourceId: string, newContent: string) => void;
}> = ({ source, onUpdateContent }) => {
    if (!source) return <div className="flex items-center justify-center h-full text-slate-500">Chọn một tư liệu để bắt đầu</div>;
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-800 truncate">{source.name}</h3>
            </div>
            <div className="flex-grow overflow-y-auto">
                <textarea 
                    value={source.content || ''}
                    onChange={(e) => onUpdateContent(source.id, e.target.value)}
                    className="w-full h-full p-4 resize-none border-none focus:ring-0 text-sm leading-relaxed"
                    placeholder="Nội dung tư liệu..."
                />
            </div>
        </div>
    );
};

// --- NEW Component: Modal to view a single studio output ---
const StudioOutputModal: React.FC<{ output: StudioOutput | null; onClose: () => void }> = ({ output, onClose }) => {
    if (!output) return null;

    const renderContent = () => {
        switch (output.type) {
            case 'note':
            case 'mind_map':
                return <Markdown remarkPlugins={[remarkGfm]}>{output.content}</Markdown>;
            case 'quiz':
                return (
                    <div className="space-y-4">
                        {(output.content as QuizQuestion[]).map((q, index) => (
                            <div key={index} className="border-b pb-2">
                                <p><strong>Câu {index + 1}:</strong> {q.question}</p>
                                <ul className="list-disc pl-5 mt-2 text-sm">
                                    {q.options.map((opt, i) => (
                                        <li key={i} className={opt === q.answer ? 'font-bold text-green-600' : ''}>{opt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                );
            case 'audio_summary':
                // Assuming content is base64 audio string
                return <audio controls src={`data:audio/mpeg;base64,${output.content}`} />;
            default:
                return <p>Loại nội dung không được hỗ trợ.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">{output.title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><IconX className="w-6 h-6" /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto prose max-w-none">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- NEW Component: Renders a single output item in the list ---
const StudioOutputItem: React.FC<{
    output: StudioOutput;
    onView: () => void;
    onDelete: () => void;
}> = ({ output, onView, onDelete }) => {
    const ICONS = {
        note: <IconFileText className="w-5 h-5 text-yellow-600" />,
        mind_map: <IconSitemap className="w-5 h-5 text-purple-600" />,
        quiz: <IconChecklist className="w-5 h-5 text-green-600" />,
        audio_summary: <IconAudioWave className="w-5 h-5 text-blue-600" />,
    };

    return (
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 group flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{ICONS[output.type]}</div>
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate" title={output.title}>{output.title}</p>
                <p className="text-xs text-slate-500 truncate" title={`Từ: ${output.sourceName}`}>Từ: {output.sourceName}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onView} title="Xem chi tiết" className="p-1.5 rounded-full hover:bg-slate-200"><IconEye className="w-4 h-4 text-slate-600" /></button>
                <button onClick={onDelete} title="Xóa" className="p-1.5 rounded-full hover:bg-red-100"><IconTrash className="w-4 h-4 text-red-500" /></button>
            </div>
        </div>
    );
};

// --- Right Panel: AI Studio ---
const StudioPanel: React.FC<{
    source: KnowledgeSource | null;
    outputs: StudioOutput[];
    onNewOutput: (output: Omit<StudioOutput, 'id'>) => void;
    onDeleteOutput: (id: string) => void;
}> = ({ source, outputs, onNewOutput, onDeleteOutput }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const [viewingOutput, setViewingOutput] = useState<StudioOutput | null>(null);

    useEffect(() => {
        setChatHistory([]);
    }, [source]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !source?.content || isLoading) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userInput }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const modelResponse = await geminiService.getChatResponseAboutSource(userInput, source.content, chatHistory);
            setChatHistory([...newHistory, { role: 'model', text: modelResponse }]);
        } catch (error) {
            setChatHistory([...newHistory, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async (type: StudioOutput['type']) => {
        if (!source?.content || isLoading) return;
        setIsLoading(true);
        try {
            let content: any;
            let title = '';
            if (type === 'mind_map') {
                content = await geminiService.generateMindMap(source.content);
                title = `Sơ đồ tư duy cho "${source.name}"`;
            } else if (type === 'quiz') {
                content = await geminiService.generateQuiz(source.content);
                title = `Bài trắc nghiệm cho "${source.name}"`;
            } else if (type === 'note') {
                content = await geminiService.summarizeForTopic(source.content);
                title = `Ghi chú tóm tắt cho "${source.name}"`;
            }
            onNewOutput({ sourceId: source.id, sourceName: source.name, type, title, content });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!source) return <div className="bg-slate-50/70 border-l border-slate-200 flex items-center justify-center h-full text-slate-500">Chọn tư liệu để sử dụng AI Studio</div>;

    const currentOutputs = outputs.filter(o => o.sourceId === source.id);

    return (
        <div className="bg-slate-50/70 border-l border-slate-200 flex flex-col h-full">
            <StudioOutputModal output={viewingOutput} onClose={() => setViewingOutput(null)} />
            <div className="p-3 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">AI Studio</h2>
            </div>
            
            <div className="p-3 grid grid-cols-2 gap-2 border-b">
                <button onClick={() => handleGenerate('note')} disabled={isLoading} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100 disabled:opacity-50"><IconFileText className="w-5 h-5"/>Tóm tắt</button>
                <button onClick={() => handleGenerate('mind_map')} disabled={isLoading} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100 disabled:opacity-50"><IconSitemap className="w-5 h-5"/>Sơ đồ</button>
                <button onClick={() => handleGenerate('quiz')} disabled={isLoading} className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md hover:bg-slate-100 disabled:opacity-50"><IconChecklist className="w-5 h-5"/>Trắc nghiệm</button>
                <button disabled className="flex items-center justify-center gap-2 p-2 text-sm bg-white border rounded-md disabled:opacity-50"><IconAudioWave className="w-5 h-5"/>Âm thanh</button>
            </div>
            
            <details className="p-3 border-b" open>
                <summary className="cursor-pointer font-semibold text-sm text-slate-700">Sản phẩm đã tạo ({currentOutputs.length})</summary>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentOutputs.length > 0 ? (
                        currentOutputs.map(output => (
                            <StudioOutputItem 
                                key={output.id}
                                output={output}
                                onView={() => setViewingOutput(output)}
                                onDelete={() => onDeleteOutput(output.id)}
                            />
                        ))
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-4">Chưa có sản phẩm nào được tạo từ tư liệu này.</p>
                    )}
                </div>
            </details>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col bg-white overflow-hidden">
                <div className="flex-grow p-3 overflow-y-auto">
                    <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'} prose prose-sm`}>
                                    <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="px-4 py-2 rounded-2xl bg-slate-200 text-slate-800"><IconSpinner className="h-5 w-5"/></div></div>}
                        <div ref={endOfMessagesRef} />
                    </div>
                </div>

                <div className="p-3 border-t border-slate-200">
                    <form onSubmit={handleChatSubmit} className="relative">
                        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Hỏi AI về nội dung tư liệu..."
                            className="w-full p-2 pr-10 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 12h14"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
export const NotebookView: React.FC<NotebookViewProps> = ({ knowledgeSources, setKnowledgeSources, studioOutputs, setStudioOutputs, isDriveConnected, onDriveConnect }) => {
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selectedSourceId && knowledgeSources.length > 0) {
            setSelectedSourceId(knowledgeSources[0].id);
        }
    }, [knowledgeSources, selectedSourceId]);
    
    const selectedSource = knowledgeSources.find(s => s.id === selectedSourceId) || null;

    const handleAddSource = async (type: 'text' | 'file' | 'url' | 'drive') => {
        let newSource: Omit<KnowledgeSource, 'id'> | null = null;
        if (type === 'text') {
            newSource = { name: 'Văn bản mới', type: 'text/plain', size: 0, createdAt: new Date().toISOString(), content: '' };
        } else if (type === 'file') {
            fileInputRef.current?.click();
            return;
        } else if (type === 'url') {
            const url = prompt('Nhập URL để tóm tắt:');
            if (url) {
                 const { title, content } = await geminiService.summarizeUrlContent(url);
                 newSource = { name: title, type: 'text/url', size: content.length, createdAt: new Date().toISOString(), content };
            }
        } else if (type === 'drive') {
            if (isDriveConnected) {
                setIsDriveModalOpen(true);
            } else {
                onDriveConnect();
            }
            return;
        }
        
        if (newSource) {
            const sourceWithId = { ...newSource, id: `user-${Date.now()}` };
            setKnowledgeSources(prev => [sourceWithId, ...prev]);
            setSelectedSourceId(sourceWithId.id);
        }
    };
    
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const content = await geminiService.extractTextFromFile(file);
        const newSource: KnowledgeSource = {
            id: `user-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: new Date().toISOString(),
            content
        };
        setKnowledgeSources(prev => [newSource, ...prev]);
        setSelectedSourceId(newSource.id);
    };

    const handleDriveSelect = async (files: {id: string, name: string}[]) => {
        setIsDriveModalOpen(false);
        for (const file of files) {
            const content = await geminiService.generateContentForDriveFile(file.name);
             const newSource: KnowledgeSource = {
                id: `user-drive-${file.id}`,
                name: file.name,
                type: 'application/vnd.google-apps.document',
                size: content.length,
                createdAt: new Date().toISOString(),
                content
            };
            setKnowledgeSources(prev => [newSource, ...prev]);
        }
    };

    const handleDeleteSource = (id: string) => {
        setKnowledgeSources(prev => prev.filter(s => s.id !== id));
        if (selectedSourceId === id) setSelectedSourceId(null);
    };
    
    const handleUpdateContent = (sourceId: string, newContent: string) => {
        setKnowledgeSources(prev => prev.map(s => s.id === sourceId ? { ...s, content: newContent } : s));
    };

    const handleNewOutput = (output: Omit<StudioOutput, 'id'>) => {
        const fullOutput = { ...output, id: `out-${Date.now()}` };
        setStudioOutputs(prev => [fullOutput, ...prev]);
        alert(`Đã tạo thành công! Sản phẩm mới đã được thêm vào danh sách "Sản phẩm đã tạo".`);
    };

    const handleDeleteOutput = (id: string) => {
        setStudioOutputs(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className="h-[600px] flex bg-white rounded-lg overflow-hidden border border-gray-200">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden"/>
            <GoogleDrivePickerModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} onSelect={handleDriveSelect} />

            <div className="w-1/4 min-w-[250px] max-w-[350px]">
                <SourceListPanel 
                    sources={knowledgeSources} 
                    selectedSourceId={selectedSourceId}
                    onSelectSource={setSelectedSourceId}
                    onAddSource={handleAddSource}
                    onDeleteSource={handleDeleteSource}
                />
            </div>
            <div className="flex-grow">
                <ContentViewerPanel source={selectedSource} onUpdateContent={handleUpdateContent} />
            </div>
            <div className="w-1/3 min-w-[300px] max-w-[450px]">
                 <StudioPanel 
                    source={selectedSource} 
                    outputs={studioOutputs}
                    onNewOutput={handleNewOutput}
                    onDeleteOutput={handleDeleteOutput}
                />
            </div>
        </div>
    );
};