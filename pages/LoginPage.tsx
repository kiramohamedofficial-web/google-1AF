import React, { useState, useEffect, useRef } from 'react';
import AnimatedCat from '../components/common/AnimatedCat.tsx';
import Footer from '../components/layout/Footer.tsx';
import { Page, User, Center } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';
import { generateAvatar } from '../constants.ts';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
}

// --- Icon Components ---
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7m-4-4l-4 2" /></svg>;
const GradeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SectionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const GuardianIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" /></svg>;
const GenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-12h8m-8 4h8m-8 4h8" /></svg>;
const CenterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

// --- Input Field Component ---
const InputField: React.FC<{ label: string, type?: string, as?: 'input' | 'select', icon: React.ReactNode, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, children?: React.ReactNode, required?: boolean }> = 
({ label, type = 'text', as = 'input', icon, value, onChange, children, required = true }) => {
    const commonClasses = "peer block w-full rounded-lg border border-slate-600 bg-black/20 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pr-10 transition text-white font-bold";
    const placeholderClass = value ? "" : "placeholder-transparent";

    return (
        <div>
            <div className="relative">
                {as === 'input' ? (
                    <input 
                        type={type} 
                        value={value}
                        onChange={onChange}
                        placeholder={label}
                        required={required}
                        className={`${commonClasses} ${placeholderClass}`}
                    />
                ) : (
                    <select
                        value={value}
                        onChange={onChange}
                        required={required}
                        className={`${commonClasses} ${value ? '' : 'text-slate-400'}`}
                    >
                        <option value="" disabled>{label}</option>
                        {children}
                    </select>
                )}
                <label className={`absolute right-3 -top-2.5 bg-slate-900 px-1 text-sm text-slate-300 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 peer-focus:font-bold font-bold
                    ${as === 'select' && value ? '!-top-2.5 !text-sm !text-blue-400 !font-bold' : ''}
                `}>
                    {label}
                </label>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    {icon}
                </span>
            </div>
        </div>
    );
};

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


