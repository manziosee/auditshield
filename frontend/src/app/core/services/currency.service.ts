import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string;
  iso_code_3: string;
  phone_prefix: string;
  default_currency: Currency;
  default_timezone: string;
  tax_year_start_month: number;
  date_format: string;
  flag_emoji: string;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private _countries = signal<Country[]>([]);
  private _currencies = signal<Currency[]>([]);

  readonly countries = this._countries.asReadonly();
  readonly currencies = this._currencies.asReadonly();

  constructor(private api: ApiService) {}

  loadCountries(): void {
    this.api.get<Country[]>('geo/countries/').subscribe({
      next: (data) => this._countries.set(data),
      error: () => {},
    });
  }

  loadCurrencies(): void {
    this.api.get<Currency[]>('geo/currencies/').subscribe({
      next: (data) => this._currencies.set(data),
      error: () => {},
    });
  }

  /**
   * Format a numeric amount with the given currency code.
   * Falls back to plain number formatting if currency is unknown.
   */
  format(amount: number | string | null | undefined, currencyCode: string): string {
    if (amount === null || amount === undefined || amount === '') return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';

    const currency = this._currencies().find(c => c.code === currencyCode);
    const decimals = currency?.decimal_places ?? 2;
    const symbol = currency?.symbol ?? currencyCode;

    return `${symbol} ${num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  getSymbol(currencyCode: string): string {
    return this._currencies().find(c => c.code === currencyCode)?.symbol ?? currencyCode;
  }

  getCountryByIso(iso: string): Country | undefined {
    return this._countries().find(c => c.iso_code === iso);
  }
}
