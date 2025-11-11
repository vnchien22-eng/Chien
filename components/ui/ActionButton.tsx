import React from 'react';

// FIX: Update ActionButtonProps to accept all standard button attributes.
// This is done by extending React.ButtonHTMLAttributes. We use Omit to keep our
// custom `onClick` signature to avoid type conflicts, which solves errors where
// props like 'title' were being passed.
interface ActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    // FIX: Made onClick optional to support cases where the button is used for styling inside another clickable element (e.g., an <a> tag).
    onClick?: () => void;
    text?: string;
    label?: string;
    color?: 'gray' | 'green' | 'blue' | 'purple';
    secondary?: boolean;
    small?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
    onClick, 
    text, 
    label,
    color = 'blue', 
    secondary,
    small,
    className = '', 
    children,
    ...rest // Capture other standard button attributes like 'title', 'disabled'
}) => {
    const finalColor = secondary ? 'gray' : color;
    
    const colorClasses = {
        gray: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        green: 'border-transparent bg-green-600 text-white hover:bg-green-700',
        blue: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        purple: 'border-transparent bg-purple-600 text-white hover:bg-purple-700',
    };
    
    const sizeClasses = small 
        ? 'py-1 px-3 text-xs' 
        : 'py-2 px-4 text-sm';

    const buttonText = label || text;

    return (
        <button 
            type="button" 
            onClick={onClick} 
            className={`w-full sm:w-auto inline-flex items-center justify-center border rounded-full shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${sizeClasses} ${colorClasses[finalColor]} ${className}`}
            {...rest}
        >
            {children || buttonText}
        </button>
    );
};