import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snack = inject(MatSnackBar);

  success(message: string): void {
    this.snack.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snack-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(message: string): void {
    this.snack.open(message, 'Dismiss', {
      duration: 6000,
      panelClass: ['snack-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  info(message: string): void {
    this.snack.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snack-info'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  warn(message: string): void {
    this.snack.open(message, 'OK', {
      duration: 5000,
      panelClass: ['snack-warn'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
