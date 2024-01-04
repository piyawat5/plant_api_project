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
 * /product:
 *  get:
 *    summary: Search all products
 *    tags: [Product]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ProductResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.allProducts = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const products = await queryAsync("SELECT * FROM product");

    const newProductPromises = products.map(async (product) => {
      const { category_id, ...productObj } = product;
      const category = await queryAsync("SELECT * FROM category WHERE id = ?", [
        category_id,
      ]);
      return { ...productObj, category: category[0] };
    });

    const newProduct = await Promise.all(newProductPromises);

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @swagger
 * /product/{id}:
 *  get:
 *    summary: Search product by id
 *    tags: [Product]
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
 *              $ref: '#/components/schemas/ProductResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */

exports.findProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const products = await queryAsync("select * from product where id = ?", [
      id,
    ]);

    const { category_id, ...product } = products[0];
    const category = await queryAsync("select * from category where id = ?", [
      category_id,
    ]);

    res.json({ ...product, category: category[0] });
  } catch (err) {
    res.status(500).json({ err });
  }
};

/**
 *
 * @swagger
 * /product/create:
 *  post:
 *    summary: Create new product
 *    tags: [Product]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ProductCreateRequest'
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ProductMsgResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
exports.createProduct = async (req, res) => {
  const { categoryName, name, stock, price, image, description } = req.body;
  try {
    const categoryId = await queryAsync(
      "select id from category where name = ?",
      [categoryName]
    );

    const createProduct = await queryAsync(
      "insert into product (category_id,name,stock,price,image,description) values(?,?,?,?,?,?)",
      [categoryId[0].id, name, stock, price, image, description]
    );

    if (createProduct) {
      res.json({ msg: "create successfully!" });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

/**
 *
 * @swagger
 * /product/edit:
 *  put:
 *    summary: Edit Product
 *    tags: [Product]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ProductRequest'
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ProductMsgResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
exports.editProduct = (req, res) => {
  const { id, category, name, stock, price, image, description } = req.body;
  try {
    db.query(
      "select id from category where name = ?",
      [category.name],
      (err, categoryId) => {
        if (err) {
          res.status(400).json(err);
          return;
        }
        db.query(
          "update product set name=?,category_id=?,stock=?,price=?,image=?,description=? where id=?",
          [name, categoryId[0].id, stock, price, image, description, id],
          (err, product) => {
            if (err) {
              return res.status(400).json({ editMsg: err });
            }
            return res.json({ msg: "Edit product successfully!" });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

/**
 *
 * @swagger
 * /product/delete/{id}:
 *  delete:
 *    summary: Delete product
 *    tags: [Product]
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
 *              $ref: '#/components/schemas/ProductMsgResponse'
 *      400:
 *        description: something wrong
 *    security: [{bearerAuth: []}]
 */
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
        db.query("delete from favorite where product_id = ?", [id], (err) => {
          if (err) {
            return res.status(400).json({ favoriteDelMsg: err });
          }

          db.query(
            "delete from product where id =? ",
            [id],
            (err, deleteProduct) => {
              if (err) {
                return res.status(400).json({ deleteProductMsg: err });
              }

              return res.json({ msg: "Delete product successfully!" });
            }
          );
        });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management API
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    ProductResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        category:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *            name:
 *              type: string
 *            description:
 *              type: string
 *        name:
 *          type: string
 *        stock:
 *          type: string
 *        price:
 *          type: string
 *        image:
 *          type: string
 *        description:
 *          type: string
 *    ProductCreateRequest:
 *      type: object
 *      required:
 *        -category
 *        -name
 *        -stock
 *        -price
 *        -image
 *        -description
 *      properties:
 *        categoryName:
 *          type: string
 *        name:
 *          type: string
 *        stock:
 *          type: string
 *        price:
 *          type: string
 *        image:
 *          type: string
 *        description:
 *          type: string
 *    ProductRequest:
 *      type: object
 *      required:
 *        -id
 *        -category
 *        -name
 *        -stock
 *        -price
 *        -image
 *        -description
 *      properties:
 *        id:
 *          type: number
 *        category:
 *          type: object
 *          properties:
 *            id:
 *              type: number
 *            name:
 *              type: string
 *            description:
 *              type: string
 *        name:
 *          type: string
 *        stock:
 *          type: string
 *        price:
 *          type: string
 *        image:
 *          type: string
 *        description:
 *          type: string
 *    ProductMsgResponse:
 *      type: object
 *      properties:
 *        msg:
 *          type: string
 */
