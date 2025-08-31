import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { Recipe, RecipeService } from '../../services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {
  recipeForm!: FormGroup;
  isEditMode = false;
  private recipeId?: string;

  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.recipeId = id;
      this.loadRecipeData(id);
    }
  }

  initForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      ingredients: this.fb.array([])
    });
  }

  loadRecipeData(id: string): void {
    this.recipeService.getRecipeById(id).pipe(first()).subscribe(recipe => {

      this.recipeForm.patchValue({
        name: recipe.name,
        description: recipe.description
      });

      if (recipe.imageUrl) {
        this.imagePreview = recipe.imageUrl;
      }

      recipe.ingredients.forEach(ing => {
        this.ingredients.push(this.fb.group({
          name: [ing.name, Validators.required],
          quantity: [ing.quantity, Validators.required],
          units: [ing.units, Validators.required]
        }));
      });
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file: File = target.files[0];
      
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        usewebWorker: true
      };
      
      try {
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(compressedFile);
        
      } catch (error) {
        console.error('Ошибка сжатия изображения:', error);
      }
    }
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.fb.group({
      name: ['', Validators.required],
      quantity: [1, Validators.required],
      units: ['шт', Validators.required]
    }));
  }

  removeIngredient(i: number): void {
    this.ingredients.removeAt(i);
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.invalid) {
      return;
    }

    const recipeData = this.recipeForm.value;
    
    const imageUrl = (this.imagePreview as string) || '';

    if (this.isEditMode && this.recipeId) {
      const dataToUpdate: Partial<Recipe> = {
        ...recipeData,
        imageUrl: imageUrl,
      };
      this.recipeService.updateRecipe(this.recipeId, dataToUpdate)
        .then(() => this.router.navigate(['/']))
        .catch(err => console.error(err));
    } else {
      const newRecipe: Recipe = {
        ...recipeData,
        creationDate: new Date(),
        imageUrl: imageUrl,
      };
      this.recipeService.addRecipe(newRecipe)
        .then(() => this.router.navigate(['/']))
        .catch(err => console.error(err));
    }
  }
}