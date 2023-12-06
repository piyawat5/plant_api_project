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
  } catch (err) {}
};

exports.findMyOrder = (req, res) => {
  const customerId = req.params.customerId;
  try {
    db.query(
      "select * from order_customer where id = ?",
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

exports.purchaseProduct = (req, res) => {
  const { customer_id, product_id, quantity, price } = req.body;
  try {
    db.query(
      "select * from order_customer where customer_id = ? and order_status = ?",
      [customer_id, "CURRENT"],
      (err, data1) => {
        if (err) {
          return res.status(400).json({ data1Msg: err });
        }
        //Check order customer
        if (data1.length > 0) {
          db.query(
            "select * from order_detail where order_customer_id = ? and product_id = ?",
            [data1[0].id, product_id],
            (err, data12) => {
              if (err) {
                return res.status(400).json({ data12Msg: err });
              }
              //Check order detail
              if (data12.length > 0) {
                db.query(
                  "update order_detail set quantity = ?",
                  [quantity],
                  (err, data13) => {
                    if (err) {
                      return res.status(400).json({ data13Msg: err });
                    }
                    return res.json({ msg13: "Add to cart successfully!" });
                  }
                );
                return;
              }
              db.query(
                "insert into order_detail (order_customer_id,product_id,quantity,price) values(?,?,?,?)",
                [data1[0].id, product_id, quantity, price],
                (err, data11) => {
                  if (err) {
                    return res.status(400).json({ data14Msg: err });
                  }
                  return res.json({ msg14: "Add to cart successfully!" });
                }
              );
            }
          );
          return;
        }
        db.query(
          "insert into order_customer (customer_id,address,order_status) values(?,?,?)",
          [customer_id, "", "CURRENT"],
          (err, data2) => {
            if (err) {
              return res.status(400).json({ data2Msg: err });
            }
            db.query(
              "select * from order_customer where customer_id = ?",
              [customer_id],
              (err, data3) => {
                if (err) {
                  return res.status(400).json({ data3Msg: err });
                }
                db.query(
                  "insert into order_detail (order_customer_id,product_id,quantity,price) values(?,?,?,?)",
                  [data3[0].id, product_id, quantity, price],
                  (err, data4) => {
                    if (err) {
                      return res.status(400).json({ data4Msg: err });
                    }
                    return res.json({ msg4: "Add to cart Successfully!" });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (err) {}
};

exports.deleteOrder = (req, res) => {
  const id = req.params.id;
  const { product_id } = req.body;
  try {
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
  } catch (err) {}
};
