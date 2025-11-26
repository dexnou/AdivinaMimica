import { Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_movies',
    name: 'Películas',
    cards: [
      // Clásicos y Hits anteriores
      'Titanic', 'Avatar', 'El Padrino', 'Matrix', 'Jurassic Park', 'Forrest Gump', 'Gladiador', 'Interstellar', 'Joker',
      'Harry Potter', 'En Busca de la Felicidad', 'Diario de una Pasion', 'Los Juegos del Hambre', 'El Señor de los Anillos',
      'El club de la pelea', 'Nace una Estrella', 'Los 4 Fantasticos', 'No Mires Arriba', '50 sombras de Grey',
      'Rapidos y Furiosos', 'Correr o Morir', 'Pretty Woman', 'Avengers', 'Perfume de Mujer', 'El Abogado del Diablo',
      'A dos metros de ti', 'El Niño con el Pijama de Rayas', 'Nueve Reinas', 'Cantando bajo la lluvia', 'Que Paso Ayer',
      'Top Gun', 'Misión Imposible', 'Mamma Mia!', 'Amor a medianoche', 'Mujercitas', 'Cásate conmigo', 'Mujer Maravilla',
      'Sin tiempo para morir', 'Tren bala',
      
      // Hits Recientes y 2015+ (Nombres Arg)
      'Barbie', 'Oppenheimer', 'La La Land', 'Bohemian Rhapsody', 'El Renacido', 'It', 'Pantera Negra', '¡Huye!', 
      'Dune', 'Cruella', 'La Ballena', 'Elvis', 'Todo en todas partes al mismo tiempo', 'Pobres Criaturas', 'Saltburn', 
      'La sociedad de la nieve', 'Argentina, 1985', 'Con todos menos contigo', 'After', 'El stand de los besos', 
      'A todos los chicos de los que me enamoré', 'Culpa Mía', 'A través de mi ventana', 'Un lugar en silencio',
      'Rocketman', 'Spider-Man: Sin camino a casa', 'Black Adam', 'The Batman', 'Elementos', 'Wonka', 
      'Los asesinos de la luna', 'Anatomía de una caída', 'Zona de interés', 'Vidas Pasadas', 'Napoleón'
    ]
  },
  {
    id: 'cat_animated',
    name: 'Infantil / Animadas',
    cards: [
      'El Rey León', 'Buscando a Nemo', 'Los tres Chanchitos', 'Toy Story', 'Frozen', 'Kung Fu Panda',
      'El Libro de la Selva', 'Los Increíbles', 'Mi Villano Favorito', 'Intensamente', 'Monsters INC',
      'Aladdin', 'La Bella y la Bestia', 'Como entrenar a tu Dragon', 'Coco', 'Encanto', 'Moana', 
      'Sing: Ven y Canta', 'Zootopia', 'Red', 'Luca', 'Soul', 'Hotel Transylvania', 'Shrek', 
      'Madagascar', 'La Era de Hielo', 'Un Jefe en Pañales', 'Super Mario Bros'
    ]
  },
  {
    id: 'cat_series',
    name: 'Series',
    cards: [
      // Clásicos Internacionales
      'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'Friends', 'The Office', 'Dark', 'Black Mirror', 
      'La Casa de Papel', 'Squid Game', 'Grey\'s Anatomy', 'Peaky Blinders', 'Better Call Saul', 
      
      // Hits Recientes (2015+)
      'Merlina', 'Bridgerton', 'Euphoria', 'Succession', 'The Last of Us', 'The Bear', 'Sex Education', 
      'Élite', 'Gambito de Dama', 'Emily in Paris', 'Heartstopper', 'The Mandalorian', 'You', 
      'Dahmer', 'Bebé Reno', 'The Crown', 'Vikingos', 'Lupin', 'The Boys', 'Rick and Morty',
      
      // Argentinas y Latinos
      'El Encargado', 'División Palermo', 'Casados con Hijos', 'Los Simuladores', 'El Marginal', 
      'Luis Miguel: La Serie', 'Rebelde Way', 'Casi Ángeles', 'Floricienta', 'Esperanza Mía'
    ]
  },
  {
    id: 'cat_characters',
    name: 'Personajes',
    cards: [
      'Harry Potter', 'Batman', 'Mickey Mouse', 'Darth Vader', 'Mario Bros', 'Sherlock Holmes', 'Spider-Man', 
      'Goku', 'Homer Simpson', 'Barbie', 'Iron Man', 'Capitán América', 'Thor', 'Hulk', 'Wonder Woman', 
      'Joker', 'Harley Quinn', 'Deadpool', 'Wolverine', 'Shrek', 'Bob Esponja', 'Minions', 'El Grinch',
      'Jack Sparrow', 'James Bond', 'Indiana Jones', 'Yoda', 'Pikachu', 'Naruto', 'Luffy'
    ]
  }
];

export const STORAGE_KEY_CATEGORIES = 'mimica_categories';
export const ADMIN_PIN = '1234';
export const TURN_DURATION_SECONDS = 120;