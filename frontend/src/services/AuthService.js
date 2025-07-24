import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL_BACKEND}`;

const AuthService = {
  googleAuth: async (token) => {
    const response = await axios.post(`${BASE_URL}/auth/google-auth`, { token });
    return response.data;
  },

  refreshAccessToken: async () => {
    const refreshToken =
      localStorage.getItem("refresh_token") ||
      sessionStorage.getItem("refresh_token");

    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;

      if (localStorage.getItem("refresh_token")) {
        localStorage.setItem("access_token", newAccessToken);
      } else {
        sessionStorage.setItem("access_token", newAccessToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error("Refresh token failed:", error);
      return null;
    }
  },

  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/account/login";
  },
};

export default AuthService;