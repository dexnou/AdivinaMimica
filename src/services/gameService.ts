import { Category, Player, Team, CardItem } from "../types";
import { supabase } from "../supabaseClient";
import { DEFAULT_CATEGORIES } from "../constants";

// --- Database Logic ---

export const fetchCategories = async (): Promise<Category[]> => {
  const { data: catsData, error: catsError } = await supabase
    .from('categorias')
    .select('*')
    .order('id', { ascending: true });

  if (catsError || !catsData) {
    console.warn('Usando categorías locales por error de conexión:', catsError);
    return DEFAULT_CATEGORIES;
  }

  const { data: elemsData, error: elemsError } = await supabase
    .from('elementos')
    .select('*');

  if (elemsError) {
    return [];
  }

  const fullCategories: Category[] = catsData.map((cat: any) => {
    const catCards = elemsData
      .filter((el: any) => el.categoria_id === cat.id)
      .map((el: any) => ({
        id: el.id,
        text: el.nombre
      }));

    return {
      id: cat.id,
      name: cat.nombre,
      cards: catCards
    };
  });
  
  if (fullCategories.length === 0) return DEFAULT_CATEGORIES;

  return fullCategories;
};

export const createCategory = async (name: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categorias')
    .insert([{ nombre: name }])
    .select()
    .single();

  if (error) {
    alert('Error creando categoría: ' + error.message);
    return null;
  }
  
  return { id: data.id, name: data.nombre, cards: [] };
};

export const deleteCategory = async (id: number | string) => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);
    
  if (error) alert('Error borrando categoría: ' + error.message);
};

export const createCard = async (categoryId: number | string, text: string): Promise<CardItem | null> => {
  const { data, error } = await supabase
    .from('elementos')
    .insert([{ 
      nombre: text, 
      categoria_id: categoryId,
      tipo: 'mimica',
      descripcion: '' 
    }])
    .select()
    .single();

  if (error) {
    alert('Error creando carta: ' + error.message);
    return null;
  }

  return { id: data.id, text: data.nombre };
};

export const deleteCard = async (cardId: number | string) => {
  const { error } = await supabase
    .from('elementos')
    .delete()
    .eq('id', cardId);

  if (error) alert('Error borrando carta: ' + error.message);
};


// --- Game Logic Helpers ---

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateTeams = (players: Player[], teamCount: number): Team[] => {
  const shuffledPlayers = shuffleArray(players);
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team_${i}`,
    name: `Equipo ${i + 1}`,
    players: [],
    score: 0,
    nextActorIndex: 0
  }));

  shuffledPlayers.forEach((player, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].players.push(player);
  });

  return teams;
};

export const getNextActors = (team: Team, count: number): Player[] => {
  const actors: Player[] = [];
  const totalPlayers = team.players.length;
  for (let i = 0; i < count; i++) {
    const index = (team.nextActorIndex + i) % totalPlayers;
    actors.push(team.players[index]);
  }
  return actors;
};

export const getRandomCard = (category: Category, usedCards: string[]): string | null => {
  // CORRECCION AQUI: c es un objeto, accedemos a c.text
  const available = category.cards.filter(c => !usedCards.includes(c.text));
  
  if (available.length === 0) return null;
  
  const randomItem = available[Math.floor(Math.random() * available.length)];
  return randomItem.text;
};