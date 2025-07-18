import axios from "axios";
const BASE_URL = `${process.env.REACT_APP_API_URL_BACKEND}`
export const chatBot = async (data) => {
    const res = await axios.post(
        `${BASE_URL}/chatbot/suggest`,
        data,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return res.data;
};
export const upLoadImage = async (data) => {
    const res = await axios.post(
        `${BASE_URL}/chatbot/upload-image-suggest`,
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return res.data;
};