import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse, QueryParams } from '../models/api.models';

export interface Country {
  id: string;
  name: string;
  code: string;
  iso3: string;
  phone_code: string;
  currency: string;
  region: string;
  flag_emoji: string;
  is_active: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: string;
  effective_date: string;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly api = inject(ApiService);

  listCountries(params?: QueryParams): Observable<PaginatedResponse<Country>> {
    return this.api.getPaginated<Country>('geo/countries/', params);
  }

  getCountry(id: string): Observable<Country> {
    return this.api.get<Country>(`geo/countries/${id}/`);
  }

  listCurrencies(params?: QueryParams): Observable<PaginatedResponse<Currency>> {
    return this.api.getPaginated<Currency>('geo/currencies/', params);
  }

  getCurrency(id: string): Observable<Currency> {
    return this.api.get<Currency>(`geo/currencies/${id}/`);
  }

  listExchangeRates(params?: QueryParams): Observable<PaginatedResponse<ExchangeRate>> {
    return this.api.getPaginated<ExchangeRate>('geo/exchange-rates/', params);
  }
}
