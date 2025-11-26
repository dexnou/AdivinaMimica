import React, { useState, useEffect } from 'react';
import { Player, Team, Category } from '../types';
import { Button } from './Button';
import { generateTeams, getCategories } from '../services/gameService';

interface SetupFlowProps {
  onComplete: (teams: Team[], actorsPerTurn: number, category: Category) => void;
  onBack: () => void;
}

const BackButton = ({ onClick, label = "Volver" }: { onClick: () => void, label?: string }) => (
  <button 
    onClick={onClick} 
    className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all mb-2 -ml-2 w-fit"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export const SetupFlow: React.FC<SetupFlowProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Cat, 2: Players, 3: Teams, 4: Actors
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [actorsCount, setActorsCount] = useState(1);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  // --- Step 1: Category ---
  const handleSelectCategory = (cat: Category) => {
    if (cat.cards.length === 0) {
      alert("Esta categoría no tiene cartas.");
      return;
    }
    setSelectedCategory(cat);
    setStep(2);
  };

  // --- Step 2: Players ---
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([...players, { id: Date.now().toString(), name: newPlayerName.trim() }]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const finishPlayers = () => {
    setStep(3);
  };

  // --- Step 3: Teams Setup ---
  const createTeams = (count: number) => {
    const generated = generateTeams(players, count);
    setTeams(generated);
  };

  const updateTeamName = (id: string, newName: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  // --- Step 4: Actors Count ---
  const finishSetup = () => {
    if (selectedCategory) {
      onComplete(teams, actorsCount, selectedCategory);
    }
  };

  // --- RENDERERS ---

  if (step === 1) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
            <BackButton onClick={onBack} label="Inicio" />
            <h2 className="text-3xl font-heading font-bold text-primary dark:text-indigo-400">Elige Categoría</h2>
            <p className="text-gray-400 text-sm">¿Sobre qué van a actuar hoy?</p>
        </div>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-10 custom-scrollbar pr-2">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleSelectCategory(cat)}
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:border-primary hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-bl-full -mr-4 -mt-4 group-hover:from-indigo-100 dark:group-hover:from-gray-600 transition-colors"></div>
              <h3 className="text-xl font-heading font-bold text-dark dark:text-white relative z-10">{cat.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm relative z-10 font-bold mt-1">
                {cat.cards.length} cartas
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col h-full">
         <div className="mb-6">
            <BackButton onClick={() => setStep(1)} label="Categorías" />
            <h2 className="text-3xl font-heading font-bold text-primary dark:text-indigo-400">Jugadores</h2>
            <p className="text-sm text-gray-500 font-bold">Mínimo 2 jugadores</p>
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-white rounded-xl focus:border-primary focus:outline-none transition-colors"
            placeholder="Nombre..."
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
          <Button onClick={addPlayer} className="px-5 rounded-xl text-xl shadow-none">+</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-1">
          {players.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-200">{p.name}</span>
              <button onClick={() => removePlayer(p.id)} className="text-gray-400 hover:text-danger p-2 transition-colors">✕</button>
            </div>
          ))}
          {players.length === 0 && (
             <div className="text-center text-gray-400 mt-10 italic">
               Agrega los nombres de quienes van a jugar.
             </div>
          )}
        </div>

        <div className="pt-2">
            <Button 
                fullWidth 
                disabled={players.length < 2} 
                onClick={finishPlayers}
                className="py-4 text-lg shadow-lg"
            >
                Continuar ({players.length})
            </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    
    // Initial Team Count Selection View
    if (teams.length === 0) {
      const maxPossibleTeams = players.length; // Can't have more teams than players
      return (
        <div className="flex flex-col h-full justify-center space-y-8">
           <div className="absolute top-4 left-4">
               <BackButton onClick={() => setStep(2)} label="Jugadores" />
           </div>
           
           <div className="text-center">
             <h2 className="text-3xl font-heading font-bold text-dark dark:text-white mb-2">¿Cuántos Equipos?</h2>
             <p className="text-gray-500">Repartiremos a los jugadores al azar.</p>
           </div>
           
          <div className="space-y-4 px-4">
            {[2, 3, 4].filter(n => n <= maxPossibleTeams).map(num => (
              <Button key={num} fullWidth variant="outline" onClick={() => createTeams(num)} className="py-6 text-xl border-2 hover:bg-indigo-50 dark:hover:bg-gray-800">
                {num} Equipos
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Rename View
    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <BackButton onClick={() => setTeams([])} label="Rehacer equipos" />
                <h2 className="text-3xl font-heading font-bold text-primary dark:text-indigo-400">Editar Equipos</h2>
                <p className="text-sm text-gray-400">Puedes cambiar los nombres.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pb-4 custom-scrollbar pr-2">
                {teams.map((team) => (
                    <div key={team.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nombre del equipo</label>
                        <input 
                            value={team.name}
                            onChange={(e) => updateTeamName(team.id, e.target.value)}
                            className="w-full text-xl font-heading font-bold border-b-2 border-gray-100 dark:border-gray-700 focus:border-primary outline-none py-1 mb-3 text-dark dark:text-white bg-transparent transition-colors"
                        />
                        <div className="flex flex-wrap gap-2">
                            {team.players.map(p => (
                                <span key={p.id} className="bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-200 text-sm font-bold px-3 py-1 rounded-full border border-indigo-100 dark:border-gray-600">{p.name}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="pt-4">
                <Button fullWidth onClick={() => setStep(4)} className="py-4 shadow-lg">Confirmar Equipos</Button>
            </div>
        </div>
    );
  }

  if (step === 4) {
    // Determine max actors
    const minTeamSize = Math.min(...teams.map(t => t.players.length));
    const maxActors = Math.max(1, minTeamSize - 1);
    const options = [1, 2, 3].filter(n => n <= maxActors);

    return (
        <div className="flex flex-col h-full justify-center space-y-8 relative">
           <div className="absolute top-0 left-0">
               <BackButton onClick={() => setStep(3)} label="Equipos" />
           </div>

           <div className="text-center px-4">
                <h2 className="text-3xl font-heading font-bold text-dark dark:text-white mb-4 leading-tight">¿Cuántos actúan a la vez?</h2>
                <p className="text-center text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 inline-block px-4 py-2 rounded-lg text-sm">
                    Máximo posible: <span className="text-dark dark:text-white font-bold">{maxActors}</span>
                </p>
           </div>

           <div className="flex justify-center gap-6">
               {options.map(opt => (
                   <button 
                    key={opt}
                    onClick={() => setActorsCount(opt)}
                    className={`w-20 h-20 rounded-2xl text-3xl font-heading font-bold flex items-center justify-center transition-all duration-300 ${actorsCount === opt ? 'bg-primary text-white scale-110 shadow-xl ring-4 ring-indigo-200 dark:ring-indigo-900' : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                   >
                       {opt}
                   </button>
               ))}
           </div>

           <div className="pt-8 px-4">
               <Button fullWidth onClick={finishSetup} className="py-5 text-xl shadow-xl animate-pulse">¡Comenzar Partida!</Button>
           </div>
        </div>
    )
  }

  return null;
};