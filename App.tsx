import React, { useState, useEffect } from 'react';
import { GameStep, Team, Category } from './src/types';
import { Button } from './src/components/Button';
import { SetupFlow } from './src/components/SetupFlow';
import { GameFlow } from './src/components/GameFlow';
import { AdminPanel } from './src/components/AdminPanel';

const App: React.FC = () => {
  const [gameStep, setGameStep] = useState<GameStep>(GameStep.HOME);
  
  // Game State
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [actorsPerTurn, setActorsPerTurn] = useState(1);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mimica_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mimica_dark_mode', darkMode.toString());
  }, [darkMode]);

  // --- Handlers ---

  const handleStartSetup = () => setGameStep(GameStep.SELECT_CATEGORY); // Start with Setup Flow
  
  const handleAdmin = () => setGameStep(GameStep.ADMIN);

  const handleSetupComplete = (setupTeams: Team[], count: number, category: Category) => {
    setTeams(setupTeams);
    setActorsPerTurn(count);
    setActiveCategory(category);
    setGameStep(GameStep.GAME_LOOP);
  };

  const handleEndGame = (finalTeams: Team[]) => {
    setTeams(finalTeams);
    setGameStep(GameStep.RESULTS);
  };

  const handleRestartSamePlayers = () => {
    // Reset scores
    const resetTeams = teams.map(t => ({ ...t, score: 0 }));
    setTeams(resetTeams);
    setGameStep(GameStep.GAME_LOOP);
  };

  const handleGoHome = () => {
    setTeams([]);
    setActiveCategory(null);
    setGameStep(GameStep.HOME);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-12 text-center p-6">
      <div className="animate-float">
        <h1 className="text-6xl md:text-7xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 drop-shadow-sm tracking-wide leading-tight">
          Mímica<br/>Master
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">¡Actúa, adivina y gana!</p>
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <Button fullWidth onClick={handleStartSetup} className="text-xl py-4 shadow-xl hover:-translate-y-1 transition-transform">
            ▶ Jugar
        </Button>
        <Button fullWidth variant="outline" onClick={handleAdmin}>
            🛠️ Admin
        </Button>
      </div>
      
      <div className="absolute bottom-4 text-xs text-gray-400 opacity-60">
        Offline Ready • v1.2
      </div>
    </div>
  );

  const renderResults = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const maxScore = sortedTeams[0].score;
    const winners = sortedTeams.filter(t => t.score === maxScore);
    const isTie = winners.length > 1;

    return (
      <div className="flex flex-col h-full pt-8 text-center">
        <h2 className="text-4xl font-heading font-bold mb-6 text-dark dark:text-white">Resultados Finales</h2>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-indigo-50 dark:border-gray-700 mb-8 mx-4 transform hover:scale-105 transition-transform duration-300">
            {isTie ? (
                <div>
                    <span className="text-6xl block mb-2">🤝</span>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 font-heading">¡Empate!</h3>
                    <p className="text-primary font-bold text-lg mt-2">{winners.map(w => w.name).join(' y ')}</p>
                </div>
            ) : (
                <div className="animate-pulse">
                    <span className="text-7xl block mb-4">🏆</span>
                    <h3 className="text-xl text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold text-xs">Ganador</h3>
                    <h2 className="text-4xl font-heading font-black text-primary mt-2">{winners[0].name}</h2>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 mb-4 custom-scrollbar">
            {sortedTeams.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center py-4 border-b dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-4">
                        <span className={`font-heading font-bold w-8 h-8 flex items-center justify-center rounded-full ${i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                          #{i+1}
                        </span>
                        <span className="font-bold text-xl text-gray-700 dark:text-gray-200">{t.name}</span>
                    </div>
                    <span className="font-heading font-black text-3xl text-primary">{t.score}</span>
                </div>
            ))}
        </div>

        <div className="space-y-3 pb-8 px-6">
            <Button fullWidth onClick={handleRestartSamePlayers}>🔄 Revancha</Button>
            <Button fullWidth variant="outline" onClick={handleGoHome}>🏠 Inicio</Button>
        </div>
      </div>
    );
  };

  return (
    // Responsive Layout Container
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center md:p-8 transition-colors duration-300">
      
      {/* App Frame (Mobile: Full Screen / Desktop: Card) */}
      <main className="w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:aspect-[9/16] md:max-w-[450px] bg-white dark:bg-gray-900 md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-black/5 dark:ring-white/10 transition-colors duration-300">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
          title={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
        >
          {darkMode ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-5 relative h-full flex flex-col">
            {gameStep === GameStep.HOME && renderHome()}
            
            {gameStep === GameStep.ADMIN && (
                <AdminPanel onBack={() => setGameStep(GameStep.HOME)} />
            )}
            
            {(gameStep === GameStep.SELECT_CATEGORY || 
              gameStep === GameStep.SETUP_PLAYERS || 
              gameStep === GameStep.SETUP_TEAMS || 
              gameStep === GameStep.SETUP_ACTORS) && (
                <SetupFlow 
                    onComplete={handleSetupComplete} 
                    onBack={handleGoHome}
                />
            )}

            {gameStep === GameStep.GAME_LOOP && activeCategory && (
                <GameFlow 
                    teams={teams} 
                    category={activeCategory} 
                    actorsPerTurn={actorsPerTurn}
                    onEndGame={handleEndGame}
                />
            )}

            {gameStep === GameStep.RESULTS && renderResults()}
        </div>
      </main>
    </div>
  );
};

export default App;