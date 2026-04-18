import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DiaryComponent } from './components/diary/diary.component';
import { FoodStoreComponent } from "./food-store/food-store.component";
import { MealLogComponent } from "./meal-log/meal-log.component";

type View = 'diary' | 'db' | 'log';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DiaryComponent, FoodStoreComponent, MealLogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  protected readonly title = signal('my-tracker');
  view = signal<View>('diary');

  setView(v: View) {
    this.view.set(v);
  }
}
