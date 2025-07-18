export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export class ApiResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Success'
    };
  }

  static error<T>(code: number, message: string, data?: T): ApiResponse<T> {
    return {
      success: false,
      data,
      message,
      code
    };
  }
} 