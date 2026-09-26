export class ApiError extends Error {
  constructor(
    message: string,
    public fieldErrors: { field: string; message: string }[] = [],
    public status = 0,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/club/${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      signal: options.signal ?? AbortSignal.timeout(12000),
    });
  } catch {
    throw new ApiError(
      "Bağlantı kurulamadı. Lütfen tekrar dene; bilgilerin formda korunuyor.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.message || "İşlem tamamlanamadı. Lütfen tekrar dene.",
      data.fieldErrors || [],
      response.status,
    );
  return data as T;
}
