const db = require("../config/mysql");

exports.allCustomer = (req, res) => {
  try {
    db.query("select * from customer", (err, customer) => {
      if (err) {
        res.status(400).json({ allCustomerMsg: err });
        return;
      }
      res.json(customer);
    });
  } catch (err) {}
};

exports.findCustomerById = (req, res) => {
  const id = req.params.id;
  try {
    db.query("select * from customer where id = ?", [id], (err, customer) => {
      if (err) {
        res.status(404).json({ customerIdMsg: err });
        return;
      }
      res.json(customer[0]);
    });
  } catch (err) {}
};

exports.editCustomer = (req, res) => {
  const { id, account_id, address, fname, lname, email, image } = req.body;
  try {
    db.query(
      "update customer set address = ?,fname = ?,lname = ?,email=?,image =? where id = ? and account_id = ?",
      [address, fname, lname, email, image, id, account_id],
      (err, customer) => {
        if (err) {
          res.status(409).json({ editMsg: err });
          return;
        }
        return res.json({ msg: "Edit customer successfully!!" });
      }
    );
  } catch (err) {
    res.status(500).json({ err });
  }
};

exports.deleteCustomer = (req, res) => {
  const id = req.params.id;
  try {
    db.query("select * from customer where id = ?", [id], (err, customer) => {
      if (err) {
        return res.json({ customerMsg: err });
      }
      db.query(
        "select * from account where id = ?",
        [customer[0].account_id],
        (err, account) => {
          if (err) {
            return res.json({ accountMsg: err });
          }
          db.query(
            "delete from customer where id = ?",
            [id],
            (err, deleteCustomer) => {
              if (err) {
                res.status(400).json({ deleteCustomerMsg: err });
                return;
              }
              db.query(
                "delete from account where id =?",
                [account[0].id],
                (err, deleteAccount) => {
                  if (err) {
                    res.status(400).json({ deleteAccountMsg: err });
                    return;
                  }
                  res.json({ msg: "Delete successfully!" });
                }
              );
            }
          );
        }
      );
    });
  } catch (err) {}
};

exports.allFavoriteProduct = (req, res) => {
  const id = req.params.id;
  try {
    db.query("select * from favorite where id ?", [id], (err, favorite) => {
      if (err) {
        return res.status(400).json({ favoriteMsg: err });
      }
      res.json(favorite);
    });
  } catch (error) {}
};

exports.addFavorite = (req, res) => {
  const { product_id, customer_id } = req.body;
  try {
    db.query(
      "insert into favorite values(?,?)",
      [product_id, customer_id],
      (err, favorite) => {
        if (err) {
          return res.status(400).json({ favoriteMsg: err });
        }
        res.json({ addFavoriteMsg: "Add favorite successfully!" });
      }
    );
  } catch (error) {}
};

exports.deleteFavorite = (req, res) => {
  const { product_id, customer_id } = req.body;
  try {
    db.query(
      "delete from favorite where product_id = ? and customer_id = ?",
      [product_id, customer_id],
      (err, favorite) => {
        if (err) {
          return res.status(400).json({ favoriteMsg: err });
        }
        res.json({ deleteMsg: "Delete favorite successfully!" });
      }
    );
  } catch (error) {}
};
