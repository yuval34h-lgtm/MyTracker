export interface MealEntry {
  id: string;
  name: string;
  type: 'food' | 'manual';
  grams?: number;
  calories: number;
  notes?: string;
  image?: string | null;
  date: string;
}
