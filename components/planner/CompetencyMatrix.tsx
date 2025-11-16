import React from 'react';
import type { DigitalCompetencyPillar } from '../../types';

interface CompetencyMatrixProps {
    pillars: DigitalCompetencyPillar[];
    highlighted: string[];
}

export const CompetencyMatrix: React.FC<CompetencyMatrixProps> = ({ pillars, highlighted }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => {
                const isActive = highlighted.includes(pillar.id);
                return (
                    <article
                        key={pillar.id}
                        className={`rounded-2xl border p-4 transition ${
                            isActive
                                ? 'border-emerald-400/80 bg-emerald-500/10 shadow-emerald-500/40'
                                : 'border-slate-700 bg-slate-900/50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                            <span className="text-xs uppercase tracking-widest text-emerald-300">{pillar.reference}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{pillar.description}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
                            {pillar.classroomActions.map((action, index) => (
                                <li key={`${pillar.id}-action-${index}`}>{action}</li>
                            ))}
                        </ul>
                        {isActive && (
                            <div className="mt-3 rounded-lg bg-emerald-400/10 p-2 text-xs text-emerald-100">
                                Trọng tâm của kế hoạch khối hiện tại
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
};
