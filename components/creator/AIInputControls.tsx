
import React from 'react';
import type { AiParams } from '../../types';

interface NumericStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    'aria-label': string;
    inputClassName?: string;
}

export const NumericStepper: React.FC<NumericStepperProps> = ({ value, onChange, min = 0, 'aria-label': ariaLabel, inputClassName = '' }) => {
    const handleIncrement = () => onChange(Number(value || 0) + 1);
    const handleDecrement = () => {
        const newValue = Number(value || 0) - 1;
        if (newValue >= min) onChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            onChange(0); // If user clears the input, set value to 0
            return;
        }
        // Allow only digits
        const numericValue = rawValue.replace(/[^0-9]/g, '');
        if (numericValue !== '') {
            const intValue = parseInt(numericValue, 10);
            if (intValue >= min) {
                onChange(intValue);
            }
        }
        // If the input was non-numeric, it gets stripped. If the result is empty,
        // we don't update, letting React re-render with the old valid value.
    };

    return (
        <div className="inline-flex items-center rounded-md shadow-sm">
            <button
                onClick={handleDecrement}
                type="button"
                className="px-3 py-1 text-gray-700 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:z-10"
                aria-label={`Giảm ${ariaLabel}`}
            >
                <span className="font-semibold text-md leading-none">-</span>
            </button>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`w-12 py-1 text-center text-sm border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 relative ${inputClassName}`}
                value={value}
                onChange={handleChange}
                aria-label={ariaLabel}
            />
            <button
                onClick={handleIncrement}
                type="button"
                className="px-3 py-1 text-gray-700 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:z-10"
                aria-label={`Tăng ${ariaLabel}`}
            >
                <span className="font-semibold text-md leading-none">+</span>
            </button>
        </div>
    );
};

interface MatrixInputRowProps {
    label: string;
    typeKey: string;
    levelKey: keyof AiParams;
    data: { count: number, points: number };
    onChange: (levelKey: keyof AiParams, typeKey: string, field: 'count' | 'points', value: number | string) => void;
}

export const MatrixInputRow: React.FC<MatrixInputRowProps> = ({ label, typeKey, levelKey, data, onChange }) => {
    const isSpecial = typeKey === 'tuLuan';
    const labelClassName = isSpecial ? 'px-3 py-2 text-sm text-red-600 font-bold' : 'px-3 py-2 text-sm text-gray-800';
    const inputClassName = isSpecial ? 'text-red-600 font-bold' : '';

    return (
        <tr className="border-t border-gray-200">
            <td className={labelClassName}>{label}</td>
            <td className="px-3 py-2">
                <NumericStepper 
                    aria-label={`Số lượng ${label}`} 
                    value={data ? data.count : 0} 
                    onChange={(newValue) => onChange(levelKey, typeKey, 'count', newValue)} 
                    inputClassName={inputClassName}
                />
            </td>
            <td className="px-3 py-2">
                <div className="flex items-center space-x-2">
                    <input 
                        type="number" 
                        aria-label={`Điểm ${label}`} 
                        className={`w-24 p-1 text-sm rounded-md border-gray-300/50 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${inputClassName}`} 
                        value={data ? data.points : 0} 
                        onChange={(e) => onChange(levelKey, typeKey, 'points', e.target.value)} 
                        min="0" 
                        step="0.25" 
                    />
                    {isSpecial && <span className="text-sm text-red-600 font-bold whitespace-nowrap">(tổng điểm)</span>}
                </div>
            </td>
        </tr>
    );
};
