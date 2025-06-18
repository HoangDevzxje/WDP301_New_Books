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


const userController = {
    getMyProfile,
};
module.exports = userController;
