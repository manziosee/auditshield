import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApollo } from 'apollo-angular';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { mockInterceptor } from './core/interceptors/mock.interceptor';
import { createApolloOptions } from './core/graphql/apollo.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    // HttpClient — mockInterceptor runs first (no-op unless as_demo=true)
    provideHttpClient(withInterceptors([mockInterceptor, authInterceptor])),
    provideAnimationsAsync(),
    // Apollo GraphQL client — connects to /graphql/ on the Django backend
    provideApollo(createApolloOptions),
    // Chart.js via ng2-charts — register all chart types
    provideCharts(withDefaultRegisterables()),
  ],
};
