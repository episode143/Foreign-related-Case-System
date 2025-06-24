import instance from "../utils/request";
import { path } from "./path";
const login = async (Credential)=>{
    try{
        const response = await instance.post(path.login, Credential);
        return response;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}
const api = {
    login,
};
export default api;