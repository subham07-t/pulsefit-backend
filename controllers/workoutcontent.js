module.exports = (app, db, inDevMode) => {
  let btoa = require("btoa");
  const encode = (data) => {
    let str = data.reduce((a, b) => {
      return a + String.fromCharCode(b);
    }, "");
    return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
  };
  let randomstring = require("randomstring");
  let { uploads3, s3Bucket } = require("../models/awsS3");
  app.post("/api/exercise", (req, res) => {
    let exerciseUUID = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      ExerciseUUID: exerciseUUID,
      Name: req.body.name,
      Duration: req.body.duration,
      Reps: req.body.reps,
      Sets: req.body.sets,
      IsTimeBased: req.body.isTimeBased,
    };
    let sqlQuery = `INSERT INTO Exercises ( ExerciseUUID, Name , Duration , Reps , Sets, IsTimeBased ,ImageKey, VideoKey ) VALUES (? , ? , ?, ?, ?, ?,0, 0)`;

    db.query(
      sqlQuery,
      [
        params.ExerciseUUID,
        params.Name,
        params.Duration,
        params.Reps,
        params.Sets,
        params.IsTimeBased,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }

        res.status(200).json({ status: "success", exerciseUUID });
      }
    );
  });

  app.get("/api/challengeexercise", (req, res) => {
    let params = {
      ExerciseUUID: inDevMode ? req.body.exerciseUUID : req.query.exerciseUUID,
    };
    let sqlQuery = `SELECT * FROM Exercises WHERE ExerciseUUID=?`;

    db.query(sqlQuery, [params.ExerciseUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        result: JSON.parse(JSON.stringify(result)),
      });
    });
  });

  app.get("/api/workoutexercise", (req, res) => {
    let params = {
      ExerciseUUID: inDevMode ? req.body.exerciseUUID : req.query.exerciseUUID,
    };
    let sqlQuery = `SELECT * FROM Exercises WHERE ExerciseUUID=?`;

    db.query(sqlQuery, [params.ExerciseUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      if (result[0].ImageKey) {
        let decodedResult = {};
        let s3params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: result[0].ImageKey,
        };
        s3Bucket.getObject(s3params, (err, data) => {
          if (err) {
            return res.status(400).send({ error: err });
          }

          let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

          decodedResult = {
            ...result[0],
            ImageKey: imageResult,
          };
          res.status(200).json({
            status: "success",
            result: decodedResult,
            // result,
          });
        });
      } else {
        res.status(200).json({
          result,
        });
      }
    });
  });

  app.post(
    "/api/storeexerciseimage",
    uploads3.single("image"),
    async (req, res) => {
      let params = {
        ImageUUID: req.body.imageUUID,
        ImageKey: req.file.key, //imageKey
      };
      let sqlQuery = `UPDATE Exercises SET ImageKey = ? WHERE ExerciseUUID = ?`;

      await db.query(
        sqlQuery,
        [params.ImageKey, params.ImageUUID],
        (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to push</h1>");
            throw err;
          }
          res.status(200).json({ status: "success" });
        }
      );
    }
  );

  app.post("/api/badgedetails", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      BadgeUUID: req.body.badgeUUID,
      Name: req.body.name,
      Time: req.body.time,
      Reps: req.body.reps,
      ImageKey: req.body.imageKey,
      IsActive: req.body.isActive,
    };
    let sqlQuery = `INSERT INTO Badges (PrimaryKey, BadgeUUID, Name, Time, Reps, ImageKey, IsActive) VALUES (?, ?, ?, ?, ? ,?, ?)`;

    db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.BadgeUUID,
        params.Name,
        params.Time,
        params.Reps,
        params.ImageKey,
        params.IsActive,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }

        res.status(200).json({ status: "success", primaryKey });
      }
    );
  });

  app.get("/api/badgedetails", (req, res) => {
    let sqlQuery = "Select * FROM Badges";
    db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }

      res.status(200).json({ status: "success", res: result });
    });
  });
  app.post("/api/shortworkouts", (req, res) => {
    let params = {};
  });

  app.get("/api/shortworkouts", (req, res) => {
    let params = {};
  });
};
