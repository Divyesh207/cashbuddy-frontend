import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Force Rebuild
import {
    ArrowRight,
    PieChart as PieChartIcon,
    Wallet,
    TrendingUp,
    Users,
    Zap,
    CheckCircle2,
    Star,
    Coins,
    AlertTriangle,
    TrendingDown,
    FileText,
    Target,
    MessageSquare,
    Shield,
    Smartphone,
    Cpu,
    Lightbulb,
    Lock,
    ShieldCheck,
    Menu,
    X,
    ChevronDown,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    ArrowDownLeft,
    Brain,
    Home,
    Plane,
    ShoppingBag,
    Utensils,
    Network
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';


// Dashboard Preview Component (High-Fidelity Code Alternative)
const DashboardPreview = () => {
    // Static Data
    const stats = { income: 45000, expenses: 20500, balance: 24500 };
    const trendData = [
        { name: 'Week 1', amount: 5000 },
        { name: 'Week 2', amount: 12000 },
        { name: 'Week 3', amount: 8000 },
        { name: 'Week 4', amount: 15000 },
        { name: 'Week 5', amount: 10000 },
        { name: 'Week 6', amount: 20500 },
    ];

    return (
        <div className="h-full w-full bg-[#f8fafc] dark:bg-[#020617] flex overflow-hidden select-none pointer-events-none text-slate-900 dark:text-white font-sans">
            {/* Sidebar (Desktop Only) */}
            <div className="hidden md:flex w-44 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-4 gap-6 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                        <Wallet size={16} />
                    </div>
                    <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">CashBuddy</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg opacity-60">
                        <PieChartIcon size={16} />
                        <span className="text-xs font-medium">Analytics</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg opacity-60">
                        <Target size={16} />
                        <span className="text-xs font-medium">Budget</span>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">System Status</span>
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400">All systems operational</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#020617]">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                    <h2 className="font-bold text-sm">Dashboard</h2>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-500 hidden sm:block">Welcome back, Divyesh</div>
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-700">D</div>
                    </div>
                </div>

                {/* Dashboard Content Grid */}
                <div className="p-4 md:p-6 overflow-hidden flex flex-col gap-4 h-full">
                    {/* Top Row: Greeting + Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 h-[140px]">
                        {/* Greeting Card */}
                        <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-lg flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="text-yellow-300 w-3 h-3" />
                                    <span className="text-emerald-300 font-semibold text-[10px] tracking-wide uppercase">Daily Wisdom</span>
                                </div>
                                <h2 className="text-sm font-medium leading-normal opacity-90 max-w-sm">"Financial freedom is available to those who learn about it and work for it."</h2>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="p-1.5 bg-white/20 rounded-lg"><Wallet className="w-4 h-4" /></div>
                                <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] text-teal-100 mb-0.5">Total Balance</div>
                                <div className="text-lg font-bold">₹{stats.balance.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Charts + Magic Import */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                        {/* Spending Analysis Chart */}
                        <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-2 shrink-0">
                                <h3 className="text-sm font-bold">Spending Analysis</h3>
                                <div className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+12% vs last week</div>
                            </div>
                            <div className="flex-1 w-full min-h-0 relative">
                                <div className="absolute inset-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorAmtDesktop" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorAmtDesktop)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Side Column: Income/Exp + Magic Import */}
                        <div className="flex flex-col gap-4 min-h-0">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3 shrink-0">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="text-[10px] text-slate-500 mb-1">Income</div>
                                    <div className="text-sm font-bold">₹{(45000).toLocaleString()}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="text-[10px] text-slate-500 mb-1">Expense</div>
                                    <div className="text-sm font-bold">₹{(20500).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Magic Import Card */}
                            <div className="flex-1 bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-2xl text-white relative overflow-hidden flex flex-col justify-center gap-2 min-h-[140px]">
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-y-8 translate-x-8"></div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white/20 rounded-lg"><Sparkles className="w-4 h-4" /></div>
                                    <div className="font-bold text-sm">Magic Import</div>
                                </div>
                                <p className="text-[10px] text-emerald-100 opacity-90 leading-tight">Paste transaction SMS to auto-track expenses instantly.</p>
                                <div className="mt-2 w-full py-1.5 bg-white/20 rounded-lg text-center text-[10px] font-bold cursor-pointer hover:bg-white/30 transition-colors">Try it now</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- VISUAL HOOKS ---

// Hook to track mouse position for hover effects
const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return mousePosition;
};

