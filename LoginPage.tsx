import React, { useState, useEffect, useRef } from 'react';

interface LoginPageProps {
    onLogin: (userType: 'student' | 'admin') => void;
}

// --- Icon Components ---
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const StudentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7m-4-4l-4 2" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Input Field Component ---
const InputField: React.FC<{ label: string, type: string, icon: React.ReactNode, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ label, type, icon, value, onChange }) => (
    <div>
        <div className="relative">
            <input 
                type={type} 
                value={value}
                onChange={onChange}
                placeholder={label}
                required 
                className="peer block w-full rounded-lg border border-slate-600 bg-black/20 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pr-10 transition text-white placeholder-transparent font-bold" 
            />
            <label className="absolute right-3 -top-2.5 bg-slate-900 px-1 text-sm text-slate-300 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 peer-focus:font-bold font-bold">
                {label}
            </label>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                {icon}
            </span>
        </div>
    </div>
);

// --- Particle Network Background ---
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseRadius: number;
}
const ParticleNetwork: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let intervalId: number;
        
        let currentShapeIndex = 0;
        let isNextShapeHeart = false;
        
        const numParticles = 150;
        
        let shapeCenterX: number;
        let shapeCenterY: number;
        let shapeCenterVX = Math.random() * 0.4 - 0.2;
        let shapeCenterVY = Math.random() * 0.4 - 0.2;
        let shapeWanderBounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            shapeWanderBounds = {
                xMin: canvas.width * 0.2,
                xMax: canvas.width * 0.8,
                yMin: canvas.height * 0.2,
                yMax: canvas.height * 0.8,
            };
        };
        
        // --- Shape Point Generation ---
        const getPointsFromVertices = (vertices: {x: number, y: number}[], numPoints: number) => {
            const points = [];
            if (vertices.length === 0) return points;
        
            const perimeter = vertices.reduce((acc, v, i) => {
                const nextV = vertices[(i + 1) % vertices.length];
                return acc + Math.hypot(nextV.x - v.x, nextV.y - v.y);
            }, 0);
        
            let accumulatedDist = 0;
            const segments = vertices.map((v, i) => {
                const nextV = vertices[(i + 1) % vertices.length];
                const length = Math.hypot(nextV.x - v.x, nextV.y - v.y);
                const segment = { start: v, end: nextV, length, startDist: accumulatedDist };
                accumulatedDist += length;
                return segment;
            });
        
            for (let i = 0; i < numPoints; i++) {
                const dist = (i / numPoints) * perimeter;
                const targetSegment = segments.find(s => dist >= s.startDist && dist <= s.startDist + s.length) || segments[segments.length - 1];
                const segmentT = (dist - targetSegment.startDist) / targetSegment.length;
                points.push({
                    x: targetSegment.start.x + segmentT * (targetSegment.end.x - targetSegment.start.x),
                    y: targetSegment.start.y + segmentT * (targetSegment.end.y - targetSegment.start.y),
                });
            }
            return points;
        };

        const getShapePoints = (shapeFn: Function, scale: number, numPoints: number, centerX: number, centerY: number) => {
            const points = [];
            for (let i = 0; i < numPoints; i++) {
                points.push(shapeFn(i / numPoints, scale, centerX, centerY));
            }
            return points;
        };

        // --- Shape Definitions ---
        const heartShape = (t: number, s: number, cx: number, cy: number) => ({
            x: cx + s * 16 * Math.pow(Math.sin(t * 2 * Math.PI), 3),
            y: cy - s * (13 * Math.cos(t * 2 * Math.PI) - 5 * Math.cos(2 * t * 2 * Math.PI) - 2 * Math.cos(3 * t * 2 * Math.PI) - Math.cos(4 * t * 2 * Math.PI)),
        });

        const polygonVertices = (sides: number, s: number, cx: number, cy: number, rotation = 0) => Array.from({ length: sides }, (_, i) => ({
            x: cx + s * Math.cos(i * 2 * Math.PI / sides + rotation),
            y: cy + s * Math.sin(i * 2 * Math.PI / sides + rotation),
        }));

        const starVertices = (points: number, outerS: number, innerS: number, cx: number, cy: number) => {
            const vertices = [];
            for (let i = 0; i < points * 2; i++) {
                const r = i % 2 === 0 ? outerS : innerS;
                const a = i * Math.PI / points - Math.PI / 2;
                vertices.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
            }
            return vertices;
        };

        const infinityShape = (t: number, s: number, cx: number, cy: number) => ({
             x: cx + s * Math.cos(t * 2 * Math.PI) / (1 + Math.pow(Math.sin(t * 2 * Math.PI), 2)),
             y: cy + s * Math.sin(t * 2 * Math.PI) * Math.cos(t * 2 * Math.PI) / (1 + Math.pow(Math.sin(t * 2 * Math.PI), 2)),
        });
        
        const butterflyShape = (t: number, s: number, cx: number, cy: number) => ({
            x: cx + s * Math.sin(t * 2 * Math.PI) * (Math.exp(Math.cos(t * 2 * Math.PI)) - 2 * Math.cos(4 * t * 2 * Math.PI) - Math.pow(Math.sin(t * 2 * Math.PI / 12), 5)),
            y: cy - s * Math.cos(t * 2 * Math.PI) * (Math.exp(Math.cos(t * 2 * Math.PI)) - 2 * Math.cos(4 * t * 2 * Math.PI) - Math.pow(Math.sin(t * 2 * Math.PI / 12), 5)),
        });

        const crescentMoonShape = (t: number, s: number, cx: number, cy: number) => {
            const angle = t * 2 * Math.PI;
            if (t < 0.5) { // Outer arc
                return { x: cx + s * Math.cos(angle), y: cy + s * Math.sin(angle) };
            } else { // Inner arc
                const innerAngle = (t - 0.5) * 2 * Math.PI;
                return { x: cx + s * 0.5 + s * 0.6 * Math.cos(innerAngle), y: cy + s * 0.6 * Math.sin(innerAngle) };
            }
        };

        const spiralShape = (t: number, s: number, cx: number, cy: number) => ({
            x: cx + s * t * Math.cos(4 * t * 2 * Math.PI),
            y: cy + s * t * Math.sin(4 * t * 2 * Math.PI),
        });

        const cloudShape = (t: number, s: number, cx: number, cy: number) => {
             const angle = t * 2 * Math.PI;
             const r = s * (1 + 0.2 * Math.sin(angle * 6) + 0.1 * Math.sin(angle * 12));
             return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
        };

        const shapes = [
            (s: number, n: number, cX: number, cY: number) => getShapePoints(heartShape, s, n, cX, cY),
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(starVertices(5, s, s / 2, cX, cY), n),
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(4, s, cX, cY, Math.PI / 4), n), // Square
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(100, s, cX, cY), n), // Circle
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(3, s, cX, cY, -Math.PI / 2), n), // Triangle
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(5, s, cX, cY, -Math.PI / 2), n), // Pentagon
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(6, s, cX, cY), n), // Hexagon
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices(polygonVertices(4, s, cX, cY), n), // Diamond
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices([ {x:cX-s,y:cY}, {x:cX,y:cY-s/2}, {x:cX,y:cY-s/4}, {x:cX+s,y:cY-s/4}, {x:cX+s,y:cY+s/4}, {x:cX,y:cY+s/4}, {x:cX,y:cY+s/2} ], n), // Arrow
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices([ {x:cX-s/4,y:cY-s/4}, {x:cX-s/4,y:cY-s}, {x:cX+s/4,y:cY-s}, {x:cX+s/4,y:cY-s/4}, {x:cX+s,y:cY-s/4}, {x:cX+s,y:cY+s/4}, {x:cX+s/4,y:cY+s/4}, {x:cX+s/4,y:cY+s}, {x:cX-s/4,y:cY+s}, {x:cX-s/4,y:cY+s/4}, {x:cX-s,y:cY+s/4}, {x:cX-s,y:cY-s/4} ], n), // Plus
            (s: number, n: number, cX: number, cY: number) => getShapePoints(infinityShape, s * 1.5, n, cX, cY),
            (s: number, n: number, cX: number, cY: number) => getShapePoints(butterflyShape, s, n, cX, cY),
            (s: number, n: number, cX: number, cY: number) => getShapePoints(crescentMoonShape, s, n, cX, cY),
            (s: number, n: number, cX: number, cY: number) => getShapePoints(spiralShape, s * 1.2, n, cX, cY),
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices([{x:cX,y:cY-s},{x:cX-s/3,y:cY},{x:cX+s/3,y:cY-s/3},{x:cX-s/2,y:cY+s},{x:cX+s/3,y:cY},{x:cX-s/3,y:cY+s/3}], n), // Bolt
            (s: number, n: number, cX: number, cY: number) => getPointsFromVertices([{x:cX,y:cY-s/2},{x:cX,y:cY+s},{x:cX-s/2,y:cY+s},{x:cX-s/2,y:cY-s*0.7},{x:cX,y:cY-s*0.7}], n), // Note
            (s: number, n: number, cX: number, cY: number) => getShapePoints(cloudShape, s, n, cX, cY),
        ];

        const changeShape = () => {
             if (isNextShapeHeart) {
                currentShapeIndex = 0; // Back to heart
            } else {
                // Pick a random shape that is NOT the heart
                let newIndex = currentShapeIndex;
                while (newIndex === currentShapeIndex || newIndex === 0) {
                     newIndex = Math.floor(Math.random() * (shapes.length - 1)) + 1;
                }
                currentShapeIndex = newIndex;
            }
            isNextShapeHeart = !isNextShapeHeart;

            shapeCenterVX += Math.random() * 0.2 - 0.1;
            shapeCenterVY += Math.random() * 0.2 - 0.1;
            shapeCenterVX = Math.max(-0.4, Math.min(0.4, shapeCenterVX));
            shapeCenterVY = Math.max(-0.4, Math.min(0.4, shapeCenterVY));
        };

        const init = () => {
            particles = [];
            shapeCenterX = canvas.width / 2;
            shapeCenterY = canvas.height / 2;
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: 0, vy: 0,
                    baseRadius: Math.random() * 1.5 + 0.5,
                });
            }
            currentShapeIndex = 0; // Start with the heart
            isNextShapeHeart = false; // Next shape will be random
            intervalId = window.setInterval(changeShape, 4000);
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Creature-like wandering movement
            shapeCenterX += shapeCenterVX;
            shapeCenterY += shapeCenterVY;
            if (shapeCenterX < shapeWanderBounds.xMin || shapeCenterX > shapeWanderBounds.xMax) shapeCenterVX *= -1;
            if (shapeCenterY < shapeWanderBounds.yMin || shapeCenterY > shapeWanderBounds.yMax) shapeCenterVY *= -1;
            
            const baseScale = Math.min(canvas.width, canvas.height) / 15;
            const pulse = Math.sin(Date.now() / 600) * 0.20; // Enhanced "pop" effect
            const currentScale = baseScale * (1 + pulse);
            
            const shapePoints = shapes[currentShapeIndex](currentScale, numParticles, shapeCenterX, shapeCenterY);

            const isHeart = currentShapeIndex === 0;
            const particleColor = isHeart ? 'rgba(255, 82, 128, 0.7)' : 'rgba(0, 150, 255, 0.7)';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const target = shapePoints[i] || { x: shapeCenterX, y: shapeCenterY };
                
                p.vx += (target.x - p.x) * 0.0015;
                p.vy += (target.y - p.y) * 0.0015;
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.x += p.vx;
                p.y += p.vy;

                const dynamicRadius = p.baseRadius * (1 + pulse * 0.5);

                ctx.beginPath();
                ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 100) {
                        const lineColor = isHeart ? `rgba(255, 82, 128, ${1 - distance / 100})` : `rgba(0, 150, 255, ${1 - distance / 100})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            clearInterval(intervalId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin('student');
    };

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin('student');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] text-slate-200 p-4 overflow-hidden dir-rtl">
            <ParticleNetwork />
            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                     <div className="inline-block p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg mb-4 border border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38bdf8" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-500 tracking-wide">سنتر جوجل التعليمي</h1>
                    <p className="text-slate-400 mt-3 text-lg font-medium">بوابتك نحو مستقبل تعليمي مشرق</p>
                </div>
                
                <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/20 border border-slate-700 overflow-hidden">
                    <div className="flex">
                        <button onClick={() => setActiveTab('login')} className={`flex-1 p-4 font-bold text-lg transition-all duration-300 ${activeTab === 'login' ? 'bg-blue-600/80 text-white' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}>تسجيل الدخول</button>
                        <button onClick={() => setActiveTab('signup')} className={`flex-1 p-4 font-bold text-lg transition-all duration-300 ${activeTab === 'signup' ? 'bg-blue-600/80 text-white' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}>إنشاء حساب</button>
                    </div>
                    
                    <div className="p-8">
                        {activeTab === 'login' ? (
                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <InputField label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<EmailIcon />}/>
                                <InputField label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={<LockIcon />}/>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transform hover:scale-105">
                                    دخول
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className="space-y-6">
                                <InputField label="الاسم الكامل" type="text" value={name} onChange={e => setName(e.target.value)} icon={<UserIcon />}/>
                                <InputField label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<EmailIcon />}/>
                                <InputField label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={<LockIcon />}/>
                                <InputField label="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} icon={<LockIcon />}/>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transform hover:scale-105">
                                    إنشاء حساب جديد
                                </button>
                            </form>
                        )}
                        
                        <div className="flex items-center my-6">
                            <hr className="flex-grow border-slate-700" />
                            <span className="mx-4 text-slate-500 text-sm font-medium">أو</span>
                            <hr className="flex-grow border-slate-700" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-slate-400 mb-4 font-medium">قم بتجربة المنصة كـ</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => onLogin('student')} className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105">
                                    <StudentIcon /> طالب
                                </button>
                                <button onClick={() => onLogin('admin')} className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105">
                                    <AdminIcon /> مدير
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;