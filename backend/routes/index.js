const authRoutes = require('./authRoute')
const bookRoutes = require('./bookRoute')

const routes = (app) => {
    app.use('/auth', authRoutes)
    app.use('/book', bookRoutes)
}

module.exports = routes