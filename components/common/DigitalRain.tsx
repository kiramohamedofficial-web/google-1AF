
import React, { useRef, useEffect } from 'react';

const DigitalRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = document.getElementById('digital-rain-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let intervalId: number;
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);

        let rainDrops: number[] = [];
        const resetDrops = () => {
            columns = Math.floor(canvas.width / fontSize);
            rainDrops = [];
            for (let x = 0; x < columns; x++) {
                rainDrops[x] = 1;
            }
        }
        resetDrops();
        window.addEventListener('resize', resetDrops);


        const draw = () => {
            // Use the matrix theme surface color for the trail effect
            ctx.fillStyle = 'hsla(120, 10%, 8%, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Use the matrix theme primary color for the text
            ctx.fillStyle = `hsl(var(--color-primary))`;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        const animate = () => {
            // Only run the animation if the matrix theme is active
            if (document.documentElement.classList.contains('matrix')) {
                draw();
            }
        };
        
        intervalId = window.setInterval(animate, 50);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', resetDrops);
            clearInterval(intervalId);
        };
    }, []);

    return null;
};

export default DigitalRain;