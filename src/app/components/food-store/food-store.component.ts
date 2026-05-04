import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-food-store',
  imports: [],
  templateUrl: './food-store.component.html',
  styleUrl: './food-store.component.css',
})
export class FoodStoreComponent {
  name = signal('');
  calories = signal<number | null>(null);

  foods = signal<any[]>([]);

  addFood() {
    if (!this.name() || !this.calories()) return;

    this.foods.update((list) => [
      {
        id: crypto.randomUUID(),
        name: this.name(),
        caloriesPer100g: this.calories(),
      },
      ...list,
    ]);

    this.name.set('');
    this.calories.set(null);
  }

  remove(id: string) {
    this.foods.update((list) => list.filter((f) => f.id !== id));
  }
}
