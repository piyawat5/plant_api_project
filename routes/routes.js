const routes = require("express").Router();

//Account
routes.post("/register", (req, res) => {});
routes.post("/login", (req, res) => {});

//customer
routes.get("/customers", (req, res) => {});
routes.get("/customer/:id", (req, res) => {});
routes.post("/customer/create", (req, res) => {});
routes.put("/customer/edit", (req, res) => {});
routes.delete("/customer/delete/:id", (req, res) => {});

//order
routes.get("/orders", (req, res) => {});
routes.get("/order/:id", (req, res) => {});
routes.post("/order/create", (req, res) => {});
routes.put("/order/edit", (req, res) => {});
routes.delete("/order/delete/:id", (req, res) => {});

//product
routes.get("/products", (req, res) => {});
routes.get("/product/:id", (req, res) => {});
routes.post("/product/create", (req, res) => {});
routes.put("/product/edit", (req, res) => {});
routes.delete("/product/delete/:id", (req, res) => {});

module.exports = routes;
