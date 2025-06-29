
// Lấy danh sách địa chỉ của người dùng
const getMyAddresses = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({ addresses: user.address });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Thêm địa chỉ mới
const addAddress = async (req, res) => {
    try {
        const { address, provinceName, districtName, wardName, isDefault } = req.body;
        const user = req.user;

        // Tạo địa chỉ mới
        const newAddress = {
            address,
            provinceName,
            districtName,
            wardName,
            isDefault: isDefault || false
        };

        user.address.push(newAddress);
        await user.save();

        res.status(200).json({ message: "Đã thêm địa chỉ mới!", addresses: user.address });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Cập nhật địa chỉ
const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { address, provinceName, districtName, wardName, isDefault } = req.body;
        const user = req.user;

        // Tìm địa chỉ cần cập nhật
        const addressToUpdate = user.address.find(addr => addr._id.toString() === addressId);
        if (!addressToUpdate) {
            return res.status(404).json({ message: "Địa chỉ không tồn tại!" });
        }

        // Cập nhật thông tin địa chỉ
        addressToUpdate.address = address || addressToUpdate.address;
        addressToUpdate.provinceName = provinceName || addressToUpdate.provinceName;
        addressToUpdate.districtName = districtName || addressToUpdate.districtName;
        addressToUpdate.wardName = wardName || addressToUpdate.wardName;
        if (isDefault !== undefined) {
            addressToUpdate.isDefault = isDefault;
        }

        await user.save();

        res.status(200).json({ message: "Đã cập nhật địa chỉ!", addresses: user.address });
    } catch (error) {
        res.status(500).json({ message: "愿意 server!", error: error.message });
    }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = req.user;

        // Kiểm tra địa chỉ có tồn tại không
        const addressExists = user.address.find(addr => addr._id.toString() === addressId);
        if (!addressExists) {
            return res.status(404).json({ message: "Địa chỉ không tồn tại!" });
        }

        // Loại bỏ địa chỉ
        user.address = user.address.filter(addr => addr._id.toString() !== addressId);
        await user.save();

        res.status(200).json({ message: "Đã xóa địa chỉ!", addresses: user.address });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Đặt địa chỉ làm mặc định
const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = req.user;

        // Kiểm tra địa chỉ có tồn tại không
        const addressToSetDefault = user.address.find(addr => addr._id.toString() === addressId);
        if (!addressToSetDefault) {
            return res.status(404).json({ message: "Địa chỉ không tồn tại!" });
        }

        // Đặt tất cả địa chỉ thành không mặc định, trừ địa chỉ được chọn
        user.address.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();

        res.status(200).json({ message: "Đã đặt địa chỉ làm mặc định!", addresses: user.address });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = {
    getMyAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};