module.exports = (app, db, inDevMode) => {
  let randomstring = require("randomstring");

  let imageKeyToUrl = {
    fewdumbells:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/fewdumbells.jpg",
    gymworkout:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/gymworkout.jpg",
    landscapedumbel:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/landscapedumbel.jpg",
    manydumbells:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/manydumbells.jpg",
    pullups:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/pullups.jpg",
    running:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/running.jpg",
    shoulderup:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/shoulderup.jpg",
    groupgirls:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/groupgirls.jpg",
    highknees:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/highknees.jpg",
    leanforward:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/leanforward.jpg",
    potraitdumbel:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/potraitdumbel.jpg",
    ropes: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/ropes.jpg",
    shoeinframe:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/shoeinframe.jpg",
    sixpack:
      "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/sixpack.jpg",

    1: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/1.png",

    2: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/2.png",
    3: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/3.png",
    4: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/4.png",
    5: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/5.png",
    6: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/6.png",
    7: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/7.png",
    8: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/8.png",
    9: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/9.png",
    10: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/10.png",
    11: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/11.png",
    12: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/12.png",
    13: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/13.png",
    14: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/14.png",
    15: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/15.png",
    16: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/16.png",
    17: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/17.png",
    18: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/18.png",
    19: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/19.png",
    20: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/20.png",
    21: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/21.png",
    22: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/22.png",
    23: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/23.png",
  };

  app.post("/api/workouts", (req, res) => {
    let workoutUUID = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      WorkoutUUID: workoutUUID,
      Name: req.body.name,
      Description: req.body.description,
      Duration: req.body.duration,
      Level: req.body.level,
      Tags: req.body.tags,
      DesignedBy: req.body.designedBy,
      ExercisesUUID: JSON.stringify(req.body.exercisesUUID),
      IsActive: req.body.isActive,
      DateAdded: req.body.dateAdded,
      ImageKey: req.body.imageKey,
    };

    let sqlQuery = `INSERT INTO Workouts (WorkoutUUID , Name ,Description , Duration , Level , Tags , DesignedBy , ExercisesUUID , IsActive, DateAdded, ImageKey) VALUES (?,?,?,?,?,?,?,?,?, ?,?)`;
    console.log(params, "line 39 api/workouts POST");
    db.query(
      sqlQuery,
      [
        params.WorkoutUUID,
        params.Name,
        params.Description,
        params.Duration,
        params.Level,
        params.Tags,
        params.DesignedBy,
        params.ExercisesUUID,
        params.IsActive,
        params.DateAdded,
        imageKeyToUrl[`${params.ImageKey}`],
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        // console.log("Success line 37 post api/hostedchallenges", result);
        res.status(200).json({ status: "success", workoutUUID });
      }
    );
  });

  app.get("/api/workouts", (req, res) => {
    let params = {
      // WorkoutUUID: inDevMode ? req.body.workoutUUID : req.query.workoutUUID,
      IsActive: true,
    };

    let sqlQuery = `SELECT * FROM Workouts WHERE IsActive=?`;
    db.query(sqlQuery, [params.IsActive], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ExercisesUUID: JSON.parse(item.ExercisesUUID),
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

  app.get("/api/specificworkout", (req, res) => {
    let params = {
      WorkoutUUID: inDevMode ? req.body.workoutUUID : req.query.workoutUUID,
    };

    let sqlQuery = `SELECT * FROM Workouts WHERE WorkoutUUID=?`;
    db.query(sqlQuery, [params.WorkoutUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ExercisesUUID: JSON.parse(item.ExercisesUUID),
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

  app.get("/api/filteredworkouts", (req, res) => {
    let params = {
      SortBy: inDevMode ? req.body.sortBy : req.query.sortBy,
      Duration: inDevMode ? req.body.duration : req.query.duration,
      Level: inDevMode ? req.body.level : req.query.level,
      Tags: inDevMode ? req.body.tags : req.query.tags,
      IsActive: true,
      IsCompleted: inDevMode ? req.body.isCompleted : req.query.isCompleted,
    };
    let durationArray = [10, 100];
    let levelArray = ["Beginner", "Advanced", "Pro"];
    let tagsArray = ["Cardio", "PushUps"];

    if (params.SortBy.indexOf("Duration") != -1) {
      let sqlQuery = `SELECT * FROM Workouts WHERE Duration>=? AND Duration<? AND Level IN (?) AND Tags IN (?) AND IsActive=? ORDER BY Duration Desc`;
      db.query(
        sqlQuery,
        [
          params.Duration ? params.Duration[0] - 10 : durationArray[0],
          params.Duration ? params.Duration[0] : durationArray[1],
          params.Level ? params.Level : levelArray,
          params.Tags ? params.Tags : tagsArray,
          params.IsActive,
        ],
        async (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to fetch Date Sort</h1>");
            throw err;
          }
          let updatedResult = [];
          await result.map((item) => {
            item = {
              ...item,
              ExercisesUUID: JSON.parse(item.ExercisesUUID),
            };
            updatedResult.push(item);
            // ImageKey
          });

          res.status(200).json({ status: "success", result: updatedResult });
        }
      );
    } else {
      let sqlQuery = `SELECT * FROM Workouts WHERE Duration>=? AND Duration<? AND Level IN (?) AND Tags IN (?) AND IsActive=? ORDER BY DateAdded Desc`;
      db.query(
        sqlQuery,
        [
          params.Duration ? params.Duration[0] - 10 : durationArray[0],
          params.Duration ? params.Duration[0] : durationArray[1],
          params.Level ? params.Level : levelArray,
          params.Tags ? params.Tags : tagsArray,
          params.IsActive,
        ],
        async (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to fetch Duration Sort</h1>");
            throw err;
          }
          let updatedResult = [];
          await result.map((item) => {
            item = {
              ...item,
              ExercisesUUID: JSON.parse(item.ExercisesUUID),
            };
            updatedResult.push(item);
            // ImageKey
          });

          res.status(200).json({ status: "success", result: updatedResult });
        }
      );
    }
  });

  app.post("/api/storeworkoutimagewithkey", async (req, res) => {
    let params = {
      ImageUUID: req.body.imageUUID,
      ImageKey: req.body.imageKey, //imageKey
    };

    let sqlQuery = `UPDATE Workouts SET ImageKey = ? WHERE WorkoutUUID = ?`;
    if (imageKeyToUrl[`${params.ImageKey}`]) {
      await db.query(
        sqlQuery,
        [imageKeyToUrl[`${params.ImageKey}`], params.ImageUUID],
        (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to push</h1>");
            throw err;
          }
          res.status(200).json({ status: "success" });
        }
      );
    } else {
      res
        .status(400)
        .send("<h1>Failure to push. No such image key exists</h1>");
    }
  });

  app.post("/api/updateworkoutstatus", async (req, res) => {
    let params = {
      WorkoutUUID: req.body.workoutUUID,
      IsActive: req.body.isActive,
    };

    let sqlQuery = `UPDATE Workouts SET IsActive = ? WHERE WorkoutUUID = ?`;
    await db.query(
      sqlQuery,
      [params.IsActive, params.WorkoutUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({ status: "success" });
      }
    );
  });
};

// TIME ML MODEL LOAD

let videoKey = {
  forwardLunges:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/ForwardLunges.mp4",
  jumpingJacks:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/JumpingJacks.mp4",
  planks:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Planks.mp4",
  pushUps:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/PushUps.mp4",
  reverseLunges:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/ReverseLunges.mp4",
  squatJumps:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/SquatJumps.mp4",
  squats:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Squats.mp4",
  childPose:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Stretches/ChildPose.mp4",
  cobraPose:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Stretches/CobraPose.mp4",
  downwardDog:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Stretches/DownwardDog.mp4",
  gluteBridge:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Stretches/GluteBridge.mp4",
  hipFlexor:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Videos/Stretches/HipFlexor.mp4",
};

let exerciseImagesKey = {
  pushup:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/exerciseimages/PushUp.png",
  lunge:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/exerciseimages/Lunge.png",
  squat:
    "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/exerciseimages/Squat.png",
};
