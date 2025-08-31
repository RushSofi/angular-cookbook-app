import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, docData, updateDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore'; 

export interface Recipe {
  id?: string;
  name: string;
  description: string;
  creationDate: Date;
  imageUrl?: string;
  ingredients: {
    name: string;
    quantity: number;
    units: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesRef = collection(this.firestore, 'recipes');

  constructor(private firestore: Firestore) { }

  getRecipes(): Observable<Recipe[]> {
    return collectionData(this.recipesRef, { idField: 'id' }).pipe(
      map(recipes => recipes.map(recipe => ({
        ...recipe,
        creationDate: (recipe['creationDate'] as Timestamp).toDate()
      })))
    ) as Observable<Recipe[]>;
  }

  addRecipe(recipe: Recipe) {
    return addDoc(this.recipesRef, recipe);
  }

  deleteRecipe(id: string) {
    const recipeDocRef = doc(this.firestore, `recipes/${id}`);
    return deleteDoc(recipeDocRef);
  }

  getRecipeById(id: string): Observable<Recipe> {
    const recipeDocRef = doc(this.firestore, `recipes/${id}`);
    return docData(recipeDocRef, { idField: 'id' }).pipe(
      map(recipe => {
        const typedRecipe = recipe as Recipe;
        return {
          ...typedRecipe,
          creationDate: (typedRecipe.creationDate as any as Timestamp).toDate()
        };
      })
    ) as Observable<Recipe>;
  }

  updateRecipe(id: string, recipe: Partial<Recipe>) {
    const recipeDocRef = doc(this.firestore, `recipes/${id}`);
    return updateDoc(recipeDocRef, recipe);
  }
}