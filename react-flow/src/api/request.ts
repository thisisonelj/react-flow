import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, ApiError } from "../types/api";

/**
 * 请求配置
 */
const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * 创建axios实例
 */
const instance: AxiosInstance = axios.create(DEFAULT_CONFIG);

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳（防止缓存）
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    console.log(
      `[Request] ${config.method?.toUpperCase()} ${config.url}`,
      config,
    );
    return config;
  },
  (error: AxiosError) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    console.log(`[Response] ${response.config.url}`, data);

    // 业务状态码判断
    if (data.code !== 200 && data.code !== 0) {
      // 业务错误处理
      const error: ApiError = {
        code: data.code,
        message: data.message || "请求失败",
        details: data,
      };

      // 特定错误码处理
      handleBusinessError(error);
      return Promise.reject(error);
    }

    // 返回完整的AxiosResponse对象，保持类型一致
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    console.error("[Response Error]", error);

    // HTTP错误处理
    const apiError: ApiError = {
      code: error.response?.status || 500,
      message: getHttpErrorMessage(error),
      details: error.response?.data,
    };

    handleHttpError(apiError, error);
    return Promise.reject(apiError);
  },
);

/**
 * 获取HTTP错误信息
 */
function getHttpErrorMessage(error: AxiosError): string {
  if (error.code === "ECONNABORTED") {
    return "请求超时，请稍后重试";
  }

  if (!error.response) {
    return "网络连接失败，请检查网络";
  }

  const status = error.response.status;
  const messages: Record<number, string> = {
    400: "请求参数错误",
    401: "未授权，请重新登录",
    403: "拒绝访问",
    404: "请求资源不存在",
    405: "请求方法不允许",
    408: "请求超时",
    500: "服务器内部错误",
    502: "网关错误",
    503: "服务不可用",
    504: "网关超时",
  };

  return messages[status] || `请求失败 (${status})`;
}

/**
 * 处理业务错误
 */
function handleBusinessError(error: ApiError): void {
  switch (error.code) {
    case 401:
      // 未授权，清除token并跳转登录
      localStorage.removeItem("token");
      window.location.href = "/login";
      break;
    case 403:
      console.error("权限不足:", error.message);
      break;
    default:
      console.error("业务错误:", error.message);
  }
}

/**
 * 处理HTTP错误
 */
function handleHttpError(error: ApiError, axiosError: AxiosError): void {
  switch (error.code) {
    case 401:
      // 未授权，清除token并跳转登录
      localStorage.removeItem("token");
      window.location.href = "/login";
      break;
    case 403:
      console.error("权限不足:", error.message);
      break;
    case 404:
      console.error("资源不存在:", axiosError.config?.url);
      break;
    case 500:
      console.error("服务器错误:", error.message);
      break;
    default:
      console.error("HTTP错误:", error.message);
  }
}

/**
 * 请求方法封装
 */
const request = {
  /**
   * GET请求
   */
  get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return instance.get(url, { params, ...config }).then((res) => res.data);
  },

  /**
   * POST请求
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return instance.post(url, data, config).then((res) => res.data);
  },

  /**
   * PUT请求
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return instance.put(url, data, config).then((res) => res.data);
  },

  /**
   * PATCH请求
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return instance.patch(url, data, config).then((res) => res.data);
  },

  /**
   * DELETE请求
   */
  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return instance.delete(url, config).then((res) => res.data);
  },

  /**
   * 上传文件
   */
  upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return instance
      .post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(progress);
          }
        },
      })
      .then((res) => res.data);
  },

  /**
   * 下载文件
   */
  download(url: string, params?: any, filename?: string): Promise<void> {
    return instance
      .get(url, {
        params,
        responseType: "blob",
      })
      .then((response: any) => {
        const blob = new Blob([response]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download =
          filename || getFilenameFromResponse(response) || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      });
  },
};

/**
 * 从响应中获取文件名
 */
function getFilenameFromResponse(response: AxiosResponse): string | null {
  const contentDisposition = response.headers["content-disposition"];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].replace(/['"]/g, "");
    }
  }
  return null;
}

/**
 * 设置基础URL
 */
export const setBaseURL = (baseURL: string) => {
  instance.defaults.baseURL = baseURL;
};

/**
 * 设置请求头
 */
export const setHeader = (key: string, value: string) => {
  instance.defaults.headers.common[key] = value;
};

/**
 * 设置Token
 */
export const setToken = (token: string) => {
  localStorage.setItem("token", token);
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

/**
 * 清除Token
 */
export const clearToken = () => {
  localStorage.removeItem("token");
  delete instance.defaults.headers.common["Authorization"];
};

/**
 * 获取当前Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export default request;
