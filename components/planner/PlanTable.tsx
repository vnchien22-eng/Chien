import React from 'react';
import type { ModulePlan } from '../../types';

interface PlanTableProps {
    modules: ModulePlan[];
}

export const PlanTable: React.FC<PlanTableProps> = ({ modules }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                        <th className="px-4 py-3 text-left">Chủ đề/Thời lượng</th>
                        <th className="px-4 py-3 text-left">Yêu cầu cần đạt</th>
                        <th className="px-4 py-3 text-left">Năng lực số</th>
                        <th className="px-4 py-3 text-left">Đánh giá & học liệu</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {modules.map((module) => (
                        <tr key={module.id} className="bg-slate-900/40">
                            <td className="px-4 py-4 align-top text-slate-100">
                                <p className="font-semibold text-white">{module.theme}</p>
                                <p className="text-xs text-emerald-300">{module.duration}</p>
                            </td>
                            <td className="px-4 py-4 align-top text-slate-200">
                                <ul className="list-disc space-y-1 pl-5">
                                    {module.objectives.map((objective, idx) => (
                                        <li key={`${module.id}-objective-${idx}`}>{objective}</li>
                                    ))}
                                </ul>
                            </td>
                            <td className="px-4 py-4 align-top text-emerald-200">
                                <p className="font-medium">{module.digitalFocus}</p>
                            </td>
                            <td className="px-4 py-4 align-top text-slate-200">
                                <p className="font-medium text-white">{module.assessment}</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
                                    {module.resources.map((resource, idx) => (
                                        <li key={`${module.id}-resource-${idx}`}>{resource}</li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
