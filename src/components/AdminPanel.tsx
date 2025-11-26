import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { fetchCategories, createCategory, deleteCategory, createCard, deleteCard } from '../services/gameService';
import { Button } from './Button';
import { ADMIN_PIN } from '../constants';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminBackButton = ({ onClick, label = "Volver" }: { onClick: () => void, label?: string }) => (
    <button onClick={onClick} className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 px-3 py-2 rounded-lg mb-2 -ml-2 w-fit">
      <span className="font-bold text-sm">⬅ {label}</span>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleLogin = () => {
    if (pinInput === ADMIN_PIN) setIsAuthenticated(true);
    else alert('PIN Incorrecto');
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setLoading(true);
    const newCat = await createCategory(newCatName.trim());
    if (newCat) {
      setCategories([...categories, newCat]);
      setNewCatName('');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: number | string) => {
    if (!window.confirm('¿Eliminar esta categoría y todas sus cartas?')) return;
    setLoading(true);
    await deleteCategory(id);
    setCategories(categories.filter(c => c.id !== id));
    setLoading(false);
  };

  const openCategory = (cat: Category) => {
    setActiveCategory(cat);
    setView('EDIT_CAT');
  };

  const handleAddCard = async () => {
    if (!activeCategory || !newCardText.trim()) return;
    
    // Optimistic / DB Update
    const addedCard = await createCard(activeCategory.id, newCardText.trim());
    
    if (addedCard) {
      const updatedCat = {
        ...activeCategory,
        cards: [...activeCategory.cards, addedCard]
      };
      
      setActiveCategory(updatedCat);
      setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
      setNewCardText('');
    }
  };

  const handleDeleteCard = async (cardId: number | string) => {
    if (!activeCategory) return;
    
    await deleteCard(cardId);
    
    const updatedCards = activeCategory.cards.filter(c => c.id !== cardId);
    const updatedCat = { ...activeCategory, cards: updatedCards };
    
    setActiveCategory(updatedCat);
    setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h2 className="text-2xl font-bold dark:text-white">Admin Access</h2>
        <input 
          type="password" 
          className="p-3 rounded-xl border text-center text-2xl w-40 text-black" 
          value={pinInput}
          onChange={e => setPinInput(e.target.value)}
          placeholder="PIN"
        />
        <div className="flex gap-2">
            <Button onClick={handleLogin}>Entrar</Button>
            <Button variant="outline" onClick={onBack}>Cancelar</Button>
        </div>
      </div>
    )
  }

  if (view === 'EDIT_CAT' && activeCategory) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col mb-4">
          <AdminBackButton onClick={() => setView('LIST')} />
          <h2 className="text-2xl font-bold truncate text-primary dark:text-indigo-400">{activeCategory.name}</h2>
          <p className="text-sm text-gray-400">{activeCategory.cards.length} cartas</p>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input 
            className="flex-1 p-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:border-primary outline-none"
            placeholder="Nueva carta..."
            value={newCardText}
            onChange={e => setNewCardText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCard()}
          />
          <Button onClick={handleAddCard} className="px-5 text-xl">+</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pb-20 custom-scrollbar pr-1">
          {activeCategory.cards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 flex justify-between items-center group">
              {/* CORRECCION AQUI: card.text en lugar de card */}
              <span className="font-medium text-gray-700 dark:text-gray-200">{card.text}</span>
              <button onClick={() => handleDeleteCard(card.id)} className="text-gray-300 hover:text-danger px-2">✕</button>
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
            <h2 className="text-3xl font-bold text-dark dark:text-white">Categorías {loading && '...'}</h2>
            <p className="text-gray-400 text-sm">Base de datos global</p>
        </div>
        <Button onClick={onBack} variant="outline" className="py-2 px-4 text-sm font-bold border-2">Salir</Button>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 p-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:border-primary outline-none"
          placeholder="Nueva categoría..."
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
        />
        <Button onClick={handleAddCategory} className="px-5 text-xl">+</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar pr-1">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex justify-between items-center">
            <span onClick={() => openCategory(cat)} className="font-bold text-lg flex-1 cursor-pointer hover:text-primary dark:text-gray-200">
                {cat.name} 
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-full align-middle">{cat.cards.length}</span>
            </span>
            <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-danger p-2">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};