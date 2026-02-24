import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { HttpHeaders } from '@angular/common/http';
import { onError } from '@apollo/client/link/error';
import type { GraphQLFormattedError } from 'graphql';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Build Apollo client options — called from provideApollo() in app.config.ts */
// Apollo's options type in this version does not require a generic param
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createApolloOptions(): any {
  const httpLink = inject(HttpLink);

  // ── Auth link — attaches JWT Bearer token ──────────────────────────────────
  const authLink = setContext((_req, { headers }) => {
    const token = localStorage.getItem('as_access');
    if (!token) return {};
    const h = headers instanceof HttpHeaders ? headers : new HttpHeaders(headers ?? {});
    return { headers: h.set('Authorization', `Bearer ${token}`) };
  });

  // ── Error link — log GraphQL / network errors ──────────────────────────────
  const errorLink = onError((args) => {
    const gqlErrors = (args as { graphQLErrors?: GraphQLFormattedError[] }).graphQLErrors;
    const netError = (args as { networkError?: unknown }).networkError;
    gqlErrors?.forEach((err) =>
      console.warn(`[GraphQL error] ${err.message} @ ${err.path?.join('.')}`)
    );
    if (netError) console.error('[Network error]', netError);
  });

  const http = httpLink.create({
    uri: `${environment.apiUrl.replace('/api/v1', '')}/graphql/`,
  });

  return {
    link: ApolloLink.from([errorLink, authLink, http]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            employees: { keyArgs: ['search', 'status', 'departmentId'], merge: false },
            documents: { keyArgs: ['documentType', 'status', 'employeeId'], merge: false },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
      query:      { fetchPolicy: 'network-only', errorPolicy: 'all' },
      mutate:     { errorPolicy: 'all' },
    },
    connectToDevTools: !environment.production,
  };
}
