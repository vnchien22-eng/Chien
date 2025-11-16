import React, { useMemo, useState, useEffect } from 'react';
import { gradeCurriculums, digitalCompetencyPillars } from './curriculumData';
import { GradeSelector } from './components/planner/GradeSelector';
import { SummaryCards } from './components/planner/SummaryCards';
import { PlanTable } from './components/planner/PlanTable';
import { CompetencyMatrix } from './components/planner/CompetencyMatrix';
import { ResourcePanel } from './components/planner/ResourcePanel';
import type { GradeCurriculum } from './types';

export const App: React.FC = () => {
    const [selectedGrade, setSelectedGrade] = useState<string>(gradeCurriculums[0].grade);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const currentPlan: GradeCurriculum = useMemo(
        () => gradeCurriculums.find((plan) => plan.grade === selectedGrade) ?? gradeCurriculums[0],
        [selectedGrade]
    );

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 3500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const handleDownloadPlan = () => {
        const file = new Blob([JSON.stringify(currentPlan, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ke-hoach-mon-tin-hoc-${currentPlan.grade.replace(/\s/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setToastMessage('Đã tải kế hoạch dưới dạng tệp JSON.');
    };

    const handleCopySummary = () => {
        const summary = `Kế hoạch Tin học ${currentPlan.grade}: ${currentPlan.keyFocus}. Thời lượng: ${currentPlan.weeklyStructure.total} - ${currentPlan.weeklyStructure.digitalTime}. Dự án nổi bật: ${currentPlan.digitalProjects.map((p) => p.title).join(', ')}.`;
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(summary)
                .then(() => setToastMessage('Đã sao chép tóm tắt kế hoạch.'))
                .catch(() => setToastMessage('Không thể sao chép, vui lòng thử lại.'));
        } else {
            setToastMessage('Thiết bị không hỗ trợ sao chép tự động.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
                {toastMessage && (
                    <div className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-center text-sm text-emerald-100">
                        {toastMessage}
                    </div>
                )}

                <header className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Theo CV 3456/HD, Thông tư 02/2025/TT-BGDĐT, Tài liệu phát triển NLS (Final) và CT GDPT 2018 môn Tin học</p>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        Trợ lý xây dựng kế hoạch môn Tin học lớp 3, 4, 5
                    </h1>
                    <p className="text-base text-slate-300">
                        Công cụ giúp giáo viên tiểu học nhanh chóng tổng hợp mục tiêu năng lực số, cấu trúc thời lượng và dự án minh chứng theo các văn bản mới nhất.
                    </p>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                        <p className="text-sm font-semibold text-emerald-200">Chọn khối lớp cần lập kế hoạch</p>
                        <GradeSelector
                            grades={gradeCurriculums.map((plan) => plan.grade)}
                            selected={selectedGrade}
                            onSelect={setSelectedGrade}
                        />
                    </div>
                </header>

                <SummaryCards plan={currentPlan} />

                <section className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Yêu cầu năng lực số trọng tâm</h2>
                        <p className="text-sm text-slate-300">
                            Trích xuất trực tiếp từ CV 3456 và Tài liệu phát triển năng lực số (bản chỉnh sửa sau thẩm định).
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {currentPlan.competencyTargets.map((target) => (
                            <article key={target.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                                <h3 className="text-lg font-semibold text-white">{target.name}</h3>
                                <p className="mt-2 text-sm text-slate-300">{target.description}</p>
                                <p className="mt-2 text-xs uppercase tracking-widest text-emerald-300">
                                    {target.linkedDocuments.join(' • ')}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-white">Kế hoạch chủ đề & dự án</h2>
                            <p className="text-sm text-slate-400">Tổng hợp các mạch nội dung theo CT GDPT 2018 và hướng dẫn CV 3456.</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs uppercase tracking-widest text-emerald-200">
                            {currentPlan.modules.length} chủ đề
                        </span>
                    </div>
                    <PlanTable modules={currentPlan.modules} />
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">Ma trận trụ cột năng lực số</h2>
                    <CompetencyMatrix pillars={digitalCompetencyPillars} highlighted={currentPlan.digitalPillars} />
                </section>

                <ResourcePanel
                    documents={currentPlan.guidingDocuments}
                    projects={currentPlan.digitalProjects}
                    sourceNotes={currentPlan.sourceNotes}
                    onDownloadPlan={handleDownloadPlan}
                    onCopySummary={handleCopySummary}
                />

                <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">
                    <p>
                        Cập nhật lần cuối: 02/2025. Nội dung đảm bảo sự tương thích với Công văn 3456/HD-BGDĐT, Thông tư 02/2025/TT-BGDĐT,
                        tài liệu "Tiểu học - Tài liệu phát triển năng lực số (chỉnh sửa sau thẩm định)" và chương trình GDPT 2018 môn Tin học.
                    </p>
                </footer>
            </div>
        </div>
    );
};
