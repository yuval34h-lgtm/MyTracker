import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-diary',
  standalone: true,
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiaryComponent {

  foodText = signal('');
  selectedImage = signal<string | null>(null);

  foodList = signal<
    { id: string; text: string; time: string; image?: string | null }[]
  >([]);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  addFood() {
    const text = this.foodText().trim();
    if (!text && !this.selectedImage()) return;

    this.foodList.update(list => [
      {
        id: crypto.randomUUID(),
        text,
        time: new Date().toLocaleTimeString(),
        image: this.selectedImage()
      },
      ...list
    ]);

    this.foodText.set('');
    this.selectedImage.set(null);
  }

  remove(id: string) {
    this.foodList.update(list =>
      list.filter(item => item.id !== id)
    );
  }
}