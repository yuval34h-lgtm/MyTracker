import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Food {
  id: string;
  name: string;
  caloriesPer100g: number;
  image: string;
  weightPerPiece?: number | null; // in grams, optional for foods that are measured by weight instead of pieces
}

@Component({
  selector: 'app-food-gallery',
  imports: [FormsModule],
  templateUrl: './food-gallery.component.html',
  styleUrl: './food-gallery.component.css',
})
export class FoodGalleryComponent {
  foods = input.required<Food[]>();
  foodSelected = output<{ food: Food; totalGrams: number }>();
  showTrigger = input<boolean>(true);

  galleryOpen = signal(false);
  previewFood = signal<Food | null>(null);
  selectedFood = signal<Food | null>(null);
  gramsInput = signal<number | null>(null);
  countInput = signal<number | null>(null);

  openGallery() {
    this.previewFood.set(null);
    this.galleryOpen.set(true);
  }

  closeGallery() {
    this.galleryOpen.set(false);
    this.previewFood.set(null);
  }

  confirmSelection() {
    const food = this.previewFood();
    if (!food) return;

    let totalGrams = 0;
    if (food.weightPerPiece !== null) {
      // Using count input
      const count = this.countInput() || 1;
      totalGrams = (food.weightPerPiece || 0) * count;
    } else {
      // Using grams input
      totalGrams = this.gramsInput() || 0;
    }

    this.selectedFood.set(food);
    this.foodSelected.emit({ food, totalGrams });
    this.closeGallery();

    // Reset inputs
    this.gramsInput.set(null);
    this.countInput.set(null);
  }
}
