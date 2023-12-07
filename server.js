const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const app = express();

//Middlewares
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(cors());

//routes
app.use(routes);

const port = 3100;

app.listen(port, () => {
  console.log(`listen port: ${port}`);
});
