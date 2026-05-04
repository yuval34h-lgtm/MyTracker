import { Component, signal } from '@angular/core';
import { FoodStoreComponent } from "./components/food-store/food-store.component";
import { MealLogComponent } from "./components/meal-log/meal-log.component";

type View = 'tracker' | 'db';

@Component({
  selector: 'app-root',
  imports: [FoodStoreComponent, MealLogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  protected readonly title = signal('my-tracker');
  view = signal<View>('tracker');

  setView(v: View) {
    this.view.set(v);
  }
}
