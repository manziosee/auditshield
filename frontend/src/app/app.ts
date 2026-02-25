import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  // Inject ThemeService at root so it initialises (applies dark/light class)
  // on every page — including auth pages that bypass the shell.
  readonly _theme = inject(ThemeService);
}