// Hook for scroll animations (Reversible or One-time)
const useScrollReveal = (threshold = 0.1, once = false) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) { // Only hide if not one-time
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold, once]);

    return { ref, isVisible };
};

// Hook for Text Scramble Effect
const useScramble = (text: string, speed = 30) => {
    const [displayedText, setDisplayedText] = useState(text);
    const [isScrambling, setIsScrambling] = useState(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    const scramble = () => {
        if (isScrambling) return;
        setIsScrambling(true);
        let iteration = 0;

        const interval = setInterval(() => {
            setDisplayedText(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
                setIsScrambling(false);
            }

            iteration += 1 / 2; // Speed control
        }, speed);
    };

    return { displayedText, scramble };
};

// Scramble Text Component
const ScrambleText = ({ text, className = "" }: { text: string, className?: string }) => {
    const { displayedText, scramble } = useScramble(text);

    return (
        <span
            onMouseEnter={scramble}
            onClick={scramble}
            className={`cursor-pointer inline-block hover:text-emerald-400 transition-colors ${className}`}
        >
            {displayedText}
        </span>
    );
};

// Hook for Parallax
const useParallax = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.scrollY * speed);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};



// Spotlight Effect Card
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(16, 185, 129, 0.15)" }: any) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(1);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
};

// 3D Tilt Wrapper
const NeuralTilt = ({ children, className = "" }: any) => {
    const [transform, setTransform] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHovered) return;

        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    };

    return (
        <div
            className={`transition-transform duration-200 ease-out ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform }}
        >
            {children}
        </div>
    );
};

// --- SUB-COMPONENTS ---

// Custom Cursor
const CustomCursor = () => {
    const { x, y } = useMousePosition();
    return (
        <div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100] hidden md:block" // Hidden on mobile
            style={{
                transform: `translate(${x - 16}px, ${y - 16}px)`,
            }}
        >
            <div className="w-full h-full rounded-full border-2 border-emerald-500 bg-emerald-500/20 backdrop-blur-sm transition-transform duration-150 ease-out animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full"></div>
        </div>
    );
};

// Particle Background (Interactive Mesh)
const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMouse({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Particle definitions
        let particles: {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            currentSpeed: number; // For smooth interpolation
        }[] = [];
        let animationFrameId: number;

        const resize = () => {
            if (containerRef.current && canvas) {
                canvas.width = containerRef.current.offsetWidth;
                canvas.height = containerRef.current.offsetHeight;
                initParticles();
            }
        };

        const initParticles = () => {
            particles = [];
            const particleCount = window.innerWidth < 768 ? 40 : 80;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: Math.random() * 0.2 + 0.05, // Positive X (Right)
                    vy: Math.random() * -0.2 - 0.05, // Negative Y (Up)
                    size: Math.random() * 2 + 1,
                    currentSpeed: 1, // Start at full speed
                });
            }
        };

        const drawLines = () => {
            const maxDist = 150;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(20, 184, 166, ${0.15 * (1 - dist / maxDist)})`; // Teal lines
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw lines first
            drawLines();

            particles.forEach((p) => {
                // 1. Calculate Target Speed based on Mouse Proximity
                let targetSpeed = 1;

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const interactionRadius = 250; // Larger radius for smoother feel

                    if (dist < interactionRadius) {
                        // "Time Freeze": Closer = Slower
                        // Smooth gentle curve: 0.1 at center, 1.0 at edge
                        targetSpeed = 0.1 + (dist / interactionRadius) * 0.9;
                    }
                }

                // 2. Smoothly Interpolate (Lerp) Current Speed to Target Speed
                // Factor 0.05 means it takes time to slow down/speed up (Inertia)
                p.currentSpeed += (targetSpeed - p.currentSpeed) * 0.05;

                // 3. Move with interpolated speed
                p.x += p.vx * p.currentSpeed;
                p.y += p.vy * p.currentSpeed;

                // Wrap around edges
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // Emerald
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mouse]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};


// Animated Progress Line
// Animated Progress Line
const ProgressLine = ({ isVisible }: { isVisible: boolean }) => {
    return (
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 dark:bg-slate-800 z-0 overflow-hidden rounded-full">
            <div className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-[3s] ease-out ${isVisible ? 'w-full' : 'w-0'}`}></div>
        </div>
    );
};

// Magnetic Button Wrapper
const MagneticWrapper = ({ children, className = "", strength = 30 }: any) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const deltaX = (clientX - centerX);
        const deltaY = (clientY - centerY);

        // Limit the movement
        const moveX = (deltaX / width) * strength;
        const moveY = (deltaY / height) * strength;

        setPosition({ x: moveX, y: moveY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
            className={`transition-transform duration-200 ease-out will-change-transform inline-block ${className}`}
        >
            {children}
        </div>
    );
};

// Spotlight Button with magnetic feel
const SpotlightButton = ({ children, onClick, className = "", to }: any) => {
    const buttonRef = useRef<HTMLElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    const Content = (
        <>
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.3), transparent 60%)`,
                }}
            />
            <div className="relative flex items-center gap-2 z-10">
                {children}
            </div>
        </>
    );

    const classes = `relative overflow-hidden rounded-xl px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center ${className}`;

    if (to) {
        return (
            <Link
                to={to}
                className={classes}
                ref={buttonRef as any}
                onMouseMove={handleMouseMove as any}
                onMouseLeave={handleMouseLeave}
            >
                {Content}
            </Link>
        );
    }

    return (
        <button
            ref={buttonRef as any}
            onClick={onClick}
            onMouseMove={handleMouseMove as any}
            onMouseLeave={handleMouseLeave}
            className={classes}
        >
            {Content}
        </button>
    );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
        const rotateY = ((x - centerX) / centerX) * 5;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
        >
            {children}
        </div>
    );
};

