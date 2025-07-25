import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL_BACKEND}`;

const AuthService = {
  googleAuth: async (token) => {
    const response = await axios.post(`${BASE_URL}/auth/google-auth`, { token }, {
      withCredentials: true
    });
    return response.data;
  },

  refreshAccessToken: async () => {
    const response = await axios.post(`${BASE_URL}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });
    return response.data;
  },

  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/account/login";
  },
};

export default AuthService;