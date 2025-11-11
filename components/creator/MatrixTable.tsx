import React, { useMemo } from 'react';
import type { MatrixStructureItem, ExamInfo, AiParams } from '../../types';
import { SpeechInputButton } from '../ui/InputField';

interface MatrixTableProps {
    data: any;
    structure: MatrixStructureItem[];
    onYccdChange: (areaId: string, newYccd: string) => void;
    examInfo: ExamInfo;
    aiParams: AiParams;
    currentAcademicYear: string;
}

const ReadOnlyCell: React.FC<{ value?: string | number, isBold?: boolean }> = ({ value, isBold = false }) => (
    <div className={`w-full h-full text-center p-2 bg-black/5 flex items-center justify-center ${isBold ? 'font-bold' : ''}`}>
       {value ?? ''}
    </div>
);

export const MatrixTable: React.FC<MatrixTableProps> = ({ data, structure, onYccdChange, examInfo, aiParams, currentAcademicYear }) => {
    
    const calculations = useMemo(() => {
        const result: { [key: string]: any } = { totals: {}, grandTotals: {}, percentages: {} };
        const num = (val: any) => parseFloat(String(val)) || 0;

        // Calculate totals for each content area (row) from the actual questions data
        structure.forEach(area => {
            result[area.id] = {};
            ['soCau', 'diem'].forEach(row => {
                const dataRow = data[area.id]?.[row] || {};
                result[area.id][`${row}TNTotal`] = num(dataRow.tn1) + num(dataRow.tn2) + num(dataRow.tn3);
                result[area.id][`${row}TLTotal`] = num(dataRow.tl1) + num(dataRow.tl2) + num(dataRow.tl3);
            });
            const cauSoRow = data[area.id]?.cauSo || {};
            result[area.id].cauSoTNTotal = [cauSoRow.tn1, cauSoRow.tn2, cauSoRow.tn3].filter(Boolean).join(', ');
            result[area.id].cauSoTLTotal = [cauSoRow.tl1, cauSoRow.tl2, cauSoRow.tl3].filter(Boolean).join(', ');
        });

        // Calculate totals for each column (footer) from the AI parameters for real-time feedback
        const totalsFromAi = {
            soCautn1: 0, diemtn1: 0, soCautl1: 0, diemtl1: 0,
            soCautn2: 0, diemtn2: 0, soCautl2: 0, diemtl2: 0,
            soCautn3: 0, diemtn3: 0, soCautl3: 0, diemtl3: 0,
        };

        if (aiParams) {
            const l1 = aiParams.level1;
            totalsFromAi.soCautn1 = num(l1.mc.count) + num(l1.fill.count) + num(l1.match.count) + num(l1.tf.count);
            totalsFromAi.diemtn1 = (num(l1.mc.count) * num(l1.mc.points)) + (num(l1.fill.count) * num(l1.fill.points)) + (num(l1.match.count) * num(l1.match.points)) + (num(l1.tf.count) * num(l1.tf.points));
            totalsFromAi.soCautl1 = num(l1.tuLuan.count);
            totalsFromAi.diemtl1 = num(l1.tuLuan.count) * num(l1.tuLuan.points);

            const l2 = aiParams.level2;
            totalsFromAi.soCautn2 = num(l2.mc.count) + num(l2.fill.count) + num(l2.match.count) + num(l2.tf.count);
            totalsFromAi.diemtn2 = (num(l2.mc.count) * num(l2.mc.points)) + (num(l2.fill.count) * num(l2.fill.points)) + (num(l2.match.count) * num(l2.match.points)) + (num(l2.tf.count) * num(l2.tf.points));
            totalsFromAi.soCautl2 = num(l2.tuLuan.count);
            totalsFromAi.diemtl2 = num(l2.tuLuan.count) * num(l2.tuLuan.points);

            const l3 = aiParams.level3;
            totalsFromAi.soCautn3 = num(l3.mc.count) + num(l3.fill.count) + num(l3.match.count) + num(l3.tf.count);
            totalsFromAi.diemtn3 = (num(l3.mc.count) * num(l3.mc.points)) + (num(l3.fill.count) * num(l3.fill.points)) + (num(l3.match.count) * num(l3.match.points)) + (num(l3.tf.count) * num(l3.tf.points));
            totalsFromAi.soCautl3 = num(l3.tuLuan.count);
            totalsFromAi.diemtl3 = num(l3.tuLuan.count) * num(l3.tuLuan.points);
        }
        
        result.totals = {
            soCautn1: totalsFromAi.soCautn1, diemtn1: totalsFromAi.diemtn1,
            soCautl1: totalsFromAi.soCautl1, diemtl1: totalsFromAi.diemtl1,
            soCautn2: totalsFromAi.soCautn2, diemtn2: totalsFromAi.diemtn2,
            soCautl2: totalsFromAi.soCautl2, diemtl2: totalsFromAi.diemtl2,
            soCautn3: totalsFromAi.soCautn3, diemtn3: totalsFromAi.diemtn3,
            soCautl3: totalsFromAi.soCautl3, diemtl3: totalsFromAi.diemtl3,
        };
        
        // Calculate grand totals for TN/TL
        result.grandTotals.soCauTN = num(result.totals.soCautn1) + num(result.totals.soCautn2) + num(result.totals.soCautn3);
        result.grandTotals.soCauTL = num(result.totals.soCautl1) + num(result.totals.soCautl2) + num(result.totals.soCautl3);
        result.grandTotals.diemTN = num(result.totals.diemtn1) + num(result.totals.diemtn2) + num(result.totals.diemtn3);
        result.grandTotals.diemTL = num(result.totals.diemtl1) + num(result.totals.diemtl2) + num(result.totals.diemtl3);
        
        // Calculate grand total score
        const grandTotalScore = result.grandTotals.diemTN + result.grandTotals.diemTL;

        // Calculate level scores
        const level1Score = num(result.totals.diemtn1) + num(result.totals.diemtl1);
        const level2Score = num(result.totals.diemtn2) + num(result.totals.diemtl2);
        const level3Score = num(result.totals.diemtn3) + num(result.totals.diemtl3);
        
        // Calculate percentages
        if (grandTotalScore > 0) {
            result.percentages.level1 = (level1Score / grandTotalScore) * 100;
            result.percentages.level2 = (level2Score / grandTotalScore) * 100;
            result.percentages.level3 = (level3Score / grandTotalScore) * 100;
            result.percentages.tn = (result.grandTotals.diemTN / grandTotalScore) * 100;
            result.percentages.tl = (result.grandTotals.diemTL / grandTotalScore) * 100;
        } else {
            result.percentages = { level1: 0, level2: 0, level3: 0, tn: 0, tl: 0 };
        }

        return result;
    }, [data, structure, aiParams]);

    return (
        <div className="mt-6">
            <h3 className="text-center font-bold text-lg">MA TRẬN ĐỀ KIỂM TRA {examInfo.examTitle.toUpperCase() || '...'}</h3>
            <p className="text-center font-bold">Môn: {examInfo.subject || '...'} - Lớp: {examInfo.className || '...'}</p>
            <p className="text-center font-bold">NĂM HỌC: {currentAcademicYear || '...'}</p>
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                        <tr className="text-center font-bold bg-black/10">
                            <td className="border border-gray-400 p-2" rowSpan={3}>Nội dung</td>
                            <td className="border border-gray-400 p-2" rowSpan={3}>Yêu cầu cần đạt</td>
                            <td className="border border-gray-400 p-2" rowSpan={3}></td>
                            <td className="border border-gray-400 p-2" colSpan={6}>Các mức độ</td>
                            <td className="border border-gray-400 p-2" colSpan={2}>Tổng</td>
                        </tr>
                        <tr className="text-center font-bold bg-black/10">
                            <td className="border border-gray-400 p-2" colSpan={2}>Mức 1</td>
                            <td className="border border-gray-400 p-2" colSpan={2}>Mức 2</td>
                            <td className="border border-gray-400 p-2" colSpan={2}>Mức 3</td>
                            <td className="border border-gray-400 p-2" rowSpan={2}>TN</td>
                            <td className="border border-gray-400 p-2" rowSpan={2}>TL</td>
                        </tr>
                        <tr className="text-center font-bold bg-black/10">
                            <td className="border border-gray-400 p-1 font-bold text-red-600">TN</td><td className="border border-gray-400 p-1 font-bold text-red-600">TL</td>
                            <td className="border border-gray-400 p-1 font-bold text-red-600">TN</td><td className="border border-gray-400 p-1 font-bold text-red-600">TL</td>
                            <td className="border border-gray-400 p-1 font-bold text-red-600">TN</td><td className="border border-gray-400 p-1 font-bold text-red-600">TL</td>
                        </tr>
                    </thead>
                    <tbody>
                        {structure.map((area) => {
                            const diemTNTotal = calculations[area.id]?.diemTNTotal || 0;
                            const diemTLTotal = calculations[area.id]?.diemTLTotal || 0;
                            return (
                               <React.Fragment key={area.id}>
                                    <tr>
                                        <td className="border border-gray-400 p-2" rowSpan={3}>{area.name}</td>
                                        <td className="border border-gray-400 p-0" rowSpan={3}>
                                            <div className="relative w-full h-full">
                                                <textarea className="w-full h-full p-1 border-none resize-none focus:ring-0 bg-transparent" value={area.yccd} onChange={(e) => onYccdChange(area.id, e.target.value)} />
                                                <div className="absolute bottom-2 right-2">
                                                    <SpeechInputButton onTranscript={(transcript) => onYccdChange(area.id, area.yccd + ' ' + transcript)} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-400 p-2">Số câu</td>
                                        {['tn1','tl1','tn2','tl2','tn3','tl3'].map(col => <td key={col} className="border border-gray-400 p-0"><ReadOnlyCell value={data[area.id]?.soCau?.[col]} /></td>)}
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations[area.id]?.soCauTNTotal} /></td>
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations[area.id]?.soCauTLTotal} /></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-2">Câu số</td>
                                        {['tn1','tl1','tn2','tl2','tn3','tl3'].map(col => <td key={col} className="border border-gray-400 p-0"><ReadOnlyCell value={data[area.id]?.cauSo?.[col] || ''} /></td>)}
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations[area.id]?.cauSoTNTotal || ''} /></td>
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations[area.id]?.cauSoTLTotal || ''} /></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-2">Điểm</td>
                                        {['tn1','tl1','tn2','tl2','tn3','tl3'].map(col => {
                                            const value = data[area.id]?.diem?.[col] || 0;
                                            return <td key={col} className="border border-gray-400 p-0"><ReadOnlyCell value={value === 0 ? 0 : value.toFixed(2)} /></td>
                                        })}
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={diemTNTotal === 0 ? 0 : diemTNTotal.toFixed(2)} /></td>
                                        <td className="border border-gray-400 p-0"><ReadOnlyCell value={diemTLTotal === 0 ? 0 : diemTLTotal.toFixed(2)} /></td>
                                    </tr>
                               </React.Fragment>
                            );
                        })}
                         <tr>
                            <td className="border border-gray-400 p-2 font-bold" colSpan={2} rowSpan={3}>Tổng</td>
                            <td className="border border-gray-400 p-2 font-bold">Số câu</td>
                            {['tn1','tl1','tn2','tl2','tn3','tl3'].map(col => <td key={col} className="border border-gray-400 p-0"><ReadOnlyCell value={calculations.totals[`soCau${col}`]} isBold /></td>)}
                            <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations.grandTotals.soCauTN} isBold /></td>
                            <td className="border border-gray-400 p-0"><ReadOnlyCell value={calculations.grandTotals.soCauTL} isBold /></td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 p-2 font-bold">Điểm</td>
                            {['tn1','tl1','tn2','tl2','tn3','tl3'].map(col => {
                                const value = calculations.totals[`diem${col}`] || 0;
                                return <td key={col} className="border border-gray-400 p-0"><ReadOnlyCell value={value === 0 ? 0 : value.toFixed(2)} isBold /></td>;
                            })}
                            <td className="border border-gray-400 p-0"><ReadOnlyCell value={(calculations.grandTotals.diemTN || 0) === 0 ? 0 : (calculations.grandTotals.diemTN || 0).toFixed(2)} isBold /></td>
                            <td className="border border-gray-400 p-0"><ReadOnlyCell value={(calculations.grandTotals.diemTL || 0) === 0 ? 0 : (calculations.grandTotals.diemTL || 0).toFixed(2)} isBold /></td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 p-2 font-bold">Tỉ lệ %</td>
                            <td className="border border-gray-400 p-0 text-center" colSpan={2}><ReadOnlyCell value={`${calculations.percentages.level1?.toFixed(1) ?? '0.0'}%`} isBold /></td>
                            <td className="border border-gray-400 p-0 text-center" colSpan={2}><ReadOnlyCell value={`${calculations.percentages.level2?.toFixed(1) ?? '0.0'}%`} isBold /></td>
                            <td className="border border-gray-400 p-0 text-center" colSpan={2}><ReadOnlyCell value={`${calculations.percentages.level3?.toFixed(1) ?? '0.0'}%`} isBold /></td>
                            <td className="border border-gray-400 p-0 text-center"><ReadOnlyCell value={`${calculations.percentages.tn?.toFixed(1) ?? '0.0'}%`} isBold /></td>
                            <td className="border border-gray-400 p-0 text-center"><ReadOnlyCell value={`${calculations.percentages.tl?.toFixed(1) ?? '0.0'}%`} isBold /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};