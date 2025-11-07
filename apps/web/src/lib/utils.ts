import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type AuthClientError = {
  error?: {
    message?: string;
    statusText?: string;
  };
  message?: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
) {
  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const authError = error as AuthClientError;
    if (authError.error) {
      return authError.error.message || authError.error.statusText || fallback;
    }

    if (typeof authError.message === "string" && authError.message.length > 0) {
      return authError.message;
    }
  }

  return fallback;
}
