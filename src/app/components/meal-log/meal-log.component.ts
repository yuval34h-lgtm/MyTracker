import { Component, signal, computed, viewChild } from '@angular/core';
import { FoodGalleryComponent, Food } from '../food-gallery/food-gallery.component';
import { MealCardComponent, Meal, Ingredient } from '../meal-card/meal-card.component';

@Component({
  selector: 'app-meal-log',
  imports: [FoodGalleryComponent, MealCardComponent],
  templateUrl: './meal-log.component.html',
  styleUrl: './meal-log.component.css',
})
export class MealLogComponent {
  foods = signal<Food[]>([
    {
      id: '1',
      name: 'Chicken breast',
      caloriesPer100g: 165,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy-uWtNxg0MUbHX745GUiTPyQAYoXwBGZgm82_YPiNtsHWyf22EenqW6mmZisAh4R17jxX8OcjYMW160rC4no5yz-QxL0BCzmqKNjB7DNY&s=10',
      weightPerPiece: 100,
    },
    {
      id: '2',
      name: 'Rice',
      caloriesPer100g: 130,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyt4BTvIENJOcr62gAqswwe-ZzoxoEdCnX9P_fuONSgSMebcHYWslQsTlWGuJ7NBVrOSeZhTLHDb5oTXRNQ8hdKknCO5TjfLEr3TyAqDdUFg&s=10',
      weightPerPiece: null,
    },
  ]);

  selectedFood = signal<Food | null>(null);
  grams = signal<number | null>(null);
  selectedDate = signal(this.getTodayString());
  selectedImage = signal<string | null>(null);
  manualText = signal('');
  manualCalories = signal<number | null>(null);
  meals = signal<Meal[]>([]);

  // Current meal being built
  currentMealName = signal('');
  currentMealCount = signal(1);
  currentMealIngredients = signal<Ingredient[]>([]);
  showIngredientInput = signal(false);
  manualCount = signal<number | null>(null);

  // Editing state for inline editing
  editingIngredientIndex = signal<number | null>(null);
  editingField = signal<'name' | 'calories' | null>(null);

  // Focus tracking for autocomplete
  mealNameFocused = signal(false);
  ingredientNameFocused = signal(false);

  // Autocomplete
  mealNameSuggestions = computed(() => {
    if (!this.mealNameFocused()) return [];
    const input = this.currentMealName().toLowerCase();
    if (!input) return [];
    return this.foods()
      .filter(f => f.name.toLowerCase().includes(input))
      .map(f => f.name);
  });

  ingredientNameSuggestions = computed(() => {
    if (!this.ingredientNameFocused()) return [];
    const input = this.manualText().toLowerCase();
    if (!input) return [];
    return this.foods()
      .filter(f => f.name.toLowerCase().includes(input))
      .map(f => f.name);
  });

  // Modal controls
  showAddOptions = signal(false);
  showManualEntry = signal(false);
  showManualMealBuilder = signal(false);

  // Calendar picker visibility
  showCalendar = signal(false);

  // Reference to food gallery component
  foodGallery = viewChild(FoodGalleryComponent);

