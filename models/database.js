let mysql = require("mysql");

// For Prod
let connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: process.env.DB_NAME, // this will give access to the particular db and then select tables that were created under it
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed: " + err.stack, "line 13");
    return;
  }
  console.log("connected to db");

  // let sqlQuery = `DESC CFWorkout`; // LastLoginTime UserName

  // connection.query(sqlQuery, (err, result) => {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log(result, "line 24");
  // });
});

module.exports = {
  db: connection,
};
