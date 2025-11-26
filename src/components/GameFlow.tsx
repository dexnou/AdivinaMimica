import React, { useState, useEffect, useRef } from 'react';
import { Team, Category, TurnPhase, Player } from '../types';
import { Button } from './Button';
import { TURN_DURATION_SECONDS } from '../constants';
import { getNextActors, getRandomCard } from '../services/gameService';

interface GameFlowProps {
  teams: Team[];
  category: Category;
  actorsPerTurn: number;
  onEndGame: (finalTeams: Team[]) => void;
}

export const GameFlow: React.FC<GameFlowProps> = ({ teams: initialTeams, category, actorsPerTurn, onEndGame }) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [phase, setPhase] = useState<TurnPhase>(TurnPhase.STANDBY);
  const [currentActors, setCurrentActors] = useState<Player[]>([]);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [usedCards, setUsedCards] = useState<string[]>([]);
  const [turnResult, setTurnResult] = useState<'SUCCESS' | 'FAIL' | null>(null);
  
  // Animation State
  const [animateScore, setAnimateScore] = useState(false);
  
  // End Game Modal State
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentTeam = teams[currentTeamIdx];
  const remainingCardsCount = category.cards.length - usedCards.length;

  // Setup actors on turn start
  useEffect(() => {
    if (phase === TurnPhase.STANDBY) {
      setCurrentActors(getNextActors(currentTeam, actorsPerTurn));
    }
  }, [currentTeamIdx, phase, currentTeam, actorsPerTurn]);

  // Score Animation Trigger
  useEffect(() => {
    if (phase === TurnPhase.SCORE_UPDATE && turnResult === 'SUCCESS') {
      // Reset animation state first
      setAnimateScore(false);
      // Small delay to ensure DOM is ready before triggering transition
      const timeout = setTimeout(() => {
        setAnimateScore(true);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setAnimateScore(false);
    }
  }, [phase, turnResult]);

  // Timer Logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const handleStartTurn = () => {
    const card = getRandomCard(category, usedCards);
    if (!card) {
      onEndGame(teams);
      return; 
    }
    setCurrentCard(card);
    setUsedCards(prev => [...prev, card]);
    setPhase(TurnPhase.CARD_REVEAL);
  };

  const handleGoToTimer = () => {
    setPhase(TurnPhase.TIMER);
    setTimeLeft(TURN_DURATION_SECONDS);
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const handleSuccess = () => {
    setTimerActive(false);
    // Update Score Logic
    const updatedTeams = [...teams];
    updatedTeams[currentTeamIdx].score += 1;
    setTeams(updatedTeams);
    setTurnResult('SUCCESS');
    setPhase(TurnPhase.SCORE_UPDATE);
  };

  const handleFail = () => {
    setTimerActive(false);
    setTurnResult('FAIL');
    setPhase(TurnPhase.SCORE_UPDATE);
  };

  const handleNextTurn = () => {
    const updatedTeams = [...teams];
    const teamJustPlayed = updatedTeams[currentTeamIdx];
    
    // Rotate actors
    teamJustPlayed.nextActorIndex = (teamJustPlayed.nextActorIndex + actorsPerTurn) % teamJustPlayed.players.length;
    setTeams(updatedTeams);

    // Reset Turn
    setPhase(TurnPhase.STANDBY);
    setCurrentCard(null);
    setTurnResult(null);
    setTimeLeft(TURN_DURATION_SECONDS);
    
    // Rotate Team
    setCurrentTeamIdx((prev) => (prev + 1) % teams.length);
  };

  const triggerEndGame = () => {
    onEndGame(teams);
  };

  // --- RENDERERS ---

  if (phase === TurnPhase.STANDBY) {
    const isDeckEmpty = remainingCardsCount === 0;

    return (
      <div className="flex flex-col h-full pt-2 relative">
        {showEndConfirm && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 rounded-3xl backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center space-y-4 border-4 border-white/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-heading font-bold text-dark dark:text-white">¿Finalizar Partida?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Se terminará el juego y verás los resultados.</p>
              <div className="flex gap-3 pt-4">
                <Button fullWidth variant="outline" onClick={() => setShowEndConfirm(false)}>Cancelar</Button>
                <Button fullWidth variant="danger" onClick={triggerEndGame}>Sí, Finalizar</Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 px-1 custom-scrollbar">
          {teams.map((t, idx) => (
            <div 
                key={t.id} 
                className={`flex-shrink-0 p-3 rounded-2xl border-2 transition-all duration-300 min-w-[100px] text-center ${idx === currentTeamIdx ? 'border-primary bg-indigo-50 dark:bg-indigo-900/30 shadow-md scale-105' : 'border-transparent bg-gray-50 dark:bg-gray-800 opacity-70'}`}
            >
              <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{t.name}</div>
              <div className="text-3xl font-heading font-black text-dark dark:text-white">{t.score}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
          {!isDeckEmpty && (
            <>
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Turno de</p>
                <h1 className="text-5xl font-heading font-black text-primary dark:text-indigo-400 break-words px-2 leading-tight drop-shadow-sm">{currentTeam.name}</h1>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-indigo-50 dark:border-gray-700 w-full max-w-xs mx-auto relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500"></div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-widest">Actúan</p>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {currentActors.map(p => p.name).join(' y ')}
                </div>
              </div>

              <div className="w-full px-8">
                  <Button onClick={handleStartTurn} className="text-xl py-5 shadow-xl hover:shadow-2xl transition-all w-full font-heading uppercase tracking-wide">
                    🃏 Sacar Carta
                  </Button>
                  <p className="text-xs text-gray-300 dark:text-gray-600 font-bold mt-4">Cartas restantes: {remainingCardsCount}</p>
              </div>
            </>
          )}

          {isDeckEmpty && (
             <div className="bg-indigo-50 dark:bg-gray-800 p-10 rounded-3xl border-4 border-indigo-100 dark:border-gray-700 max-w-sm mx-4 text-center">
                <span className="text-6xl block mb-4">🃏</span>
                <h3 className="text-3xl font-heading font-bold text-dark dark:text-white mt-2">¡Fin del mazo!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">No quedan más opciones en esta categoría.</p>
             </div>
          )}
        </div>

        <div className="py-4 space-y-2 px-4">
            {isDeckEmpty ? (
              <Button variant="primary" fullWidth onClick={triggerEndGame} className="py-5 text-xl font-heading shadow-xl">
                Ver Resultados Finales
              </Button>
            ) : (
              <Button variant="danger" fullWidth onClick={() => setShowEndConfirm(true)} className="opacity-80 hover:opacity-100 text-sm py-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:text-white shadow-none hover:shadow-lg border-transparent">
                Terminar Partida
              </Button>
            )}
        </div>
      </div>
    );
  }

  if (phase === TurnPhase.CARD_REVEAL) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-center space-y-8 animate-fade-in relative px-4">
        <div className="absolute top-4 font-bold text-gray-300 dark:text-gray-600 uppercase text-xs tracking-[0.2em]">{category.name}</div>
        
        <div className="w-full max-w-sm relative group">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 transform transition-all group-hover:scale-[1.02] duration-300">
                <p className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">Tu palabra es</p>
                <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(currentCard || '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-4xl md:text-5xl font-heading font-black text-dark dark:text-white leading-tight hover:text-primary dark:hover:text-indigo-400 transition-colors block break-words"
                    style={{textShadow: "2px 2px 0px rgba(0,0,0,0.05)"}}
                >
                    {currentCard}
                </a>
                <div className="mt-8 flex justify-center">
                   <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                     Toca para buscar
                   </span>
                </div>
            </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-6 py-3 rounded-xl font-bold text-sm animate-pulse border border-orange-100 dark:border-orange-900 shadow-sm">
            🤫 ¡Shh! Solo tú puedes ver esto
        </div>

        <div className="w-full max-w-xs mt-4">
            <Button onClick={handleGoToTimer} fullWidth className="py-5 text-xl font-heading shadow-xl bg-gradient-to-r from-primary to-indigo-600 border-none">
                ⏱️ Ir al Timer
            </Button>
        </div>
      </div>
    );
  }

  if (phase === TurnPhase.TIMER) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    const isCritical = timeLeft < 10;

    return (
      <div className="flex flex-col h-full pt-6 px-4">
         <div className="text-center mb-10">
             <span className="bg-white dark:bg-gray-800 border-2 border-indigo-50 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
                 Turno: {currentTeam.name}
             </span>
             {/* Actor Name Display - Improved visibility */}
             <div className="mt-6 bg-indigo-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-gray-700">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Actúa</p>
                <p className="text-2xl font-bold text-dark dark:text-white font-heading">{currentActors.map(a => a.name).join(' y ')}</p>
             </div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className={`text-9xl font-heading font-black tabular-nums tracking-tighter transition-all duration-300 scale-110 drop-shadow-md ${isCritical ? 'text-danger animate-pulse' : 'text-dark dark:text-white'}`}>
                 {timeString}
             </div>
             {timeLeft === 0 && <p className="text-danger font-bold text-2xl mt-6 animate-bounce font-heading">¡TIEMPO AGOTADO!</p>}
         </div>

         <div className="space-y-4 pb-8">
             {!timerActive && timeLeft === TURN_DURATION_SECONDS && (
                 <Button fullWidth onClick={startTimer} className="h-24 text-3xl font-heading uppercase tracking-wide shadow-2xl hover:scale-[1.02] transition-transform">
                     🎬 ¡Acción!
                 </Button>
             )}

             {(timerActive || timeLeft < TURN_DURATION_SECONDS) && (
                 <>
                    {timeLeft > 0 && (
                        <Button fullWidth onClick={handleSuccess} variant="secondary" className="h-24 text-2xl font-heading shadow-xl hover:bg-emerald-500 border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 transition-all">
                            ✅ ¡ADIVINADA!
                        </Button>
                    )}
                    
                    <Button fullWidth onClick={handleFail} variant="outline" className="opacity-60 hover:opacity-100 font-bold border-2 py-4 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                        {timeLeft === 0 ? "Siguiente Turno ➡" : "Pasar / No adivinaron"}
                    </Button>
                 </>
             )}
         </div>
      </div>
    );
  }

  // SCORE UPDATE SCREEN with Rolling Animation
  if (phase === TurnPhase.SCORE_UPDATE) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-6 space-y-10 text-center animate-fade-in">
        
        {turnResult === 'SUCCESS' ? (
          <div className="space-y-2">
            <span className="text-6xl animate-bounce block">🎉</span>
            <h2 className="text-4xl font-heading font-black text-secondary dark:text-emerald-400 drop-shadow-sm">¡PUNTO!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold">¡Bien hecho!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-6xl block">⏰</span>
            <h2 className="text-3xl font-heading font-bold text-gray-400 dark:text-gray-500">Se acabó el tiempo</h2>
            <p className="text-gray-400 text-sm">Más suerte la próxima...</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 w-full max-w-xs transform scale-105">
           <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">{currentTeam.name}</p>
           
           <div className="h-24 flex justify-center items-center gap-3 overflow-hidden">
              {turnResult === 'SUCCESS' ? (
                  /* Rolling Animation Container */
                  <div className="h-[6rem] overflow-hidden relative leading-none">
                      <div className={`flex flex-col transition-transform duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) ${animateScore ? '-translate-y-1/2' : 'translate-y-0'}`}>
                          {/* Old Score (grayed out) */}
                          <span className="h-[6rem] flex items-center justify-center text-7xl font-heading font-black text-gray-300 dark:text-gray-600 opacity-50">{currentTeam.score - 1}</span>
                          {/* New Score (highlighted) */}
                          <span className="h-[6rem] flex items-center justify-center text-7xl font-heading font-black text-primary dark:text-emerald-400">{currentTeam.score}</span>
                      </div>
                  </div>
              ) : (
                  /* Static Score if Failed */
                  <span className="text-7xl font-heading font-black text-dark dark:text-white">{currentTeam.score}</span>
              )}
              <span className="text-3xl text-gray-400 font-bold self-end mb-4">pts</span>
           </div>
        </div>

        <div className="w-full max-w-xs pt-8">
          <Button fullWidth onClick={handleNextTurn} className="py-5 text-xl font-heading shadow-xl">
             Continuar ➡
          </Button>
        </div>
      </div>
    );
  }

  return null;
};