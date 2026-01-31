import React, { useState, useEffect } from 'react';

/**
 * StartScreen - Fun, friendly farm-themed landing page
 * Shows before the main game loads
 */
const StartScreen = ({ onStartGame, hasSaveData }) => {
    const [animatedEmoji, setAnimatedEmoji] = useState(0);
    const [cloudOffset, setCloudOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Floating farm animals
    const farmAnimals = ['🐄', '🐔', '🐷', '🐑', '🐴', '🦆'];

    // Animate emoji cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedEmoji(prev => (prev + 1) % farmAnimals.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Cloud animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCloudOffset(prev => (prev + 0.5) % 200);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleStart = (newGame = false) => {
        setIsLoading(true);
        setTimeout(() => {
            onStartGame(newGame);
        }, 500);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
            {/* Sky gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200" />

            {/* Sun */}
            <div className="absolute top-8 right-12 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg animate-pulse" style={{ boxShadow: '0 0 60px rgba(255, 200, 0, 0.6)' }} />

            {/* Clouds */}
            <div className="absolute top-16 left-0 right-0 flex justify-around pointer-events-none" style={{ transform: `translateX(${cloudOffset - 100}px)` }}>
                <span className="text-6xl opacity-90 animate-float-slow">☁️</span>
                <span className="text-5xl opacity-80 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
                <span className="text-7xl opacity-85 animate-float-slow" style={{ animationDelay: '0.5s' }}>☁️</span>
                <span className="text-4xl opacity-75 animate-float" style={{ animationDelay: '1.5s' }}>☁️</span>
                <span className="text-6xl opacity-90 animate-float-slow" style={{ animationDelay: '0.3s' }}>☁️</span>
            </div>

            {/* Rolling hills background */}
            <div className="absolute bottom-0 left-0 right-0 h-48">
                <div className="absolute bottom-12 left-0 right-0 h-40 bg-gradient-to-t from-green-500 to-green-400 rounded-t-[100%]" style={{ transform: 'scaleX(1.5)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-green-600 to-green-500 rounded-t-[80%]" style={{ transform: 'scaleX(1.3) translateX(-20px)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-green-700 to-green-600" />
            </div>

            {/* Animated farm animals on the field */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-around px-12 pointer-events-none">
                {farmAnimals.map((animal, i) => (
                    <span
                        key={i}
                        className={`text-4xl transition-all duration-500 ${i === animatedEmoji ? 'scale-125 -translate-y-2' : 'scale-100'}`}
                        style={{
                            animationDelay: `${i * 0.3}s`,
                            filter: i === animatedEmoji ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                        }}
                    >
                        {animal}
                    </span>
                ))}
            </div>

            {/* Barn */}
            <div className="absolute bottom-36 left-1/4 text-6xl pointer-events-none drop-shadow-lg">
                🏠
            </div>

            {/* Tree */}
            <div className="absolute bottom-36 right-1/4 text-5xl pointer-events-none drop-shadow-lg">
                🌳
            </div>

            {/* Main content card */}
            <div className="relative z-10 flex flex-col items-center bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-amber-400 max-w-md mx-4">

                {/* Logo area */}
                <div className="relative mb-4">
                    <div className="text-6xl mb-2 animate-bounce-slow">🌾</div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        FarmSim
                    </h1>
                    <p className="text-amber-700 font-medium text-center mt-1">
                        🌱 Grow • 🏡 Build • 🐄 Thrive 🌻
                    </p>
                </div>

                {/* Decorative wheat */}
                <div className="flex gap-2 mb-6 text-2xl">
                    <span className="animate-sway">🌾</span>
                    <span className="animate-sway" style={{ animationDelay: '0.2s' }}>🌾</span>
                    <span className="animate-sway" style={{ animationDelay: '0.4s' }}>🌾</span>
                    <span className="animate-sway" style={{ animationDelay: '0.6s' }}>🌾</span>
                    <span className="animate-sway" style={{ animationDelay: '0.8s' }}>🌾</span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 w-full">
                    {hasSaveData && (
                        <button
                            onClick={() => handleStart(false)}
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">🌻</span> Loading...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    🚜 Continue Farm
                                </span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => handleStart(true)}
                        disabled={isLoading}
                        className={`w-full py-4 px-6 font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${hasSaveData
                                ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-900'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            }`}
                    >
                        {isLoading && !hasSaveData ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">🌱</span> Planting Seeds...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                🌱 {hasSaveData ? 'New Farm' : 'Start Farming!'}
                            </span>
                        )}
                    </button>
                </div>

                {/* Fun tips */}
                <div className="mt-6 text-center text-sm text-amber-700/80">
                    <p className="animate-pulse">🌟 Tip: Plant crops, raise animals, and build your dream farm!</p>
                </div>
            </div>

            {/* Footer decorative crops */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 text-3xl pointer-events-none">
                <span className="animate-grow-pop" style={{ animationDelay: '0s' }}>🥕</span>
                <span className="animate-grow-pop" style={{ animationDelay: '0.3s' }}>🌽</span>
                <span className="animate-grow-pop" style={{ animationDelay: '0.6s' }}>🍅</span>
                <span className="animate-grow-pop" style={{ animationDelay: '0.9s' }}>🥬</span>
                <span className="animate-grow-pop" style={{ animationDelay: '1.2s' }}>🍆</span>
            </div>

            {/* CSS animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes grow-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-sway { animation: sway 2s ease-in-out infinite; }
        .animate-grow-pop { animation: grow-pop 0.6s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default StartScreen;
