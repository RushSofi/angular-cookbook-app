import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Recipe, RecipeService } from '../../services/recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipes$!: Observable<Recipe[]>;

  constructor(
    private recipeService: RecipeService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.recipes$ = this.recipeService.getRecipes();
  }

  openDeleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recipeService.deleteRecipe(id)
          .then(() => console.log('Рецепт удален'))
          .catch(err => console.error(err));
      }
    });
  }
}
