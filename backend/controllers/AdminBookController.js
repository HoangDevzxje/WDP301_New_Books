const Book = require("../models/Book");
const Category = require("../models/Category");

// Lấy danh sách tất cả sách
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("categories");
    res.status(200).json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sách", error: error.message });
  }
};

// Lấy thông tin một sách theo ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("categories");
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy sách", error: error.message });
  }
};

// Thêm sách mới với upload ảnh
exports.createBook = async (req, res) => {
  try {
    const { title, author, categories } = req.body;
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    if (!title || !author) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập tiêu đề và tác giả." });
    }
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn ít nhất một danh mục." });
    }

    const imageUrls = req.files?.map((file) => file.path) || [];

    const newBook = new Book({
      ...req.body,
      categories: JSON.parse(req.body.categories), // nếu gửi từ form-data dạng chuỗi JSON
      images: imageUrls,
    });

    await newBook.save();
    res.status(201).json({ message: "Sách đã được tạo", newBook });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo sách", error: error.message });
  }
};

// Cập nhật sách (thay ảnh nếu có upload mới)
exports.updateBook = async (req, res) => {
  try {
    const { title, author, categories } = req.body;

    if (
      categories &&
      !Array.isArray(categories) &&
      typeof categories !== "string"
    ) {
      return res.status(400).json({ message: "Danh mục không hợp lệ." });
    }

    const imageUrls = req.files?.map((file) => file.path) || [];

    const updateData = {
      ...req.body,
      categories: categories ? JSON.parse(categories) : undefined,
    };

    // Nếu có ảnh mới, thay thế ảnh cũ
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedBook)
      return res.status(404).json({ message: "Không tìm thấy sách" });

    res.status(200).json({ message: "Sách đã được cập nhật", updatedBook });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sách", error: error.message });
  }
};

// Xóa sách theo ID
exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook)
      return res.status(404).json({ message: "Không tìm thấy sách" });
    res.status(200).json({ message: "Sách đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sách", error: error.message });
  }
};

// Quản lý danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh mục", error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc." });
    }

    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json({ message: "Danh mục đã được tạo", newCategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo danh mục", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      return res
        .status(400)
        .json({ message: "Tên danh mục không được để trống." });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res
      .status(200)
      .json({ message: "Danh mục đã được cập nhật", updatedCategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật danh mục", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.status(200).json({ message: "Danh mục đã được xóa" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa danh mục", error: error.message });
  }
};
