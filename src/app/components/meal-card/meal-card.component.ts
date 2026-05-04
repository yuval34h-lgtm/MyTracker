import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  count?: number; // Number of pieces (e.g., 2 apples)
}

export interface Meal {
  id: string;
  name: string;
  ingredients: Ingredient[];
  totalCalories: number;
  date: string;
  image?: string | null;
  type: 'food' | 'manual';
}

@Component({
  selector: 'app-meal-card',
  imports: [DatePipe],
  templateUrl: './meal-card.component.html',
  styleUrl: './meal-card.component.css',
})
export class MealCardComponent {
  meal = input.required<Meal>();
  remove = output<string>();
}
