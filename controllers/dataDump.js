module.exports = (app, db, inDevMode) => {
  app.get("/api/fullUserStats", (req, res) => {
    let sqlQuery = `SELECT * FROM UserStats`;
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });

  app.get("/api/fullModularWorkouts", (req, res) => {
    let sqlQuery = `SELECT * FROM ModularWorkouts`;
    db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });


  app.get("/api/fullchallengelogs", (req, res) => {
    let sqlQuery = `SELECT * FROM ChallengeLogs`;
    db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });


  app.get("/api/fulljoinedchallenges", (req, res) => {
    let sqlQuery = `SELECT * FROM JoinedChallenges`;
    db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });


  app.get("/api/fullnotes", (req, res) => {
    let sqlQuery = `SELECT * FROM Notes`;
    db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });
};
