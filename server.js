require("dotenv").config();

const app = require("./app");
const connectToDB = require("./src/config/database");

connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});