const Book = require("../models/Book");
const Category = require("../models/Category");

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({ isActivated: true });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy sách", error: error.message });
    }
}

const getBookByCategory = async (req, res) => {
    try {
        const books = await Book.find({ categories: req.params.id });
        if (books.length === 0) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const getDiscountedBooks = async (req, res) => {
    try {
        const books = await Book.find({
            isActivated: true,
            $expr: { $lt: ["$price", "$originalPrice"] }
        });
        if (books.length === 0) return res.status(404).json({ message: "Không tìm thấy sách đang giảm giá" });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const getNewBooks = async (req, res) => {
    try {
        const books = await Book.find({ isActivated: true, isNewRelease: true });
        if (books.length === 0) return res.status(404).json({ message: "Không tìm thấy sách mới" });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};
const getBookByAuthor = async (req, res) => {
    try {
        const { author } = req.params;
        const books = await Book.find({ author: author });
        if (books.length === 0) return res.status(404).json({ message: "Không tìm thấy sách của tác giả này" });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
}

const getBookByPublisher = async (req, res) => {
    try {
        const { publisher } = req.params;
        const books = await Book.find({ publisher });
        if (books.length === 0) return res.status(404).json({ message: "Không tìm thấy sách của nhà xuất bản này" });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
}

module.exports = {
    getAllBooks,
    getBookById,
    getBookByCategory,
    getDiscountedBooks,
    getNewBooks,
    getBookByAuthor,
    getBookByPublisher
}