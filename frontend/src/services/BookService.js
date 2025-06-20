import axiosInstance from "../utils/axiosInstance";

const BookService = {
  getBooks: () => {
    return axiosInstance.get("/book/");
  },
};

export default BookService;
