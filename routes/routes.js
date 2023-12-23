const routes = require("express").Router();
const accountControllers = require("../controllers/account.controller");
const customerControllers = require("../controllers/customer.controller");
const orderControllers = require("../controllers/order.controller");
const productControllers = require("../controllers/product.controller");
const verifyToken = require("../config/jwt");
const cloudinary = require("../config/cloudinary");

//Account
routes.post("/account/register", accountControllers.register);

routes.post("/account/login", accountControllers.login);

routes.get("/account/authen", accountControllers.authen);

//customer
routes.get("/customer", verifyToken, customerControllers.allCustomer);

routes.get("/customer/:id", verifyToken, customerControllers.findCustomerById);

routes.put("/customer/edit", verifyToken, customerControllers.editCustomer);

routes.delete(
  "/customer/delete/:id",
  verifyToken,
  customerControllers.deleteCustomer
);

//favorite
routes.get(
  "/customer/favorite/:id",
  verifyToken,
  customerControllers.allFavoriteProduct
);

routes.post(
  "/customer/favorite/create",
  verifyToken,
  customerControllers.addFavorite
);

routes.delete(
  "/customer/favorite/delete",
  verifyToken,
  customerControllers.deleteFavorite
);

//order
routes.get("/order", verifyToken, orderControllers.allOrders);

routes.get("/order/:id", verifyToken, orderControllers.findOrderById);

routes.get(
  "/order/myOrder/:customerId",
  verifyToken,
  orderControllers.findMyOrder
);

routes.post("/order/purchase", verifyToken, orderControllers.purchaseProduct);

routes.put("/order/edit", verifyToken, orderControllers.editOrder);

routes.delete("/order/delete/:id", verifyToken, orderControllers.deleteOrder);

//product
routes.get("/product", verifyToken, productControllers.allProducts);

routes.get("/product/:id", verifyToken, productControllers.findProductById);

routes.post("/product/create", verifyToken, productControllers.createProduct);

routes.put("/product/edit", verifyToken, productControllers.editProduct);

routes.delete(
  "/product/delete/:id",
  verifyToken,
  productControllers.deleteProduct
);

//upload image
routes.post("/uploadImage", verifyToken, (req, res) => {
  cloudinary(req.body.image)
    .then((url) => res.send(url))
    .catch((err) => res.status(500).send(err));
});

module.exports = routes;
