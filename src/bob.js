// https://www.npmjs.com/package/mariadb
// ECMAScript 2017 way
const mariadb = require('mariadb');
const pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, connectionLimit: 5});
     
async function asyncFunction() {
      let conn;
      try {
     
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT 1 as val");
        // rows: [ {val: 1}, meta: ... ]
     
        const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
     
      } catch (err) {
        throw err;
      } finally {
        if (conn) conn.release(); //release to pool
      }
    }

// Insert Pipelining
////////////////////
// https.get('https://someContent', readableStream => {
//     //readableStream implement Readable, driver will stream data to database 
//     connection.query("INSERT INTO myTable VALUE (?)", [readableStream]);
// });

// Old ECMAScript way
////////////////////
// const mariadb = require('mariadb');
// const pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, connectionLimit: 5});
// pool.getConnection()
//     .then(conn => {
// 
//       conn.query("SELECT 1 as val")
//         .then(rows => { // rows: [ {val: 1}, meta: ... ]
//           return conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
//         })
//         .then(res => { // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
//           conn.release(); // release to pool
//         })
//         .catch(err => {
//           conn.release(); // release to pool
//         })
// 
//     }).catch(err => {
//       //not connected
//     });
