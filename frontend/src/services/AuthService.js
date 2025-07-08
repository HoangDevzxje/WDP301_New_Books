import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL_BACKEND}`
const AuthService = {
    googleAuth: async (token) => {
        const response = await axios.post(`${BASE_URL}/auth/google-auth`, { token });
        return response.data;
    }
};

export default AuthService;