  // Generate last 7 days
  last7Days = computed(() => {
    const days: { label: string; date: string; isToday: boolean }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = this.formatDate(d);
      days.push({
        label: this.getDayName(d),
        date: dateStr,
        isToday: i === 0,
      });
    }
    return days;
  });

  // Filter meals for selected date
  mealsForSelectedDate = computed(() => {
    const selected = this.selectedDate();
    return this.meals().filter((meal) => {
      const mealDate = meal.date?.split('T')[0];
      return mealDate === selected;
    });
  });

  private getTodayString(): string {
    return this.formatDate(new Date());
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private getDayName(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
  }

  toggleCalendar(btn?: HTMLElement) {
    const newState = !this.showCalendar();
    this.showCalendar.set(newState);
    if (btn && newState) {
      this.updateCalendarPosition(btn);
    }
  }

  calendarTop = signal(0);
  calendarRight = signal(0);

  updateCalendarPosition(btn: HTMLElement) {
    const rect = btn.getBoundingClientRect();
    this.calendarTop.set(rect.bottom + 8);
    this.calendarRight.set(window.innerWidth - rect.right);
  }

  onCalendarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate.set(input.value);
      this.showCalendar.set(false);
    }
  }

  closeCalendar() {
    this.showCalendar.set(false);
  }

  // Called from meal builder's gallery - adds as ingredient
  onFoodSelectedForBuilder(selected: { food: Food; totalGrams: number }) {
    const food = selected.food;
    const grams = selected.totalGrams;
    const calories = (food.caloriesPer100g / 100) * grams;

    // Add as ingredient to the meal being built
    const count = this.manualCount();
    const ingredient: Ingredient = {
      name: food.name,
      grams,
      calories,
    };
    if (count !== null) {
      ingredient.count = count;
    }

    this.currentMealIngredients.update((ingredients) => [...ingredients, ingredient]);
    this.manualCount.set(null);
  }

  // Called from Quick Add gallery - adds directly to log
  onFoodSelectedForQuickAdd(selected: { food: Food; totalGrams: number }) {
    const food = selected.food;
    const grams = selected.totalGrams;
    const calories = (food.caloriesPer100g / 100) * grams;
    this.addMealDirectly(food, grams, calories);
  }

  // Add meal directly from Quick Add (not as ingredient)
  addMealDirectly(food: Food, grams: number, calories: number) {
    const mealName = this.currentMealName().trim() || food.name;
    const count = this.currentMealCount();

    this.meals.update((list) => [
      {
        id: crypto.randomUUID(),
        name: mealName,
        ingredients: [{ name: food.name, grams, calories: calories * count }],
        totalCalories: calories * count,
        date: this.selectedDate() + 'T12:00',
        image: food.image,
        type: 'food' as const,
      },
      ...list,
    ]);
  }

  selectMealNameSuggestion(name: string) {
    this.currentMealName.set(name);
    // Auto-fill calories if known food
    const food = this.foods().find(f => f.name === name);
    if (food) {
      this.manualCalories.set(food.caloriesPer100g);
    }
  }

  selectIngredientNameSuggestion(name: string) {
    this.manualText.set(name);
    // Auto-fill calories if known food
    const food = this.foods().find(f => f.name === name);
    if (food) {
      this.manualCalories.set(food.caloriesPer100g);
      // If food has weightPerPiece, set default count to 1
      if (food.weightPerPiece !== null) {
        this.manualCount.set(1);
      }
    }
  }

  onManualImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.selectedImage.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearManualImage() {
    this.selectedImage.set(null);
  }

  toggleIngredientInput() {
    this.showIngredientInput.update(v => !v);
  }

  addManualIngredient() {
    const text = this.manualText().trim();
    const calories = this.manualCalories();
    if (!text || calories === null) return;

    const count = this.manualCount();
    const ingredient: Ingredient = {
      name: text,
      grams: 0,
      calories,
    };
    if (count !== null) {
      ingredient.count = count;
    }

    this.currentMealIngredients.update((ingredients) => [
      ...ingredients,
      ingredient,
    ]);

    // Reset inputs and hide
    this.manualText.set('');
    this.manualCalories.set(null);
    this.manualCount.set(null);
    this.clearManualImage();
    this.showIngredientInput.set(false);
  }

  removeCurrentIngredient(index: number) {
    this.currentMealIngredients.update((ingredients) =>
      ingredients.filter((_, i) => i !== index)
    );
    this.cancelEdit();
  }

  // Inline editing
  startEdit(index: number, field: 'name' | 'calories') {
    this.editingIngredientIndex.set(index);
    this.editingField.set(field);
  }

  saveEdit() {
    // Save is automatic via signal updates, just exit edit mode
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingIngredientIndex.set(null);
    this.editingField.set(null);
  }

  updateIngredientName(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    if (!newName) return;

    this.currentMealIngredients.update((ingredients) => {
      const updated = [...ingredients];
      if (updated[index]) {
        updated[index] = { ...updated[index], name: newName };
      }
      return updated;
    });
  }

  updateIngredientCalories(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newCalories = parseFloat(input.value);
    if (isNaN(newCalories)) return;

    this.currentMealIngredients.update((ingredients) => {
      const updated = [...ingredients];
      if (updated[index]) {
        updated[index] = { ...updated[index], calories: newCalories };
      }
      return updated;
    });
  }

  get currentMealTotalCalories(): number {
    const multiplier = this.currentMealCount();
    const ingredientCalories = this.currentMealIngredients().reduce(
      (sum, ing) => sum + ing.calories,
      0
    );
    return ingredientCalories * multiplier;
  }

  confirmMeal() {
    const ingredients = this.currentMealIngredients();
    if (ingredients.length === 0) return;

    const totalCalories = this.currentMealTotalCalories;
    const mealName =
      this.currentMealName().trim() || this.generateMealName(ingredients);

    this.meals.update((list) => [
      {
        id: crypto.randomUUID(),
        name: mealName,
        ingredients,
        totalCalories,
        date: this.selectedDate() + 'T12:00',
        image: null,
        type: 'food' as const,
      },
      ...list,
    ]);

    this.clearCurrentMeal();
    this.showManualMealBuilder.set(false);
  }

  private generateMealName(ingredients: Ingredient[]): string {
    if (ingredients.length <= 2) {
      return ingredients.map((ing) => ing.name).join(' + ');
    }
    return 'Meal with ' + ingredients.map((ing) => ing.name).join(', ');
  }

  clearCurrentMeal() {
    this.currentMealName.set('');
    this.currentMealCount.set(1);
    this.currentMealIngredients.set([]);
    this.manualText.set('');
    this.manualCalories.set(null);
    this.clearManualImage();
    this.showIngredientInput.set(false);
    this.cancelEdit();
  }

  remove(id: string) {
    this.meals.update((list) => list.filter((m) => m.id !== id));
  }

  openAddOptions() {
    this.showAddOptions.set(true);
  }

  openManualEntry() {
    this.showAddOptions.set(false);
    this.showManualMealBuilder.set(true);
  }

  openQuickAdd() {
    this.showAddOptions.set(false);
    const gallery = this.foodGallery();
    if (gallery) {
      gallery.openGallery();
    }
  }
}
