import React from 'react';

interface MatrixProgressBarProps {
    level1Percent: number;
    level2Percent: number;
    level3Percent: number;
    totalPoints: number;
}

const ProgressBarSegment: React.FC<{ percent: number; color: string; label: string }> = ({ percent, color, label }) => (
    <div
        className={`h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
        title={`${label}: ${percent.toFixed(1)}%`}
    >
        {percent > 10 && `${percent.toFixed(1)}%`}
    </div>
);

export const MatrixProgressBar: React.FC<MatrixProgressBarProps> = ({ level1Percent, level2Percent, level3Percent, totalPoints }) => {
    const totalPercent = level1Percent + level2Percent + level3Percent;
    const isBalanced = Math.abs(totalPercent - 100) < 0.1;

    let suggestion = "Cấu trúc đề chưa cân đối, tổng tỉ lệ chưa đủ 100%. Vui lòng điều chỉnh lại điểm hoặc số câu.";
    if (isBalanced) {
        if (level1Percent > 50) {
            suggestion = "Gợi ý: Tỉ lệ câu hỏi Nhận biết cao, phù hợp cho đề ôn tập kiến thức cơ bản.";
        } else if (level3Percent > 40) {
            suggestion = "Gợi ý: Tỉ lệ câu hỏi Vận dụng cao, phù hợp để phân loại học sinh giỏi.";
        } else {
            suggestion = "Gợi ý: Cấu trúc đề cân đối, phù hợp để đánh giá năng lực toàn diện của học sinh.";
        }
    }
    
    const finalTotalPoints = parseFloat(totalPoints.toFixed(2));


    return (
        <div className="p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm space-y-3">
            <div className="flex justify-between items-center">
                 <h4 className="text-sm font-semibold text-gray-800">Phân bổ Cấu trúc Điểm</h4>
                 <span className="text-sm font-bold text-indigo-600">Tổng điểm: {finalTotalPoints}</span>
            </div>
           
            <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                <ProgressBarSegment percent={level1Percent} color="bg-blue-500" label="Mức 1" />
                <ProgressBarSegment percent={level2Percent} color="bg-green-500" label="Mức 2" />
                <ProgressBarSegment percent={level3Percent} color="bg-orange-500" label="Mức 3" />
            </div>

            <div className="flex justify-between text-xs text-gray-600 px-1">
                <div className="text-center">
                    <p className="font-semibold">Mức 1 (Nhận biết)</p>
                    <p>{level1Percent.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold">Mức 2 (Kết nối)</p>
                    <p>{level2Percent.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold">Mức 3 (Vận dụng)</p>
                    <p>{level3Percent.toFixed(1)}%</p>
                </div>
            </div>
             <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <p>{suggestion}</p>
            </div>
        </div>
    );
};