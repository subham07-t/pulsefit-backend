const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const handlebars = require("handlebars");

module.exports = (app, db, inDevMode) => {
  let btoa = require("btoa");
  const encode = (data) => {
    let str = data.reduce((a, b) => {
      return a + String.fromCharCode(b);
    }, "");
    return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
  };
  let randomstring = require("randomstring");
  let {
    uploads3,
    s3Bucket,
    imageDimension,
    multer,
    sendAwsEmail,
  } = require("../models/awsS3");
  let { plans } = require("../models/programs");

  // function to check if date is in current week or not
  Date.prototype.GetFirstDayOfWeek = function () {
    return new Date(this.setDate(this.getDate() - this.getDay()));
  };
  Date.prototype.GetLastDayOfWeek = function () {
    return new Date(this.setDate(this.getDate() - this.getDay() + 6));
  };

  const isDateInThisWeek = (date) => {
    let returnValue = false;
    const checkDate = new Date(date);
    const currentDate = new Date();
    const firstDay = currentDate.GetFirstDayOfWeek();
    const lastDay = currentDate.GetLastDayOfWeek();

    if (
      checkDate.getTime() <= lastDay.getTime() &&
      checkDate.getTime() >= firstDay.getTime()
    ) {
      returnValue = true;
    }
    return returnValue;
  };

  app.post("/api/trainerprofile", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      TrainerUUID: primaryKey,
      Name: req.body.name,
      Email: req.body.email,
      TimeZone: req.body.timeZone,
      NumberOfTrainees: req.body.numberOfTrainees,
      Gender: req.body.gender,
      IsActive: req.body.isActive,
      ContactNumber: req.body.contactNumber,
      CostPerMonth: req.body.costPerMonth,
      Currency: req.body.currency,
      Bio: req.body.bio,
      ImageKey: req.body.imageKey,
    };
    let sqlQuery = `INSERT INTO Trainers (TrainerUUID, Name, Email,TimeZone, NumberOfTrainees, Gender, ContactNumber, CostPerMonth ,Bio , Currency, ImageKey, IsActive) VALUES (? ,? , ?, ?, ? ,?, ?, ? , ?, ?, ? ,?)`;

    db.query(
      sqlQuery,
      [
        params.TrainerUUID,
        params.Name,
        params.Email,
        params.TimeZone,
        params.NumberOfTrainees,
        params.Gender,
        params.ContactNumber,
        params.CostPerMonth,
        params.Bio,
        params.Currency,
        params.ImageKey,
        params.IsActive,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          status: "Success",
        });
      }
    );
  });

  app.post("/api/updatetrainerchatid", (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      ChatID: req.body.chatID,
    };
    let sqlQuery = `UPDATE Trainers SET ChatID = ? WHERE TrainerUUID = ?`;

    db.query(
      sqlQuery,
      [params.ChatID, params.TrainerUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "updated trainer chatID" });
      }
    );
  });

  app.post("/api/updatenumberoftrainees", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET NumberOfTrainees= NumberOfTrainees+1 WHERE TrainerUUID = ?`;
    db.query(sqlQuery, [params.TrainerUUD], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).json({ status: "Success" });
    });
  });

  app.post("/api/updatetrainerbiostuff", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
      Bio: req.body.bio,
      ImageKey: req.body.imageKey,
      Currency: req.body.currency,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET Bio=?, Currency = ?, ImageKey = ? WHERE TrainerUUID = ?`;
    db.query(
      sqlQuery,
      [params.Bio, params.Currency, params.ImageKey, params.TrainerUUD],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        res.status(200).json({ status: "Success" });
      }
    );
  });

  app.post("/api/updatetrainerbio", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
      Bio: req.body.bio,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET Bio=? WHERE TrainerUUID = ?`;
    db.query(sqlQuery, [params.Bio, params.TrainerUUD], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).json({ status: "BIO UPDATED" });
    });
  });

  app.post("/api/trainerprofileupdate", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
      Name: req.body.name,
      Email: req.body.email,
      ContactNumber: req.body.contactNumber,
      Bio: req.body.bio,
      ImageKey: req.body.imageKey,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET Bio=?, Name=?, Email =?,ContactNumber=?, ImageKey=? WHERE TrainerUUID = ?`;
    db.query(
      sqlQuery,
      [
        params.Bio,
        params.Name,
        params.Email,
        params.ContactNumber,
        params.ImageKey,
        params.TrainerUUD,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        res.status(200).json({ status: "Trainer Details Updated" });
      }
    );
  });

  app.get("/api/trainerprofile", async (req, res) => {
    // // till we get a femail trainer

    // let params = {
    //   IsActive: true,
    // };
    // let sqlQuery = `Select * From Trainers WHERE (IsActive = ?) ORDER BY NumberOfTrainees ASC LIMIT 1`;

    // await db.query(sqlQuery, [params.IsActive], (err, result) => {
    //   if (err) {
    //     res.status(400).json({ result: false });
    //     throw err;
    //   }

    //   res.status(200).json({ result: result[0] });
    // });

    // For both the genders
    let params = {
      IsActive: true,
      FirstGender: "Male",
      SecondGender: "Female",
    };
    let maleTrainer = [];
    let femaleTrainer = [];

    let sqlQueryMaleTrainers = `Select * From Trainers WHERE (IsActive = ?) AND (Gender = ?) ORDER BY NumberOfTrainees ASC LIMIT 3`;
    let sqlQueryFemaleTrainers = `Select * From Trainers WHERE (IsActive = ?) AND (Gender = ?) ORDER BY NumberOfTrainees ASC LIMIT 2`;

    await db.query(
      sqlQueryMaleTrainers,
      [params.IsActive, params.FirstGender],
      async (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }

        let updatedMaleTrainerList = [];

        await result.map((trainer) => {
          if (trainer.Highlights != null) {
            let val = {
              ...trainer,
              Highlights: JSON.parse(trainer.Highlights),
            };
            updatedMaleTrainerList.push(val);
          } else {
            updatedMaleTrainerList.push(trainer);
          }
        });

        maleTrainer = updatedMaleTrainerList;
      }
    );

    await db.query(
      sqlQueryFemaleTrainers,
      [params.IsActive, params.SecondGender],
      async (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }

        let updatedFemaleTrainerList = [];

        await result.map((trainer) => {
          if (trainer.Highlights != null) {
            let val = {
              ...trainer,
              Highlights: JSON.parse(trainer.Highlights),
            };
            updatedFemaleTrainerList.push(val);
          } else {
            updatedFemaleTrainerList.push(trainer);
          }
        });

        femaleTrainer = updatedFemaleTrainerList;
        let finalResult = [...femaleTrainer, ...maleTrainer];

        res.status(200).json({ result: finalResult });
      }
    );
  });

  app.post("/api/deactivateatrainer", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET IsActive = 0 WHERE TrainerUUID = ?`;
    db.query(sqlQuery, [params.TrainerUUD], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).json({ status: "Success" });
    });
  });

  app.post("/api/activateatrainer", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET IsActive = 1 WHERE TrainerUUID = ?`;
    db.query(sqlQuery, [params.TrainerUUD], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).json({ status: "Success" });
    });
  });

  app.post("/api/updatetraineremail", (req, res) => {
    let params = {
      TrainerUUD: req.body.trainerUUID,
      TrainerEmail: req.body.trainerEmail,
    };
    // console.log(req.body, "line 117 account");
    // SQLquery
    let sqlQuery = `UPDATE Trainers SET Email = ? WHERE TrainerUUID = ?`;
    db.query(
      sqlQuery,
      [params.TrainerEmail, params.TrainerUUD],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        res.status(200).json({ status: "Success" });
      }
    );
  });
  app.post("/api/updatetrainerhighlights", (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      Highlights: JSON.stringify(req.body.highlights),
    };
    let sqlQuery = `UPDATE Trainers SET Highlights = ? WHERE TrainerUUID = ?`;

    db.query(
      sqlQuery,
      [params.Highlights, params.TrainerUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "updated trainer highlights" });
      }
    );
  });
  app.get("/api/alltrainers", async (req, res) => {
    let sqlQuery = `Select * From Trainers`;

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

  app.get("/api/trainerinfo", async (req, res) => {
    let params = {
      TrainerUUID: req.query.trainerUUID,
    };
    let sqlQuery = `Select * From Trainers WHERE TrainerUUID=?`;

    await db.query(sqlQuery, [params.TrainerUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }

      res.status(200).json({ result: result });
    });
  });

  app.get("/api/deletetrainer", async (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
    };

    let sqlQuery = `DELETE From Trainers WHERE (TrainerUUID = ?)`;
    await db.query(sqlQuery, [params.TrainerUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).json({ result: "Deleted" });
    });
  });

  app.get("/api/authtrainer", async (req, res) => {
    let params = {
      TrainerUUID: req.query.trainerUUID, // we should update this to password as auth need password. not updating yet because FE have to change too.
      TrainerEmail: req.query.trainerEmail,
    };
    // let sqlQuery = `SELECT * From Trainers WHERE TrainerUUID = ? AND Email = ? AND IsActive=?`;
    let sqlQuery = `SELECT * From Trainers WHERE Email = ?`;

    await db.query(sqlQuery, params.TrainerEmail, (err, [result]) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      if (result) {
        let trainerEmail = result.Email;
        let trainerUUID = result.TrainerUUID;

        if (result.Password) {
          let comparePassword = bcrypt.compareSync(
            params.TrainerUUID,
            result.Password
          );
          if (!comparePassword) {
            res.status(400).json({ authorize: false });
            return;
          } else {
            res
              .status(200)
              .json({ authorize: true, trainerEmail, trainerUUID });
            return;
          }
        } else {
          if (params.TrainerUUID !== result.TrainerUUID) {
            res.status(400).json({ authorize: false });
            return;
          } else {
            res
              .status(200)
              .json({ authorize: true, trainerEmail, trainerUUID });
            return;
          }
        }
      } else {
        res.status(200).json({ authorize: false });
      }
    });
  });

  async function getUserS3Image(ImageKey) {
    if (ImageKey != null) {
      return new Promise(function (resolve, reject) {
        let s3params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: JSON.parse(JSON.stringify(ImageKey)),
        };
        s3Bucket.getObject(s3params, (err, data) => {
          if (err) {
            throw err;
          }
          let s3ImageUrl = "data:image/jpeg;base64," + encode(data.Body);
          resolve(s3ImageUrl); // successfully fill promise
        });
      });
    } else {
      return new Promise(function (resolve, reject) {
        let userImageDetails =
          "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/AppImages/assets/detailScreen/sportsman.png";
        resolve(userImageDetails); // successfully fill promise
      });
    }
  }
  const generateAdherenceDetails = (adherenceIndex, userAdherenceDetails) => {
    if (
      !userAdherenceDetails ||
      (userAdherenceDetails && !userAdherenceDetails.length)
    ) {
      return [0, 0, 0];
    }

    if (
      userAdherenceDetails &&
      userAdherenceDetails.length === adherenceIndex.length
    ) {
      const adherenceDetails = userAdherenceDetails.map((element) => {
        return element.value;
      });

      return adherenceDetails;
    }

    if (
      userAdherenceDetails &&
      userAdherenceDetails.length < adherenceIndex.length
    ) {
      const adherenceDetails = adherenceIndex.map((indexElement) => {
        const [filterData] = userAdherenceDetails.filter((element) => {
          return element.type == indexElement;
        });
        return filterData ? filterData.value : 0;
      });

      return adherenceDetails;
    }
  };

  app.get("/api/trainerdashboard", async (req, res) => {
    // let params = inDevMode
    //   ? {
    //       TrainerUUID: req.body.trainerUUID,
    //       TrainerEmail: req.body.trainerEmail,
    //     }
    //   : {
    //       TrainerUUID: req.query.trainerUUID,
    //       TrainerEmail: req.query.trainerEmail,
    //     };

    let params = {
      TrainerUUID: req.query.trainerUUID,
      TrainerEmail: req.query.trainerEmail,
    };
    // console.log("params", params)
    // let sqlQuery = `SELECT * From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ? AND IsActive=?`;
    let sqlQuery = `SELECT * From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ?`;

    let sqlQueryModuleDetails = `SELECT P.UserUUID, P.ModuleDate, P.Complete FROM Programs AS P WHERE P.UserUUID IN (SELECT UserUUID From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ?) ORDER BY P.ModuleDate DESC`;

    let metrics = {};
    let finalResult = [];
    let userModuleData = new Map();
    let adherenceDetails = new Map();

    // adherence details according to this indexes
    let adherenceIndex = ["all", "lastWeek", "lastMonth"];
    let adherenceCondition = "ModuleDate <CURDATE()";
    await db.query(
      sqlQueryModuleDetails,
      [params.TrainerUUID, params.TrainerEmail],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        result.map(async (details) => {
          let userDetails = [];
          if (userModuleData.has(details.UserUUID)) {
            userDetails = userModuleData.get(details.UserUUID);
          }
          userDetails.push(details);
          userModuleData.set(details.UserUUID, userDetails);
        });
      }
    );

    adherenceIndex.forEach(async (item, index) => {
      if (item == "lastWeek") {
        adherenceCondition =
          "ModuleDate > (CURDATE() - INTERVAL 7 DAY)  AND ModuleDate <CURDATE()";
      } else if (item == "lastMonth") {
        adherenceCondition =
          "ModuleDate > (CURDATE() - INTERVAL 1 MONTH)  AND ModuleDate <CURDATE()";
      }

      let sqlQueryMetrics = `SELECT SUM(Complete)/COUNT(*) as Adherence, UserUUID FROM Programs WHERE UserUUID IN (SELECT UserUUID From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ? AND IsActive=?) AND ${adherenceCondition} GROUP BY UserUUID`;

      await db.query(
        sqlQueryMetrics,
        [params.TrainerUUID, params.TrainerEmail, true],
        (err, result) => {
          if (err) {
            res.status(400).json({ result: false });
            throw err;
          }
          if (result.length) {
            result.map((details, index) => {
              metrics[details.UserUUID] = details.Adherence;
              let adherenceData = [];
              if (adherenceDetails.has(details.UserUUID)) {
                adherenceData = adherenceDetails.get(details.UserUUID);
              }
              let adherencePercentage = Math.floor(100 * details.Adherence);
              adherenceData.push({ type: item, value: adherencePercentage });
              adherenceDetails.set(details.UserUUID, adherenceData);
            });
          } else {
            for (const userUUID of adherenceDetails.keys()) {
              let adherenceData = [];
              if (adherenceDetails.has(userUUID)) {
                adherenceData = adherenceDetails.get(userUUID);
              }
              adherenceData.push({ type: item, value: 0 });
              adherenceDetails.set(userUUID, adherenceData);
            }
          }
        }
      );
    });

    await db.query(
      sqlQuery,
      [params.TrainerUUID, params.TrainerEmail],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        result.map(async (val, index) => {
          let lastWorkoutDate = "";
          let lastPlannedWorkoutDate = "";
          let planForThisWeekDate = [];
          let isMissedLastTwoWorkout = true;

          let currentUserModule = userModuleData.get(val.UserUUID);
          if (currentUserModule && currentUserModule.length) {
            let missedWorkoutIndex = 0;
            currentUserModule.forEach((item) => {
              if (!lastPlannedWorkoutDate) {
                lastPlannedWorkoutDate = item.ModuleDate;
              }
              // if item.moduleDate is in this week then true
              if (!lastWorkoutDate && item.Complete == 1) {
                lastWorkoutDate = item.ModuleDate;
              }
              const moduleDate = new Date(item.ModuleDate);
              const currentDate = new Date();
              if (
                moduleDate.getTime() <= currentDate.getTime() &&
                missedWorkoutIndex <= 1 &&
                isMissedLastTwoWorkout
              ) {
                missedWorkoutIndex++;
                if (item.Complete == 1) {
                  isMissedLastTwoWorkout = false;
                }
              }
              // if user have plan this week
              const hasPlanForThisWeek = isDateInThisWeek(item.ModuleDate);
              if (hasPlanForThisWeek) {
                planForThisWeekDate.push(item.ModuleDate);
              }
            });
          }

          let options = { year: "numeric", month: "short", day: "numeric" };
          let updatedTill =
            metrics[index] && metrics[index]["ModuleDate"]
              ? new Date(metrics[index]["ModuleDate"])
              : new Date();
          let endsInDate = new Date(val.EndDate);
          let today = new Date();
          let startDate = new Date(val.StartDate);
          let nextCheckinDays =
            Math.round(
              Math.abs(today - startDate) / (1000 * 60 * 60 * 24 * 7)
            ) * 7;

          let nextCheckinDate = startDate.setDate(
            startDate.getDate() + nextCheckinDays
          );

          let nextCheckinDaysVal = new Date(nextCheckinDate);

          let endsInVal = today - endsInDate;
          let endsInValDays = endsInVal / (1000 * 60 * 60 * 24);

          // let userUUID = val.UserUUID;

          // db.query(sqlQueryModuleDetails, userUUID, (err, result) => {
          //   if (err) {
          //     res.status(400).json({ result: false });
          //     throw err;
          //   }
          //   console.log('result :-> ', result)
          //   console.log(result[0].ModuleDate)
          //   let MissedLastTwoWorkouts = false
          //   if ((result[1].Complete & result[2].Complete) == 1) {
          //     MissedLastTwoWorkouts = true
          //   }
          //   // console.log(MissedLastTwoWorkouts)
          //   infoRegardingModuleDate[UserUUID] = { LastWorkoutDate: result[0].ModuleDate, MissedLastTwoWorkouts: MissedLastTwoWorkouts }
          //   console.log(infoRegardingModuleDate)
          // })

          const adherenceDetailsOfUUID = adherenceDetails.get(val.UserUUID);
          let userAdherenceDetails = generateAdherenceDetails(
            adherenceIndex,
            adherenceDetailsOfUUID
          );

          //  Configure this for frontend
          finalResult.push({
            Name: val.UserName,
            UpdatedTill: updatedTill.toLocaleDateString("en-US", options),
            EndsIn: endsInDate.toLocaleDateString("en-US", options),
            // endsInValDays > 0
            //   ? `${Math.floor(endsInValDays)} days ago`
            //   : `${Math.floor(-1 * endsInValDays)} days`
            Adherence: userAdherenceDetails[0],
            testAdherence: userAdherenceDetails,
            // NextCheckin: nextCheckinDaysVal.toLocaleString("en-US", options),
            UserUUID: val.UserUUID,
            LastWorkoutDate: lastWorkoutDate,
            MissedLastTwoWorkout: isMissedLastTwoWorkout,
            PrimaryKey: val.PrimaryKey,
            HasPlanForThisWeek: planForThisWeekDate.length > 0,
            IsActive: val.IsActive,
            LastPlannedWorkoutDate: lastPlannedWorkoutDate,
          });
        });

        res.status(200).json({ result: finalResult });
      }
    );
  });

  app.get("/api/traineeinfo", async (req, res) => {
    let params = {
      UserUUID: req.query.userUUID,
    };

    let sqlQuery = `Select * From Users WHERE UserUUID = ?`;
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }

      res.status(200).json({
        status: "Success",
        result: result[0],
      });
      // }
    });
  });

  app.get("/api/traineeprofileimage", async (req, res) => {
    let params = {
      UserUUID: req.query.userUUID,
    };
    let sqlQuery = `Select UserImageKey From Users WHERE UserUUID = ?`;
    db.query(sqlQuery, [params.UserUUID], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      if (result[0].UserImageKey != null) {
        let s3params = {
          // Bucket: process.env.AWS_BUCKET_NAME,
          Bucket: "pulsefitimages",
          Key: JSON.parse(JSON.stringify(result))[0].UserImageKey,
        };
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
      } else {
        res.status(200).json({
          result:
            "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/AppImages/assets/detailScreen/sportsman.png",
        });
      }
    });
  });

  app.get("/api/traineedetailspage", async (req, res) => {
    let currentweekmodules = [];
    let pastweekmodules = [];
    let planStaticData = {};
    let futureWeekModules = [];
    let params = {
      UserUUID: req.query.userUUID,
    };
    let sqlQueryCurrent = `SELECT * FROM Programs WHERE UserUUID = ? AND WEEK(ModuleDate)=WEEK(CURDATE()) ORDER BY ModuleDate ASC`;

    await db.query(sqlQueryCurrent, [params.UserUUID], async (err, result) => {
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
        currentweekmodules = updatedResult;
        // console.log(result,"line 74")
      } else {
        currentweekmodules = [];
      }
    });

    let sqlQueryPast = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate < CURDATE() ORDER BY ModuleDate DESC`;

    db.query(sqlQueryPast, [params.UserUUID], async (err, result) => {
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
        pastweekmodules = updatedResult;
        // console.log(result,"line 74")
      } else {
        pastweekmodules = [];
      }
    });

    let sqlQueryFuture = `SELECT * FROM Programs WHERE UserUUID = ? AND ModuleDate>CURDATE() AND WEEK(ModuleDate) != WEEK(CURDATE()) ORDER BY ModuleDate ASC`; //should match week

    await db.query(sqlQueryFuture, [params.UserUUID], async (err, result) => {
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
        futureWeekModules = updatedResult;

        // console.log(result,"line 74")
      } else {
        futureWeekModules = [];
      }
    });

    let sqlQuery = `SELECT * From ProgramsStaticData WHERE UserUUID = ? AND IsActive=?`;

    await db.query(sqlQuery, [params.UserUUID, true], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      let val = result[0];
      let options = { year: "numeric", month: "short", day: "numeric" };
      let endsInDate = new Date(val.EndDate);
      let today = new Date();
      let startDateMain = new Date(val.StartDate);
      let startDateEdit = new Date(val.StartDate);
      let daysDiff = (today - startDateEdit) / (1000 * 60 * 60 * 24 * 7);

      let dateFromDaysDiff = startDateEdit.setDate(
        startDateEdit.getDate() + Math.round(daysDiff) * 7
      );

      let nextCheckinDaysVal = new Date(dateFromDaysDiff);

      planStaticData = {
        startDate: startDateMain.toLocaleString("en-US", options),
        endDate: endsInDate.toLocaleString("en-US", options),
        nextCheckInDate: nextCheckinDaysVal.toLocaleString("en-US", options),
        planName: val.PlanName,
      };
      res.status(200).json({
        result: {
          planStaticData,
          pastweekmodules,
          currentweekmodules,
          futureWeekModules,
        },
      });
    });
  });

  app.post("/api/addexercisetolibrary", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let params = {
      PrimaryKey: primaryKey,
      Name: req.body.name,
      VideoURL: req.body.videoURL,
      label: req.body.name,
      value: req.body.name,
      Category: req.body.category,
      ImageLink: req.body.imageLink,
      Equipment: req.body.equipment,
      Instructions: req.body.instructions,
      AudioCues: req.body.audioCues,
    };

    let sqlQuery = `INSERT INTO ExercisesLibrary (PrimaryKey,Name, VideoURL, label, value, Category, ImageLink, Equipment, Instructions, AudioCues) VALUES (?,?, ?, ? , ?, ?,?,?, ?,?)`;
    db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.Name,
        params.VideoURL,
        params.label,
        params.value,
        params.Category,
        params.ImageLink,
        params.Equipment,
        params.Instructions,
        params.AudioCues,
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        res.status(200).json({ result: true });
        // console.log("pushed");
      }
    );
  });

  app.get("/api/exerciseslist", (req, res) => {
    let sqlQuery = `SELECT * FROM ExercisesLibrary ORDER BY Name ASC`;
    db.query(
      sqlQuery,

      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }

        res.status(200).json({ result });
      }
    );
  });

  app.post("/api/bulkaddexercisetolibrary", async (req, res) => {
    let exercisesList = req.body.exercisesList;

    await exercisesList.map((item) => {
      let primaryKey = randomstring.generate({
        length: 12,
        charset: "alphabetic",
      });
      let params = {
        PrimaryKey: primaryKey,
        Name: item.name,
        VideoURL: item.videoURL,
        label: item.name,
        value: item.name,
        Category: item.category,
        ImageLink: item.imageLink,
        Equipment: item.equipment,
        Instructions: item.instructions,
        AudioCues: req.body.audioCues,
      };

      let sqlQuery = `INSERT INTO ExercisesLibrary (PrimaryKey,Name, VideoURL, label, value, Category, ImageLink, Equipment, Instructions, AudioCues) VALUES (?,?, ?, ? , ?, ?,?,?, ?, ?)`;
      db.query(
        sqlQuery,
        [
          params.PrimaryKey,
          params.Name,
          params.VideoURL,
          params.label,
          params.value,
          params.Category,
          params.ImageLink,
          params.Equipment,
          params.Instructions,
          params.AudioCues,
        ],
        (err, result) => {
          if (err) {
            res.status(400).json({ result: false });
            throw err;
          }
          console.log("pushed");
        }
      );
    });

    res.status(200).json({ status: "Success" });
  });

  app.get("/api/deleteexercise", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
    };
    let sqlQuery = `DELETE From ExercisesLibrary WHERE (PrimaryKey=?)`;
    db.query(sqlQuery, [params.PrimaryKey], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }

      res.status(200).json({ result });
    });
  });

  app.get("/api/trainerdashboardfrompostman", async (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      TrainerEmail: req.body.trainerEmail,
    };

    let sqlQuery = `SELECT * From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ? AND IsActive=?`;

    let sqlQueryMetrics = `SELECT ModuleDate, SUM(Complete)/COUNT(*), UserUUID FROM Programs WHERE UserUUID IN (SELECT UserUUID From ProgramsStaticData WHERE TrainerUUID = ? AND TrainerEmail = ? AND IsActive=?) GROUP BY UserUUID`;

    let metrics = [];
    let finalResult = [];
    await db.query(
      sqlQueryMetrics,
      [params.TrainerUUID, params.TrainerEmail, true],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        metrics = result;
      }
    );

    await db.query(
      sqlQuery,
      [params.TrainerUUID, params.TrainerEmail, true],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        result.map((val, index) => {
          let options = { year: "numeric", month: "short", day: "numeric" };
          let updatedTill =
            metrics[index] && metrics[index]["ModuleDate"]
              ? new Date(metrics[index]["ModuleDate"])
              : new Date();
          let endsInDate = new Date(val.EndDate);
          let today = new Date();
          let startDate = new Date(val.StartDate);
          let nextCheckinDays =
            Math.round(
              Math.abs(today - startDate) / (1000 * 60 * 60 * 24 * 7)
            ) * 7;

          let nextCheckinDate = startDate.setDate(
            startDate.getDate() + nextCheckinDays
          );

          let nextCheckinDaysVal = new Date(nextCheckinDate);

          let endsInVal = today - endsInDate;
          let endsInValDays = endsInVal / (1000 * 60 * 60 * 24);
          //  Configure this for frontend
          finalResult.push({
            Name: val.UserName,
            UpdatedTill: updatedTill.toLocaleDateString("en-US", options),
            EndsIn: endsInDate.toLocaleDateString("en-US", options),
            // endsInValDays > 0
            //   ? `${Math.floor(endsInValDays)} days ago`
            //   : `${Math.floor(-1 * endsInValDays)} days`
            Adherence: `${Math.floor(
              100 *
                (metrics[index] && metrics[index]["SUM(Complete)/COUNT(*)"]
                  ? metrics[index]["SUM(Complete)/COUNT(*)"]
                  : 0)
            )} %`,
            NextCheckin: nextCheckinDaysVal.toLocaleString("en-US", options),
            UUID: val.UserUUID,
          });
        });

        res.status(200).json({ result: finalResult });
      }
    );
  });

  // NOTES ROUTE
  app.post("/api/addnote", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PrimaryKey: primaryKey,
      UserUUID: req.body.userUUID,
      TrainerUUID: req.body.trainerUUID,
      Note: req.body.note,
      Date: req.body.date,
    };
    let sqlQuery = `INSERT INTO Notes (PrimaryKey, UserUUID, TrainerUUID, Note, Date) VALUES (? ,? , ?, ?, ?)`;

    db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.UserUUID,
        params.TrainerUUID,
        params.Note,
        params.Date,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          status: "Success",
        });
      }
    );
  });

  app.post("/api/updatenote", async (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,

      Note: req.body.note,
    };
    let sqlQuery = `UPDATE Notes SET Note= ? WHERE PrimaryKey= ?`;

    await db.query(
      sqlQuery,
      [params.Note, params.PrimaryKey],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          status: "Success",
        });
      }
    );
  });

  app.post("/api/deletenote", async (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
    };
    let sqlQuery = `DELETE FROM Notes WHERE (PrimaryKey= ?)`;

    db.query(sqlQuery, [params.PrimaryKey], (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }
      res.status(200).json({
        status: "Success",
      });
    });
  });

  app.get("/api/getnotes", async (req, res) => {
    let params = {
      UserUUID: inDevMode ? req.body.userUUID : req.query.userUUID,
      TrainerUUID: inDevMode ? req.body.trainerUUID : req.query.trainerUUID,
    };
    let sqlQuery = `SELECT * FROM Notes WHERE TrainerUUID= ? AND UserUUID=? ORDER BY Date DESC`;

    await db.query(
      sqlQuery,
      [params.TrainerUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          notes: result,
        });
      }
    );
  });

  app.get("/api/getnotesfrompostman", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      TrainerUUID: req.body.trainerUUID,
    };
    let sqlQuery = `SELECT * FROM Notes WHERE TrainerUUID= ? AND UserUUID=? ORDER BY Date DESC`;

    await db.query(
      sqlQuery,
      [params.TrainerUUID, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          notes: result,
        });
      }
    );
  });

  app.get("/api/getactivechattrainees", async (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
    };
    let sqlQuery = `SELECT ChatID FROM ProgramsStaticData WHERE TrainerUUID= ? AND IsActive=? ORDER BY UserName`;

    await db.query(
      sqlQuery,
      [params.TrainerUUID, true],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        let valuesArray = [];

        await result.map((item) => valuesArray.push(item));
        console.log(valuesArray);
        res.status(200).json({
          value: valuesArray,
        });
      }
    );
  });

  app.post("/api/modularworkouts", (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      PrimaryKey: primaryKey,
      ModuleDetails: JSON.stringify(req.body.moduleDetails),
      Calories: 0,
      ModuleDate: req.body.moduleDate,
      Name: req.body.name,
      ModuleDuration: req.body.moduleDuration,
      Tag: req.body.tag,
      TrainerUUID: req.body.trainerUUID,
    };
    let sqlQuery = `INSERT INTO ModularWorkouts (PrimaryKey , ModuleDetails, Calories, ModuleDate, Name, ModuleDuration,Tag, TrainerUUID) VALUES (?, ?, ?,?,?,?,?, ?)`;

    db.query(
      sqlQuery,
      [
        params.PrimaryKey,
        params.ModuleDetails,
        params.Calories,

        params.ModuleDate,
        params.Name,
        params.ModuleDuration,
        params.Tag,
        params.TrainerUUID,
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

  app.get("/api/modularworkouts", (req, res) => {
    let params = {
      TrainerUUID: req.query.trainerUUID,
    };
    let sqlQuery = `SELECT * FROM ModularWorkouts WHERE TrainerUUID = ? ORDER BY ModuleDate DESC`;

    db.query(sqlQuery, [params.TrainerUUID], async (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ModuleDetails: JSON.parse(item.ModuleDetails),
          };
          updatedResult.push(item);
          // ImageKey
        });

        res.status(200).json({ result: updatedResult });
      } else {
        res.status(200).json({ result: [] });
      }
    });
  });

  app.post("/api/deleteparticularmodularworkout", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
    };
    let sqlQuery = `DELETE From ModularWorkouts WHERE PrimaryKey = ?`;

    db.query(sqlQuery, [params.PrimaryKey], (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
        throw err;
      }
      res
        .status(200)
        .json({ status: "module deleted successfully", result: result });
    });
  });

  app.get("/api/particularmodularworkout", (req, res) => {
    let params = {
      PrimaryKey: req.query.primaryKey,
    };
    let sqlQuery = `SELECT * FROM ModularWorkouts WHERE PrimaryKey = ?`;

    db.query(sqlQuery, [params.PrimaryKey], async (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
        throw err;
      }
      let updatedResult = [];
      if (result.length > 0) {
        await result.map((item, index) => {
          item = {
            ...item,
            ModuleDetails: JSON.parse(item.ModuleDetails),
          };
          updatedResult.push(item);
          // ImageKey
        });

        res.status(200).json({ result: updatedResult });
      } else {
        res.status(200).json({ result: [] });
      }
    });
  });

  app.post("/api/updateparticularmodularworkout", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
      ModuleDetails: JSON.stringify(req.body.moduleDetails),
    };
    let sqlQuery = `UPDATE ModularWorkouts SET ModuleDetails=? WHERE PrimaryKey = ?`;

    db.query(
      sqlQuery,
      [params.ModuleDetails, params.PrimaryKey],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          throw err;
        }
        res
          .status(200)
          .json({ status: "module updated successfully", result: result });
      }
    );
  });

  app.post("/api/trainerprofileinternaltest", async (req, res) => {
    let primaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });

    let params = {
      TrainerUUID: primaryKey,
      Name: req.body.name,
      Email: req.body.email,
      TimeZone: req.body.timeZone,
      NumberOfTrainees: req.body.numberOfTrainees,
      Gender: req.body.gender,
      IsActive: req.body.isActive,
      ContactNumber: req.body.contactNumber,
      CostPerMonth: req.body.costPerMonth,
      Currency: req.body.currency,
      Bio: req.body.bio,
      ImageKey: req.body.imageKey,
    };
    let sqlQuery = `INSERT INTO TestTrainers (TrainerUUID, Name, Email,TimeZone, NumberOfTrainees, Gender, ContactNumber, CostPerMonth ,Bio , Currency, ImageKey, IsActive) VALUES (? ,? , ?, ?, ? ,?, ?, ? , ?, ?, ? ,?)`;

    db.query(
      sqlQuery,
      [
        params.TrainerUUID,
        params.Name,
        params.Email,
        params.TimeZone,
        params.NumberOfTrainees,
        params.Gender,
        params.ContactNumber,
        params.CostPerMonth,
        params.Bio,
        params.Currency,
        params.ImageKey,
        params.IsActive,
      ],
      (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to push</h1>");
          throw err;
        }
        res.status(200).json({
          status: "Success",
        });
      }
    );
  });

  app.get("/api/testtrainer", async (req, res) => {
    let sqlQuery = `Select * From TestTrainers`;

    await db.query(
      sqlQuery,

      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        let finalResult = [];

        finalResult.push({
          ...result[0],
          Highlights: JSON.parse(result[0].Highlights),
        });
        res.status(200).json({ result: finalResult });
      }
    );
  });

  app.post("/api/testhighlights", (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      Highlights: JSON.stringify(req.body.highlights),
    };
    let sqlQuery = `UPDATE TestTrainers SET Highlights = ? WHERE TrainerUUID = ?`;

    db.query(
      sqlQuery,
      [params.Highlights, params.TrainerUUID],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "updated trainer highlights" });
      }
    );
  });

  app.get("/api/successtypeform", (req, res) => {
    res.redirect("https://www.pulse.fit/");
  });

  app.post("/api/autoprogramsforuser", (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      UserUUID: req.body.userUUID,
    };

    const UserUUID = params.UserUUID;
    const requestBody = plans(params.UserUUID)[`${params.TrainerUUID}`][4];
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

  // api to store modular programs of a single trainerUUID
  app.post("/api/modularprograms", (req, res) => {
    let params = {
      TrainerUUID: req.body.trainerUUID,
      Name: req.body.name,
      Description: req.body.description,
      Duration: req.body.duration,
      Workouts: req.body.workouts,
    };
    if (!params.TrainerUUID || !params.Name) {
      res.status(400).json({ error: "Invalid Request" });
    }

    let PrimaryKey = randomstring.generate({
      length: 12,
      charset: "alphabetic",
    });
    let sqlQuery = `INSERT INTO ModularPrograms (PrimaryKey , TrainerUUID , Name, Description, Duration, Workouts ) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(
      sqlQuery,
      [
        PrimaryKey,
        params.TrainerUUID,
        params.Name,
        params.Description,
        params.Duration,
        JSON.stringify(params.Workouts),
      ],
      (err, result) => {
        if (err) {
          res.status(400).json({ error: err });
          console.log(err, "err");
        }
        res
          .status(200)
          .json({ status: "program stored successfully", result: result });
      }
    );
  });

  // api to update modular programs of a single trainerUUID
  app.put("/api/updatemodularprogram", (req, res) => {
    let params = {
      PrimaryKey: req.body.primaryKey,
      Name: req.body.name,
      Description: req.body.description,
      Duration: req.body.duration,
      Workouts: req.body.workouts,
    };
    if (!params.PrimaryKey) {
      res.status(400).json({ error: "Invalid Request" });
    }
    const sqlQuery = `UPDATE ModularPrograms SET Name = ?, Description = ?, Workouts = ?,Duration=? WHERE ModularPrograms.PrimaryKey = ?`;
    const sqlData = [
      params.Name,
      params.Description,
      JSON.stringify(params.Workouts),
      params.Duration,
      params.PrimaryKey,
    ];
    db.query(sqlQuery, sqlData, (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
        console.log(err, "err");
      }
      res
        .status(200)
        .json({ status: "program updated successfully", result: result });
    });
  });

  // api to fetch modular programs of a single trainerUUID
  app.get("/api/modularprograms", async (req, res) => {
    let TrainerUUID = req.query.trainerUUID;
    let sqlQuery = `SELECT * FROM ModularPrograms WHERE TrainerUUID = ?`;
    await db.query(sqlQuery, TrainerUUID, (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).send(result);
    });
  });

  // api to fetch a modular program by primary key
  app.get("/api/modularprogram", async (req, res) => {
    let PrimaryKey = req.query.primaryKey;
    let sqlQuery = `SELECT * FROM ModularPrograms WHERE PrimaryKey = ?`;
    await db.query(sqlQuery, PrimaryKey, (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).send(result);
    });
  });

  // api to delete a modular program by primary key
  app.get("/api/deletemodularprogram", async (req, res) => {
    let PrimaryKey = req.query.primaryKey;
    let sqlQuery = `DELETE FROM ModularPrograms WHERE PrimaryKey = ?`;
    await db.query(sqlQuery, PrimaryKey, (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      res.status(200).send(result);
    });
  });

  // api to assign user to a modular program
  app.post("/api/assignmodularprogramtouser", async (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      ModularProgramId: req.body.primaryKey,
      startDate: new Date(req.body.startDate),
    };

    let sqlQueryForModularPrograms = `SELECT * FROM ModularPrograms WHERE PrimaryKey = ?`;
    let dayCount = 0;
    let finalInsertResult = [];
    let sqlInsertQuery = `INSERT INTO Programs (PrimaryKey , UserUUID , ModulesUUID, Calories, Time , Complete, ModuleDate, Name, ModuleDuration,Tag) VALUES ?`;

    await db.query(
      sqlQueryForModularPrograms,
      params.ModularProgramId,
      (err, [result]) => {
        if (err) {
          throw err;
        }

        if (result) {
          let workouts = JSON.parse(result.Workouts);
          Object.keys(workouts).forEach(function (key) {
            let singleWorkout = workouts[key];
            let primaryKey = randomstring.generate({
              length: 12,
              charset: "alphabetic",
            });
            let startDate = params.startDate;
            let tempStartDate = new Date(params.startDate);
            let newModuleDate = new Date(
              tempStartDate.setDate(startDate.getDate() + dayCount)
            );
            if (Object.keys(singleWorkout).length > 0) {
              let insertParams = {};
              insertParams = [
                primaryKey,
                params.UserUUID,
                singleWorkout.ModuleDetails
                  ? JSON.stringify(singleWorkout.ModuleDetails)
                  : JSON.stringify([]),
                singleWorkout.Calories ? singleWorkout.Calories : 0,
                0,
                false,
                newModuleDate,
                singleWorkout.Name ? singleWorkout.Name : "",
                singleWorkout.ModuleDuration ? singleWorkout.ModuleDuration : 0,
                singleWorkout.Tag ? singleWorkout.Tag : "",
              ];
              finalInsertResult.push(insertParams);
            }
            dayCount++;
          });
          db.query(sqlInsertQuery, [finalInsertResult], (err, result) => {
            if (err) {
              res.status(400).json({ error: err });
              throw err;
            }
            res
              .status(200)
              .json({ status: "module pushed successfully", result: result });
          });
        } else {
          res.status(400).json({ error: "Module Program not found" });
        }
      }
    );
  });

  function updateTrainerPassword(trainerUUID, password) {
    return new Promise(function (resolve, reject) {
      let sqlQuery = `UPDATE Trainers SET Password = ? WHERE TrainerUUID = ?`;
      let passwordSalt = bcrypt.genSaltSync(10);
      var hashPassword = bcrypt.hashSync(password, passwordSalt);
      db.query(sqlQuery, [hashPassword, trainerUUID], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  // api to reset password for a trainer
  app.post("/api/trainerpasswordreset", async (req, res, next) => {
    let params = {
      TrainerEmail: req.body.trainerEmail,
      OldPassword: req.body.oldPassword,
      NewPassword: req.body.newPassword,
    };

    let sqlQuery = `SELECT * From Trainers WHERE Email = ?`;

    await db.query(sqlQuery, params.TrainerEmail, async (err, [result]) => {
      if (err) {
        res.status(400).json(err);
        throw err;
      }

      if (!result) {
        res.status(400).json("Invalid Email Address");
        return;
      }

      if (result.Password) {
        let comparePassword = bcrypt.compareSync(
          params.OldPassword,
          result.Password
        );
        if (!comparePassword) {
          res.status(400).json("Invalid Old Password");
          return;
        } else {
          let newPassword = params.NewPassword;
          let trainerUUid = result.TrainerUUID;

          updateTrainerPassword(trainerUUid, newPassword)
            .then((result) => {
              res.status(200).send("Password Successfully Reset");
              return;
            })
            .catch((err) => {
              res.status(400).json(err);
              return;
            });
        }
      } else {
        if (params.OldPassword !== result.TrainerUUID) {
          res.status(400).json("Invalid Old Password");
          return;
        } else {
          let newPassword = params.NewPassword;
          let trainerUUid = result.TrainerUUID;

          updateTrainerPassword(trainerUUid, newPassword)
            .then((result) => {
              res.status(200).send("Password Successfully Reset");
              return;
            })
            .catch((err) => {
              res.status(400).json(err);
              return;
            });
        }
      }
    });
  });

  async function getFilteredDataForUser(UserUUID, filterCondition) {
    return new Promise(function (resolve, reject) {
      let sqlQueryMetrics = `SELECT COUNT(*) as PlannedWorkouts, SUM(Complete)/COUNT(*) as Adherence,SUM(Complete) as TotalNoOfWorkoutDone,SUM(Time) as TotalWorkoutTime, UserUUID FROM Programs WHERE UserUUID=?  ${filterCondition}`;
      db.query(sqlQueryMetrics, [UserUUID, true], (err, [result]) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        const returnData = {
          PlannedWorkouts: result.PlannedWorkouts,
          Adherence: Math.floor(100 * result.Adherence),
          TotalNoOfWorkoutDone: result.TotalNoOfWorkoutDone,
          TotalWorkoutTime: result.TotalWorkoutTime,
        };
        resolve(returnData);
      });
    });
  }

  app.get("/api/weeklyperformancereport", async (req, res) => {
    const TrainerUUID = req.query.trainerUUID;
    const filter = req.query.filter;
    let filterCondition = "";
    if (filter == "lastWeek") {
      filterCondition =
        "AND ModuleDate > (CURDATE() - INTERVAL 7 DAY)  AND ModuleDate <CURDATE()";
    } else if (filter == "lastMonth") {
      filterCondition =
        "AND ModuleDate > (CURDATE() - INTERVAL 1 MONTH)  AND ModuleDate <CURDATE()";
    } else if (filter == "lastSixMonth") {
      filterCondition =
        "AND ModuleDate > (CURDATE() - INTERVAL 6 MONTH)  AND ModuleDate <CURDATE()";
    }

    let sqlQuery = `SELECT UserUUID, UserName FROM ProgramsStaticData WHERE TrainerUUID = ? AND isActive=?`;

    await db.query(sqlQuery, [TrainerUUID, true], (err, result) => {
      if (err) {
        res.status(400).json({ result: false });
        throw err;
      }
      Promise.all(
        result.map(async (item) => {
          const UserUUID = item.UserUUID;
          const UserName = item.UserName;
          const filterData = await getFilteredDataForUser(
            UserUUID,
            filterCondition
          );
          if (filterData instanceof Error) {
            res.status(400).send(filterData.message);
          } else {
            return { UserUUID, ...filterData, UserName };
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
  });

  const storeImageKey = async (req, res) => {
    const file = req.file;
    const dimensions = imageDimension(file.buffer);
    if (dimensions.height === dimensions.width) {
      let trainerUUID = req.query.trainerUUID;
      const sqlQuery = "SELECT Name FROM Trainers WHERE TrainerUUID = ?";
      await db.query(sqlQuery, trainerUUID, (err, [result]) => {
        if (err) {
          res.status(400).json(err);
          throw err;
        }
        if (result) {
          const filename = `${result.Name}${path.extname(file.originalname)}`;
          const fileContent = file.buffer;
          const sqlQuery1 =
            "UPDATE Trainers SET ImageKey = ? WHERE TrainerUUID= ?";
          const s3 = new AWS.S3();
          const params = {
            Bucket: "pulsefitpublicimages/TrainerContent",
            Key: `${filename}`,
            Body: fileContent,
            ACL: "public-read",
          };
          s3.upload(params, (err, data) => {
            if (err) {
              throw err;
            }
            db.query(sqlQuery1, [data.Location, trainerUUID], (err, result) => {
              if (err) {
                res.status(400).json({ result: false });
                throw err;
              }
              res.status(200).send(result);
            });
          });
        } else {
          res.status(400).json("Trainer not found");
        }
      });
    } else {
      res.status(400).json("Invalid image dimension");
    }
  };

  app.post(
    "/api/uploadtrainerprofilepic",
    multer().single("image"),
    storeImageKey
  );

  app.put("/api/updatetrainer", (req, res) => {
    const params = {
      TrainerUUID: req.body.trainerUUID,
      Name: req.body.name,
      ContactNumber: req.body.contactNumber,
      CostPerMonth: req.body.costPerMonth,
      Bio: req.body.bio,
    };

    if (!params.TrainerUUID) {
      res.status(400).send("invalid request");
    }

    const paramsArray = [];
    const queryArray = [];
    Object.keys(params).forEach((item) => {
      if (params[item] && item !== "TrainerUUID") {
        paramsArray.push(params[item]);
        queryArray.push(`${item}=?`);
      }
    });
    let queryColumnsToUpdate = queryArray.toString();
    paramsArray.push(params.TrainerUUID);
    const sqlQuery = `UPDATE Trainers SET ${queryColumnsToUpdate} WHERE TrainerUUID=? `;

    db.query(sqlQuery, paramsArray, (err, result) => {
      if (err) {
        res.status(400).send(err);
        throw err;
      }
      res.status(200).send(result);
    });
  });

  function updateToken(token, id) {
    return new Promise(function (resolve, reject) {
      let sqlQuery = `UPDATE Trainers SET ResetPasswordToken = ? WHERE Trainers.TrainerUUID = ?`;
      db.query(sqlQuery, [token, id], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  app.post("/api/forgetpassword", async (req, res) => {
    const email = req.body.email;
    let sqlQuery = `SELECT * FROM Trainers WHERE Email=? `;
    await db.query(sqlQuery, email, async (err, [trainer]) => {
      if (err) {
        res.status(400).send(err);
        throw err;
      }
      if (!trainer) {
        res.status(400).send("Invalid Email Address");
      }
      const jwtSecret =
        "$2a$10$Dqst4.KqcNXdFmW/pA5EVO/alyNJuB/Ozqm0kVMdL6u9iJhxIWPA6";

      const jwtPayload = {
        email: trainer.Email,
        id: trainer.TrainerUUID,
      };
      const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "30m" });
      updateToken(token, trainer.TrainerUUID)
        .then(async (result) => {
          const link = `https://trainer.pulse.fit/resetpassword/?id=${trainer.TrainerUUID}&key=${token}`;
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
          const emailAddress = [trainer.Email, "support@pulse.fit"];
          sendAwsEmail(subject, emailAddress, htmlToSend)
            .then((success) => res.status(200).json({ status: "success" }))
            .catch((err) => res.status(400).json({ status: err }));
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
  });

  app.post("/api/resettrainerpassword", async (req, res) => {
    let sqlQuery = `SELECT * FROM Trainers WHERE TrainerUUID=?`;
    const TrainerUUID = req.body.trainerUUID;
    const token = req.body.resetToken;
    const resetPassword = req.body.password;
    try {
      await db.query(sqlQuery, TrainerUUID, (err, [trainer]) => {
        if (err) {
          res.status(400).send(err);
          throw err;
        }
        if (!trainer)
          return res
            .status(400)
            .send("Invalid User Details. Please Try Again Later");

        const jwtSecret =
          "$2a$10$Dqst4.KqcNXdFmW/pA5EVO/alyNJuB/Ozqm0kVMdL6u9iJhxIWPA6";

        try {
          const jwtPayload = jwt.verify(token, jwtSecret);
          if (jwtPayload.id === TrainerUUID) {
            updateTrainerPassword(TrainerUUID, resetPassword)
              .then((result) => {
                res.status(200).send({
                  message: "Password Successfully Updated",
                  email: trainer.Email,
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
