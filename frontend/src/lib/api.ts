import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
});

export interface ApiErrorShape {
  message: string;
  errors?: unknown;
}

/** Normalizes an axios error into a human-readable message. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorShape | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Extracts a structured errors payload (e.g. BRE failures or validation details). */
export function getApiErrorDetails<T = unknown>(err: unknown): T | undefined {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorShape | undefined;
    return data?.errors as T | undefined;
  }
  return undefined;
}
