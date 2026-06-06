/**
 * API通用类型定义
 */

// API响应通用结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

// 分页请求参数
export interface PageParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 请求配置
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// 错误响应
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}