// Scroll Reveal Wrapper
// Scroll Reveal Wrapper
const ScrollReveal = ({ children, className = "", delay = 0, yOffset = "translate-y-12" }: any) => {
    const { ref, isVisible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : `${yOffset} opacity-0`} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};



// Analytics Chart Component
// Analytics Widget Component
const AnalyticsWidget = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-5 z-20 ${className}`}>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">₹24,500</div>
                </div>
                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12% vs last month</div>
            </div>

            {/* Mock Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-24">
                {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                    <div key={i} className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative group/bar overflow-hidden">
                        <div
                            className="absolute bottom-0 inset-x-0 bg-emerald-500 rounded-t-lg transition-all duration-1000 ease-out group-hover:bg-emerald-400"
                            style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
        </div>
    );
};

// Bento Grid Item
const BentoItem = ({ icon: Icon, title, desc, className, delay, children }: any) => {
    const { ref, isVisible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-500 ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <SpotlightCard className="h-full p-8 group hover:border-emerald-500/30 transition-colors">
                {children}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Icon size={120} />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="md:max-w-[60%]">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
};

// Smart Nexus Visualization Component ("Connectivity & Central Nervous System")
const SmartNexus = () => {
    return (
        <div className="relative w-full max-w-[500px] h-[500px] mx-auto flex items-center justify-center select-none pointer-events-none">

            {/* Connection Lines (The Nervous System) */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <defs>
                    <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
                        <stop offset="50%" stopColor="rgba(16, 185, 129, 1)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                    </linearGradient>
                </defs>

                {/* Line to Top Left (Home) */}
                <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill="#10b981" className="animate-[trace_3s_linear_infinite]">
                    <animateMotion path="M 250 250 L 100 100" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Line to Top Right (Travel) */}
                <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill="#10b981" className="animate-[trace_4s_linear_infinite]">
                    <animateMotion path="M 250 250 L 400 100" dur="4s" repeatCount="indefinite" />
                </circle>

                {/* Line to Bottom Left (Shopping) */}
                <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill="#10b981" className="animate-[trace_3.5s_linear_infinite]">
                    <animateMotion path="M 250 250 L 100 400" dur="3.5s" repeatCount="indefinite" />
                </circle>

                {/* Line to Bottom Right (Food) */}
                <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill="#10b981" className="animate-[trace_2.5s_linear_infinite]">
                    <animateMotion path="M 250 250 L 400 400" dur="2.5s" repeatCount="indefinite" />
                </circle>
            </svg>

            {/* Central Hub (The Brain/Core) */}
            <div className="relative z-20">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-pulse-slow relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
                    {/* Rotating Ring around Core */}
                    <div className="absolute inset-[-10px] border border-emerald-400/30 rounded-full animate-[spin_10s_linear_infinite] border-t-transparent border-l-transparent"></div>
                    <Network size={40} className="text-white relative z-10" />
                </div>
            </div>

            {/* Satellite Nodes (Life Areas) */}
            {/* Node 1: Home */}
            <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative group">
                    <div className="absolute -top-8 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Home & Bills</div>
                    <Home size={24} className="text-teal-500" />
                </div>
            </div>

            {/* Node 2: Travel */}
            <div className="absolute top-[20%] right-[20%] translate-x-1/2 -translate-y-1/2 z-10 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative group">
                    <div className="absolute -top-8 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Travel Goals</div>
                    <Plane size={24} className="text-sky-500" />
                </div>
            </div>

            {/* Node 3: Shopping */}
            <div className="absolute bottom-[20%] left-[20%] -translate-x-1/2 translate-y-1/2 z-10 animate-[float_6s_ease-in-out_infinite_500ms]">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative group">
                    <div className="absolute -bottom-8 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Smart Spending</div>
                    <ShoppingBag size={24} className="text-rose-500" />
                </div>
            </div>

            {/* Node 4: Food */}
            <div className="absolute bottom-[20%] right-[20%] translate-x-1/2 translate-y-1/2 z-10 animate-[float_4.5s_ease-in-out_infinite_1.5s]">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative group">
                    <div className="absolute -bottom-8 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dining Out</div>
                    <Utensils size={24} className="text-amber-500" />
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        </div>
    );
};

// --- MAIN PAGE ---

// Helper Components for Synchronized Animation
const SectionTriggerContext = React.createContext(false);

const SectionTriggerWrapper = ({ children }: { children: React.ReactNode }) => {
    const { ref, isVisible } = useScrollReveal(0.1, false); // Trigger up/down scrolling
    return (
        <SectionTriggerContext.Provider value={isVisible}>
            <div ref={ref} className="relative">
                {children}
            </div>
        </SectionTriggerContext.Provider>
    );
};

const ProgressLineWrapper = () => {
    const isVisible = React.useContext(SectionTriggerContext);
    return <ProgressLine isVisible={isVisible} />;
};

const StepItem = ({ step, index }: { step: any, index: number }) => {
    const isVisible = React.useContext(SectionTriggerContext);
    return (
        <ScrollReveal
            manualVisible={isVisible}
            delay={index * 1000}
            yOffset="translate-y-24"
            className="relative z-10"
        >
            <div className="text-center group">
                <div className="w-10 h-10 md:w-24 md:h-24 mx-auto bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-2 md:mb-6 relative group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse-slow"></div>
                    <step.icon className="w-4 h-4 md:w-10 md:h-10 text-emerald-500" />
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[8px] md:text-sm border-2 md:border-4 border-white dark:border-slate-800">
                        {index + 1}
                    </div>
                </div>
                <h3 className="text-xs md:text-xl font-bold mb-1 md:mb-3">{step.title}</h3>
                <p className="text-[8px] md:text-base text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-tight">{step.desc}</p>
            </div>
        </ScrollReveal>
    );
};

// --- MAIN PAGE ---

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeWord, setActiveWord] = useState(0);
    const words = ["Finances", "Future", "Savings", "Freedom"];

    // Typing effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveWord((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Parallax Offsets
    const parallaxSlow = useParallax(0.2);
    const parallaxFast = useParallax(0.5);
    const parallaxReverse = useParallax(-0.3);

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 cursor-none">
            <CustomCursor />

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBackground />
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 inset-0 absolute"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 backdrop-blur-md bg-white/50 dark:bg-[#050505]/50 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-2 md:px-6 h-14 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Wallet className="text-white w-4 h-4 md:w-6 md:h-6 animate-pulse-slow" />
                        </div>
                        <span className="font-display font-bold text-sm md:text-xl tracking-tight">CashBuddy</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {isAuthenticated ? (
                            <SpotlightButton to="/dashboard" className="!px-3 !py-1.5 !text-xs md:!px-4 md:!py-2 md:!text-base">
                                <span>Dashboard</span>
                                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                            </SpotlightButton>
                        ) : (
                            <>
                                <Link to="/login" className="font-medium text-xs md:text-base hover:text-emerald-500 transition-colors">Log in</Link>
                                <SpotlightButton to="/register" className="!px-3 !py-1.5 !text-xs md:!px-4 md:!py-2 md:!text-base">
                                    <span>Get Started</span>
                                </SpotlightButton>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 z-10">
                {/* Floating Icons Background with Parallax */}
                <div
                    className="absolute top-32 left-10 opacity-20 hidden lg:block"
                    style={{ transform: `translateY(${parallaxSlow}px)` }}
                >
                    <Coins size={64} className="text-emerald-400" />
                </div>
                <div
                    className="absolute bottom-40 right-10 opacity-20 hidden lg:block"
                    style={{ transform: `translateY(${parallaxReverse}px)` }}
                >
                    <PieChartIcon size={80} className="text-emerald-400" />
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <ScrollReveal delay={100}>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] tracking-tight mb-8">
                                <ScrambleText text="AI managing" /> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-shimmer bg-[length:200%_auto] relative">
                                    your money
                                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></span>
                                </span> <br />
                                smarter.
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
                                Stop tracking manually. Let CashBuddy's AI handle your budgeting, expense tracking, and savings goals automatically.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={300}>
                            <div className="flex flex-wrap gap-4">
                                <MagneticWrapper>
                                    <SpotlightButton to={isAuthenticated ? "/dashboard" : "/register"} className="!py-4 !px-8 text-lg">
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </SpotlightButton>
                                </MagneticWrapper>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Smart Nexus Visualization */}
                    <div className="relative w-full flex justify-center lg:justify-end">
                        <ScrollReveal delay={200} className="w-full">
                            <NeuralTilt>
                                <SmartNexus />
                            </NeuralTilt>

                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-10 md:py-24 bg-white dark:bg-[#0A0A0A] relative z-20">
                <div className="max-w-7xl mx-auto px-2 md:px-6">
                    <ScrollReveal>
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-xl md:text-5xl font-display font-bold mb-2 md:mb-6">
                                Managing money shouldn't be <span className="text-rose-500">hard work</span>.
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xs md:text-lg">
                                Most people struggle because traditional methods are broken. Spreadsheets are tedious, and banking apps are cluttered.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-3 gap-2 md:gap-8">
                        <ScrollReveal delay={0}>
                            <SpotlightCard className="p-2 md:p-8 h-full group" spotlightColor="rgba(244, 63, 94, 0.15)">
                                <div className="w-8 h-8 md:w-12 md:h-12 bg-rose-100 dark:bg-rose-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6 text-rose-500 group-hover:scale-110 transition-transform">
                                    <TrendingDown className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-xs md:text-xl font-bold mb-1 md:mb-3">Overspending</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-tight">Easy to lose track and blow budget.</p>
                            </SpotlightCard>
                        </ScrollReveal>

                        <ScrollReveal delay={100}>
                            <SpotlightCard className="p-2 md:p-8 h-full group" spotlightColor="rgba(245, 158, 11, 0.15)">
                                <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-xs md:text-xl font-bold mb-1 md:mb-3">Stagnant Savings</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-tight">Good intentions don't grow wealth.</p>
                            </SpotlightCard>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <SpotlightCard className="p-2 md:p-8 h-full group" spotlightColor="rgba(59, 130, 246, 0.15)">
                                <div className="w-8 h-8 md:w-12 md:h-12 bg-teal-100 dark:bg-teal-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6 text-teal-500 group-hover:scale-110 transition-transform">
                                    <FileText className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-xs md:text-xl font-bold mb-1 md:mb-3">Spreadsheets</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-tight">Manual data entry is boring & error-prone.</p>
                            </SpotlightCard>
                        </ScrollReveal>
                    </div>
                </div>

            </section>

            {/* Features Section - Redesigned */}
            {/* Features Section - Redesigned */}
            <section id="features" className="py-10 md:py-32 px-2 md:px-6 relative z-10 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 md:mb-20">
                        <ScrollReveal>
                            <h2 className="text-2xl md:text-5xl font-display font-bold mb-2 md:mb-6">Everything you need.</h2>
                        </ScrollReveal>
                        <ScrollReveal delay={100}>
                            <p className="text-xs md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                Powerful auditing tools to help you keep track of your financial life.
                            </p>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-8">
                        {/* Feature 1 */}
                        <ScrollReveal delay={0}>
                            <div className="h-full p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden">
                                <div className="w-8 h-8 md:w-14 md:h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-4 h-4 md:w-7 md:h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4">Smart Tracking</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4 md:mb-8">
                                    Visualize your spending patterns with beautiful charts.
                                </p>
                                <div className="h-32 md:h-auto overflow-hidden">
                                    <div className="relative rounded-lg md:rounded-2xl bg-slate-50 dark:bg-black/50 p-2 md:p-4 border border-slate-100 dark:border-slate-800 overflow-hidden w-[250%] md:w-full transform scale-[0.4] md:scale-100 origin-top-left">
                                        <div className="absolute inset-0 bg-emerald-500/5"></div>
                                        <AnalyticsWidget className="!shadow-none !border-none !bg-transparent" />
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 2 */}
                        <ScrollReveal delay={100}>
                            <div className="h-full p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 group overflow-hidden">
                                <div className="w-8 h-8 md:w-14 md:h-14 bg-teal-100 dark:bg-teal-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform">
                                    <Users className="w-4 h-4 md:w-7 md:h-7 text-teal-600 dark:text-teal-400" />
                                </div>
                                <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4">Friend Ledger</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4 md:mb-8">
                                    Split bills instantly. Keep track of who owes what without the awkward conversations.
                                </p>
                                <div className="h-28 md:h-auto overflow-hidden">
                                    <div className="mt-4 md:mt-8 space-y-2 md:space-y-3 w-[200%] md:w-full transform scale-[0.5] md:scale-100 origin-top-left">
                                        {/* Transaction 1: You Lent */}
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Pizza Night</div>
                                                    <div className="text-[10px] text-slate-400">Paid for John</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-emerald-600 font-bold text-sm md:text-base">₹450</div>
                                                <div className="text-[9px] text-slate-400 uppercase">You Lent</div>
                                            </div>
                                        </div>

                                        {/* Transaction 2: You Borrowed */}
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                    <ArrowDownLeft className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Movie Tickets</div>
                                                    <div className="text-[10px] text-slate-400">Borrowed from Alice</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-red-600 font-bold text-sm md:text-base">₹800</div>
                                                <div className="text-[9px] text-slate-400 uppercase">You Owe</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 3 */}
                        <ScrollReveal delay={200}>
                            <div className="h-full p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="w-8 h-8 md:w-14 md:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform">
                                    <Zap className="w-4 h-4 md:w-7 md:h-7 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4">Smart Budgeting</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Set smart limits. We'll nudge you gently if you're getting close to your limit.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Feature 4 */}
                        <ScrollReveal delay={300}>
                            <div className="h-full p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group">
                                <div className="w-8 h-8 md:w-14 md:h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform">
                                    <Target className="w-4 h-4 md:w-7 md:h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4">Goal Tracking</h3>
                                <p className="text-[9px] md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Create unlimited savings pots and watch them grow.
                                </p>
                                <div className="mt-4 md:mt-8">
                                    <div className="flex justify-between text-[9px] md:text-sm font-bold mb-1 md:mb-2">
                                        <span>MacBook</span>
                                        <span className="text-emerald-500">75%</span>
                                    </div>
                                    <div className="h-2 md:h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[75%] bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-10 md:py-32 bg-slate-50 dark:bg-slate-900/50 relative z-10" >
                <div className="max-w-7xl mx-auto px-2 md:px-6">
                    <div className="text-center mb-8 md:mb-16">
                        <ScrollReveal>
                            <h2 className="text-2xl md:text-5xl font-display font-bold mb-2 md:mb-6">How it works.</h2>
                            <p className="text-xs md:text-lg text-slate-500 dark:text-slate-400">No bank linking required. Just use our Magic Import.</p>
                        </ScrollReveal>
                    </div>

                    <SectionTriggerWrapper>
                        <div className="grid grid-cols-3 gap-2 md:gap-12 relative">
                            {/* Connector Line (Desktop) */}
                            <ProgressLineWrapper />

                            {[
                                { icon: MessageSquare, title: 'Copy', desc: 'Received a transaction SMS? Copy it.' },
                                { icon: Sparkles, title: 'Paste', desc: 'Paste into Magic Import.' },
                                { icon: CheckCircle2, title: 'Tracked', desc: 'AI extracts amount & category. Done!' }
                            ].map((step, i) => (
                                <StepItem key={i} step={step} index={i} />
                            ))}
                        </div>
                    </SectionTriggerWrapper>
                </div>
            </section >


            {/* CTA Section */}
            < section className="py-16 md:py-32 px-6 relative overflow-hidden" >
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <ScrollReveal>
                        <h2 className="text-2xl md:text-7xl font-display font-bold mb-4 md:mb-8">
                            Ready to upgrade <br /> your lifestyle?
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={100}>
                        <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 mb-6 md:mb-12">
                            Join thousands of others taking control today.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={200}>
                        <MagneticWrapper>
                            <SpotlightButton to="/register" className="!text-sm !px-6 !py-3 md:!text-xl md:!px-12 md:!py-5 bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40">
                                Get Started Now
                            </SpotlightButton>
                        </MagneticWrapper>
                    </ScrollReveal>
                </div>

            </section >


        </div >
    );
};

export default LandingPage;
