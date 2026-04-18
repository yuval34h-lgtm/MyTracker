import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-meal-log',
  imports: [DatePipe],
  templateUrl: './meal-log.component.html',
  styleUrl: './meal-log.component.css',
})
export class MealLogComponent {
  // 🧠 food database (later from service / supabase)
  foods = signal([
    {
      id: '1',
      name: 'Chicken breast',
      caloriesPer100g: 165,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy-uWtNxg0MUbHX745GUiTPyQAYoXwBGZgm82_YPiNtsHWyf22EenqW6mmZisAh4R17jxX8OcjYMW160rC4no5yz-QxL0BCzmqKNjB7DNY&s=10', // example
    },
    {
      id: '2',
      name: 'Rice',
      caloriesPer100g: 130,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyt4BTvIENJOcr62gAqswwe-ZzoxoEdCnX9P_fuONSgSMebcHYWslQsTlWGuJ7NBVrOSeZhTLHDb5oTXRNQ8hdKknCO5TjfLEr3TyAqDdUFg&s=10',
    },
  ]);

  selectedFood = signal<any | null>(null);
  grams = signal<number | null>(null);
  selectedDate = signal(this.getCurrentDateTime());
  selectedImage = signal<string | null>(null);

  private getCurrentDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }
  // ✍️ manual entry
  manualText = signal('');
  manualCalories = signal<number | null>(null);

  meals = signal<any[]>([]);

  // ⚡ calorie calc
  calculatedCalories = computed(() => {
    const food = this.selectedFood();
    if (!food) return 0;
    const grams = this.grams() || 0;
    return (food.caloriesPer100g / 100) * grams;
  });

  onManualImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearManualImage() {
    this.selectedImage.set(null);
  }

  addFromFood() {
    const food = this.selectedFood();
    const grams = this.grams();
    if (!food || grams === null || grams <= 0) return;

    this.meals.update((list) => [
      {
        id: crypto.randomUUID(),
        name: food.name,
        type: 'food',
        grams: grams,
        calories: this.calculatedCalories(),
        date: this.selectedDate(),
        image: food.image,
      },
      ...list,
    ]);

    this.grams.set(0);
    this.selectedFood.set(null);
  }

  addManual() {
    const text = this.manualText().trim();
    const calories = this.manualCalories();

    if (!text || calories === null) return;

    this.meals.update((list) => [
      {
        id: crypto.randomUUID(),
        name: text,
        type: 'manual',
        calories: calories,
        notes: text,
        date: this.selectedDate(),
        image: this.selectedImage(),
      },
      ...list,
    ]);

    this.manualText.set('');
    this.manualCalories.set(null);
    this.clearManualImage();
  }

  remove(id: string) {
    this.meals.update((list) => list.filter((m) => m.id !== id));
  }
}
