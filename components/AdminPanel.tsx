import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { getCategories, saveCategories } from '../services/gameService';
import { Button } from './Button';
import { ADMIN_PIN } from '../constants';

interface AdminPanelProps {
  onBack: () => void;
}

// Reusable styled back button for Admin
const AdminBackButton = ({ onClick, label = "Volver" }: { onClick: () => void, label?: string }) => (
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<'LIST' | 'EDIT_CAT'>('LIST');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCardText, setNewCardText] = useState('');

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleLogin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
    } else {
      alert('PIN Incorrecto');
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: Date.now().toString(),
      name: newCatName.trim(),
      cards: []
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveCategories(updated);
  };

  const openCategory = (cat: Category) => {
    setActiveCategory(cat);
    setView('EDIT_CAT');
  };

  const handleAddCard = () => {
    if (!activeCategory || !newCardText.trim()) return;
    const updatedCat = {
      ...activeCategory,
      cards: [...activeCategory.cards, newCardText.trim()]
    };
    updateCategoryInState(updatedCat);
    setNewCardText('');
  };

  const handleDeleteCard = (index: number) => {
    if (!activeCategory) return;
    const updatedCards = activeCategory.cards.filter((_, i) => i !== index);
    const updatedCat = { ...activeCategory, cards: updatedCards };
    updateCategoryInState(updatedCat);
  };

  const updateCategoryInState = (updatedCat: Category) => {
    const updatedCategories = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setActiveCategory(updatedCat);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-dark dark:text-white mb-2">Acceso Admin</h2>
            <p className="text-gray-500 dark:text-gray-400">Ingresa el PIN para configurar.</p>
        </div>
        
        <input 
          type="password" 
          inputMode="numeric"
          className="p-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-white rounded-2xl text-center text-3xl tracking-widest w-48 focus:border-primary focus:outline-none transition-colors" 
          placeholder="••••"
          maxLength={4}
          value={pinInput}
          onChange={e => setPinInput(e.target.value)}
        />
        
        <div className="flex gap-3 w-full max-w-xs">
          <Button onClick={onBack} variant="outline" fullWidth>Volver</Button>
          <Button onClick={handleLogin} fullWidth>Ingresar</Button>
        </div>
        <p className="text-gray-300 dark:text-gray-600 text-xs mt-4">Hint: 1234</p>
      </div>
    );
  }

  if (view === 'EDIT_CAT' && activeCategory) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col mb-4">
          <AdminBackButton onClick={() => setView('LIST')} />
          <h2 className="text-2xl font-heading font-bold truncate text-primary dark:text-indigo-400">{activeCategory.name}</h2>
          <p className="text-sm text-gray-400">{activeCategory.cards.length} cartas</p>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input 
            className="flex-1 p-3 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-white rounded-xl focus:border-primary focus:outline-none transition-colors"
            placeholder="Nueva carta..."
            value={newCardText}
            onChange={e => setNewCardText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCard()}
          />
          <Button onClick={handleAddCard} className="px-5 rounded-xl text-xl">+</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pb-20 custom-scrollbar pr-1">
          {activeCategory.cards.length === 0 && (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-400">No hay cartas aún.</p>
              </div>
          )}
          {activeCategory.cards.map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center group transition-colors">
              <span className="font-medium text-gray-700 dark:text-gray-200">{card}</span>
              <button onClick={() => handleDeleteCard(idx)} className="text-gray-300 group-hover:text-danger font-bold px-2 transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-heading font-bold text-dark dark:text-white">Categorías</h2>
            <p className="text-gray-400 text-sm">Gestiona el contenido</p>
        </div>
        <Button onClick={onBack} variant="outline" className="py-2 px-4 text-sm font-bold border-2">Salir</Button>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 p-3 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-white rounded-xl focus:border-primary focus:outline-none transition-colors"
          placeholder="Nueva categoría..."
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
        />
        <Button onClick={handleAddCategory} className="px-5 rounded-xl text-xl">+</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar pr-1">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow">
            <span onClick={() => openCategory(cat)} className="font-bold text-lg flex-1 cursor-pointer font-heading text-dark dark:text-gray-200 hover:text-primary dark:hover:text-indigo-400 transition-colors">
                {cat.name} 
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full align-middle font-sans">{cat.cards.length}</span>
            </span>
            <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-danger p-2 transition-colors">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};