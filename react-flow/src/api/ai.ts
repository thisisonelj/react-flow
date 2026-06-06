/**
 * langchain相关API
 */

import request from "./request";
import type { ApiResponse, PageParams, PageResponse } from "../types/api";

/**
 * 测试参数
 */
export interface AiModel {
  id: string;
  [prop: string]: any;
}

/**
 * langchain模型查询参数
 */
export interface AiModelListParams extends PageParams {
  id?: string;
}

/**
 * langchain chat聊天参数
 */
export interface ChatParams {
  message: string;
}

/**
 * langchain API服务
 */
export const aiApi = {
  /**
   * 测试接口
   */
  getModelList: (
    params: AiModelListParams,
  ): Promise<ApiResponse<PageResponse<AiModel>>> => {
    return request.post("/test", params);
  },

  /**
   * 获取langchain基础智能体
   */
  getBasicAgent: (
    params: ChatParams,
  ): Promise<ApiResponse<PageResponse<AiModel>>> => {
    return request.post("/agent/chat", params);
  },
};
