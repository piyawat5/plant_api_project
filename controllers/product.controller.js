const db = require("../config/mysql");

exports.allProducts = (req, res) => {
  try {
    db.query("select * from product", (err, product) => {
      if (err) {
        res.status(404).json(err);
        return;
      }

      return res.json({ message: "hi brooo" });
    });
  } catch (error) {}
};

exports.findProductById = (req, res) => {
  return res.json({});
};

exports.editProduct = (req, res) => {
  return res.json({});
};

exports.createProduct = (req, res) => {
  return res.json({});
};

exports.deleteProduct = (req, res) => {
  return res.json({});
};
