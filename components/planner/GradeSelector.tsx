import React from 'react';

interface GradeSelectorProps {
    grades: string[];
    selected: string;
    onSelect: (grade: string) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ grades, selected, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-3">
            {grades.map((grade) => {
                const isActive = selected === grade;
                return (
                    <button
                        key={grade}
                        onClick={() => onSelect(grade)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:scale-105 ${
                            isActive
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                                : 'border-slate-600 bg-slate-900/60 text-slate-200 hover:border-emerald-300'
                        }`}
                    >
                        {grade}
                    </button>
                );
            })}
        </div>
    );
};
