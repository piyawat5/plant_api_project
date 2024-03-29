const db = require("../config/mysql");

const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * @swagger
 * /order:
 *  get:
 *    summary: shopping bag and order of customer
 *    tags: [Order]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/OrderResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
exports.allOrders = (req, res) => {
  try {
    db.query("select * from order_customer", (err, orders) => {
      if (err) {
        return res.status(400).json({ ordersMsg: err });
      }
      return res.json(orders);
    });
  } catch (err) {}
};

/**
 * @swagger
 * /order/{id}:
 *  get:
 *    summary: Search order by id
 *    tags: [Order]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/OrderIdResponse'
 *      400:
 *        description: something wrong
 *      404:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.findOrderById = (req, res) => {
  const id = req.params.id;
  try {
    db.query(
      "select * from order_customer where id = ?",
      [id],
      (err, order) => {
        if (err) {
          res.status(400).json({ orderIdMsg: err });
          return;
        }

        db.query(
          "select * from order_detail where order_customer_id = ?",
          [id],
          (err, od) => {
            if (err) {
              res.status(400).json({ msg: err });
              return;
            }
            let getOd = [...od];
            db.query(
              "select id,category_id,name,stock,product.price,image,description from order_detail join product on product.id = order_detail.product_id where order_customer_id = ?",
              [id],
              (err, orderDetail) => {
                if (err) {
                  res.status(400).json({ msg: err });
                  return;
                }
                let newOrderDtail = getOd.map((item) => {
                  let { product_id, ...newItem } = item;
                  return {
                    ...newItem,
                    product: orderDetail.find((o) => o.id === product_id),
                  };
                });
                let data = {
                  ...order[0],
                  orderDetail: [...newOrderDtail],
                };
                res.json(data);
              }
            );
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

/**
 * @swagger
 * /order/myOrder/{customerId}:
 *  get:
 *    summary: find order for this customer
 *    tags: [Order]
 *    parameters:
 *      - in: path
 *        name: customerId
 *        schema:
 *          type: number
 *        required: true
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/OrderResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.findMyOrder = (req, res) => {
  const customerId = req.params.customerId;
  try {
    db.query(
      "select * from order_customer where customer_id = ? ",
      [customerId],
      (err, myOrder) => {
        if (err) {
          return res.status(400).json({ myOrderMsg: err });
        }
        res.json(myOrder);
      }
    );
  } catch (err) {}
};

/**
 * @swagger
 * /order/purchase:
 *  post:
 *    summary: Customer add some product to cart
 *    tags: [Order]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/PurchaseRequest'
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PurchaseResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.purchaseProduct = async (req, res) => {
  const { customer_id, product_id, quantity, price } = req.body;
  try {
    db.query(
      "select * from order_customer where customer_id = ? and order_status = ?",
      [customer_id, "CURRENT"],
      async (err, orderCustomer) => {
        if (err) {
          return res.status(400).json({ err1Msg: err });
        }
        // Check if there is an existing order for the customer
        if (orderCustomer.length > 0) {
          db.query(
            "select * from order_detail where order_customer_id = ? and product_id = ?",
            [orderCustomer[0].id, product_id],
            async (err, orderDetail) => {
              if (err) {
                return res.status(400).json({ err12Msg: err });
              }
              //Check existing order detail for this customer
              if (orderDetail.length > 0) {
                let result = orderDetail[0].quantity - quantity;
                db.query(
                  "select * from product where id = ?",
                  [product_id],
                  (err, product) => {
                    if (err) {
                      return res.status(400).json({ err112Msg: err });
                    }
                    let newStock = product[0].stock + result;
                    //Check stock product
                    if (newStock >= 0) {
                      db.query(
                        "update product set stock = ? where id = ?",
                        [newStock, product_id],
                        (err, updateProduct) => {
                          if (err) {
                            return res.status(400).json({ err113Msg: err });
                          }
                          db.query(
                            "update order_detail set quantity = ?, price = ? where order_customer_id = ? and product_id = ?",
                            [quantity, price, orderCustomer[0].id, product_id],
                            (err, updateOrderDetail) => {
                              if (err) {
                                return res.status(400).json({ err13Msg: err });
                              }
                              return res.json({
                                msg13: "Add to cart successfully!",
                              });
                            }
                          );
                        }
                      );
                      return;
                    }
                    return res.status(400).json({ msg: "Stock not enough" });
                  }
                );
                return;
              }
              db.query(
                "select * from product where id = ?",
                [product_id],
                (err, product) => {
                  if (err) {
                    return res.status(400).json({ err1111Msg: err });
                  }
                  let newStock2 = product[0].stock - quantity;
                  //Check stock product
                  if (newStock2 >= 0) {
                    db.query(
                      "update product set stock = ? where id = ?",
                      [newStock2, product[0].id],
                      (err, updateProduct) => {
                        if (err) {
                          return res
                            .status(400)
                            .json({ updateProductMsg: err });
                        }
                        // Add new order detail
                        db.query(
                          "insert into order_detail (order_customer_id,product_id,quantity,price) values(?,?,?,?)",
                          [orderCustomer[0].id, product_id, quantity, price],
                          (err, insertOrderDetail) => {
                            if (err) {
                              return res.status(400).json({ data14Msg: err });
                            }
                            return res.json({
                              msg14: "Add to cart successfully!",
                            });
                          }
                        );
                      }
                    );
                    return;
                  }
                  return res.status(400).json({
                    msgNotEnough: "Stock not enough",
                  });
                }
              );
            }
          );
          return;
        }
        // Create a new order for the customer

        await queryAsync(
          "insert into order_customer (customer_id,address,order_status) values(?,?,?)",
          [customer_id, "", "CURRENT"]
        );

        const findOrderCustomer = await queryAsync(
          "select * from order_customer where customer_id = ? and order_status = ?",
          [customer_id, "CURRENT"]
        );
        const product = await queryAsync("select * from product where id = ?", [
          product_id,
        ]);

        let result = product[0].stock - quantity;
        if (result >= 0) {
          db.query(
            "update product set stock = ? where id = ?",
            [result, product_id],
            (err, updateProduct) => {
              if (err) {
                return res.status(400).json({ data445Msg: err });
              }
              db.query(
                "insert into order_detail (order_customer_id,product_id,quantity,price) values(?,?,?,?)",
                [findOrderCustomer[0].id, product_id, quantity, price],
                (err, data4) => {
                  if (err) {
                    return res.status(400).json({ data4Msg: err });
                  }
                  return res.json({
                    msg4: "Add to cart Successfully!",
                  });
                }
              );
            }
          );
          return;
        }
        return res.status(400).json({ msg: "Stock not enough" });
      }
    );
  } catch (err) {
    return res.json({ catchErrMsg: err });
  }
};

/**
 * @swagger
 * /order/edit:
 *  put:
 *    summary: Admin edit status of customer order
 *    tags: [Order]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/EditOrderRequest'
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/EditOrderResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.editOrder = async (req, res) => {
  const { order_status, id, image = "" } = req.body;

  try {
    if (image) {
      await queryAsync(
        "update order_customer set order_status = ? ,image = ? where id = ?",
        [order_status, image, id]
      );
    } else {
      await queryAsync(
        "update order_customer set order_status = ? where id = ?",
        [order_status, id]
      );
    }

    res.json({ msg: "Edit successfully!" });
  } catch (err) {
    return res.status(500).json({ catchErrMsg: err });
  }
};

/**
 * @swagger
 * /order/delete/{id}?product_id={product_id}&quantity={quantity}:
 *  delete:
 *    summary: Customer delete order detail
 *    tags: [Order]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *      - in: query
 *        name: product_id
 *        schema:
 *          type: number
 *        required: true
 *      - in: query
 *        name: quantity
 *        schema:
 *          type: number
 *        required: true
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PurchaseDeleteResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.deleteOrderDetail = (req, res) => {
  const id = req.params.id;
  const { product_id, quantity } = req.query;
  try {
    db.query(
      "select * from product where id = ?",
      [+product_id],
      (err, product) => {
        if (err) {
          return res.status(400).json({ msg: err });
        }
        //Add stock
        let newStock = product[0].stock + Number(quantity);
        db.query(
          "update product set stock = ? where id = ?",
          [newStock, product[0].id],
          (err, update) => {
            if (err) {
              return res.status(400).json({ msg: err });
            }
            //delete order detail
            db.query(
              "delete from order_detail where order_customer_id = ? and product_id = ?",
              [id, product[0].id],
              (err, data) => {
                if (err) {
                  return res.status(400).json({ msg: err });
                }
                return res.json({ msg: "Delete product successfully!" });
              }
            );
          }
        );
      }
    );
  } catch (err) {}
};

/**
 * @swagger
 * /order/deleteOrder/{id}:
 *  delete:
 *    summary: delete order
 *    tags: [Order]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PurchaseDeleteResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.deleteOrder = async (req, res) => {
  const id = req.params.id;
  try {
    await queryAsync("delete from order_detail where order_customer_id = ?", [
      id,
    ]);
    await queryAsync("delete from order_customer where id = ?", [id]);

    res.json({ msg: "Delete order successfully" });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};
/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order customer API
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    OrderResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        customer_id:
 *          type: number
 *        address:
 *          type: string
 *        order_status:
 *          type: string
 *    OrderIdResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        customer_id:
 *          type: number
 *        address:
 *          type: string
 *        image:
 *          type: string
 *        order_status:
 *          type: string
 *        orderDetail:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/OrderDetailDTO'
 *    OrderDetailDTO:
 *      type: object
 *      properties:
 *        order_customer_id:
 *          type: number
 *        product:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *            category_id:
 *              type: number
 *            name:
 *              type: string
 *            stock:
 *              type: number
 *            price:
 *              type: number
 *            image:
 *              type: string
 *        quantity:
 *          type: number
 *        price:
 *          type: number
 *    PurchaseRequest:
 *      type: object
 *      required:
 *        -customer_id
 *        -product_id
 *        -quantity
 *        -price
 *      properties:
 *        customer_id:
 *          type: number
 *        product_id:
 *          type: number
 *        quantity:
 *          type: number
 *        price:
 *          type: number
 *    PurchaseResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 *    EditOrderRequest:
 *      type: object
 *      required:
 *        -id
 *        -order_status
 *      properties:
 *        id:
 *          type: number
 *        order_status:
 *          type: string
 *        image:
 *          type: string
 *    EditOrderResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 *    PurchaseDeleteResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 */
