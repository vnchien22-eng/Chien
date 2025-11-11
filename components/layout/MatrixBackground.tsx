import React, { useRef, useEffect } from 'react';

export const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;
        
        let animationFrameId: number;
        let drops: number[];
        let columns: number;
        
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        const fontSize = 14;

        const initialize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (let x = 0; x < columns; x++) {
                drops[x] = 1;
            }
        };

        const draw = () => {
            // Use a semi-transparent fill to create the fading tail effect.
            // This is drawn over the static gradient background.
            context.fillStyle = 'rgba(240, 245, 255, 0.1)'; 
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = 'rgba(59, 130, 246, 0.7)'; // A semi-transparent blue color
            context.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                context.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        let lastTime = 0;
        const speed = 50; // milliseconds per frame, higher is slower

        const animate = (timestamp: number) => {
            if (timestamp - lastTime > speed) {
                draw();
                lastTime = timestamp;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        initialize();
        animate(0);

        window.addEventListener('resize', initialize);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', initialize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-0"
            style={{
                background: 'linear-gradient(180deg, #f0f5ff 0%, #e6f0ff 100%)',
            }}
        />
    );
};