import instance from "../utils/request";
import { paths } from "./path";
// 登录
const login = async (Credential) => {
  try {
    const response = await instance.get(paths.login, Credential);
    console.log("Login response:", response);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// 注册
const register = async (Credential) => {
  try {
    const response = await instance.get(paths.register, Credential);
    console.log("Register response:", response);
    return response;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

// 获取收藏案例列表
const getCollectionList = async (Credential) => {
  try {
    const response = await instance.get(paths.collectionList, Credential);
    console.log("Collection List response:", response);
    return response;
  } catch (error) {
    console.error("Get Collection List failed:", error);
    throw error;
  }
};

// 案件搜索
const searchCases = async (params) => {
  try {
    const response = await instance.get(paths.searchCases, params);
    console.log("Search Cases response:", response);
    return response;
  } catch (error) {
    console.error("Search Cases failed:", error);
    throw error;
  }
};

// 获取案件ai生成总结
const getCaseSummary = async (params) => {
  try {
    const response = await instance.get(paths.getCaseSummary, params);
    console.log("Case Summary response:", response);
    return response;
  } catch (error) {
    console.error("Get Case Summary failed:", error);
    throw error;
  }
};

// 收藏案件
const favoriteCase = async (params) => {
  try {
    const response = await instance.post(paths.favoriteCase, params);
    console.log("Favorite Case response:", response);
    return response;
  } catch (error) {
    console.error("Favorite Case failed:", error);
    throw error;
  }
};

// 取消收藏
const cancelFavoriteCase = async (params) => {
  try {
    const response = await instance.delete(paths.cancelFavoriteCase, params);
    console.log("Cancel Favorite Case response:", response);
    return response;
  } catch (error) {
    console.error("Cancel Favorite Case failed:", error);
    throw error;
  }
};

// 获取收藏案件列表
const getFavoriteCases = async (params) => {
  try {
    const response = await instance.get(paths.getFavoriteCases, params);
    console.log("Get Favorite Cases response:", response);
    return response;
  }
  catch (error) {
    console.error("Get Favorite Cases failed:", error);
    throw error;
  }
}

// 获取历史浏览案件列表
const getHistoryCases = async (params) => {
  try {
    const response = await instance.get(paths.getHistoryCases, params);
    console.log("Get History Cases response:", response);
    return response;
  } catch (error) {
    console.error("Get History Cases failed:", error);
    throw error;
  }
};
const api = {
  login,
  register,
  getCollectionList,
  searchCases,
  getCaseSummary,
  favoriteCase,
  cancelFavoriteCase,
  getFavoriteCases,
  getHistoryCases,
};
export default api;
