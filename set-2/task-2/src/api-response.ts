export interface ApiSuccessResponse<T> {
    success: true;
    statusCode: number;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    error: {
        message: string;
        code?: string;
        details?: unknown;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[]> & {
    pagination: PaginationMeta;
};

interface SuccessOptions {
    statusCode?: number;
    message?: string;
}

interface ErrorOptions {
    statusCode?: number;
    code?: string;
    details?: unknown;
}

export function successResponse<T>(data: T, options: SuccessOptions = {}): ApiSuccessResponse<T> {
    return {
        success: true,
        statusCode: options.statusCode ?? 200,
        data,
        ...(options.message !== undefined ? { message: options.message } : {}),
    };
}

export function paginatedResponse<T>(
    items: T[],
    pagination: PaginationMeta,
    options: SuccessOptions = {}
): ApiPaginatedResponse<T> {
    return {
        ...successResponse(items, options),
        pagination,
    };
}

export function errorResponse(message: string, options: ErrorOptions = {}): ApiErrorResponse {
    return {
        success: false,
        statusCode: options.statusCode ?? 500,
        error: {
            message,
            ...(options.code !== undefined ? { code: options.code } : {}),
            ...(options.details !== undefined ? { details: options.details } : {}),
        },
    };
}

export function isSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success;
}

export function isError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
    return !response.success;
}

export function unwrapOrThrow<T>(response: ApiResponse<T>): T {
    if (isError(response)) {
        throw new Error(`[${response.statusCode}] ${response.error.message}`);
    }

    return response.data;
}
