const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger");

//Middlewares
app.use(express.json({ limit: "100000mb" }));
app.use(express.urlencoded({ limit: "100000mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// app.use(cors());

//routes
app.use(routes);

//swagger
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = 3100;

app.listen(port, () => {
  console.log(`listen port: ${port}`);
});
