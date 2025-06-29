const Book = require("../models/Book");
const User = require("../models/User");
// profile

const getMyProfile = async (req, res) => {
    try {
        const user = req?.user;
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// wishlist
const addBookToWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = req.user;

        // Kiểm tra sách có tồn tại không
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Sách không tồn tại!" });
        }

        // Kiểm tra nếu sách đã có trong wishlist
        if (user.wishlist.includes(bookId)) {
            return res.status(400).json({ message: "Sách đã có trong wishlist!" });
        }

        // Thêm sách vào wishlist
        user.wishlist.push(bookId);
        await user.save();

        res
            .status(200)
            .json({ message: "Đã thêm sách vào wishlist!", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const deleteBookFromWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = req.user;

        // Kiểm tra nếu sách không có trong wishlist
        if (!user.wishlist.includes(bookId)) {
            return res.status(400).json({ message: "Sách không có trong wishlist!" });
        }

        // Loại bỏ sách khỏi wishlist
        user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
        await user.save();

        res
            .status(200)
            .json({ message: "Đã xóa sách khỏi wishlist!", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const getMyWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");

        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const userController = {
    getMyProfile,
    addBookToWishlist,
    deleteBookFromWishlist,
    getMyWishlist,
};
module.exports = userController;
