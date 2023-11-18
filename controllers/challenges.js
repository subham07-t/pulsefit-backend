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
  app.post("/api/hostedchallenges", (req, res) => {
    let challengeUUID = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    // ADD COLUMN TIME/ REPS and pass the Exercises Array
    let params = {
      ChallengeUUID: challengeUUID,
      Name: req.body.name,
      StartDate: req.body.startDate, //YYYY-MM-DD
      EndDate: req.body.endDate, //YYYY-MM-DD
      ExercisesUUID: JSON.stringify(req.body.exercisesUUID),
      Description: req.body.description,
      Rewards: req.body.rewards,
      Type: req.body.type,
      ChallengeDuration: req.body.challengeDuration,
      CreatorName: req.body.creatorName,
      CreatorUUID: req.body.creatorUUID,
    };

    // let exercisesString = "";
    // req.body.exercisesUUID.map(
    //   (exercise) => (exercisesString += exercise + ",")
    // );
    // exercisesString = exercisesString.slice(0, -1);
    let sqlQuery = `INSERT INTO Challenges (ChallengeUUID , Name , StartDate , EndDate , ExercisesUUID , Description , Rewards , Type , CreatorName , CreatorUUID, ChallengeDuration) VALUES (? , ? , ? ,? , ? ,?, ? , ?, ? ,?, ? )`;

    db.query(
      sqlQuery,
      [
        params.ChallengeUUID,
        params.Name,
        params.StartDate,
        params.EndDate,
        // JSON.stringify(exercisesString),
        params.ExercisesUUID,
        params.Description,
        params.Rewards,
        params.Type,
        params.CreatorName,
        params.CreatorUUID,
        params.ChallengeDuration,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        // console.log("Success line 37 post api/hostedchallenges", result);
        res.status(200).json({ status: "success", challengeUUID });
      }
    );
  });
  app.get("/api/allchallenges", (req, res) => {
    let sqlQuery = `SELECT * FROM Challenges`;
    db.query(sqlQuery, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      let item = {
        ...result[0],
        ExercisesUUID: JSON.parse(result[0].ExercisesUUID),
      };

      res.status(200).json({
        status: "success",
        result: item,
      });
    });
  });

  app.get("/api/hostedchallenges", (req, res) => {
    let params = {
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };

    // SELECT * FROM Exercises WHERE ExerciseUUID IN (SELECT ExercisesUUID FROM Challenges WHERE ChallengeUUID =?) Use this new Query
    let sqlQuery = `SELECT * FROM Challenges WHERE ChallengeUUID = ?`;
    db.query(sqlQuery, params.ChallengeUUID, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      let decodedResult = {};

      let item = {
        ...result[0],
        ExercisesUUID: JSON.parse(result[0].ExercisesUUID),
      };

      // let s3paramsIcon = {
      //   // Bucket: process.env.AWS_BUCKET_NAME,
      //   Bucket: "pulsefitimages",
      //   Key: item.ChallengeImageKey,
      // };

      // s3Bucket.getObject(s3paramsIcon, function (err, data) {
      //   if (err) {
      //     return res.status(400).send({ error: err });
      //   }

      //   console.log(data, "line 105 challenges");
      //   let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

      //   decodedResult = {
      //     ...item,
      //     ChallengeImageKey: imageResult,
      //   };

      // });
      res.status(200).json({
        status: "success",
        result: item,
      });
    });
  });

  // USE THESE IN THE NEXT APP RELEASE AFTER WE CHANGE IMAGEKEY TO IMAGEURL

  app.get("/api/newchallenges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    let sqlQuery = `Select * FROM Challenges WHERE ChallengeUUID NOT IN (Select ChallengeUUID FROM JoinedChallenges WHERE UserUUID = ? ) AND DATE(EndDate) >=  curdate() AND Type = ? ORDER BY StartDate ASC`;

    db.query(sqlQuery, [params.UserUUID, "Public"], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      if (result.length > 0) {
        let updatedResult = [];
        await result.map((item) => {
          item = {
            ...JSON.parse(JSON.stringify(item)),
            ExercisesUUID: JSON.parse(item.ExercisesUUID),
          };
          updatedResult.push(item);
        });

        res.status(200).json({
          status: "success",
          result: updatedResult,
        });
      } else {
        res.status(200).json({
          status: "success",
          result: [],
        });
      }
    });
  });

  // Create a route with completed and active challenges

  app.get("/api/activeuserchallenges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `Select * FROM Challenges WHERE ChallengeUUID IN (Select ChallengeUUID FROM JoinedChallenges WHERE UserUUID = ? ) AND DATE(EndDate) >=  curdate() AND DATE(StartDate) <=  curdate() ORDER BY EndDate ASC`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      if (result.length > 0) {
        let updatedResult = [];
        await result.map((item) => {
          item = {
            ...JSON.parse(JSON.stringify(item)),
            ExercisesUUID: JSON.parse(item.ExercisesUUID),
          };
          updatedResult.push(item);
          // ImageKey
          // let s3params = {
          //   // Bucket: process.env.AWS_BUCKET_NAME,
          //   Bucket: "pulsefitimages",
          //   Key: item.ChallengeImageKey,
          // }; // keyname can be a filename
          // s3Bucket.getObject(s3params, (err, data) => {
          //   if (err) {
          //     return res.status(400).send({ error: err });
          //   }

          //   let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

          //   decodedResult = {
          //     ...item,
          //     ChallengeImageKey: imageResult,
          //   };
          //   updatedResult.push(decodedResult);
          //   updatedResult.length == result.length
          //     ? res.status(200).json({
          //         status: "success",
          //         result: updatedResult,
          //         // result,
          //       })
          //     : null;
          // });
        });
        res.status(200).json({
          status: "success",
          result: updatedResult,
        });
      } else {
        res.status(200).json({
          status: "success",
          result: [],
          // result,
        });
      }
    });
  });

  // When we push exercisesUUID this has to be changed
  app.get("/api/completeduserchallenges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    // Add few filters here to fetch only the relevant challenges
    let sqlQuery = `Select * FROM Challenges WHERE ChallengeUUID IN (Select ChallengeUUID FROM JoinedChallenges WHERE UserUUID = ? ) AND DATE(EndDate) < curdate()`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      if (result.length > 0) {
        let updatedResult = [];
        await result.map((item) => {
          item = {
            ...JSON.parse(JSON.stringify(item)),
            ExercisesUUID: JSON.parse(item.ExercisesUUID),
          };
          updatedResult.push(item);
          // ImageKey
        });
        res.status(200).json({
          status: "success",
          result: updatedResult,
        });
      } else {
        res.status(200).json({
          status: "success",
          result: [],
          // result,
        });
      }
    });
  });

  app.post("/api/joinedchallenges", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      ChallengeUUID: req.body.challengeUUID,
    };
    let sqlQuery = `INSERT INTO JoinedChallenges (UserUUID, ChallengeUUID, PrimaryKey) VALUES (? , ?, ?)`;
    await db.query(
      sqlQuery,
      [params.UserUUID, params.ChallengeUUID, params.PrimaryKey],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
      }
    );
    let userStatsSQLquery =
      "INSERT INTO UserStats (userUUID,  TotalChallenges, TotalReps, TotalDurationMins, TotalWorkouts) VALUES (?, 1,0,0,0) ON DUPLICATE KEY UPDATE TotalChallenges = TotalChallenges + 1";
    await db.query(userStatsSQLquery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({ status: JSON.stringify(err) });
        throw err;
      }
      res.status(200).json({ status: "success in statsQuery" });
    });
  });

  app.get("/api/joinedchallenges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `SELECT * FROM JoinedChallenges WHERE UserUUID=?`;
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      // console.log("Success line 111 get api/joinedchallenges", result[0]);
      res.status(200).json({
        status: "success",
        result: JSON.parse(JSON.stringify(result)),
      });
    });
  });

  app.post("/api/challengeprogress", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      ChallengeUUID: req.body.challengeUUID,
      Date: req.body.date,
      ExerciseName: req.body.exerciseName,
      Reps: req.body.reps, //Pass total reps for challenge
      Time: req.body.time,
      Workouts: req.body.challengeExercises,
      ExerciseDuration: req.body.exerciseDuration,
      // Reps: 10, //Pass total reps for challenge
      // Time: 20,
      // Workouts: 100,
      // ExerciseDuration: req.body.exerciseDuration,
    };
    let sqlQuery = `INSERT INTO ChallengeLogs (UserUUID , ChallengeUUID , Date , ExerciseName , Reps , Time ,PrimaryKey, ExerciseDuration) VALUES (? , ?, ? , ?, ? , ?, ?, ?)`;
    db.query(
      sqlQuery,
      [
        params.UserUUID,
        params.ChallengeUUID,
        params.Date, //change the date to DATE datatype
        params.ExerciseName,
        params.Reps,
        params.Time,
        params.PrimaryKey,
        params.ExerciseDuration,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        // console.log("Success line 89 post api/joinedchallenges", result);
        !params.Workouts ? res.status(200).json({ status: "success" }) : null;
      }
    );

    if (params.Workouts > 0) {
      let userStatsSQLquery =
        "INSERT INTO UserStats (UserUUID,  TotalReps, TotalDurationMins, TotalWorkouts, TotalChallenges) VALUES (?, ?, ?, ?,0) ON DUPLICATE KEY UPDATE TotalReps = TotalReps + ?, TotalDurationMins = TotalDurationMins + ?, TotalWorkouts = TotalWorkouts + ?";
      db.query(
        userStatsSQLquery,
        [
          params.UserUUID,
          params.Reps,
          params.Time,
          params.Workouts,
          params.Reps,
          params.Time,
          params.Workouts,
        ],
        (err, result) => {
          if (err) {
            res.status(400).json({ status: JSON.stringify(err) });
            throw err;
          }
          // console.log("Success line 176 post api/joinedchallenges", result);
          // res.status(200).json({ status: "success in statsQuery" });
        }
      );

      // add the earnedbadge logic here
      let oldReps = 0;
      let totalReps;
      let singleSQLQuery = `SELECT UserStats.TotalReps, Badges.BadgeUUID, Badges.Reps FROM UserStats, Badges WHERE UserStats.UserUUID = ? AND Badges.IsActive=1 AND Badges.BadgeUUID NOT IN ( Select BadgeUUID from EarnedBadges WHERE UserUUID=?)`;

      db.query(
        singleSQLQuery,
        [params.UserUUID, params.UserUUID],
        (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to fetch</h1>");
            throw err;
          }

          if (result.length > 0) {
            oldReps = result[0].TotalReps;
            totalReps = oldReps;
            result.map(async (item, index) => {
              if (totalReps >= item.Reps) {
                let primaryKeyBadge = randomstring.generate({
                  length: 12,
                  charset: "alphabetic",
                });

                let badgePushParams = {
                  PrimaryKey: primaryKeyBadge,
                  UserUUID: params.UserUUID,
                  BadgeUUID: item.BadgeUUID,
                };
                let pushEarnedBadgesQuery = `INSERT INTO EarnedBadges (PrimaryKey, UserUUID, BadgeUUID) VALUES (?,?,?)`;

                await db.query(
                  pushEarnedBadgesQuery,
                  [
                    badgePushParams.PrimaryKey,
                    badgePushParams.UserUUID,
                    badgePushParams.BadgeUUID,
                  ],
                  (err, result) => {
                    if (err) {
                      res.status(400).send("<h1>Failure to push</h1>");
                      throw err;
                    }
                  }
                );
              }
            });

            res.status(200).json({ status: "Pushed details" });
          } else {
            res.status(200).json({ newBadgesEarned: false });
          }
        }
      );
    }
    // res.status(200).json({ newBadgesEarned: false });
  });

  app.get("/api/challengeprogress", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };
    let sqlQuery = `SELECT * FROM ChallengeLogs WHERE (UserUUID = ? AND ChallengeUUID=?)`;
    // Stats
    // SELECT COUNT(DISTINT DATE) FROM ChallengeLogs WHERE (UserUUID = ? AND DATE > currdate() -30)
    db.query(
      sqlQuery,
      [params.UserUUID, params.ChallengeUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
        // console.log("Success line 166 get api/challengelogs", result[0],params);
        res.status(200).json({
          status: "success",
          result: JSON.parse(JSON.stringify(result)),
        });
      }
    );
  });
  // duration of challenge exercises UUID,

  app.get("/api/leaderboard", (req, res) => {
    let params = {
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };

    // User.URL

    let sqlQuery =
      "SELECT Users.Name, MAX(ChallengeLogs.Reps), Users.UserUUID FROM ChallengeLogs,Users WHERE ChallengeLogs.ChallengeUUID = ? AND Users.UserUUID = ChallengeLogs.UserUUID GROUP BY 1 ORDER BY 2 DESC";
    db.query(sqlQuery, [params.ChallengeUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      // console.log("Success line 193 get api/challengelogs", result[0]);

      // AWAIT RESULT ARRAY -> User.URL (as input to S3bucket) and pass it to the result
      res.status(200).json({
        status: "success",
        result: JSON.parse(JSON.stringify(result)),
      });
    });
  });

  app.post("/api/addexercises", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      ExerciseUUID: primaryKey,
      Name: req.body.name,
      Duration: req.body.duration,
      Reps: req.body.reps,
      Sets: req.body.sets,
    };
    let sqlQuery = `INSERT INTO Exercises (ExerciseUUID, Name, Duration, Reps, Sets) VALUES (? , ?, ? , ?, ?)`;
    db.query(
      sqlQuery,
      [
        params.ExerciseUUID,

        params.Name,
        params.Duration,
        params.Reps,
        params.Sets,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        // console.log("Success line 231 post api/addexercises", result);
        res
          .status(200)
          .json({ status: "success", exerciseUUID: params.ExerciseUUID });
      }
    );
  });

  app.get("/api/addexercises", (req, res) => {
    let params = {
      // ExerciseUUID: req.body.exerciseUUID,
      ExerciseUUID: inDevMode ? req.body.exerciseUUID : req.query.exerciseUUID,
    };

    let sqlQuery = "SELECT * FROM Exercises WHERE ExerciseUUID=?";
    db.query(sqlQuery, [params.ExerciseUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      // console.log("Success line 247 get api/addexercises", result[0]);
      res.status(200).json({
        status: "success",
        result: JSON.parse(JSON.stringify(result)),
      });
    });
  });

  app.get("/api/mystatsinfo", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };
    let graphData;
    let exercisesData;
    let bestReportData;
    let sqlQueryGraph =
      "SELECT SUM(Reps), Date FROM ChallengeLogs WHERE ChallengeUUID=? AND UserUUID=? GROUP BY Date";
    // Challenge Duration isn't there for the report card
    await db.query(
      sqlQueryGraph,
      [params.ChallengeUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch 1</h1>");
          throw err;
        }
        graphData = JSON.parse(JSON.stringify(result));
        // console.log("Success line 193 get api/challengelogs", result[0])
      }
    );

    let bestReportStats =
      "SELECT MAX(Reps), MIN(Time) FROM ChallengeLogs WHERE ChallengeUUID=? AND UserUUID=?";

    await db.query(
      bestReportStats,
      [params.ChallengeUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch 2</h1>");
          throw err;
        }
        bestReportData = JSON.parse(JSON.stringify(result));
        // console.log("Success line 193 get api/challengelogs", result[0])
      }
    );

    let sqlQueryExercises =
      "SELECT SUM(Reps), ExerciseName FROM ChallengeLogs WHERE ChallengeUUID=? AND UserUUID=? GROUP BY ExerciseName";

    await db.query(
      sqlQueryExercises,
      [params.ChallengeUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch 2</h1>");
          throw err;
        }
        exercisesData = JSON.parse(JSON.stringify(result));
        res.status(200).json({
          status: "success",
          result: {
            graphData,
            exercisesData,
            bestReportData,
          },
        });
      }
    );
  });

  app.post(
    "/api/storechallengeimagewithfile",
    uploads3.single("image"),
    async (req, res) => {
      let params = {
        ImageUUID: req.body.imageUUID,
        ImageKey: req.file.key, //imageKey
      };
      // User Image information
      // Challenge Images and Icon in the Challenge table
      let sqlQuery = `UPDATE Challenges SET ChallengeImageKey = ? WHERE ChallengeUUID = ?`;
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

  app.post("/api/storechallengeimagewithkey", async (req, res) => {
    let params = {
      ImageUUID: req.body.imageUUID,
      ImageKey: req.body.imageKey, //imageKey
    };

    // PASS THE KEY TO URL VALUE HERE
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
      ropes:
        "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/ropes.jpg",
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
      24: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/24.png",
      25: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/25.png",
      26: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/26.png",
      27: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/27.png",
      28: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/28.png",
      29: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/29.png",
      30: "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/brandImages/30.png",
      pa_logo:
        "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/pa_logo.jpg",
      lunge:
        "https://pulsefitpublicimages.s3.us-east-2.amazonaws.com/Images/lunge.png",
      bourboncoffee:
        "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/Images/bourboncoffee.png",
      pulsefitlogo:
        "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/pulsefitlogo.png",
      new_challenge:
        "https://pulsefitpublicimages.s3.us-east-2.amazonaws.com/Images/squat_challenge.jpg",
    };

    let sqlQuery = `UPDATE Challenges SET ChallengeImageKey = ? WHERE ChallengeUUID = ?`;
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

  app.get("/api/challengeparticipants", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };

    let sqlQuery =
      "SELECT UserUUID FROM JoinedChallenges WHERE ChallengeUUID=?";
    // let sqlQuery ="SELECT Users.UserImageKey FROM JoinedChallenges,Users WHERE JoinedChallenges.ChallengeUUID = ? AND Users.UserUUID = JoinedChallenges.UserUUID GROUP BY 1";

    db.query(sqlQuery, [params.ChallengeUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result,
        // result,
      });
    });
  });

  app.post("/api/uploadtobucket", uploads3.single("image"), (req, res) => {
    res.status(200).json({ imageKey: req.file.key });
  });

  app.get("/api/challengejoincheck", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };

    let sqlQuery =
      "SELECT * FROM JoinedChallenges WHERE ChallengeUUID=? AND UserUUID =?";

    db.query(
      sqlQuery,
      [params.ChallengeUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
        res.status(200).json({
          status: "success",
          result: result.length,
          // result,
        });
      }
    );
  });

  app.post("/api/updatechallengeenddate", async (req, res) => {
    let params = {
      ChallengeUUID: req.body.challengeUUID,
      EndDate: req.body.endDate,
    };

    // PASS THE KEY TO URL VALUE HERE

    let sqlQuery = `UPDATE Challenges SET EndDate = ? WHERE ChallengeUUID = ?`;

    await db.query(
      sqlQuery,
      [params.EndDate, params.ChallengeUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({ status: "success updated end date" });
      }
    );
  });
};
