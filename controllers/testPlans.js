module.exports = (app, db, inDevMode) => {
  let randomstring = require("randomstring");

  let imageKeyToUrl = {
    bigImage:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/TestPlans/exercises1Copy4_2021-07-27/exercises1Copy4%403x.png",
    small1:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/TestPlans/group14%403x.png",
    small2:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/TestPlans/group15%403x.png",
  };
  app.post("/api/testplans", (req, res) => {
    let planUUID = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PlanUUID: planUUID,
      Name: req.body.name,
      Description: req.body.description,
      Duration: req.body.duration,
      Level: req.body.level,
      Tags: req.body.tags,
      DesignedBy: req.body.designedBy,
      ModulesUUID: JSON.stringify(req.body.modulesUUID),
      DateAdded: req.body.dateAdded,
      ImageKey: req.body.imageKey,
      HasBigImage: req.body.hasBigImage,
    };

    let sqlQuery = `INSERT INTO TestPlans (PlanUUID , Name ,Description , Duration , Level , Tags , DesignedBy , ModulesUUID , ImageKey, HasBigImage) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    // console.log(params, "line 39 api/testplans POST");
    db.query(
      sqlQuery,
      [
        params.PlanUUID,
        params.Name,
        params.Description,
        params.Duration,
        params.Level,
        params.Tags,
        params.DesignedBy,
        params.ModulesUUID,
        params.ImageKey,
        params.HasBigImage,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          throw err;
        }
        // console.log("Success line 37 post api/hostedchallenges", result);
        res.status(200).json({ status: "success", planUUID: params.PlanUUID });
      }
    );
  });

  app.get("/api/testplans", (req, res) => {
    let sqlQuery = `SELECT * FROM TestPlans`;
    db.query(sqlQuery, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ModulesUUID: JSON.parse(item.ModulesUUID),
          };
          updatedResult.push(item);
          // ImageKey
        });
        res.status(200).json({
          status: "success",
          result: updatedResult,
        });
        // console.log(result,"line 74")
      } else {
        res.status(200).json({
          status: "success",
          result: [],
          // result,
        });
      }
    });
  });

  app.post("/api/useractivetestplans", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      PlanUUID: req.body.planUUID,
    };
    let sqlQuery = `INSERT INTO TestCompletedPlans (UserUUID, PlanUUID) VALUES (? , ?) ON DUPLICATE KEY UPDATE PlanUUID=?`;
    // console.log("hit here")
    await db.query(
      sqlQuery,
      [params.UserUUID, params.PlanUUID, params.PlanUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({ status: "success in statsQuery" });
      }
    );
  });

  app.get("/api/useractivetestplans", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `SELECT * FROM TestPlans WHERE PlanUUID IN (SELECT PlanUUID From TestCompletedPlans WHERE UserUUID=?)`;
    await db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      if (result.length > 0) {
        let item = {
          ...result[0],
          ModulesUUID: JSON.parse(result[0].ModulesUUID),
        };
        res.status(200).json({
          result: item,
        });
      } else {
        res.status(200).json({
          result: [],
        });
      }
    });
  });
};
