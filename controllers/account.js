const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config = fs.readFileSync("./config/config.json");
const AppleAuth = require("apple-auth");
const jwksClient = require("jwks-rsa");
const bcrypt = require("bcryptjs");

let auth = new AppleAuth(
  config,
  fs.readFileSync("./config/appleLoginKeys.p8").toString(),
  "text"
);

module.exports = (app, db, inDevMode, jwt, stripe) => {
  let btoa = require("btoa");

  const CREDENTIALS = {
    appId: 95000,
    authKey: "D9-zZLYPaDhM9V-",
    authSecret: "OT4XqUCP8ORWVO5",
    accountKey: "qSAPKzs9VDywYyPayLXw",
  };
  const encode = (data) => {
    let str = data.reduce((a, b) => {
      return a + String.fromCharCode(b);
    }, "");
    return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
  };
  let SelectUsersQuery = `SELECT * FROM Users WHERE UserUUID=?`;
  let randomstring = require("randomstring");
  let { uploads3, s3Bucket, sendAwsEmail } = require("../models/awsS3");
  let { chat } = require("../models/streamChat.js");

  const veriftyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];
    // console.log(req.headers, "line 16 account");
    if (typeof bearerHeader !== "undefined") {
      const bearerToken = bearerHeader.split(" ")[1];

      req.token = bearerToken;
      // Going to the next middlewhere
      next();
    } else {
      res.status(403).send("<h1>Forbidden access</h1>");
    }
  };

  app.post("/api/login", async (req, res) => {
    let userAvailibileTest = [];
    let userdetailsTest = false;

    let params = {
      Name: req.body.fetchName,
      UserUUID: req.body.userUUID,
      LastLoginTime: req.body.lastSignedIn,
      Email: req.body.email,
      DateOfBirth: null,
      Weight: null,
      Height: null,
      Gender: null,
      ContactNumber: null,
      UserName: req.body.userName,
    };

    let user = {
      id: params.UserUUID,
      username: params.Name,
      email: params.Email,
    };

    db.query(SelectUsersQuery, [params.UserUUID], (err, result) => {
      if (err) {
        throw err;
      }
      userAvailibileTest = JSON.parse(JSON.stringify(result));

      if (
        userAvailibileTest.length == 0 ||
        !userAvailibileTest[0].Gender ||
        !userAvailibileTest[0].Email ||
        !userAvailibileTest[0].ContactNumber
      ) {
        //HEIGHT OR WEIGHT
        userdetailsTest = true;
      }
    });
    // SQLquery
    let sqlQuery = `INSERT INTO Users (UserUUID, Name, Email, DateOfBirth, Weight, Height, LastLoginTime, Gender,ContactNumber ,UserName) VALUES (? , ? , ? ,? , ? ,?, ? , ?, ?,? ) ON DUPLICATE KEY UPDATE  LastLoginTime = ?, Name=?, UserName=?`;
    // let tokenRes;
    // await jwt.sign({ user }, "secretkey", (err, token) => {
    //   tokenRes = token;
    // });
    db.query(
      sqlQuery,
      [
        params.UserUUID,
        params.Name,
        params.Email,
        params.DateOfBirth,
        params.Weight,
        params.Height,
        params.LastLoginTime,
        params.Gender,
        params.ContactNumber,
        params.UserName,
        params.LastLoginTime,
        params.Name,
        params.UserName,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          firstTimeUser: userdetailsTest,
          // token: tokenRes
        });
      }
    );
  });

  app.get("/api/appleAuth", async (req, res) => {
    //   let userAvailibileTest = [];
    //   let userdetailsTest = false;
    try {
      const response = await auth.accessToken(req.query.code);
      //     const response = await auth.accessToken(
      //       "cb80a99e1744d4916b8d7613eb9cb052b.0.rrxtx.5aQKiOyXlb4OAwp6m1Pyyw"
      //     );
      res.status(200).json(response);
      //     // const idToken = jwt.decode(response.id_token);
      //     // const user = {};
      //     // user.id = idToken.sub;
      //     // if (idToken.email) user.email = idToken.email;
      //     // if (req.body.user) {
      //     //   const { name } = JSON.parse(req.body.user);
      //     //   user.name = name;
      //     // }

      //     // let params = {
      //     //   UserUUID: user.id,
      //     //   LastLoginTime: new Date(),
      //     //   Email: user.email,
      //     //   UserName: user.name,
      //     // };

      //     // db.query(SelectUsersQuery, [params.UserUUID], (err, result) => {
      //     //   if (err) {
      //     //     throw err;
      //     //   }
      //     //   userAvailibileTest = JSON.parse(JSON.stringify(result));

      //     //   if (
      //     //     userAvailibileTest.length == 0 ||
      //     //     !userAvailibileTest[0].Gender ||
      //     //     !userAvailibileTest[0].Email ||
      //     //     !userAvailibileTest[0].ContactNumber
      //     //   ) {
      //     //     //HEIGHT OR WEIGHT
      //     //     userdetailsTest = true;
      //     //   }
      //     // });

      //     // let sqlQuery = `INSERT INTO Users (UserUUID, Email,LastLoginTime,UserName) VALUES (? , ? , ? ,? ) ON DUPLICATE KEY UPDATE  LastLoginTime = ?, UserName=?`;
      //     // db.query(
      //     //   sqlQuery,
      //     //   [
      //     //     params.UserUUID,
      //     //     params.Email,
      //     //     params.LastLoginTime,
      //     //     params.UserName,
      //     //     params.LastLoginTime,
      //     //     params.UserName,
      //     //   ],
      //     //   (err, result) => {
      //     //     if (err) {
      //     //       res.status(400).send("<h1>Failure to push</h1>");
      //     //       throw err;
      //     //     }
      //     //     res.status(200).json({
      //     //       firstTimeUser: userdetailsTest,
      //     //       // token: tokenRes
      //     //     });
      //     //   }
      //     // );
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  });

  async function key(kid) {
    const client = jwksClient({
      jwksUri: "https://appleid.apple.com/auth/keys",
      timeout: 30000,
    });

    return await client.getSigningKey(kid);
  }

  app.post("/api/appleAuth", async (req, res) => {
    try {
      const { id_token } = req.body.authorization;
      const { header } = jwt.decode(id_token, {
        complete: true,
      });

      const kid = header.kid;
      const publicKey = (await key(kid)).getPublicKey();
      console.log(publicKey);

      const { sub, email } = jwt.verify(id_token, publicKey);
      res.status(200).json({ sub, email });
    } catch (error) {
      res.status(400).json(error);
    }
  });

  // This should always have some imagekey
  app.post("/api/profileinfo", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      UserName: req.body.userName,
      DateOfBirth: req.body.dateOfBirth,
      Weight: req.body.weight,
      Height: req.body.height,
      Gender: req.body.gender,
      FullName: req.body.fullName,
      Email: req.body.email,
      ContactNumber: req.body.contactNumber,
      Goal: req.body.goal,
      TrainedWithCoach: req.body.trainedWithCoach,
      ActivityLevel: req.body.activityLevel,
      SpecialCircumstances: req.body.specialCircumstances,
      Profession: req.body.profession,
      DaysPerWeek: req.body.daysPerWeek,

      // console.log(req.body, "line 117 account");
    };
    // SQLquery

    let sqlQuery = `UPDATE Users SET DateOfBirth = ?, Weight = ? , Height = ?,Gender = ?, UserName=?, Name=?, Email=?, ContactNumber = ? ,  Goal= ?, TrainedWithCoach = ?, ActivityLevel =? ,SpecialCircumstances =? , Profession =?, DaysPerWeek = ? WHERE UserUUID = ?`;
    db.query(
      sqlQuery,
      [
        params.DateOfBirth,
        params.Weight,
        params.Height,
        params.Gender,
        params.UserName,
        params.FullName,
        params.Email,
        params.ContactNumber,
        params.Goal,
        params.TrainedWithCoach,
        params.ActivityLevel,
        params.SpecialCircumstances,
        params.Profession,
        params.DaysPerWeek,
        params.UserUUID,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        res.status(200).json({ status: "Success" });
      }
    );
  });

  app.get(
    "/api/profileinfo",
    //  veriftyToken,
    async (req, res) => {
      let params = {
        UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      };

      let userStatsQuery = `SELECT SUM(Complete), COUNT(*) FROM Programs WHERE UserUUID = ?`;
      let stats = {};
      await db.query(userStatsQuery, [params.UserUUID], (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        stats = result[0];
      });
      // jwt.verify(req.token, "secretkey", (err, authData) => {
      //   if (err) {
      //     res.status(403).send("<h1>Forbidden Failed Token Auth</h1>");
      //   } else {

      //   }
      // });

      // console.log(req.query, "line 117 account", req.params, req.body);
      let sqlQuery = `Select * From Users WHERE UserUUID = ?`;
      await db.query(sqlQuery, [params.UserUUID], (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }

        // if (
        //   JSON.parse(JSON.stringify(result))[0].UserImageKey &&
        //   JSON.parse(JSON.stringify(result))[0].UserImageKey != null
        // ) {
        //   let decodedResult = {};

        //   let s3params = {
        // Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: JSON.parse(JSON.stringify(result))[0].UserImageKey,
        //     // Key: "1623660703099"
        //   }; // keyname can be a filename
        //   s3Bucket.getObject(s3params, function (err, data) {
        //     if (err) {
        //       return res.status(400).send({ error: err });
        //     }
        //     let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

        //     decodedResult = {
        //       ...JSON.parse(JSON.stringify(result))[0],
        //       UserImageKey: imageResult,
        //     };
        //     res.status(200).json({
        //       status: "Success",
        //       result: decodedResult,
        //     });
        //   });
        // } else {
        res.status(200).json({
          status: "Success",
          result: result[0],
          stats,
        });
        // }
      });
      // // SQLquery
    }
  );

  app.post("/api/weblogin", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };
    db.query(SelectUsersQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({
          result: 0,
        });
        throw err;
      }
      res.status(200).json({
        result: JSON.parse(JSON.stringify(result)).length,
      });
    });
  });

  app.get("/api/userstats", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    let sqlQueryStreakCurrent = `SELECT  COUNT(DISTINCT(Date)) FROM ChallengeLogs WHERE (UserUUID = ? AND Date >= now() -INTERVAL 7 DAY)`;
    let sqlQueryStreakOld = `SELECT  COUNT(DISTINCT(Date)) FROM ChallengeLogs WHERE (UserUUID = ? AND Date < now() -INTERVAL 7 DAY AND Date > now() -INTERVAL 14 DAY)`;
    let streakCurrent;
    let streakOld;
    let repsNewCount = `SELECT SUM(Reps) FROM ChallengeLogs WHERE (UserUUID = ? AND Date >= now() -INTERVAL 7 DAY)`;
    let repsOldCount = `SELECT SUM(Reps) FROM ChallengeLogs  WHERE (UserUUID = ? AND Date < now() -INTERVAL 7 DAY AND Date > now() -INTERVAL 14 DAY)`;
    let repsOld;
    let repsNew;

    await db.query(sqlQueryStreakCurrent, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      streakCurrent = JSON.parse(JSON.stringify(result))[0][
        "COUNT(DISTINCT(Date))"
      ];
    });

    await db.query(sqlQueryStreakOld, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      streakOld = JSON.parse(JSON.stringify(result))[0][
        "COUNT(DISTINCT(Date))"
      ];
    });

    await db.query(repsNewCount, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      repsNew = JSON.parse(JSON.stringify(result))[0]["SUM(Reps)"];
    });

    await db.query(repsOldCount, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      repsOld = JSON.parse(JSON.stringify(result))[0]["SUM(Reps)"];
    });

    let sqlQuery = `SELECT * FROM UserStats WHERE (UserUUID = ?)`;
    await db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      // console.log("Success line 166 get api/challengelogs", result[0]);
      res.status(200).json({
        status: "success",
        result: {
          ...JSON.parse(JSON.stringify(result)),
          streakCurrent,
          streakOld,
          caloriesOld: 2 * repsOld,
          caloriesNew: 2 * repsNew,
        },
      });
    });
  });

  app.post("/api/storeprofileimages", uploads3.single("image"), (req, res) => {
    let params = {
      ImageUUID: req.body.imageUUID,
      ImageKey: req.file.key,
      // ImageKey:"1888888"
    };

    // User Image information
    // console.log("Route hit", params,req.body)
    // Challenge Images and Icon in the Challenge table
    let sqlQuery = `UPDATE Users SET UserImageKey = ? WHERE UserUUID = ?`;
    db.query(sqlQuery, [params.ImageKey, params.ImageUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).json({ status: "success", imageKey: params.ImageKey });
    });
  });

  app.get("/api/profileimages", async (req, res) => {
    let params = {
      // UserUUID: req.body.userUUID,
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    // User Image information
    // Challenge Images and Icon in the Challenge table
    let sqlQuery = `Select UserImageKey From Users WHERE UserUUID = ?`;
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }

      let s3params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: JSON.parse(JSON.stringify(result))[0].UserImageKey,
      }; // keyname can be a filename
      s3Bucket.getObject(s3params, function (err, data) {
        if (err) {
          return res.status(400).send({ error: err });
        }
        let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

        res.status(200).json({
          status: "Success",
          result: imageResult,
        });
      });
    });
  });

  app.post("/api/unjoinchallenge", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      ChallengeUUID: req.body.challengeUUID,
    };

    let sqlQuery =
      "DELETE FROM JoinedChallenges WHERE UserUUID = ? AND ChallengeUUID=?";
    db.query(
      sqlQuery,
      [params.UserUUID, params.ChallengeUUID],
      (err, result) => {
        if (err) {
          res.status(400).json({
            result: 0,
          });
          throw err;
        }
        res.status(200).json({
          result: true,
        });
      }
    );
  });

  app.get("/api/userrank", (req, res) => {
    let params = {
      // UserUUID: req.body.userUUID,
      // ChallengeUUID: req.body.challengeUUID,
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ChallengeUUID: inDevMode
        ? req.body.challengeUUID
        : req.query.challengeUUID,
    };
    let sqlQuery =
      "SELECT MAX(ChallengeLogs.Reps), Users.UserUUID FROM ChallengeLogs,Users WHERE ChallengeLogs.ChallengeUUID = ? AND Users.UserUUID = ChallengeLogs.UserUUID GROUP BY 2 ORDER BY 1 DESC";
    db.query(sqlQuery, [params.ChallengeUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      // console.log("Success line 193 get api/challengelogs", result[0]);
      let resultArray = JSON.parse(JSON.stringify(result));
      let rankIndex = resultArray.length + 1;
      if (resultArray.length > 0) {
        result.map((rank, i) => {
          rank.UserUUID == params.UserUUID ? (rankIndex = i + 1) : null;
          i == resultArray.length - 1
            ? res.status(200).json({
                status: "success in map func",
                result: rankIndex,
              })
            : null;
        });
      } else {
        res.status(200).json({
          status: "success",
          result: rankIndex,
        });
      }
      // AWAIT RESULT ARRAY -> User.URL (as input to S3bucket) and pass it to the result
    });
  });

  app.get("/api/activeuserbadges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `SELECT * FROM Badges, EarnedBadges WHERE Badges.IsActive=1 AND Badges.BadgeUUID=EarnedBadges.BadgeUUID AND EarnedBadges.UserUUID=? ORDER BY Badges.Reps ASC`;
    // let sqlQuery = `SELECT * FROM EarnedBadges WHERE UserUUID=?`;
    // let sqlQuery = `SELECT * FROM Badges`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      if (result.length > 0) {
        res.status(200).json({
          status: "active",
          result: result, //check
          // result,
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

  app.get("/api/inactiveuserbadges", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      ForReportScreen: inDevMode
        ? req.body.forReportScreen
        : req.query.forReportScreen,
    };

    if (!params.ForReportScreen) {
      let sqlQuery = `SELECT * FROM Badges WHERE IsActive=1 AND BadgeUUID NOT IN ( Select BadgeUUID from EarnedBadges WHERE UserUUID=?) ORDER BY Badges.Reps ASC`;

      db.query(sqlQuery, [params.UserUUID], async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
        if (result.length > 0) {
          res.status(200).json({
            status: "success",
            result: result, //check
            // result,
          });
        } else {
          res.status(200).json({
            status: "success",
            result: [],
            // result,
          });
        }
      });
    } else {
      let singleSQLQuery = `SELECT UserStats.TotalReps, Badges.BadgeUUID, Badges.Reps, Badges.ImageKey, Badges.Name FROM UserStats, Badges WHERE UserStats.UserUUID = ? AND Badges.IsActive=1 AND Badges.BadgeUUID NOT IN ( Select BadgeUUID from EarnedBadges WHERE UserUUID=?) ORDER BY Badges.Reps ASC LIMIT 1`;

      db.query(
        singleSQLQuery,
        [params.UserUUID, params.UserUUID],
        (err, result) => {
          if (err) {
            res.status(400).send("<h1>Failure to fetch</h1>");
            throw err;
          }

          if (result.length > 0) {
            let progress =
              result[0].Reps != 0 ? result[0].TotalReps / result[0].Reps : 0;
            res.status(200).json({
              status: "success",
              result: result, //check
              progress,
              // result,
            });
          } else {
            res.status(200).json({
              status: "success",
              result: [],
              progress: 0,
              // result,
            });
          }
        }
      );
    }
  });

  app.post("/api/usercompletedworkouts", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      WorkoutUUID: req.body.workoutUUID,
      Duration: req.body.workoutDuration,
    };
    let sqlQuery = `INSERT INTO CompletedWorkouts (UserUUID, WorkoutUUID, PrimaryKey) VALUES (? , ?, ?)`;
    // console.log("hit here")
    await db.query(
      sqlQuery,
      [params.UserUUID, params.WorkoutUUID, params.PrimaryKey],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
      }
    );
    let userStatsSQLquery =
      "INSERT INTO UserStats (UserUUID,  TotalChallenges, TotalReps, TotalDurationMins, TotalWorkouts) VALUES (?, 0,0,?,1) ON DUPLICATE KEY UPDATE TotalWorkouts = TotalWorkouts + 1";
    await db.query(
      userStatsSQLquery,
      [params.UserUUID, params.workoutDuration],
      (err, result) => {
        if (err) {
          res.status(400).json({ status: JSON.stringify(err) });
          throw err;
        }
        res.status(200).json({ status: "success in statsQuery" });
      }
    );
  });

  // app.post("/api/completedworkouts", (req, res) => {
  //   console.log("hit")

  // });

  app.get("/api/usercompletedworkouts", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `SELECT DISTINCT WorkoutUUID FROM CompletedWorkouts WHERE UserUUID=?`;

    let updatedResult = [];
    await db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      await result.map((item) => updatedResult.push(item["WorkoutUUID"]));
      res.status(200).json({
        result: updatedResult,
      });
    });
  });

  app.post("/api/userfeedback", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      WorkoutUUID: req.body.workoutUUID,
      ChallengeUUID: req.body.challengeUUID,
      Rating: req.body.rating,
      TextFeedback: req.body.textFeedback,
    };
    let sqlQuery = `INSERT INTO UserFeedback (PrimaryKey , UserUUID , Rating, WorkoutUUID , ChallengeUUID , TextFeedback ) VALUES (? , ?, ?, ? ,?,?)`;
    // console.log("hit here")
    let sqlQueryForWorkout = `UPDATE Programs SET Rating=?, Feedback=? WHERE PrimaryKey = ?`;

    await db.query(
      sqlQueryForWorkout,
      [params.Rating, params.TextFeedback, params.WorkoutUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
      }
    );
    await db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.UserUUID,
        params.Rating,
        params.WorkoutUUID,
        params.ChallengeUUID,
        params.TextFeedback,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }

        res.status(200).json({ result: "Pushed feedback" });
      }
    );
  });

  app.get("/api/userfeedback", async (req, res) => {
    let sqlQuery = `SELECT * FROM UserFeedback`;

    await db.query(sqlQuery, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        result: result,
      });
    });
  });

  app.post("/api/usercompletedprogrammodules", async (req, res) => {
    let params = {
      // UserUUID: req.body.userUUID,
      ModuleUUID: req.body.moduleUUID,
      Time: req.body.time,
      Calories: req.body.calories,
      CompletedExercises: JSON.stringify(req.body.completedExercises),
      SkippedExercises: JSON.stringify(req.body.skippedExercises),
    };

    let sqlQuery = `UPDATE  Programs SET Complete = ?, Calories = ?, Time = ?, CompletedExercises = ?, SkippedExercises=? WHERE PrimaryKey = ?`;
    await db.query(
      sqlQuery,
      [
        true,
        params.Calories,
        params.Time,
        params.CompletedExercises,
        params.SkippedExercises,
        params.ModuleUUID,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).send({ result: "Success" });
      }
    );
  });

  app.post("/api/programmodulesfeedbackupdate", async (req, res) => {
    let params = {
      // UserUUID: req.body.userUUID,
      ModuleUUID: req.body.moduleUUID,
      Rating: req.body.rating,
      Feedback: req.body.textFeedback,
    };

    let sqlQuery = `UPDATE  Programs SET Rating = ?, Feedback = ? WHERE PrimaryKey = ?`;
    await db.query(
      sqlQuery,
      [params.Rating, params.Feedback, params.ModuleUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).send({ result: "Success" });
      }
    );
  });

  app.post("/api/usersignups", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      SignedUpDate: req.body.signedUpDate,
    };

    let sqlQuery = `INSERT INTO UserSignUps (UserUUID ,SignedUpDate ) VALUES (? , ?)`;
    await db.query(
      sqlQuery,
      [params.UserUUID, params.SignedUpDate],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).send({ result: "Success" });
      }
    );
  });

  app.get("/api/usersignups", async (req, res) => {
    let sqlQuery = `SELECT * FROM UserSignUps ORDER BY SignedUpDate DESC`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).send({ result });
    });
  });

  app.post("/api/deleteusersignups", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };

    let sqlQuery = `DELETE FROM UserSignUps WHERE UserUUID = ?`;
    await db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).send({ result: "deleted" });
    });
  });

  app.get("/api/userprofile", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };

    let userStatsQuery = `SELECT SUM(Complete), COUNT(*) FROM Programs WHERE UserUUID = ?`;
    let stats = {};
    await db.query(userStatsQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      stats = result;
    });

    await db.query(SelectUsersQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).send({ result, stats });
    });
  });

  app.get("/api/signedupusercheck", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    let sqlQuery = `SELECT * FROM UserSignUps WHERE UserUUID = ?`;
    await db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).send({ result: result.length > 0 ? false : true });
    });
  });

  app.get("/api/allusers", async (req, res) => {
    let sqlQuery = `Select * From Users`;

    await db.query(
      sqlQuery,

      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }

        res.status(200).json({ result: result });
      }
    );
  });

  app.post("/api/cancelsubscription", async (req, res) => {
    let subscriptionID = inDevMode
      ? req.body.subscriptionID
      : req.query.subscriptionID;
    try {
      await stripe.subscriptions.del(subscriptionID);

      res.json({ success: true });
    } catch (err) {
      res.json({ err: err });
    }
  });

  app.post("/api/generatetoken", async (req, res) => {
    let params = {
      userUUID: req.body.userUUID,
      userName: req.body.userName,
    };

    const token = chat.createToken(`${params.userUUID}`);

    //   await chat.connectUser(
    //     {
    //         id: params.userUUID,
    //         name: params.userName,

    //     },
    //     `${token}`,
    // );
    res.status(200).json({
      token,
    });
  });

  app.post("/api/deleteuser", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };

    let sqlQuery = "DELETE FROM Users WHERE UserUUID = ?";
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({
          result: 0,
        });
        throw err;
      }
      res.status(200).json({
        result: "Deleted",
      });
    });
  });

  app.post("/api/manualpayment", async (req, res) => {
    let sqlQuery = `Update Users SET SubscriptionID =? , CustomerID =? , NextBillingDate=? WHERE UserUUID=?`;
    // console.log("hit here")

    let params = {
      UserUUID: req.body.userUUID,
      SubscriptionID: req.body.subscriptionID, // if using checkout.session else use session.data.id
      CustomerID: req.body.customerID,
      NextBillingDate: req.body.nextBillingDate, //if using checksession else current_period_end
    };
    await db.query(
      sqlQuery,
      [
        params.SubscriptionID,
        params.CustomerID,
        params.NextBillingDate,
        params.UserUUID,
      ],
      (err, result) => {
        if (err) {
          throw err;
        }
        res.json({ success: "pushed payment details" });
      }
    );
  });
  app.get("/api/userworkoutstats", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    let SQLtotalWorkoutsDone = `SELECT  COUNT(*),SUM(Time)  FROM Programs WHERE (UserUUID = ?) AND (Complete = ?)`;
    let SQLdherence = `SELECT SUM(Complete)/COUNT(*) FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE()`;
    let totalWorkoutsDone = { workouts: "", time: "" };

    await db.query(
      SQLtotalWorkoutsDone,
      [params.UserUUID, 1],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
        totalWorkoutsDone.workouts = result[0]["COUNT(*)"];
        totalWorkoutsDone.time = result[0]["SUM(Time)"];
      }
    );

    await db.query(SQLdherence, [params.UserUUID, 1], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: {
          workouts: totalWorkoutsDone.workouts,
          time: totalWorkoutsDone.time,
          adherence: `${Math.floor(
            100 *
              (result[0]["SUM(Complete)/COUNT(*)"]
                ? result[0]["SUM(Complete)/COUNT(*)"]
                : 0)
          )} %`,
        },
      });
    });
  });

  app.get("/api/userYearReview2022", (req, res) => {
    const reviewData = JSON.parse(
      fs.readFileSync("./yearReview/YearEndReview.json").toString()
    );
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    //console.log(reviewData)
    if (reviewData[params.UserUUID] != undefined) {
      res.status(200).json({
        result: reviewData[params.UserUUID],
        message: "Sucessfully send data",
      });
    } else {
      res.status(400).json({
        userid: params.UserUUID,
        result: [],
        message: "Invalid user for review",
      });
    }
  });

  app.get("/api/userlastmonthreport", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      month: inDevMode ? req.body.month : req.query.month,
      year: inDevMode ? req.body.year : req.query.year,
      // PeriodRange: req.body.periodRange,
    };
    // let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() AND ModuleDate > CURDATE()- ? ORDER BY ModuleDate ASC`;
    let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND MONTH(ModuleDate)= ? AND YEAR(ModuleDate)=? ORDER BY ModuleDate ASC`;

    db.query(
      sqlQuery,
      // [params.UserUUID, params.PeriodRange],
      [params.UserUUID, params.month, params.year],
      async (err, result) => {
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
              CompletedExercises: JSON.parse(item.CompletedExercises),
            };
            updatedResult.push(item);
            // ImageKey
          });

          let totalActiveDays = 0;
          let totalActiveMins = 0;
          let longestStreak = 0;
          let longestWorkout = 0;
          let streak = 0;
          updatedResult.map((dayWorkout) => {
            if (dayWorkout["Complete"] == 0) {
              streak = 0;
            }
            streak += 1;
            longestStreak = Math.max(streak, longestStreak);
            totalActiveDays += 1;
            if (dayWorkout["Time"] == 0) {
              totalActiveMins += 20;
            } else {
              totalActiveMins += dayWorkout["Time"];
            }
            longestWorkout = Math.max(longestWorkout, dayWorkout["Time"]);
          });

          res.status(200).json({
            status: "success",
            result: {
              totalActiveDays,
              totalActiveMins,
              longestStreak,
              longestWorkout,
            },
          });
          // console.log(result,"line 74")
        } else {
          res.status(200).json({
            status: "success",
            result: [],
            // result,
          });
        }
      }
    );
  });

  async function isEmailExist(email) {
    return new Promise(function (resolve, reject) {
      let sqlQuery = "SELECT * FROM Users WHERE Email = ? ";
      db.query(sqlQuery, email, (err, [result]) => {
        if (err) {
          console.log("error", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  async function assignUserToTrainer(userUUID, params) {
    return new Promise(function (resolve, reject) {
      let trainerQuery = "SELECT * FROM Trainers WHERE TrainerUUID = ?";
      db.query(trainerQuery, params.trainerUUID, (err, [result]) => {
        if (err) {
          console.log("error", err);
          reject(err);
        }
        if (result) {
          let primaryKey = randomstring.generate({
            length: 12,
            charset: "alphabetic",
          });

          let startDate = new Date();
          let endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));

          let requestData = {
            PrimaryKey: primaryKey,
            UserUUID: userUUID,
            PlanName: "Transformation Plan",
            Duration: 90,
            TrainerName: result.Name,
            StartDate: startDate,
            EndDate: endDate,
            IsActive: true,
            TrainerEmail: result.Email,
            TrainerUUID: params.trainerUUID,
            UserName: params.userName,
            UserEmail: params.email, //to update in doc
            TrailDate: new Date("2024-01-01"),
          };

          let sqlQueryForTrialDate = `UPDATE Users SET TrailDate = ? WHERE UserUUID = ?`;

          let sqlQuery = `INSERT INTO ProgramsStaticData (PrimaryKey , UserUUID ,PlanName , Duration , TrainerName , StartDate , EndDate , IsActive, TrainerEmail, TrainerUUID, UserName) VALUES (?, ?, ?, ?,?,?,?,?, ? ,?, ?)`;
          db.query(
            sqlQuery,
            [
              requestData.PrimaryKey,
              requestData.UserUUID,
              requestData.PlanName,
              requestData.Duration,
              requestData.TrainerName,
              requestData.StartDate,
              requestData.EndDate,
              requestData.IsActive,
              requestData.TrainerEmail,
              requestData.TrainerUUID,
              requestData.UserName,
            ],
            (err, result) => {
              if (err) {
                console.log("error", err);
                reject(err);
              }
            }
          );

          db.query(
            sqlQueryForTrialDate,
            [requestData.TrailDate, requestData.UserUUID],
            async (err, result) => {
              if (err) {
                console.log("error", err);
                reject(err);
              }
              resolve("program data pushed successfully with trial date");
            }
          );
        }
      });
    });
  }

  app.post("/api/usersignup", async (req, res) => {
    let params = {
      userName: req.body.userName,
      name: req.body.name,
      email: req.body.email,
      dateOfBirth: req.body.age,
      weight: req.body.weight, //POUNDS
      height: req.body.height, //CMS
      password: req.body.password,
      trainerUUID: req.body.trainerUUID,
    };
    if (!(await isEmailExist(params.email))) {
      let sqlQuery = `INSERT INTO Users (UserUUID,UserName,Name,Email,DateOfBirth, Weight, Height,Password) VALUES (? , ? , ? ,? , ? ,?, ? , ?) `;
      let userUUID = randomstring.generate({
        length: 12,
        charset: "alphabetic",
      });
      let passwordSalt = bcrypt.genSaltSync(10);
      var hashPassword = bcrypt.hashSync(params.password, passwordSalt);

      await db.query(
        sqlQuery,
        [
          userUUID,
          params.userName,
          params.name,
          params.email,
          params.dateOfBirth,
          params.weight,
          params.height,
          hashPassword,
        ],
        (err, result) => {
          if (err) {
            res.status(400).send({ err });
            throw err;
          }
          if (result) {
            assignUserToTrainer(userUUID, params)
              .then(() =>
                res
                  .status(200)
                  .send({ userUUID, msg: "account created successfully" })
              )
              .catch((err) => res.status(400).send(err));
          }
        }
      );
    } else {
      res.status(400).send("Duplicate email address");
    }
  });
  app.post("/api/userlogin", (req, res) => {
    let userAvailibileTest = [];
    let userdetailsTest = false;
    let params = {
      email: req.body.email,
      password: req.body.password,
    };
    let sqlQuery = "SELECT * FROM Users WHERE Email=?";

    db.query(sqlQuery, params.email, (err, [result]) => {
      if (err) {
        res.status(400).send({ err });
        throw err;
      }
      if (result) {
        userAvailibileTest.push(result);
        if (
          userAvailibileTest.length == 0 ||
          !userAvailibileTest[0].Gender ||
          !userAvailibileTest[0].Email ||
          !userAvailibileTest[0].ContactNumber
        ) {
          userdetailsTest = true;
        }
        let email = result.Email;
        let userUUID = result.UserUUID;
        let userName = result.UserName;
        let comparePassword = bcrypt.compareSync(
          params.password,
          result.Password
        );
        if (!comparePassword) {
          res.status(400).json({ authorize: false });
        } else {
          res.status(200).json({
            authorize: true,
            userUUID,
            email,
            userName,
            firstTimeUser: userdetailsTest,
          });
        }
      } else {
        res.status(400).send("Invalid Email Address");
      }
    });
  });

  function updateToken(token, id) {
    return new Promise(function (resolve, reject) {
      let sqlQuery = `UPDATE Users SET ResetPasswordToken = ? WHERE Users.UserUUID = ?`;
      db.query(sqlQuery, [token, id], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  app.post("/api/userforgetpassword", async (req, res) => {
    const email = req.body.email;
    let sqlQuery = `SELECT * FROM Users WHERE Email=? `;
    await db.query(sqlQuery, email, async (err, [user]) => {
      if (err) {
        res.status(400).send(err);
        throw err;
      }
      if (!user) {
        res.status(400).send("Invalid Email Address");
      }
      const jwtSecret =
        "$2a$10$Dqst4.KqcNXdFmW/pA5EVO/alyNJuB/Ozqm0kVMdL6u9iJhxIWPA6";

      const jwtPayload = {
        email: user.Email,
        id: user.UserUUID,
      };
      const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "30m" });
      updateToken(token, user.UserUUID)
        .then(async (result) => {
          const link = `https://trainer.pulse.fit/resetUserPassword/?id=${user.UserUUID}&key=${token}`;
          const filePath = path.join(
            __dirname,
            "../views/resetPasswordEmail.html"
          );
          const source = fs.readFileSync(filePath, "utf-8").toString();
          const template = handlebars.compile(source);
          const replacements = {
            RestPasswordURL: link,
          };
          const htmlToSend = template(replacements);
          const subject = `Reset password request`;
          const emailAddress = [user.Email, "support@pulse.fit"];
          sendAwsEmail(subject, emailAddress, htmlToSend)
            .then((success) => res.status(200).json({ status: "success" }))
            .catch((err) => res.status(400).json({ status: err }));
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
  });

  function updateUserPassword(userUUID, password) {
    return new Promise(function (resolve, reject) {
      let sqlQuery = `UPDATE Users SET Password = ? WHERE UserUUID = ?`;
      let passwordSalt = bcrypt.genSaltSync(10);
      var hashPassword = bcrypt.hashSync(password, passwordSalt);
      db.query(sqlQuery, [hashPassword, userUUID], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  app.post("/api/resetuserpassword", async (req, res) => {
    let sqlQuery = `SELECT * FROM Users WHERE UserUUID=?`;
    const UserUUID = req.body.userUUID;
    const token = req.body.resetToken;
    const resetPassword = req.body.password;
    try {
      await db.query(sqlQuery, UserUUID, (err, [user]) => {
        if (err) {
          res.status(400).send(err);
          throw err;
        }
        if (!user)
          return res
            .status(400)
            .send("Invalid User Details. Please Try Again Later");

        const jwtSecret =
          "$2a$10$Dqst4.KqcNXdFmW/pA5EVO/alyNJuB/Ozqm0kVMdL6u9iJhxIWPA6";
        try {
          const jwtPayload = jwt.verify(token, jwtSecret);
          if (jwtPayload.id === UserUUID) {
            updateUserPassword(UserUUID, resetPassword)
              .then((result) => {
                res.status(200).send({
                  message: "Password Successfully Updated",
                  email: user.Email,
                });
              })
              .catch((err) => {
                res.status(400).json(err);
              });
          } else {
            throw new Error("Invalid Token");
          }
        } catch (error) {
          res.status(400).send(error);
        }
      });
    } catch (error) {
      res.send("An error occurred");
    }
  });
};
