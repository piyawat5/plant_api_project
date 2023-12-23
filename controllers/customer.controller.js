const db = require("../config/mysql");

/**
 * @swagger
 * /customer:
 *  get:
 *    summary: Show all customer
 *    tags: [Customer]
 *    responses:
 *      200:
 *        description: show all customer
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/CustomerResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

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

/**
 * @swagger
 * /customer/{id}:
 *  get:
 *    summary: search customer by id
 *    tags: [Customer]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *    responses:
 *      200:
 *        description: search customer by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CustomerResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
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

/**
 * @swagger
 * /customer/edit:
 *  put:
 *    summary: Customer edit information
 *    tags: [Customer]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CustomerEditRequest'
 *    responses:
 *      200:
 *        description: search customer by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CustomerMsgResponse'
 *      409:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
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

/**
 * @swagger
 * /customer/delete/{id}:
 *  delete:
 *    summary: delete customer
 *    tags: [Customer]
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
 *              $ref: '#/components/schemas/CustomerMsgResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
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

/**
 * @swagger
 * /customer/favorite/{id}:
 *  get:
 *    summary: search all favorite for this customer
 *    tags: [Customer]
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
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/FavoriteResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
exports.allFavoriteProduct = (req, res) => {
  const id = req.params.id;
  try {
    db.query(
      "select * from favorite where customer_id = ?",
      [id],
      (err, favorite) => {
        if (err) {
          return res.status(400).json({ favoriteMsg: err });
        }
        res.json(favorite);
      }
    );
  } catch (error) {}
};

/**
 * @swagger
 * /customer/favorite/create:
 *  post:
 *    summary: Add favorite product for this customer
 *    tags: [Customer]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/FavoriteCreateRequest'
 *    responses:
 *      200:
 *        description: Add favorite successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FavoriteCreateResponse'
 *      409:
 *        description: product favorite is duplicated
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
exports.addFavorite = (req, res) => {
  const { product_id, customer_id } = req.body;
  try {
    //Check duplicate
    db.query(
      "select * from favorite where product_id = ? and customer_id = ?",
      [product_id, customer_id],
      (err, favorite) => {
        if (err) {
          return res.status(400).json({ err });
        }

        if (favorite.length > 0) {
          res.status(409).json({ msg: "favorite duplicate" });
          return;
        }
        db.query(
          "insert into favorite (product_id,customer_id) values(?,?)",
          [product_id, customer_id],
          (err, favorite) => {
            if (err) {
              return res.status(400).json({ favoriteMsg: err });
            }
            res.json({ addFavoriteMsg: "Add favorite successfully!" });
            return;
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ catchErr: error });
  }
};

/**
 * @swagger
 * /customer/favorite/delete:
 *  delete:
 *    summary: remove favorite product for this customer
 *    tags: [Customer]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/FavoriteDeleteRequest'
 *    responses:
 *      200:
 *        description: Delete favorite product successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FavoriteDeleteResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
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

/**
 * @swagger
 * tags:
 *    name: Customer
 *    description: Customer management API
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    CustomerResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        account_id:
 *          type: number
 *        adress:
 *          type: string
 *        email:
 *          type: string
 *        fname:
 *          type: string
 *        lname:
 *          type: string
 *        image:
 *          type: string
 *    CustomerEditRequest:
 *      type: object
 *      required:
 *        -id
 *        -account_id
 *        -address
 *        -fname
 *        -lname
 *        -email
 *        -image
 *      properties:
 *        id:
 *          type: number
 *        account_id:
 *          type: number
 *        address:
 *          type: string
 *        fname:
 *          type: string
 *        lname:
 *          type: string
 *        email:
 *          type: string
 *        image:
 *          type: string
 *    CustomerMsgResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 *    FavoriteResponse:
 *      type: object
 *      properties:
 *        customer_id:
 *          type: number
 *        product_id:
 *          type: number
 *    FavoriteCreateResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 *    FavoriteCreateRequest:
 *      type: object
 *      requests:
 *        -customer_id
 *        -product_id
 *      properties:
 *        customer_id:
 *          type: number
 *        product_id:
 *          type: number
 *    FavoriteDeleteRequest:
 *      type: object
 *      requests:
 *        -customer_id
 *        -product_id
 *      properties:
 *        customer_id:
 *          type: number
 *        product_id:
 *          type: number
 *    FavoriteDeleteResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 */
