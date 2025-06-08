const authRoutes = require("./authRoute");
const bookRoutes = require("./bookRoute");
const adminRoutes = require("./adminRoute");

const routes = (app) => {
  app.use("/auth", authRoutes);
  app.use("/book", bookRoutes);
  app.use("/admin", adminRoutes);
};

module.exports = routes;
