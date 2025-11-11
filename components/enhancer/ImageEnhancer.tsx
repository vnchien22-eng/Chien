import React, { useState, useCallback, useRef } from 'react';
import * as geminiService from '../../services/geminiService';
import { IconCloudUpload, IconSpinner, IconDownload, IconWand } from '../ui/Icons';

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(';')[0].split(':')[1];
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

export const ImageEnhancer: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'enhance' | 'generate'>('enhance');
    
    // States for 'enhance' tab
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const originalFileRef = useRef<File | null>(null);
    const [aiMessage, setAiMessage] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);

    // States for 'generate' tab
    const [prompt, setPrompt] = useState('Một chú robot đang cầm một chiếc ván trượt màu đỏ.');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Shared states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleFile = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chỉ tải lên tệp hình ảnh (PNG, JPG, v.v.).');
                return;
            }
            originalFileRef.current = file;
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setProcessedImage(null);
                setError(null);
                setAiMessage('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFile(e.dataTransfer.files);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFile(e.target.files);
    };

    const handleProcessImage = async () => {
        if (!originalFileRef.current) {
            setError("Vui lòng tải lên một hình ảnh trước.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setProcessedImage(null);
        setAiMessage('');
        try {
            const { base64, mimeType } = await fileToBase64(originalFileRef.current);
            const result = await geminiService.enhanceImage(base64, mimeType);
            setProcessedImage(result.base64Image);
            if (result.text) {
                setAiMessage(result.text);
            }
        } catch (err) {
            console.error("Error processing image:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi không xác định xảy ra.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (image: string | null, baseName: string) => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        const nameParts = baseName.split('.');
        nameParts.pop();
        const name = nameParts.join('.') || 'image';
        link.download = `${name}-${activeTab === 'enhance' ? 'processed' : 'generated'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            setError("Vui lòng nhập một yêu cầu để tạo ảnh.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const result = await geminiService.generateImageFromPrompt(prompt, aspectRatio);
            setGeneratedImage(result);
        } catch (err) {
            console.error("Error generating image:", err);
            setError(err instanceof Error ? err.message : "Đã có lỗi không xác định xảy ra khi tạo ảnh.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8 max-w-6xl mx-auto">
            <div className="text-center mb-6 border-b pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Studio Hình ảnh AI</h1>
                <p className="text-gray-500 mt-2">Nâng cấp ảnh có sẵn hoặc tạo ảnh mới từ văn bản bằng công nghệ AI tiên tiến.</p>
            </div>

             {/* TABS */}
            <div className="mb-6 flex border-b">
                <button onClick={() => setActiveTab('enhance')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'enhance' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Nâng cấp ảnh SGK
                </button>
                <button onClick={() => setActiveTab('generate')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'generate' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Tạo ảnh từ văn bản (Imagen 4.0)
                </button>
            </div>

            {error && (
                <div className="my-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p><strong>Lỗi:</strong> {error}</p>
                </div>
            )}

            {activeTab === 'enhance' && (
                <div>
                    {!originalImage ? (
                        <form id="form-file-upload" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className="relative">
                            <input type="file" id="input-file-upload" onChange={handleChange} className="hidden" accept="image/*"/>
                            <label htmlFor="input-file-upload" className={`flex justify-center w-full h-64 px-4 transition bg-white border-2 ${dragActive ? "border-indigo-600" : "border-gray-300"} border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}>
                                <span className="flex items-center space-x-2">
                                    <IconCloudUpload />
                                    <span className="font-medium text-gray-600">
                                        Kéo và thả ảnh vào đây, hoặc <span className="text-blue-600 underline">nhấn để chọn ảnh</span>
                                        <p className="text-xs text-gray-500">Hỗ trợ: PNG, JPG, WEBP</p>
                                    </span>
                                </span>
                            </label>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ảnh Gốc</h3>
                                    <img src={originalImage} alt="Original" className="max-h-96 w-auto mx-auto rounded-lg border border-gray-200" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ảnh Đã Xử Lý</h3>
                                    <div className="h-96 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                        {isLoading ? (
                                            <div className="text-center text-gray-500"><IconSpinner className="h-12 w-12 mx-auto" /> <p className="mt-2">AI đang xử lý, vui lòng chờ...</p></div>
                                        ) : processedImage ? (
                                            <img src={processedImage} alt="Processed" className="max-h-96 w-auto mx-auto rounded-lg" />
                                        ) : (
                                            <p className="text-gray-500">Kết quả sẽ hiện ở đây</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {aiMessage && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                    <p><strong>AI nói:</strong> {aiMessage}</p>
                                </div>
                            )}
                            <div className="flex justify-center items-center space-x-4 pt-4 border-t">
                                <button onClick={() => { setOriginalImage(null); originalFileRef.current = null; }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Chọn ảnh khác</button>
                                <button onClick={handleProcessImage} disabled={isLoading} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                    {isLoading ? <IconSpinner /> : <IconWand />}
                                    <span className="ml-2">{isLoading ? 'Đang xử lý...' : 'Xử lý với AI'}</span>
                                </button>
                                <button onClick={() => handleDownload(processedImage, originalFileRef.current?.name || 'enhanced.png')} disabled={!processedImage || isLoading} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                                    <IconDownload /><span className="ml-2">Tải ảnh xuống</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'generate' && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Yêu cầu (Prompt)</label>
                        <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700">Tỷ lệ khung hình</label>
                        <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="1:1">Vuông (1:1)</option>
                            <option value="16:9">Ngang (16:9)</option>
                            <option value="9:16">Dọc (9:16)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                        </select>
                    </div>
                    <div className="text-center pt-2">
                        <button onClick={handleGenerateImage} disabled={isLoading} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? <IconSpinner/> : <IconWand />}
                            <span className="ml-2">{isLoading ? 'Đang tạo ảnh...' : 'Tạo ảnh với Imagen 4.0'}</span>
                        </button>
                    </div>

                    {isLoading && <div className="text-center py-10 text-gray-500"><IconSpinner className="h-12 w-12 mx-auto" /><p className="mt-2">AI đang vẽ, vui lòng chờ...</p></div>}
                    
                    {generatedImage && (
                        <div className="text-center space-y-4 pt-4 border-t">
                             <h3 className="text-lg font-semibold text-gray-700">Ảnh đã tạo</h3>
                             <img src={generatedImage} alt="Generated" className="max-h-96 w-auto mx-auto rounded-lg border border-gray-200" />
                             <button onClick={() => handleDownload(generatedImage, 'generated.png')} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700">
                                <IconDownload />
                                <span className="ml-2">Tải ảnh xuống</span>
                             </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};