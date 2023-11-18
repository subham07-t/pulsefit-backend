const trainer = require("./trainer");
const reader = require("xlsx");
const path = require("path");
const { exerciseData, exerciseCode } = require("../utils/constants");
const fs = require("fs");
let moment = require("moment");
module.exports = (app, db, inDevMode) => {
  let randomstring = require("randomstring");

  const CREDENTIALS = {
    appId: 95000,
    authKey: "D9-zZLYPaDhM9V-",
    authSecret: "OT4XqUCP8ORWVO5",
    accountKey: "qSAPKzs9VDywYyPayLXw",
  };
  let { uploads3, s3Bucket, multer } = require("../models/awsS3");

  app.post("/api/modules", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      ModulesUUID: JSON.stringify(req.body.modulesUUID),
      Calories: 0,
      Time: 0,
      Complete: false,
      ModuleDate: req.body.moduleDate,
      Name: req.body.name,
      ModuleDuration: req.body.moduleDuration,
      Tag: req.body.tag,
    };
    // New Column IsRestDay? should be added. If this is true then we display rest in the location
    let sqlQuery = `INSERT INTO Programs (PrimaryKey , UserUUID , ModulesUUID, Calories, Time , Complete, ModuleDate, Name, ModuleDuration,Tag) VALUES (?, ?, ?,?,?,?,?, ?, ?,?)`;
    // let sqlQuery = `INSERT INTO Programs (PrimaryKey , UserUUID ) VALUES (?, ?)`;

    // console.log(params, "line 39 api/testplans POST");
    db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.UserUUID,
        params.ModulesUUID,
        params.Calories,
        params.Time,
        params.Complete,
        params.ModuleDate,
        params.Name,
        params.ModuleDuration,
        params.Tag,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          throw err;
        }
        res
          .status(200)
          .json({ status: "module pushed successfully", result: result });
      }
    );
  });

  app.post("/api/programs", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      PlanName: req.body.planName,
      Duration: req.body.duration,
      TrainerName: req.body.trainerName,
      StartDate: req.body.startDate,
      EndDate: req.body.endDate,
      IsActive: req.body.isActive,
      TrainerEmail: req.body.trainerEmail,
      TrainerUUID: req.body.trainerUUID,
      UserName: req.body.userName,
      UserEmail: req.body.userEmail, //to update in doc
      TrailDate: req.body.trailDate,
    };

    let sqlQueryForTrialDate = `UPDATE Users SET TrailDate = ? WHERE UserUUID = ?`;

    let sqlQuery = `INSERT INTO ProgramsStaticData (PrimaryKey , UserUUID ,PlanName , Duration , TrainerName , StartDate , EndDate , IsActive, TrainerEmail, TrainerUUID, UserName) VALUES (?, ?, ?, ?,?,?,?,?, ? ,?, ?)`;
    await db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.UserUUID,
        params.PlanName,
        params.Duration,
        params.TrainerName,
        params.StartDate,
        params.EndDate,
        params.IsActive,
        params.TrainerEmail,
        params.TrainerUUID,
        params.UserName,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          throw err;
        }
      }
    );

    await db.query(
      sqlQueryForTrialDate,
      [params.TrailDate, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res
          .status(200)
          .json({ status: "program data pushed successfully with trial date" });
      }
    );
  });

  app.get("/api/userprogrammetadata", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      IsActive: true,
    };
    let sqlQuery = `SELECT * FROM ProgramsStaticData WHERE UserUUID = ? AND IsActive=?`;

    db.query(
      sqlQuery,
      [params.UserUUID, params.IsActive],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: result });
      }
    );
  });

  app.get("/api/allprogramsmetadata", (req, res) => {
    let sqlQuery = `SELECT * FROM ProgramsStaticData WHERE IsActive=?`;

    db.query(sqlQuery, [true], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).send({ result: result });
    });
  });

  app.get("/api/allprogramsdetails", (req, res) => {
    let sqlQuery = `SELECT * FROM Programs`;

    db.query(sqlQuery, [true], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).send({ result: result });
    });
  });

  app.post("/api/updateusertrainer", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      IsActive: true,
      TrainerEmail: req.body.trainerEmail,
      TrainerUUID: req.body.trainerUUID,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET TrainerEmail=?, TrainerUUID=? WHERE UserUUID = ? AND IsActive=?`;

    db.query(
      sqlQuery,
      [
        params.TrainerEmail,
        params.TrainerUUID,
        params.UserUUID,
        params.IsActive,
      ],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Updated" });
      }
    );
  });

  app.post("/api/updateuserdataprograms", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      UserName: req.body.userName,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET UserName=? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [params.UserName, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Updated" });
      }
    );
  });

  app.post("/api/updatetrainername", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      TrainerName: req.body.trainerName,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET TrainerName=? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [params.TrainerName, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Updated Trainer Name" });
      }
    );
  });

  app.post("/api/updatemoduledata", async (req, res) => {
    let params = {
      ModulesUUID: JSON.stringify(req.body.modulesUUID),
      Calories: req.body.calories,
      Time: req.body.time,
      Complete: req.body.completed,
      ModuleDate: req.body.moduleDate,
      Name: req.body.name,
      ModuleDuration: req.body.moduleDuration,
      Tag: req.body.tag,
      PrimaryKey: req.body.primaryKey,
    };

    let sqlQuery = `UPDATE Programs SET ModulesUUID=?, Calories=?, Time=?, Complete=?, ModuleDate=?, Name=?, ModuleDuration=?,Tag=? WHERE PrimaryKey = ?`;
    await db.query(
      sqlQuery,
      [
        params.ModulesUUID,
        params.Calories,
        params.Time,
        params.Complete,
        params.ModuleDate,
        params.Name,
        params.ModuleDuration,
        params.Tag,
        params.PrimaryKey,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).send({ result: "Module updated" });
      }
    );
  });

  app.get("/api/userprogrammodules", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };
    let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND WEEK(ModuleDate)=WEEK(CURDATE()) ORDER BY ModuleDate ASC`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
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

  app.get("/api/userprogrammodulesfrompostman", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };
    let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND WEEK(ModuleDate)=WEEK(CURDATE()) ORDER BY ModuleDate ASC`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
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
            SkippedExercises: JSON.parse(item.SkippedExercises),
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

  app.get("/api/deletemodule", async (req, res) => {
    let params = {
      PrimaryKey: req.query.primaryKey,
    };

    let sqlQuery = `DELETE From Programs WHERE (PrimaryKey = ?)`;
    await db.query(sqlQuery, [params.PrimaryKey], (err, result) => {
      if (err) {
        res.status(400).json({ result: err });
        throw err;
      }
      res.status(200).json({ result: "Deleted" });
    });
  });

  app.get("/api/userprogrammetadatafrompostman", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };
    let sqlQuery = `SELECT * FROM ProgramsStaticData WHERE UserUUID = ?`;

    db.query(sqlQuery, [params.UserUUID], async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      res.status(200).send({ result: result });
    });
  });

  app.get("/api/usermodulehistory", (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
    };

    let sqlQueryTest = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() ORDER BY ModuleDate DESC`;

    db.query(sqlQueryTest, [params.UserUUID], async (err, result) => {
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
            SkippedExercises: JSON.parse(item.SkippedExercises),
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

  app.post("/api/updateprogramactivestatus", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
      UserUUID: req.body.userUUID,
      IsActive: false,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET IsActive = ? WHERE PrimaryKey = ? AND UserUUID =?`;

    db.query(
      sqlQuery,
      [params.PrimaryKey, params.IsActive, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Decativated" });
      }
    );
  });

  app.get("/api/usermodulehistorypostman", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
    };

    let sqlQueryTest = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() ORDER BY ModuleDate DESC`;

    db.query(sqlQueryTest, [params.UserUUID], async (err, result) => {
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
            SkippedExercises: JSON.parse(item.SkippedExercises),
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

  app.post("/api/programreactivate", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
      IsActive: true,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET IsActive = ? WHERE PrimaryKey = ?`;

    db.query(
      sqlQuery,
      [params.PrimaryKey, params.IsActive],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: result });
      }
    );
  });

  app.post("/api/overwriteprogramdata", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      PlanName: req.body.planName,
      Duration: req.body.duration,
      TrainerName: req.body.trainerName,
      StartDate: req.body.startDate,
      EndDate: req.body.endDate,
      IsActive: req.body.isActive,
      TrainerEmail: req.body.trainerEmail,
      TrainerUUID: req.body.trainerUUID,
      UserName: req.body.userName,
      OldPrimaryKey: req.body.oldPrimaryKey,
      ChatID: req.body.chatID,
      // pass the chat ID
    };

    let sqlQueryAddNew = `INSERT INTO ProgramsStaticData (PrimaryKey , UserUUID ,PlanName , Duration , TrainerName , StartDate , EndDate , IsActive, TrainerEmail, TrainerUUID, UserName, ChatID) VALUES (?, ?, ?, ?,?,?,?,?, ? ,?, ?, ?)`;

    let sqlQueryDelete = `DELETE From ProgramsStaticData WHERE (PrimaryKey = ?)`;

    await db.query(sqlQueryDelete, [params.OldPrimaryKey], (err, result) => {
      if (err) {
        res.status(400).json({ result: err });
        throw err;
      }
      console.log("deleted");
    });

    await db.query(
      sqlQueryAddNew,
      [
        params.PrimaryKey,
        params.UserUUID,
        params.PlanName,
        params.Duration,
        params.TrainerName,
        params.StartDate,
        params.EndDate,
        params.IsActive,
        params.TrainerEmail,
        params.TrainerUUID,
        params.UserName,
        params.ChatID,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          throw err;
        }
        res.status(200).json({ status: "program data pushed successfully" });
      }
    );
  });

  app.get("/api/deleteprogrammetadata", async (req, res) => {
    // Use with caution this is deleting all the rows in the table
    let params = {
      PrimaryKey: req.body.primaryKey,
    };

    let sqlQuery = `DELETE From ProgramsStaticData WHERE (PrimaryKey = ?)`;
    await db.query(sqlQuery, [params.PrimaryKey], (err, result) => {
      if (err) {
        res.status(400).json({ result: err });
        throw err;
      }
      res.status(200).json({ result: "Deleted" });
    });
  });

  app.post("/api/updateusertrailandpaymentstatus", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      TrailDate: req.body.trailDate,
      PaymentStatus: req.body.paymentStatus,
    };
    let sqlQuery = `UPDATE Users SET TrailDate = ?, PaymentStatus = ? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [params.TrailDate, params.PaymentStatus, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res
          .status(200)
          .send({ result: "updated user payment and trail details" });
      }
    );
  });

  app.post("/api/updatechatid", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      ChatID: req.body.chatID,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET ChatID = ? WHERE UserUUID = ? AND IsActive=?`;

    db.query(
      sqlQuery,
      [params.ChatID, params.UserUUID, true],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "updated user chatID" });
      }
    );
  });

  app.post("/api/updateusertraildate", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      TrailDate: req.body.trailDate,
      EndDate: req.body.trailDate,
    };
    let sqlQuery = `UPDATE Users SET TrailDate = ? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [params.TrailDate, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
      }
    );

    let sqlQueryDateUpdateTrialDate = `UPDATE ProgramsStaticData SET EndDate=? WHERE UserUUID = ?`;

    db.query(
      sqlQueryDateUpdateTrialDate,
      [params.EndDate, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Updated" });
      }
    );
  });

  // app.get("/api/deleteallprogrammodulesforcurrweek", (req, res) => {
  //   let params = {
  //     UserUUID: req.body.userUUID,
  //   };
  //   let sqlQuery = `DELETE FROM Programs WHERE WEEK(ModuleDate)=WEEK(CURDATE()) ORDER BY ModuleDate ASC`;

  //   db.query(sqlQuery, [params.UserUUID], async (err, result) => {
  //     if (err) {
  //       res.status(400).send("<h1>Failure to fetch</h1>");
  //       throw err;
  //     }
  //     let updatedResult = [];
  //     if (result.length > 0) {
  //       await result.map((item, index) => {
  //         item = {
  //           ...item,
  //           ModulesUUID: JSON.parse(item.ModulesUUID),
  //           CompletedExercises: JSON.parse(item.CompletedExercises),
  //           SkippedExercises: JSON.parse(item.SkippedExercises),
  //         };
  //         updatedResult.push(item);
  //         // ImageKey
  //       });
  //       res.status(200).json({
  //         status: "success",
  //         result: updatedResult,
  //       });
  //       // console.log(result,"line 74")
  //     } else {
  //       res.status(200).json({
  //         status: "success",
  //         result: [],
  //         // result,
  //       });
  //     }
  //   });
  // });

  app.post("/api/updateuserpaymentstatus", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      PaymentStatus: req.body.paymentStatus, //status: Active, Inactive
    };
    let sqlQuery = `UPDATE Users SET PaymentStatus = ? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [params.PaymentStatus, params.UserUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "updated user payment details" });
      }
    );
  });

  app.post("/api/updatestripedetailsuser", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      NextBillingDate: req.body.nextBillingDate,
      SubscriptionID: req.body.subscriptionID,
      CustomerID: req.body.customerID,
    };
    let sqlQuery = `UPDATE Users SET NextBillingDate = ?, SubscriptionID = ?, CustomerID = ? WHERE UserUUID = ?`;

    db.query(
      sqlQuery,
      [
        params.NextBillingDate,
        params.SubscriptionID,
        params.CustomerID,
        params.UserUUID,
      ],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: result });
      }
    );
  });

  app.get("/api/homescreendetails", async (req, res) => {
    // Use with caution this is deleting all the rows in the table
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      IsActive: true,
    };

    let firstTimeCheck;
    let profileInfo;
    let programMetaData;
    let currentWeekModules;
    let pastWeekModules;

    let sqlQuery1 = `SELECT * FROM Users WHERE UserUUID = ?`;
    await db.query(sqlQuery1, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      if (result.length > 0) {
        let userDetails = result[0];
        firstTimeCheck =
          userDetails &&
            userDetails.Weight != null &&
            userDetails.Height != null
            ? false
            : true;
      } else {
        firstTimeCheck = true;
      }
      // firstTimeCheck = result.length > 0 ? false : true;
    });

    let sqlQuery2 = `Select * From Users WHERE UserUUID = ?`;
    await db.query(sqlQuery2, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }

      profileInfo = result[0];
    });

    let sqlQuery3 = `SELECT * FROM ProgramsStaticData WHERE UserUUID = ? AND IsActive=?`;

    await db.query(
      sqlQuery3,
      [params.UserUUID, params.IsActive],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }
        programMetaData = result;
      }
    );

    let sqlQuery4 = `SELECT * FROM Programs WHERE UserUUID = ? AND WEEK(ModuleDate)=WEEK(CURDATE()) AND YEAR(ModuleDate)=YEAR(CURDATE()) ORDER BY ModuleDate ASC`; //ADD YEAR

    await db.query(sqlQuery4, [params.UserUUID], async (err, result) => {
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
        currentWeekModules = updatedResult;

        // console.log(result,"line 74")
      } else {
        currentWeekModules = [];
      }
    });

    let sqlQuery5 = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() AND WEEK(ModuleDate)!=WEEK(CURDATE()) ORDER BY ModuleDate DESC`;

    await db.query(sqlQuery5, [params.UserUUID], async (err, result) => {
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
            SkippedExercises: JSON.parse(item.SkippedExercises),
          };
          updatedResult.push(item);
          // ImageKey
        });
        pastWeekModules = updatedResult;
        // console.log(result,"line 74")
        let sendToClient = {
          firstTimeCheck,
          profileInfo,
          currentWeekModules,
          programMetaData,
          pastWeekModules,
        };
        res.status(200).json({ result: sendToClient });
      } else {
        pastWeekModules = [];

        let sendToClient = {
          firstTimeCheck,
          profileInfo,
          currentWeekModules,
          programMetaData,
          pastWeekModules,
        };

        res.status(200).json({ result: sendToClient });
      }
    });
  });

  app.get("/api/getmoduledetails", async (req, res) => {
    let params = {
      PrimaryKey: req.query.primaryKey,
    };

    let sqlQuery = `SELECT * From Programs WHERE (PrimaryKey = ?)`;
    await db.query(sqlQuery, [params.PrimaryKey], async (err, result) => {
      if (err) {
        res.status(400).json({ result: err });
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ModulesUUID: JSON.parse(item.ModulesUUID),
            CompletedExercises: JSON.parse(item.CompletedExercises),
            SkippedExercises: JSON.parse(item.SkippedExercises),
          };
          updatedResult.push(item);
          // ImageKey
        });

        // console.log(result,"line 74")

        res.status(200).json({ result: updatedResult });
      } else {
        res.status(200).json({ result: [] });
      }
    });
  });

  app.get("/api/selectworkoutsforaday", async (req, res) => {
    let sqlQuery4 = `SELECT * FROM Programs WHERE  WEEK(ModuleDate)=WEEK(CURDATE()) AND ModuleDate < CURDATE()`; //ADD YEAR

    await db.query(sqlQuery4, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }
      res.status(200).json({ result: result });
    });
  });

  app.get("/api/getmoduledetails", async (req, res) => {
    let params = {
      PrimaryKey: req.query.primaryKey,
    };

    let sqlQuery = `SELECT * From Programs WHERE (PrimaryKey = ?)`;
    await db.query(sqlQuery, [params.PrimaryKey], async (err, result) => {
      if (err) {
        res.status(400).json({ result: err });
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ModulesUUID: JSON.parse(item.ModulesUUID),
            CompletedExercises: JSON.parse(item.CompletedExercises),
            SkippedExercises: JSON.parse(item.SkippedExercises),
          };
          updatedResult.push(item);
          // ImageKey
        });

        // console.log(result,"line 74")

        res.status(200).json({ result: updatedResult });
      } else {
        res.status(200).json({ result: [] });
      }
    });
  });

  app.get("/api/userprogrammoduleslastweek", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      // PeriodRange: req.body.periodRange,
    };
    // let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() AND ModuleDate > CURDATE()- ? ORDER BY ModuleDate ASC`;
    let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate <= CURDATE() ORDER BY ModuleDate DESC LIMIT 6`;

    db.query(
      sqlQuery,
      // [params.UserUUID, params.PeriodRange],
      [params.UserUUID],
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
      }
    );
  });

  app.get("/api/userprogrammoduleslastmoth", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      month: req.body.month,
      year: req.body.year,
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
      }
    );
  });

  // api to insert multiple programs simultaneously
  app.post("/api/multimodules", (req, res) => {
    const UserUUID = req.body.userUUID;
    const requestBody = req.body.data;
    const paramValues = requestBody.map((element) => {
      let primaryKey = randomstring.generate({
        length: 12,
        charset: "alphabetic",
      });
      // param values should be in insert query sequence
      //(PrimaryKey , UserUUID , ModulesUUID, Calories, Time , Complete, ModuleDate, Name, ModuleDuration,Tag)
      let params = [
        primaryKey,
        UserUUID,
        JSON.stringify(element.modulesUUID),
        0,
        0,
        false,
        element.moduleDate,
        element.name,
        element.moduleDuration,
        element.tag,
      ];
      return params;
    });

    let sqlQuery = `INSERT INTO Programs (PrimaryKey , UserUUID , ModulesUUID, Calories, Time , Complete, ModuleDate, Name, ModuleDuration,Tag) VALUES ?`;

    db.query(sqlQuery, [paramValues], (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
        throw err;
      }
      res
        .status(200)
        .json({ status: "module pushed successfully", result: result });
    });
  });

  // api to update program's isActive column
  app.post("/api/updateuserprogramactivity", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
    };
    let sqlQuery = `UPDATE ProgramsStaticData SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE PrimaryKey=?`;
    console.log(params.PrimaryKey);
    db.query(sqlQuery, params.PrimaryKey, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failed to update status</h1>");
        throw err;
      }
      res.status(200).json({
        status: "success",
        result: result,
      });
    });
  });

  // api to get total number of workout done by the user
  app.get("/api/totalworkoutdone", async (req, res) => {
    let params = {
      UserUUID: req.query.userUUID,
    };
    let sqlQuery = `SELECT  SUM(Complete) as TotalNoOfWorkoutDone FROM Programs WHERE UserUUID=? AND Complete=1; `;
    await db.query(sqlQuery, params.UserUUID, (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      let totalNoOfWorkoutDone = result[0].TotalNoOfWorkoutDone;
      res.status(200).send({ totalNoOfWorkoutDone });
    });
  });

  const getUpdatedName = (name) => {
    let updatedName = "";
    if (name.indexOf("P") == 0) {
      const indexOfD = name.indexOf("D");
      let intBeforeD = +name.slice(1, indexOfD);
      let stringAfterD = name.slice(indexOfD + 1, name.length);

      if (!isNaN(intBeforeD) && indexOfD > 0 && indexOfD <= 5) {
        updatedName = "P" + (intBeforeD + 1) + "D" + stringAfterD;
      } else {
        updatedName = name;
      }
    } else {
      updatedName = name;
    }
    return updatedName;
  };

  // api for read excel file and then send the data in excel file
  app.post("/api/extractperformancereport", async (req, res) => {
    let jsonData = req.body.userkeys;
    let limit = req.body.limit;
    Promise.all(
      jsonData.map(async (item) => {
        let UserUUID = item.UserUUID;
        let UserName = item.Name;
        if (UserUUID) {
          const fileDetails = await getExcelUrlForUser(UserUUID, UserName, limit);
          if (fileDetails instanceof Error) {
            res.status(400).send(fileDetails.message);
          } else {
            return { UserUUID, url: fileDetails };
          }
        }
      })
    )
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  });

  // function to convert json data into excel file
  const exportDataToExcel = async (data, fileName) => {
    try {
      const workBook = reader.utils.book_new();
      const headingColumnNames = [
        "Module_exercise",
        "Module_reps",
        "Module_weights",
        "Module_weightUnits",
        "Module_duration",
        "Module_exerciseType",
        "Module_sets",
        "Module_videoKey",
        "Module_imageKey",
        "calories",
        "moduleDate",
        "name",
        "moduleDuration",
        "userUUID",
        "rating",
        "feedback",
      ];
      data.forEach((item) => {
        let initialIndex = 0;
        let module = [];
        let completedExercisesData = [];
        let itemModulesUUID = JSON.parse(item.ModulesUUID);
        let breakTime = 60;
        let itemModulesUUIDData = itemModulesUUID.find((item) => item.exercise == "Break");
        console.log("itemModulesUUIDData", itemModulesUUIDData)
        if (itemModulesUUIDData) {
          breakTime = itemModulesUUIDData.duration;
        }
        let itemCompletedExercises = item.CompletedExercises;
        console.log("itemCompletedExercises", itemCompletedExercises)
        if (itemCompletedExercises) {
          completedExercisesData = JSON.parse(itemCompletedExercises);
        } else {
          let itemModulesUUID = item.ModulesUUID;
          if (itemModulesUUID) {
            completedExercisesData = JSON.parse(itemModulesUUID);
          }
        }
        if (
          completedExercisesData.length / JSON.parse(item.ModulesUUID).length <=
          0.5
        ) {
          completedExercisesData = JSON.parse(item.ModulesUUID);
        }

        let rows = 0;

        if (completedExercisesData.length) {
          completedExercisesData.forEach((completedExercise) => {
            let subModule = "";
            let duration =
              Math.round(parseInt(completedExercise.duration) / 10) * 10;
            let reps = completedExercise.reps;
            let weights = completedExercise.weights;
            let module_date = item.ModuleDate;
            let updated_name = getUpdatedName(item.Name);
            let new_date = new Date(module_date);
            new_date.setDate(new_date.getDate() + 8);
            let total_duration = Math.round(item.Time / 10) * 10;
            if (total_duration <= 0) {
              total_duration = item.ModuleDuration;
            }
            if (reps > 0) {
              duration = 0;
              if (completedExercise.exercise)
                if (
                  exerciseData[completedExercise.exercise] != null &&
                  reps >= exerciseData[completedExercise.exercise].Max
                ) {
                  reps = exerciseData[completedExercise.exercise].Min;
                  weights =
                    +weights + exerciseData[completedExercise.exercise].Weight;
                } else {
                  reps += 1;
                }
            }

            if (rows == 0) {
              if (initialIndex == 0) {
                initialIndex += 1;
              }
              if (completedExercise.exercise == "BREAK") {
                return;
              }
              if (reps && weights) {
                duration = 0;
              }

              // first exercise shouldn't be break and video if isn't exisiting than use it from the library, for rep based module duration should come from the actual list EXERCISE TYPE LOGIC
              subModule = {
                ModuleExercise: completedExercise.exercise,
                ModuleReps: reps,
                ModuleWeights: weights,
                ModuleWeightUnits: completedExercise.weightUnits,
                ModuleDuration: duration,
                ModuleExerciseType: completedExercise.exerciseType,
                ModuleSets: 1,
                ModuleVideoKey:
                  "https://dial9vo52zsvi.cloudfront.net/" +
                  exerciseCode[completedExercise.exercise] +
                  ".mp4",
                ModuleImageKey: completedExercise.imageKey,
                calories: item.Calories,
                moduleDate: moment(new_date).format("YYYY-MM-DD"), //+7 days
                name: updated_name,
                moduleDuration: item.Time, //Should we use ModuleDuration instead?
                userUUID: item.UserUUID,
                rating: item.Rating,
                feedback: item.Feedback,
              };
            } else {
              let videoKey =
                "https://dial9vo52zsvi.cloudfront.net/" +
                exerciseCode[completedExercise.exercise] +
                ".mp4";
              let sets = 1;
              duration = parseInt(completedExercise.duration);
              if (reps && weights) {
                duration = 0;
              }
              if (completedExercise.exercise.toUpperCase() == "BREAK") {
                videoKey = "";
                reps = "";
                sets = "";
                duration = breakTime;
              }
              if (completedExercise.exercise.toUpperCase() == "FRONT PLANK") {
                reps = 0;
              }


              subModule = {
                ModuleExercise: completedExercise.exercise,
                ModuleReps: reps,
                ModuleWeights: weights,
                ModuleWeightUnits: completedExercise.weightUnits,
                ModuleDuration: duration,
                ModuleExerciseType: completedExercise.exerciseType,
                ModuleSets: sets,
                ModuleVideoKey: videoKey,
                ModuleImageKey: completedExercise.imageKey,
              };
            }
            rows += 1;
            if (subModule.ModuleExercise) {
              module.push(subModule);
            }
          });
        }

        let sheetData = module.map((sheerModule, index) => {
          return Object.values(sheerModule);
        });
        const workSheetData = [headingColumnNames, ...sheetData];
        const workSheet = reader.utils.aoa_to_sheet(workSheetData);
        reader.utils.book_append_sheet(workBook, workSheet);
      });
      const fileData = reader.write(workBook, {
        type: "buffer",
        bookType: "xlsx",
        bookSST: false,
      });
      const fileDetails = await uploadFileToS3(fileData, fileName);
      return fileDetails;
    } catch (e) {
      return e;
    }
  };

  async function uploadFileToS3(file, fileName) {
    return new Promise(function (resolve, reject) {
      const params = {
        Bucket: "programsurlstorage", // pass your bucket name
        Key: fileName, // file will be saved as testBucket/contacts.csv
        ACL: "public-read",
        Body: file,
      };
      s3Bucket.upload(params, (s3Err, data) => {
        if (s3Err) throw s3Err;
        resolve(data.Location); // successfully fill promise
      });
    });
  }

  async function getExcelUrlForUser(UserUUID, UserName, limit) {
    return new Promise(function (resolve, reject) {
      let limitToSet = 6
      if (limit) {
        limitToSet = limit;
      }

      if (limitToSet > 10) {
        limitToSet = 10;
      }
      let sqlQuery = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate <= CURDATE() ORDER BY ModuleDate DESC LIMIT ${limitToSet}`;

      db.query(sqlQuery, UserUUID, async (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        const excelData = result.map((item) => {
          return {
            PrimaryKey: item.PrimaryKey,
            UserUUID: item.UserUUID,
            ModulesUUID: item.ModulesUUID,
            Calories: item.Calories,
            Time: item.Time,
            Complete: item.Complete,
            ModuleDate: item.ModuleDate,
            Feedback: item.Feedback,
            Name: item.Name,
            ModuleDuration: item.ModuleDuration,
            Tag: item.Tag,
            CompletedExercises: item.CompletedExercises,
            SkippedExercises: item.SkippedExercises,
            Rating: item.Rating,
            Feedback: item.Feedback,
          };
        });
        const fileNameUser = UserName.replace(/[^A-Z0-9]/gi, "_");
        const writeFileName = `${fileNameUser}.xlsx`;
        const exportDataToExcelUrl = await exportDataToExcel(
          excelData,
          writeFileName
        );
        resolve(exportDataToExcelUrl);
      });
    });
  }

  const getListOfObjects = (params) => {
    const objects = [];
    return new Promise((resolve, reject) => {
      s3Bucket.listObjects(params, function (err, data) {
        if (err) {
          reject(err);
        }
        if (data) {
          data.Contents.forEach(function (obj) {
            objects.push({ Key: obj.Key });
          });
        }
        resolve(objects);
      });
    });
  };

  async function deleteFileFromS3(file, fileName) {
    const bucketName = "programsurlstorage";
    var paramsForList = {
      Bucket: bucketName,
      Delimiter: "/",
    };

    const result = await getListOfObjects(paramsForList);
    var paramsForDelete = {
      Bucket: bucketName,
      Delete: {
        Objects: result,
        Quiet: false,
      },
    };
    s3Bucket.deleteObjects(paramsForDelete, function (err, data) {
      if (err) res.status(400).send(err);
      else return "Deleted successfully";
    });
  }

  // change excel date to js date
  function ExcelDateToJSDate(serial) {
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;
    let date_info = new Date(utc_value * 1000);

    let fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    let seconds = total_seconds % 60;

    total_seconds -= seconds;

    let hours = Math.floor(total_seconds / (60 * 60));
    let minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(
      date_info.getFullYear(),
      date_info.getMonth(),
      date_info.getDate(),
      hours,
      minutes,
      seconds
    );
  }

  function storeDataFromExcel(file) {
    let sheetList = file.Sheets;
    let finalRequest = [];
    Object.values(sheetList).forEach((sheet) => {
      const sheetData = reader.utils.sheet_to_json(sheet);
      let userUUID = sheetData[0].userUUID;
      let calories = 350;
      let time = 0;
      let completed = false;
      let moduleDate = sheetData[0].moduleDate
        ? new Date(ExcelDateToJSDate(sheetData[0].moduleDate))
        : "";
      let name = sheetData[0].name;
      let moduleDuration = sheetData[0].moduleDuration;
      let tag = "Circuit";
      let primaryKey = randomstring.generate({
        length: 12,
        charset: "alphabetic",
      });
      let moduleData = {
        primaryKey,
        userUUID,
        calories,
        time,
        completed,
        moduleDate,
        name,
        moduleDuration,
        tag,
      };

      let moduleUUID = [];
      sheetData.map((item, index) => {
        let exerciseType = "";
        let sets = "";
        let submodule = {};
        if (item.Module_exercise.toUpperCase() == "BREAK") {
          sets = 1;
          exerciseType = "BREAK";
        } else {
          sets = item.Module_sets;
          exerciseType = "Strength";
        }
        while (sets) {
          if (item.Module_exercise.toUpperCase() == "BREAK") {
            submodule = {
              exercise: item.Module_exercise,
              reps: 0,
              duration: item.Module_duration,
              exerciseType: "",
              sets: 1,
              videoKey: "",
              imageKey: "",
              weights: "",
              weightUnits: "",
            };
          } else {
            let weights = 0;
            if (!isNaN(item.Module_weights) && item.Module_weights !== "") {
              weights = parseInt(item.Module_weights);
            }
            let duration = 0;
            if (!isNaN(item.Module_duration) && item.Module_duration !== "") {
              duration = parseInt(item.Module_duration);
            }
            let reps = 0;
            if (!isNaN(item.Module_reps) && item.Module_reps !== "") {
              reps = parseInt(item.Module_reps);
            }

            if (item.Module_exercise.toUpperCase() == "FRONT PLANK") {
              reps = 0;
            }

            submodule = {
              exercise: item.Module_exercise,
              reps: reps,
              duration: duration,
              exerciseType: exerciseType,
              sets: 1,
              videoKey: item.Module_videoKey,
              imageKey: item.Module_imageKey,
              weights: weights,
              weightUnits: item.Module_weightUnits
                ? item.Module_weightUnits
                : 0,
            };
          }
          sets--;
          moduleUUID.push(submodule);
        }
      });
      moduleData["modulesUUID"] = moduleUUID;
      finalRequest.push(moduleData);
    });
    const paramValues = finalRequest.map((element) => {
      let params = [
        element.primaryKey,
        element.userUUID,
        JSON.stringify(element.modulesUUID),
        element.calories,
        element.time,
        element.completed,
        element.moduleDate,
        element.name,
        element.moduleDuration,
        element.tag,
      ];
      return params;
    });
    return paramValues;
  }

  const insertBulkModules = (paramValues) => {
    let sqlQuery = `INSERT INTO Programs (PrimaryKey , UserUUID , ModulesUUID, Calories, Time , Complete, ModuleDate, Name, ModuleDuration,Tag) VALUES ?`;
    return new Promise((resolve, reject) => {
      db.query(sqlQuery, [paramValues], (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };

  const createModuleFromExcel = async (req, res, next) => {
    try {
      const buffer = req.file.buffer;
      const workbook = reader.read(buffer);
      const parmaValues = storeDataFromExcel(workbook);
      insertBulkModules(parmaValues)
        .then((result) => {
          return res.status(200).json({
            result,
          });
        })
        .catch((error) => {
          throw error;
        });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  const createModuleFromBulkExcel = async (req, res, next) => {
    let fileList = req.files;
    Promise.all(
      fileList.map(async (fileInfo) => {
        const buffer = fileInfo.buffer;
        const workbook = reader.read(buffer);
        const parmaValues = storeDataFromExcel(workbook);
        return parmaValues;
      })
    ).then((parmaValues) => {
      let finalParmaValues = [];
      parmaValues.forEach((item) => {
        finalParmaValues.push(...item);
      });

      insertBulkModules(finalParmaValues)
        .then((result) => {
          return res.status(200).json({
            result,
          });
        })
        .catch((error) => {
          return res.status(400).json({
            error,
          });
        });
    });
  };

  app.post(
    "/api/createmodulefromexcel",
    multer().single("excelFile"),
    createModuleFromExcel
  );

  app.post(
    "/api/createmodulefrombulkexcel",
    multer().array("excelFiles"),
    createModuleFromBulkExcel
  );
};
