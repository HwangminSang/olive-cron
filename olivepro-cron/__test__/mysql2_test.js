const mysql = require("mysql2/promise");
const { log } =require('../winston/logger')
// CREATE DATABASE sample;
// USE sample;
// CREATE TABLE example(
//   id INT NOT NULL AUTO_INCREMENT,
//   name VARCAHR(32) NOT NULL,
//   PRIMARY KEY(id)
// );

const dbPool = mysql.createPool({
  host: config.MYSQL_HOST || 'olivepro-prod-new.cluster-coluvj80rday.ap-northeast-2.rds.amazonaws.com',
  user: config.MYSQL_USER || 'root',
  password: config.MYSQL_PASSWORD || 'dhfflqm0704',
  database: config.MYSQL_DATABASE || 'olivepro',
  port: 3306,
  connectionLimit: 4,
})

const result = async () => {
  log.info('conn.getConnection.....');
  const connection = await dbPool.getConnection(async conn => conn);

  try {
    const [rows] = // await conn.query("SELECT * FROM user"); 
      await connection.query("SELECT * FROM user WHERE id = 4")
      log.info('>>>>>', rows[0].password)
      log.info(rows); // return row
  } catch (e) {
    throw new Error(e)
  } finally {
    dbPool.release() // pool 을 돌려주는 역할을 한다.
    log.info('conn.release.....');
  }
}

/* Step 2. get connection */
const dbTest = async () => {
  try {
    const connection = await dbPool.getConnection(async conn => conn);
    try {
      /* Step 3. */
      const ID = 'HELLO';
      const PW = 'WORLD';
      const [rows] = await connection.query('INSERT INTO MEMBERS_INFO(ID, PW) VALUES(?, ?)', [ID, PW]);
      connection.release();
      return rows;
    } catch (err) {
      log.info('Query Error');
      connection.release();
      return false;
    }
  } catch (err) {
    log.err('DB Error');
    return false;
  }
};

/* Step 2. get connection */
const dbTransactionTest = async () => {
  try {
    const connection = await dbPool.getConnection(async conn => conn);
    try {
      /* Step 3. */
      const ID = 'HELLO';
      const PW = 'WORLD';
      await connection.beginTransaction(); // START TRANSACTION
      const [rows] = await connection.query('INSERT INTO MEMBERS_INFO(ID, PW) VALUES(?, ?)', [ID, PW]);
      await connection.commit(); // COMMIT
      connection.release();
      return rows;
    } catch (err) {
      await connection.rollback(); // ROLLBACK
      connection.release();
      log.info('Query Error');
      return false;
    }
  } catch (err) {
    log.err('DB Error');
    return false;
  }
};

const db = async () => {
  const connection = await dbPool.getConnection();
  try {
    // db connection
    // let connection = await mysql.createConnection({
    //     host: "test-olivernd-mysql.coluvj80rday.ap-northeast-2.rds.amazonaws.com",
    //     user: "admin",
    //     password: "testOliveRds0704*",
    //     database: "olivepro",
    //     port: 3306
    // });

    // Select all rows from example table
    let [rows, fields] = await connection.query("SELECT id, password FROM user");
    // console.log(rows);

    rows.forEach((item) => {
      log.info(item.id, ' ==> ', item.password);
    });

    // insert data
    // let data = {
    //     name: "sample0",
    // };

    // // insert data into example table
    // let [results] = await connection.query(
    //     "INSERT INTO example SET ?",
    //     data
    // );
    // // inserted data's id(auto_increment)
    // let insertId = results.insertId;

    // // Select all rows from example table
    // [rows, fields] = await connection.query("SELECT * FROM example");
    // console.log(rows);

    // // update row
    // [results] = await connection.query("UPDATE example SET name=? WHERE id=?", [
    //     "updated_sample",
    //     insertId,
    // ]);

    // // Select all rows from example table
    // [rows, fields] = await connection.query("SELECT * FROM example");
    // console.log(rows);

    // // delete row
    // [results] = await connection.query("DELETE FROM example WHERE id=?", [
    //     insertId,
    // ]);

    // // Select all rows from example table
    // [rows, fields] = await connection.query("SELECT * FROM example");
    // console.log(rows);
  } catch (error) {
    log.info(error);
  } finally {
    connection.release() // pool 을 돌려주는 역할을 한다.
  }

};

// exports.
const
  getPhoneDeviceToken = async () => {
    const connection = await dbPool.getConnection();
    try {
      // Select all rows from PhoneDevice table
      // let [rows, fields] = await connection.query("SELECT id, password FROM user");
      let [rows, fields] = await connection.query(`SELECT * FROM phone_device where fcm_token is not null`);
      log.info(rows);

      rows.forEach((item) => {
        log.info(' ==> ', item.fcm_token);
        // console.log(item.id, ' ==> ', item.password);
      });

      let tokens = rows.map((row) => {
        return row.fcm_token;
      });

      log.info(' tokens ==> ', tokens);

    } catch (error) {
      log.err(error);
    } finally {
      connection.release();
    }
  };

// db();
// result();
// getPhoneDeviceToken();