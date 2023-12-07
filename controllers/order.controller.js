const db = require("../config/mysql");

exports.allOrders = (req, res) => {
  try {
    db.query("select * from order", (err, orders) => {
      if (err) {
        return res.status(400).json({ ordersMsg: err });
      }
      return res.json(orders);
    });
  } catch (err) {}
};

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
          [order[0].id],
          (err, orderDetail) => {
            if (err) {
              return res.status(404).json({ orderDetailMsg: err });
            }
            let data = {
              order: order[0],
              orderDetail: [...orderDetail],
            };
            res.json(data);
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

exports.findMyOrder = (req, res) => {
  const customerId = req.params.customerId;
  try {
    db.query(
      "select * from order_customer where customer_id = ?",
      [customerId],
      (err, myOrder) => {
        if (err) {
          return res.status(404).json({ myOrderMsg: err });
        }
        res.json(myOrder);
      }
    );
  } catch (err) {}
};

exports.purchaseProduct = async (req, res) => {
  const { customer_id, product_id, quantity, price } = req.body;
  try {
    db.query(
      "select * from order_customer where customer_id = ? and order_status = ?",
      [customer_id, "CURRENT"],
      (err, orderCustomer) => {
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
                            "update order_detail set quantity = ? where order_customer_id = ? and product_id = ?",
                            [quantity, orderCustomer[0].id, product_id],
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
        db.query(
          "insert into order_customer (customer_id,address,order_status) values(?,?,?)",
          [customer_id, "", "CURRENT"],
          (err, insertOrderCustomer) => {
            if (err) {
              return res.status(400).json({ data2Msg: err });
            }
            db.query(
              "select * from order_customer where customer_id = ?",
              [customer_id],
              (err, orderCustomer) => {
                if (err) {
                  return res.status(400).json({ data3Msg: err });
                }
                db.query(
                  "select * from product where id = ?",
                  [product_id],
                  (err, product) => {
                    if (err) {
                      return res.status(400).json({ data44Msg: err });
                    }
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
                            [orderCustomer[0].id, product_id, quantity, price],
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
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (err) {
    return res.json({ catchErrMsg: err });
  }
};

exports.deleteOrder = (req, res) => {
  const id = req.params.id;
  const { order_customer_id, product_id, quantity, price } = req.body;
  try {
    db.query(
      "select * from product where id = ?",
      [product_id],
      (err, product) => {
        if (err) {
          return res.status(400).json({ msg: err });
        }

        //Add stock
        let newStock = product[0].stock + quantity;
        db.query(
          "update product set stock = ? where id = ?",
          [newStock, product_id],
          (err, update) => {
            if (err) {
              return res.status(400).json({ msg: err });
            }

            //delete order detail
            db.query(
              "delete from order_detail where order_customer_id = ? and product_id",
              [id, product_id],
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
