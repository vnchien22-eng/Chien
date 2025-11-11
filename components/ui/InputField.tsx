import React, { useState, useEffect, useRef } from 'react';
import { IconMicrophoneButton } from './Icons';

// --- New SpeechInputButton Component ---
interface SpeechInputButtonProps {
    onTranscript: (transcript: string) => void;
    lang?: string;
    className?: string;
}

const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

export const SpeechInputButton: React.FC<SpeechInputButtonProps> = ({ onTranscript, lang = 'vi-VN', className }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            onTranscript(transcript);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang, onTranscript]);
    
    const toggleListening = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!recognitionRef.current) return;
        
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
               recognitionRef.current.start();
               setIsListening(true);
            } catch (e) {
                 console.error("Could not start recognition", e);
                 setIsListening(false);
            }
        }
    };

    if (!SpeechRecognitionAPI) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } ${className}`}
            title={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
        >
            <IconMicrophoneButton className="w-4 h-4" />
        </button>
    );
};


// --- Modified InputField ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    enableSpeech?: (transcript: string) => void;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, enableSpeech, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
            <input 
                type="text" 
                id={id} 
                name={id} 
                {...props} 
                className={`block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${enableSpeech ? 'pr-10' : ''}`} 
            />
            {enableSpeech && 
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <SpeechInputButton onTranscript={enableSpeech} />
                </div>
            }
        </div>
    </div>
);

// --- New AutocompleteInput Component ---
interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    suggestions: string[];
    onValueChange: (value: string) => void;
    enableSpeech?: (transcript: string) => void;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ label, id, suggestions, onValueChange, value, enableSpeech, ...props }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.currentTarget.value;
        onValueChange(userInput);

        if (userInput) {
            const filtered = suggestions.filter(
                suggestion => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
        setActiveSuggestionIndex(0);
    };

    const onClick = (suggestion: string) => {
        onValueChange(suggestion);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (showSuggestions && filteredSuggestions.length > activeSuggestionIndex) {
                onClick(filteredSuggestions[activeSuggestionIndex]);
            }
        } else if (e.key === "ArrowUp") {
            if (activeSuggestionIndex === 0) return;
            setActiveSuggestionIndex(activeSuggestionIndex - 1);
        } else if (e.key === "ArrowDown") {
            if (activeSuggestionIndex + 1 < filteredSuggestions.length) {
                setActiveSuggestionIndex(activeSuggestionIndex + 1);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    const SuggestionsListComponent = () => {
        return filteredSuggestions.length > 0 && showSuggestions ? (
            <ul className="absolute top-full left-0 right-0 border border-t-0 border-gray-300 bg-white rounded-b-lg shadow-lg max-h-60 overflow-y-auto z-20">
                {filteredSuggestions.map((suggestion, index) => {
                    const isActive = index === activeSuggestionIndex;
                    return (
                        <li
                            className={`p-2 cursor-pointer text-sm ${isActive ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                            key={suggestion + index}
                            onClick={() => onClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    );
                })}
            </ul>
        ) : null;
    };

    return (
        <div ref={wrapperRef}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative mt-1">
                <input
                    type="text"
                    id={id}
                    onChange={handleChange}
                    onKeyDown={onKeyDown}
                    value={value}
                    {...props}
                    className={`block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${enableSpeech ? 'pr-10' : ''}`}
                    autoComplete="off"
                />
                {enableSpeech &&
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <SpeechInputButton onTranscript={enableSpeech} />
                    </div>
                }
                <SuggestionsListComponent />
            </div>
        </div>
    );
};