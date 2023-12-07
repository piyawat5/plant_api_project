const db = require("../config/mysql");

exports.allProducts = (req, res) => {
  try {
    db.query("select * from product", (err, product) => {
      if (err) {
        res.status(404).json(err);
        return;
      }

      return res.json(product);
    });
  } catch (error) {}
};

exports.findProductById = (req, res) => {
  const id = req.params.id;
  try {
    db.query("select * from product where id = ?", [id], (err, product) => {
      if (err) {
        return res.status(400).json({ ProductIdmsg: err });
      }
      res.json(product[0]);
    });
  } catch (err) {}
};

exports.editProduct = (req, res) => {
  const { id, category_id, name, stock, price, image, description } = req.body;
  try {
    db.query(
      "update product set name=?,stock=?,price=?,image=?,description=? where id=?",
      [id, category_id, name, stock, price, image, description],
      (err, product) => {
        if (err) {
          return res.status(400).json({ editMsg: err });
        }
        return res.json({ msg: "Edit product successfully!" });
      }
    );
  } catch (err) {}
};

exports.createProduct = (req, res) => {
  const { category_id, name, stock, price, image, description } = req.body;
  try {
    db.query(
      "insert into product (category_id,name,stock,price,image,description) values(?,?,?,?,?,?)",
      [category_id, name, stock, price, image, description],
      (err, product) => {
        if (err) {
          return res.status(400).json({ createMsg: err });
        }
        return res.json({ msg: "Create product successfully!" });
      }
    );
  } catch (err) {}
};

exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  try {
    db.query(
      "delete from order_detail where product_id = ?",
      [id],
      (err, deleteOrderDetail) => {
        if (err) {
          return res.status(400).json({ deleteOrderDetailMsg: err });
        }
        db.query(
          "delete from product where id =?",
          [id],
          (err, deleteProduct) => {
            if (err) {
              return res.status(400).json({ deleteProductMsg: err });
            }
            return res.json({ msg: "Delete product successfully!" });
          }
        );
      }
    );
  } catch (err) {}
};
