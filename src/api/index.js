import instance from "../utils/request";
import { paths } from "./path";
const login = async (Credential) => {
  try {
    const response = await instance.post(paths.login, Credential);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const register = async (Credential) => {
  try {
    const response = await instance.post(paths.register, Credential);
    return response;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};
const api = {
  login,
  register,
};
export default api;
