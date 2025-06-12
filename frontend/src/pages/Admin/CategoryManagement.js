import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography
} from "@mui/material";
import axios from "axios";

const CategoryManagement = ({ open, onClose, categories, setCategories, mode, handleAlert, fetchCategories }) => {
    const [categoryName, setCategoryName] = useState("");
    const [editedName, setEditedName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [nameError, setNameError] = useState("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    useEffect(() => {
        if (mode === "edit" && selectedCategory) {
            const category = categories.find(cat => cat._id === selectedCategory);
            setEditedName(category?.name || "");
            setNameError("");
        }
    }, [selectedCategory, mode, categories]);

    // Reset form khi mở dialog
    useEffect(() => {
        if (open) {
            setCategoryName("");
            setEditedName("");
            setSelectedCategory("");
            setNameError("");
        }
    }, [open]);

    // Kiểm tra tên danh mục trùng lặp
    const checkDuplicateName = (name) => {
        return categories.some(category => 
            category.name.toLowerCase() === name.toLowerCase() && 
            (mode !== "edit" || category._id !== selectedCategory)
        );
    };

    // Validate tên danh mục
    const validateCategoryName = (name) => {
        if (!name.trim()) {
            return "Tên danh mục không được để trống";
        }
        
        if (name.trim().length < 2) {
            return "Tên danh mục phải có ít nhất 2 ký tự";
        }
        
        if (name.trim().length > 50) {
            return "Tên danh mục không được vượt quá 50 ký tự";
        }
        
        if (checkDuplicateName(name)) {
            return "Tên danh mục đã tồn tại";
        }
        
        return "";
    };

    // Xử lý thay đổi tên danh mục mới
    const handleCategoryNameChange = (e) => {
        const newName = e.target.value;
        setCategoryName(newName);
        setNameError(validateCategoryName(newName));
    };

    // Xử lý thay đổi tên danh mục đã chỉnh sửa
    const handleEditedNameChange = (e) => {
        const newName = e.target.value;
        setEditedName(newName);
        setNameError(validateCategoryName(newName));
    };

    const handleAddCategory = async () => {
        try {
            if (!token) {
                console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
                handleAlert("Không tìm thấy token, vui lòng đăng nhập lại.", "error");
                return;
            }
            
            const error = validateCategoryName(categoryName);
            if (error) {
                setNameError(error);
                return;
            }
            
            const response = await axios.post("http://localhost:9999/admin/categories", { name: categoryName.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCategoryName("");
            fetchCategories(); // Tải lại danh sách category
            handleAlert("Thêm danh mục thành công", "success");
            onClose();
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            handleAlert("Lỗi khi thêm danh mục: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const handleEditCategory = async () => {
        try {
            if (!token) {
                console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
                handleAlert("Không tìm thấy token, vui lòng đăng nhập lại.", "error");
                return;
            }
            
            if (!selectedCategory) {
                handleAlert("Vui lòng chọn danh mục cần sửa", "warning");
                return;
            }
            
            const error = validateCategoryName(editedName);
            if (error) {
                setNameError(error);
                return;
            }
            
            await axios.put(`http://localhost:9999/admin/categories/${selectedCategory}`, { name: editedName.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchCategories(); // Tải lại danh sách category
            handleAlert("Cập nhật danh mục thành công", "success");
            onClose();
        } catch (error) {
            console.error("Lỗi khi sửa danh mục:", error);
            handleAlert("Lỗi khi sửa danh mục: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const handleDeleteCategory = async () => {
        try {
            if (!token) {
                console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
                handleAlert("Không tìm thấy token, vui lòng đăng nhập lại.", "error");
                return;
            }
            
            if (!selectedCategory) {
                handleAlert("Vui lòng chọn danh mục cần xóa", "warning");
                return;
            }
            
            await axios.delete(`http://localhost:9999/admin/categories/${selectedCategory}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchCategories(); // Tải lại danh sách category
            handleAlert("Xóa danh mục thành công", "error");
            setSelectedCategory("");
            onClose();
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
            handleAlert("Lỗi khi xóa danh mục: " + (error.response?.data?.message || error.message), "error");
        }
    };

    // Reset form khi đóng dialog
    const handleDialogClose = () => {
        setCategoryName("");
        setEditedName("");
        setSelectedCategory("");
        setNameError("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {mode === "add" ? "Thêm danh mục" : mode === "edit" ? "Sửa danh mục" : "Xóa danh mục"}
            </DialogTitle>
            <DialogContent>
                {mode === "add" && (
                    <TextField 
                        fullWidth 
                        label="Tên danh mục" 
                        value={categoryName} 
                        onChange={handleCategoryNameChange} 
                        margin="dense"
                        error={!!nameError}
                        helperText={nameError}
                    />
                )}

                {mode === "edit" && (
                    <>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Chọn danh mục</InputLabel>
                            <Select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                label="Chọn danh mục"
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            fullWidth 
                            label="Tên mới" 
                            value={editedName} 
                            onChange={handleEditedNameChange} 
                            margin="dense"
                            error={!!nameError}
                            helperText={nameError}
                            disabled={!selectedCategory}
                        />
                    </>
                )}

                {mode === "delete" && (
                    <>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Chọn danh mục cần xóa</InputLabel>
                            <Select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                label="Chọn danh mục cần xóa"
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedCategory && (
                            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                                Cảnh báo: Xóa danh mục có thể ảnh hưởng đến các sách đã gán danh mục này.
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleDialogClose}>Hủy</Button>
                {mode === "add" && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleAddCategory}
                        disabled={!categoryName.trim() || !!nameError}
                    >
                        Thêm
                    </Button>
                )}
                {mode === "edit" && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleEditCategory}
                        disabled={!selectedCategory || !editedName.trim() || !!nameError}
                    >
                        Cập nhật
                    </Button>
                )}
                {mode === "delete" && (
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleDeleteCategory}
                        disabled={!selectedCategory}
                    >
                        Xóa
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CategoryManagement;