// FIX: Create the AIAssistant component to provide AI functionalities.
// This resolves the module import error in ExamCreator.tsx.
import React, { useState, useMemo } from 'react';
import type { AiParams, ExamInfo, MatrixStructureItem, SavedExam, KnowledgeSource } from '../../types';
import { IconSpinner, IconWand } from '../ui/Icons';
import { AutocompleteInput } from '../ui/InputField';
import { ActionButton } from '../ui/ActionButton';
import { MatrixInputRow } from './AIInputControls';
import { MatrixTable } from './MatrixTable';
import { MatrixProgressBar } from './MatrixProgressBar';
import { ExamLibrary } from './ExamLibrary';

interface AIAssistantProps {
    examInfo: ExamInfo;
    params: AiParams;
    onParamsChange: (levelKey: 'level1' | 'level2' | 'level3', typeKey: string, field: 'count' | 'points', value: number | string) => void;
    onTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerateFromMatrix: (options: { useSearch: boolean; useMaps: boolean }) => Promise<void>;
    isLoading: boolean;
    onSuggestMatrix: () => Promise<void>;
    onSuggestDistribution: (levelKey: 'level1' | 'level2' | 'level3') => void;
    isLoadingMatrix: boolean;
    matrixData: any;
    matrixStructure: MatrixStructureItem[];
    onYccdChange: (areaId: string, newYccd: string) => void;
    showNotification: (message: string) => void;
    onTopicSelect: (topic: string) => void;
    pastedContent: string;
    setPastedContent: React.Dispatch<React.SetStateAction<string>>;
    onAnalyzePastedContent: (pastedText: string) => Promise<void>;
    isAnalyzingPastedContent: boolean;
    onAnalyzeFile: (files: FileList) => Promise<void>;
    isAnalyzingFile: boolean;
    currentAcademicYear: string;
    savedExams: SavedExam[];
    knowledgeSources: KnowledgeSource[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
    examInfo, params, onParamsChange, onTopicChange, onGenerateFromMatrix, isLoading, 
    onSuggestMatrix, isLoadingMatrix, matrixData, matrixStructure, onYccdChange,
    showNotification, onTopicSelect, pastedContent, setPastedContent,
    onAnalyzePastedContent, isAnalyzingPastedContent,
    onAnalyzeFile, isAnalyzingFile, currentAcademicYear,
}) => {
    const [activeTab, setActiveTab] = useState('params');
    const [useSearchGrounding, setUseSearchGrounding] = useState(false);
    const [useMapsGrounding, setUseMapsGrounding] = useState(false);
    const [selectedSourceId, setSelectedSourceId] = useState('');

    const topicSuggestions = useMemo(() => {
        return matrixStructure.map(item => item.name);
    }, [matrixStructure]);

    // FIX: Use 'as const' to ensure TypeScript correctly types 'level' as one of 'level1', 'level2', 'level3', not a generic string.
    // This resolves errors where properties like 'mc' were not found on the AiParams type.
    const totalPoints = useMemo(() => {
        let total = 0;
        (['level1', 'level2', 'level3'] as const).forEach(level => {
            const l = params[level];
            total += (l.mc.count * l.mc.points) + (l.fill.count * l.fill.points) + (l.match.count * l.match.points) + (l.tf.count * l.tf.points) + (l.tuLuan.count * l.tuLuan.points);
        });
        return total;
    }, [params]);

    // FIX: Explicitly type the keys of the points object to guide TypeScript's inference.
    // This prevents errors from accessing properties on a union type that includes 'string'.
    const levelPoints = useMemo(() => {
        const points = { level1: 0, level2: 0, level3: 0 };
        (Object.keys(points) as Array<keyof typeof points>).forEach(level => {
            const l = params[level];
            points[level] = (l.mc.count * l.mc.points) + (l.fill.count * l.fill.points) + (l.match.count * l.match.points) + (l.tf.count * l.tf.points) + (l.tuLuan.count * l.tuLuan.points);
        });
        return points;
    }, [params]);

    const percentages = useMemo(() => {
        if (totalPoints === 0) return { level1: 0, level2: 0, level3: 0 };
        return {
            level1: (levelPoints.level1 / totalPoints) * 100,
            level2: (levelPoints.level2 / totalPoints) * 100,
            level3: (levelPoints.level3 / totalPoints) * 100,
        };
    }, [levelPoints, totalPoints]);

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Trợ lý AI Soạn đề</h2>
            <div className="space-y-8">
                {/* AI Controls Panel */}
                <div className="space-y-4">
                    {/* FIX: Use the correct `onTopicSelect` handler for `onValueChange` and speech input. Removed the incorrect `onChange` prop which interfered with AutocompleteInput's internal logic. */}
                    <AutocompleteInput 
                        label="Chủ đề/Nội dung trọng tâm" 
                        id="topic"
                        value={params.topic}
                        onValueChange={onTopicSelect}
                        suggestions={topicSuggestions}
                        placeholder="VD: Ôn tập số tự nhiên và phân số"
                        enableSpeech={(transcript) => onTopicSelect(params.topic + transcript)}
                    />
                    <ExamLibrary onSelectTopic={onTopicSelect} />

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {['params', 'paste', 'source'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`${tab === activeTab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                                    { {params: 'Theo Tham số', paste: 'Dán Nội dung', source: 'Từ Tư liệu'}[tab] }
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeTab === 'params' && (
                        <div className="p-4 bg-gray-50/50 rounded-lg border">
                           {/* Level 1, 2, 3 inputs */}
                            {/* FIX: Cast the map key to a specific level key type to ensure TypeScript can correctly infer the type of params[levelKey], resolving property access errors. */}
                            {Object.entries({ level1: 'Mức 1 (Nhận biết)', level2: 'Mức 2 (Kết nối)', level3: 'Mức 3 (Vận dụng)' }).map(([key, label]) => {
                                const levelKey = key as 'level1' | 'level2' | 'level3';
                                return (
                                <details key={key} className="mb-2" open={key==='level1'}>
                                    <summary className="cursor-pointer font-semibold text-gray-700">{label}</summary>
                                    <table className="w-full mt-2 bg-white rounded-md shadow-sm">
                                        <thead>
                                            <tr className="text-left bg-gray-100">
                                                <th className="px-3 py-2 text-sm font-medium">Loại câu hỏi</th>
                                                <th className="px-3 py-2 text-sm font-medium">Số lượng</th>
                                                <th className="px-3 py-2 text-sm font-medium">Điểm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <MatrixInputRow label="Trắc nghiệm (MC)" typeKey="mc" levelKey={levelKey} data={params[levelKey].mc} onChange={onParamsChange} />
                                            <MatrixInputRow label="Điền khuyết" typeKey="fill" levelKey={levelKey} data={params[levelKey].fill} onChange={onParamsChange} />
                                            <MatrixInputRow label="Nối" typeKey="match" levelKey={levelKey} data={params[levelKey].match} onChange={onParamsChange} />
                                            <MatrixInputRow label="Đúng/Sai" typeKey="tf" levelKey={levelKey} data={params[levelKey].tf} onChange={onParamsChange} />
                                            <MatrixInputRow label="Tự luận" typeKey="tuLuan" levelKey={levelKey} data={params[levelKey].tuLuan} onChange={onParamsChange} />
                                        </tbody>
                                    </table>
                                </details>
                            )})}
                        </div>
                    )}
                     <div className="flex justify-end space-x-4 pt-4">
                        <ActionButton onClick={onSuggestMatrix} disabled={isLoadingMatrix} text={isLoadingMatrix ? "Đang gợi ý..." : "Gợi ý Phân bổ"} color="gray">
                            {isLoadingMatrix && <IconSpinner />}
                        </ActionButton>
                        <ActionButton onClick={() => onGenerateFromMatrix({ useSearch: useSearchGrounding, useMaps: useMapsGrounding })} disabled={isLoading} text={isLoading ? "Đang tạo..." : "AI Tạo bộ câu hỏi"} color="blue">
                            {isLoading && <IconSpinner />}
                        </ActionButton>
                    </div>
                </div>

                {/* Matrix Preview Panel */}
                <div className="space-y-4">
                    <MatrixProgressBar level1Percent={percentages.level1} level2Percent={percentages.level2} level3Percent={percentages.level3} totalPoints={totalPoints} />
                    <MatrixTable data={matrixData} structure={matrixStructure} onYccdChange={onYccdChange} examInfo={examInfo} aiParams={params} currentAcademicYear={currentAcademicYear} />
                </div>
            </div>
        </div>
    );
};