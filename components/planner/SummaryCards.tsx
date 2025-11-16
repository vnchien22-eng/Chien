import React from 'react';
import type { GradeCurriculum } from '../../types';

interface SummaryCardsProps {
    plan: GradeCurriculum;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ plan }) => {
    const cards = [
        {
            title: 'Trọng tâm triển khai',
            value: plan.keyFocus,
            details: [plan.summary],
        },
        {
            title: 'Cấu trúc thời lượng',
            value: `${plan.weeklyStructure.total}`,
            details: [
                `Tỷ lệ thực hành số: ${plan.weeklyStructure.digitalTime}`,
                ...plan.weeklyStructure.highlights,
            ],
        },
        {
            title: 'Đánh giá & minh chứng',
            value: plan.assessmentPlan.approach,
            details: [...plan.assessmentPlan.methods, plan.assessmentPlan.evidence],
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-xl shadow-emerald-500/5"
                >
                    <p className="text-xs uppercase tracking-widest text-emerald-300">{card.title}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{card.value}</h3>
                    <ul className="mt-3 space-y-1 text-sm text-slate-300">
                        {card.details.map((detail, index) => (
                            <li key={`${card.title}-${index}`} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                                <span>{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
