/** Standard paginated API response */
export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Standard API error */
export interface ApiError {
  error: true;
  status_code: number;
  detail: Record<string, string[]> | string;
}

/** Filter params */
export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: unknown;
}