const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [signupStep, setSignupStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');

    // Signup fields
    const [centers, setCenters] = useState<Center[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [centerId, setCenterId] = useState('');
    const [phone, setPhone] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');
    const [grade, setGrade] = useState('');
    const [gender, setGender] = useState<'ذكر' | 'أنثى' | ''>('');
    const [section, setSection] = useState('');
    const [school, setSchool] = useState('');

    const showSectionField = grade.includes('الثانوي');

    useEffect(() => {
        try {
            const loginError = sessionStorage.getItem('loginError');
            if (loginError) {
                setError(loginError);
                sessionStorage.removeItem('loginError');
            }
        } catch (e) {
            console.warn("Could not read sessionStorage for login error", e);
        }
    }, []);

    useEffect(() => {
        const fetchCenters = async () => {
            const { data, error } = await supabase.from('centers').select('id, name');
            if (error) {
                console.error("Error fetching centers:", error.message, error);
                setError("لم نتمكن من تحميل قائمة المراكز. يرجى المحاولة مرة أخرى.");
            } else {
                setCenters(data || []);
            }
        };
        if (activeTab === 'signup') {
            fetchCenters();
        }
    }, [activeTab]);

    const handleNextStep = () => {
        setError('');
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("يرجى ملء جميع الحقول الأساسية.");
            return;
        }
        if (password.trim() !== confirmPassword.trim()) {
            setError("كلمتا المرور غير متطابقتين.");
            return;
        }
        setSignupStep(2);
    };


    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!loginEmail.trim() || !loginPassword.trim()) {
            setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail.trim(),
                password: loginPassword.trim(),
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
                } else if (error.message.includes('Email not confirmed')) {
                    setError("يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد الخاص بك.");
                } else {
                    setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
                }
                console.error('Login error:', error.message, error);
            }
        } catch (err: any) {
            console.error("Login exception:", err.message, err);
            setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!centerId || !phone.trim() || !grade || !gender) {
            setError("يرجى ملء جميع الحقول المطلوبة.");
            return;
        }
        
        setIsLoading(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
            });

            if (authError) {
                console.error("Signup auth error:", authError.message, authError);
                if (authError.message.includes('already registered')) {
                    setError("هذا البريد الإلكتروني مسجل بالفعل.");
                    setSignupStep(1);
                } else if (authError.message.includes('Password should be at least 6 characters')) {
                    setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل.");
                    setSignupStep(1);
                } else {
                    setError("حدث خطأ أثناء إنشاء الحساب.");
                }
                setIsLoading(false);
                return;
            }

            if (user) {
                let profilePictureUrl = '';
                const mappedGender = gender === 'ذكر' ? 'male' : 'female';
                const { data: pictures, error: picError } = await supabase
                    .from('default_profile_pictures')
                    .select('image_url')
                    .eq('gender', mappedGender);

                if (picError || !pictures || pictures.length === 0) {
                    console.warn('Could not fetch default profile pictures, falling back to generated SVG avatar.', picError);
                    profilePictureUrl = generateAvatar(name.trim());
                } else {
                    const randomIndex = Math.floor(Math.random() * pictures.length);
                    profilePictureUrl = pictures[randomIndex].image_url;
                }
                
                const newUserProfile = {
                    id: user.id,
                    role: 'student',
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    guardianPhone: guardianPhone.trim(),
                    school: school.trim(),
                    grade: grade.trim(),
                    profilePicture: profilePictureUrl,
                    xpPoints: 0,
                    gender: gender as User['gender'],
                    section: (showSectionField && section ? section : 'عام') as User['section'],
                    center_id: centerId,
                };
                
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert(newUserProfile);

                if (profileError) {
                    console.error("Signup profile upsert error:", profileError.message, profileError);
                    setError("حدث خطأ أثناء إعداد ملفك الشخصي. يرجى الاتصال بالدعم.");
                } else {
                    setActiveTab('login');
                    setSignupStep(1);
                    setMessage('✅ تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.');
                }
            }

        } catch (err: any) {
            console.error("Signup exception:", err.message, err);
            setError("حدث خطأ غير متوقع أثناء إنشاء الحساب.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!resetEmail.trim()) {
            setError("يرجى إدخال البريد الإلكتروني.");
            setIsLoading(false);
            return;
        }

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
                redirectTo: window.location.href,
            });

            if (resetError) {
                console.error('Password reset error:', resetError.message);
            }
            
            setMessage("إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة التعيين.");

        } catch(err: any) {
             console.error("Password reset exception:", err.message, err);
             setMessage("إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة التعيين.");
        } finally {
            setIsLoading(false);
        }
    };

    const gradeOptions = [
        'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
        'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
    ];
    const sectionOptions = ['علمي علوم', 'علمي رياضة', 'أدبي'];

    return (
        <div className="min-h-screen flex flex-col bg-[#0a192f] text-slate-200 overflow-hidden">
            <ParticleNetwork />
            <AnimatedCat />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg mb-4 border border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38bdf8" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-500 tracking-wide">المنصة التعليمية</h1>
                        <p className="text-slate-400 mt-3 text-lg font-medium">بوابتك نحو مستقبل تعليمي مشرق</p>
                    </div>
                    
                    <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/20 border border-slate-700 overflow-hidden">
                        <div className="flex">
                            <button onClick={() => { setActiveTab('login'); setIsForgotPassword(false); setError(''); setMessage(''); }} className={`flex-1 p-4 font-bold text-lg transition-all duration-300 ${activeTab === 'login' ? 'bg-blue-600/80 text-white' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}>تسجيل الدخول</button>
                            <button onClick={() => { setActiveTab('signup'); setSignupStep(1); setError(''); setMessage(''); }} className={`flex-1 p-4 font-bold text-lg transition-all duration-300 ${activeTab === 'signup' ? 'bg-blue-600/80 text-white' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}>إنشاء حساب</button>
                        </div>
                        
                        <div className="p-8">
                            {activeTab === 'login' ? (
                                isForgotPassword ? (
                                    <form onSubmit={handlePasswordReset} className="space-y-6">
                                        <h3 className="text-xl font-bold text-center">إعادة تعيين كلمة المرور</h3>
                                        {error && <p className="text-red-400 text-center font-semibold bg-red-500/10 p-3 rounded-lg">{error}</p>}
                                        {message && <p className="text-green-400 text-center font-semibold bg-green-500/10 p-3 rounded-lg">{message}</p>}
                                        <p className="text-slate-400 text-center text-sm">أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.</p>
                                        <InputField label="البريد الإلكتروني" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} icon={<EmailIcon />}/>
                                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed">
                                            {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                                        </button>
                                        <button type="button" onClick={() => {setIsForgotPassword(false); setMessage(''); setError('')}} className="w-full text-center text-slate-400 hover:text-white transition-colors pt-2">
                                            &larr; العودة لتسجيل الدخول
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                                        {error && <p className="text-red-400 text-center font-semibold bg-red-500/10 p-3 rounded-lg">{error}</p>}
                                        {message && <p className="text-green-400 text-center font-semibold bg-green-500/10 p-3 rounded-lg">{message}</p>}
                                        <InputField label="البريد الإلكتروني" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} icon={<EmailIcon />}/>
                                        <InputField label="كلمة المرور" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} icon={<LockIcon />}/>
                                        <div className="text-right -mt-2">
                                            <button type="button" onClick={() => {setIsForgotPassword(true); setMessage(''); setError('');}} className="text-sm text-slate-400 hover:text-white transition-colors">
                                                نسيت كلمة المرور؟
                                            </button>
                                        </div>
                                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed">
                                            {isLoading ? 'جاري الدخول...' : 'دخول'}
                                        </button>
                                    </form>
                                )
                            ) : (
                                <form onSubmit={handleSignupSubmit} className="space-y-6">
                                    {error && <p className="text-red-400 text-center font-semibold bg-red-500/10 p-3 rounded-lg">{error}</p>}
                                    
                                    {signupStep === 1 ? (
                                        <>
                                            <h3 className="text-xl font-bold text-center">الخطوة 1: معلومات الحساب</h3>
                                            <InputField label="الاسم الكامل" type="text" value={name} onChange={e => setName(e.target.value)} icon={<UserIcon />}/>
                                            <InputField label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<EmailIcon />}/>
                                            <InputField label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={<LockIcon />}/>
                                            <InputField label="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} icon={<LockIcon />}/>
                                            <button type="button" onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg">
                                                التالي
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-bold text-center">الخطوة 2: معلومات الطالب</h3>
                                            <InputField as="select" label="اختر المركز الخاص بك" value={centerId} onChange={e => setCenterId(e.target.value)} icon={<CenterIcon />}>
                                                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </InputField>
                                            <InputField label="رقم هاتف الطالب" type="tel" value={phone} onChange={e => setPhone(e.target.value)} icon={<PhoneIcon />} />
                                            <InputField label="رقم هاتف ولي الأمر" type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} icon={<GuardianIcon />} />
                                            <InputField as="select" label="الصف الدراسي" value={grade} onChange={e => setGrade(e.target.value)} icon={<GradeIcon />}>
                                                {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                            </InputField>
                                            
                                            {showSectionField && (
                                                <InputField as="select" label="الشعبة" value={section} onChange={e => setSection(e.target.value)} icon={<SectionIcon />}>
                                                    {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                </InputField>
                                            )}
                                            <div>
                                                <label className="text-sm font-bold text-slate-300 mb-2 block">الجنس</label>
                                                <div className="flex gap-4">
                                                    <label className={`flex-1 p-3 rounded-lg text-center font-bold border-2 transition-all cursor-pointer ${gender === 'ذكر' ? 'bg-blue-600/80 border-blue-500 text-white' : 'bg-black/20 border-slate-600'}`}>
                                                        <input type="radio" name="gender" value="ذكر" checked={gender === 'ذكر'} onChange={() => setGender('ذكر')} className="sr-only" />
                                                        ذكر
                                                    </label>
                                                    <label className={`flex-1 p-3 rounded-lg text-center font-bold border-2 transition-all cursor-pointer ${gender === 'أنثى' ? 'bg-pink-600/80 border-pink-500 text-white' : 'bg-black/20 border-slate-600'}`}>
                                                        <input type="radio" name="gender" value="أنثى" checked={gender === 'أنثى'} onChange={() => setGender('أنثى')} className="sr-only" />
                                                        أنثى
                                                    </label>
                                                </div>
                                            </div>
                                            <InputField label="المدرسة" type="text" value={school} onChange={e => setSchool(e.target.value)} icon={<SchoolIcon />} required={false} />

                                            <div className="flex gap-4">
                                                <button type="button" onClick={() => setSignupStep(1)} className="w-1/2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg">
                                                    السابق
                                                </button>
                                                <button type="submit" disabled={isLoading} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed">
                                                    {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative z-10">
                 <Footer onNavigate={onNavigate} insideApp={false} />
            </div>
        </div>
    );
};

export default LoginPage;