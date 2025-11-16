import React from 'react';
import type { DigitalProject, DocumentReference } from '../../types';

interface ResourcePanelProps {
    documents: DocumentReference[];
    projects: DigitalProject[];
    sourceNotes: string;
    onDownloadPlan: () => void;
    onCopySummary: () => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
    documents,
    projects,
    sourceNotes,
    onDownloadPlan,
    onCopySummary,
}) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Tài liệu định hướng</h3>
                    <button
                        onClick={onCopySummary}
                        className="rounded-full border border-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/10"
                    >
                        Sao chép tóm tắt
                    </button>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    {documents.map((doc) => (
                        <li key={doc.code} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                            <p className="text-xs uppercase tracking-widest text-emerald-300">{doc.code}</p>
                            <p className="font-medium text-white">{doc.title}</p>
                            <p className="mt-1 text-slate-300">{doc.summary}</p>
                            <p className="mt-1 text-xs text-slate-400">Ứng dụng: {doc.application}</p>
                        </li>
                    ))}
                </ul>
                <p className="mt-4 text-xs text-slate-400">{sourceNotes}</p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Dự án số trọng tâm</h3>
                    <button
                        onClick={onDownloadPlan}
                        className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                    >
                        Tải kế hoạch (.json)
                    </button>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    {projects.map((project) => (
                        <li key={project.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                            <p className="font-semibold text-white">{project.title}</p>
                            <p className="text-xs uppercase tracking-widest text-emerald-300">{project.weeks}</p>
                            <p className="mt-1 text-slate-300">{project.description}</p>
                            <p className="mt-1 text-xs text-slate-400">Sản phẩm: {project.output}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};
