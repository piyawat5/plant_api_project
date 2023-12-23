const db = require("../config/mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @swagger
 * /account/register:
 *  post:
 *    summary: Create new accout
 *    tags: [Account]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RegisterRequest'
 *    responses:
 *      201:
 *        description: The account was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RegisterResponse'
 *      409:
 *        description: deplicate username
 */

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

/**
 * @swagger
 * /account/login:
 *  post:
 *    summary: Login and response jwt token
 *    tags: [Account]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginRequest'
 *    responses:
 *      200:
 *        description: The token was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginResponse'
 *      404:
 *        description: Invalid email or password
 */

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
          db.query(
            "select * from customer where account_id = ?",
            [loginRes[0].id],
            (err, customer) => {
              const { password, ...accountObject } = loginRes[0];
              const { fname, lname, email, ...customerObject } = customer[0];
              const token = jwt.sign(
                {
                  ...accountObject,
                  customer: customerObject,
                },
                process.env.SECRET_KEY,
                { expiresIn: "10h" }
              );
              res.json({ token });
            }
          );
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

/**
 * @swagger
 * /account/authen:
 *  get:
 *    summary: Authorization
 *    tags: [Account]
 *    responses:
 *      200:
 *        description: Authorization
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AuthenResponse'
 *      401:
 *        description: Un Authenticated
 *    security: [{bearerAuth: []}]
 */

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

/**
 * @swagger
 * tags:
 *    name: Account
 *    description: Account management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *    RegisterRequest:
 *      type: object
 *      required:
 *        -email
 *        -password
 *        -fname
 *        -lname
 *        -dateOfBirth
 *      properties:
 *        email:
 *          type: string
 *          description: The account username
 *        password:
 *          type: string
 *          description: The account password
 *        fname:
 *          type: string
 *          description: The account first name
 *        lname:
 *          type: string
 *          description: The account last name
 *        dateOfBirth:
 *          type: date
 *          description: The account date of birth
 *    RegisterResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *    LoginRequest:
 *      type: object
 *      required:
 *        -email
 *        -password
 *      properties:
 *        email:
 *          type: string
 *          description: The account username
 *        password:
 *          type: string
 *          description: The account username
 *    LoginResponse:
 *      type: object
 *      properties:
 *        token:
 *          type: string
 *          description: Then JWT token
 *    AuthenResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the account
 *        email:
 *          type: string
 *          description: The account username
 *        fname:
 *          type: string
 *          description: The account role
 *        lname:
 *          type: string
 *          description: The account role
 *        customer:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *            account_id:
 *              type: number
 *            address:
 *              type: string
 *            image:
 *              type: string
 *        iat:
 *          type: number
 *        exp:
 *          type: number
 *          description: Token expire
 */
