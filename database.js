const mongoose = require('mongoose')
// Removes mongoose 7 warning about `strictQuery` option being switched back to `false` by default in Mongoose 7 release
mongoose.set('strictQuery', true);

// Function that is exported; connects to DB with db_string from env variables
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB
