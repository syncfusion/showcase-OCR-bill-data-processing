
export function basePath(): string {
  return 'https://ocr-bill-data-processing-staging-api-ajhjdzh6f8h0f6e3.westus2-01.azurewebsites.net/aspnet-core-ocr-bill-data-processing';
}

export function apiUrl(path: string): string {
  return basePath() + path;
}
