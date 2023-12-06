const db = require("../config/mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = (req, res) => {
  const { email, password, fname, lname, dateOfBirth } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    try {
      db.query(
        "insert into account (email,password,fname,lname,dateOfBirth) values(?,?,?,?,?)",
        [email, hash, fname, lname, dateOfBirth],
        (err, createAccountRes) => {
          if (err) {
            res.status(409).json({ messageInsertAccount: err });
            return;
          }

          db.query(
            "select * from account where email = ?",
            [email],
            (err, accountRes) => {
              if (err) {
                return res.json({ selectAccountMsg: err });
              }
              db.query(
                "insert into customer (account_id,address,fname,lname,email,image) values(?,?,?,?,?,?)",
                [accountRes[0].id, "", fname, lname, email, ""],
                (err, createCustomerRes) => {
                  if (err) {
                    return res.status(409).json({ messageCreateCustomer: err });
                  }

                  return res.json({ message: "Create account successfully!" });
                }
              );
            }
          );
          return;
        }
      );
    } catch (err) {
      res.status(500).json({ message: err });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  try {
    db.query(
      "select * from account where email = ?",
      [email],
      (err, loginRes) => {
        if (err) {
          res.status(400).json({ loginMessage: err });
          return;
        }
        if (loginRes.length === 0) {
          res.status(404).json({ loginMessage: "user not found" });
          return;
        }
        bcrypt.compare(password, loginRes[0].password, (err, isLogin) => {
          if (err) {
            res.status(404).json({ messageComparePassword: err });
            return;
          }
          const { password, ...newObject } = loginRes[0];
          const token = jwt.sign(
            {
              id: newObject.id,
              email: newObject.email,
              fname: newObject.fname,
              lname: newObject.lname,
              dateOfBirth: newObject.dateOfBirth,
            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
          );
          res.json({ token });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.authen = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(401).json();
        return;
      }
      res.json(decoded);
    });
  } catch (err) {
    res.status(404).json({ message: err });
  }
};
