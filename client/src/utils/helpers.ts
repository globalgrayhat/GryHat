import CONFIG_KEYS from "../config";
/**
 * Returns a full URL based on a given path.
 * - If the path is already a full URL (starts with http/https), it returns it as-is.
 * - Otherwise, it prepends the API base URL from the config.
 *
 * @param path - A relative or absolute path string
 * @returns Full URL string
 */
export const getFullUrl = (path?: string | null): string => {
  if (!path) return "";

  // Return as-is if the path is already an absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Clean up slashes to avoid double slashes in final URL
  const trimmedBase = CONFIG_KEYS.API_BASE_URL.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");

  return `${trimmedBase}/${trimmedPath}`;
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formattedDate;
}

export const capitalizeFirstLetter = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

export function formatToINR(number: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

export function formatToUSD(number: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400); // 86400 seconds in a day
  const hours = Math.floor((seconds % 86400) / 3600); // 3600 seconds in an hour
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  return formattedTime;
};

