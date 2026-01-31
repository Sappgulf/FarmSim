import React, { useState, useEffect, useRef } from 'react';

/**
 * StartScreen - AAA Polished Farm Landing Page
 * Features parallax background, atmospheric effects, and premium glassmorphism UI
 */
const StartScreen = ({ onStartGame, hasSaveData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Handle parallax mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 20; // 20px max movement
            const y = (e.clientY / innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleStart = (newGame = false) => {
        setIsLoading(true);
        // Add a slight delay for the transition animation
        setTimeout(() => {
            onStartGame(newGame);
        }, 800);
    };

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundColor: '#1a202c' }}
        >
            {/* --- BACKGROUND LAYERS (PARALLAX) --- */}

            {/* Main Farm Background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out scale-110"
                style={{
                    backgroundImage: 'url("/farm_bg.png")',
                    transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) scale(1.1)`,
                }}
            />

            {/* Atmospheric Overlay: Warm Sunset Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-purple-900/20 pointer-events-none" />

            {/* --- ATMOSPHERIC EFFECTS --- */}

            {/* God Rays (Sun Rays) */}
            <div className="absolute top-0 right-0 w-[800px] h-[600px] pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute top-[-100px] right-[-100px] w-[100px] h-[1000px] bg-gradient-to-b from-yellow-200/40 to-transparent rotate-[45deg] blur-2xl animate-beam"
                        style={{
                            left: `${i * 150}px`,
                            animationDelay: `${i * 1.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Floating Particles (Pollen/Dust) */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-100 rounded-full animate-float-particle mix-blend-screen"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                            animationDuration: `${Math.random() * 10 + 10}s`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* --- UI CONTENT --- */}

            {/* Main Menu Container */}
            <div
                className="relative z-20 flex flex-col items-center animate-fade-in-up"
                style={{
                    transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`,
                }}
            >
                {/* Title / Logo Area */}
                <div className="mb-10 text-center">
                    <div className="inline-block relative">
                        <h1 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] select-none">
                            Farm<span className="text-amber-400">Sim</span>
                        </h1>
                        <div className="absolute -top-6 -right-8 text-5xl animate-bounce-slow">🥕</div>
                    </div>
                    <p className="text-xl font-medium text-white/90 tracking-[0.2em] uppercase mt-2 drop-shadow-md">
                        The Ultimate Agricultural Odyssey
                    </p>
                </div>

                {/* Action Buttons: Premium Glassmorphism */}
                <div className="w-[380px] space-y-4 p-8 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

                    {hasSaveData && (
                        <button
                            onClick={() => handleStart(false)}
                            disabled={isLoading}
                            className="group relative w-full py-5 px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xl rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_30px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                <span className="text-2xl group-hover:rotate-12 transition-transform">🚜</span>
                                <span>{isLoading ? 'Loading Farm...' : 'CONTINUE FARM'}</span>
                            </div>
                            {/* Shine effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                        </button>
                    )}

                    <button
                        onClick={() => handleStart(true)}
                        disabled={isLoading}
                        className={`group relative w-full py-5 px-8 font-black text-xl rounded-2xl transform transition-all duration-300 hover:-translate-y-1 active:scale-95 disabled:opacity-50 overflow-hidden ${hasSaveData
                                ? 'bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 shadow-lg'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_30px_rgba(245,158,11,0.4)]'
                            }`}
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            <span className="text-2xl group-hover:scale-125 transition-transform">🌱</span>
                            <span>{hasSaveData ? 'START NEW FARM' : 'BEGIN YOUR HARVEST'}</span>
                        </div>
                        {/* Shine effect */}
                        {!hasSaveData && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />}
                    </button>

                    {!hasSaveData && (
                        <div className="pt-4 text-center">
                            <p className="text-white/60 text-sm font-medium animate-pulse">
                                ✨ Join over 1,000,000 virtual farmers
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer: Social / Version */}
                <div className="mt-12 flex gap-8">
                    <div className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm font-bold tracking-widest uppercase">
                        <span>v2.5.0 Gold Edition</span>
                    </div>
                </div>
            </div>

            {/* Transitions / Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes beam {
          0% { opacity: 0; transform: translateX(-50px) rotate(45deg); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(50px) rotate(45deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(-10px, -40px); }
          75% { transform: translate(-30px, -20px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-15px) rotate(15deg); }
        }
        .animate-beam { animation: beam 6s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-shine { animation: shine 0.8s ease-in-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}} />
        </div>
    );
};

export default StartScreen;
