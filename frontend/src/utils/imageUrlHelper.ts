const getBackendBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return envUrl || "http://localhost:3001";
};
export function buildImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const baseUrl = getBackendBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
export function buildPublicImageUrl(filename?: string | null): string | undefined {
  if (!filename) return undefined;
  return buildImageUrl(`/public/assets/digital-solution-images/${filename}`);
}
