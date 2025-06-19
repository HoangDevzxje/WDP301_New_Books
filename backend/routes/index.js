const authRoutes = require("./authRoute");
const bookRoutes = require("./bookRoute");
const adminRoutes = require("./adminRoute");
const userRoutes = require("./userRoute");
const cartRoutes = require("./cartRoute");

const routes = (app) => {
  app.use("/auth", authRoutes);
  app.use("/book", bookRoutes);
  app.use("/admin", adminRoutes);
  app.use("/user", userRoutes);
  app.use("/cart", cartRoutes);
};

module.exports = routes;
