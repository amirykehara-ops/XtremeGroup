export const AVAILABLE_COLORS = [
  'Azul Eléctrico',
  'Rojo Fuego',
  'Verde Esmeralda',
  'Morado Premium',
  'Naranja Vibrante',
  'Amarillo Solar',
  'Rosa Impacto',
  'Turquesa Marino',
  'Gris Titanio',
  'Dorado Luxe'
] as const;



export type ProductColor = typeof AVAILABLE_COLORS[number];

export interface Product {
  id: number;
  title: string;
  desc: string;
  ben: string;
  ind: string;
  price: number;
  img: string;
  category: string;
  specs: string[];
  stock: boolean;
  badge?: string;
  points: number;
  colors?: readonly ProductColor[] | ProductColor[];
}

export interface NavLink {
  label: string;
  path: string;
}

export enum Availability {
  ANY = 'any',
  STOCK = 'stock',
  PREORDER = 'preorder'
}
