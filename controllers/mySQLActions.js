module.exports = (app, db, inDevMode) => {
  app.get("/api/clearchallengestable", (req, res) => {
    let sqlQuery2 = `TRUNCATE Challenges`;
    db.query(sqlQuery2, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).send({ success: true });
    });
  });

  // EXERCISES TABLE ALTERATIONS HAVE NOT BEEN DONE ON PROD I GUESS!!
  app.get("/api/addcolumnimagekey", async (req, res) => {
    let sqlQuery1 = `ALTER TABLE Exercises ADD COLUMN ImageKey varchar(255)`;
    await db.query(sqlQuery1, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: "ImageKey column added",
      });
    });
  });

  app.get("/api/addcolumnvideokey", async (req, res) => {
    let sqlQuery1 = `ALTER TABLE Exercises ADD COLUMN VideoKey varchar(255)`;
    await db.query(sqlQuery1, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: "VideoKey column added",
      });
    });
  });

  app.get("/api/addcolumnistimebased", async (req, res) => {
    let sqlQuery1 = `ALTER TABLE Exercises ADD COLUMN IsTimeBased BOOL`;
    await db.query(sqlQuery1, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: "IsTimeBased column added",
      });
    });
  });

  app.get("/api/clearwrokoutstable", async (req, res) => {
    let sqlQuery = `TRUNCATE Workouts`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: true,
      });
    });
  });
  app.get("/api/clearbadgestable", async (req, res) => {
    let sqlQuery = `TRUNCATE Badges`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: true,
      });
    });
  });

  app.get("/api/clearearnedbadgestable", async (req, res) => {
    let sqlQuery = `TRUNCATE EarnedBadges`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: true,
      });
    });
  });

  app.get("/api/deleteachallenge", async (req, res) => {
    let params = {
      ChallengeUUID: req.body.challengeUUID,
    };
    let sqlQuery = `DELETE FROM Challenges WHERE ChallengeUUID=?`;
    await db.query(sqlQuery, params.ChallengeUUID, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: "Deleted",
      });
    });
  });

  app.get("/api/deleteaworkout", async (req, res) => {
    let params = {
      WorkoutUUID: req.body.workoutUUID,
    };
    let sqlQuery = `DELETE FROM Workouts WHERE WorkoutUUID=?`;
    await db.query(sqlQuery, params.WorkoutUUID, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: "Deleted",
      });
    });
  });

  app.get("/api/cleareuserfeedback", async (req, res) => {
    let sqlQuery = `TRUNCATE UserFeedback`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({
        status: true,
      });
    });
  });

  app.get("/api/totalrepsonsite", (req, res) => {
    let sqlQuery = "SELECT SUM(Reps) FROM ChallengeLogs";
    db.query(sqlQuery, (err, result) => {
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

  app.get("/api/cleartableprograms", async (req, res) => {
    let sqlQuery = `TRUNCATE Programs`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).send({ result: "CLEARED" });
    });
  });

  app.get("/api/addcolumtoprogramsmetadata", async (req, res) => {
    let sqlQuery = `ALTER TABLE ProgramsStaticData ADD COLUMN UserName varchar(255)`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).send({ result: "All columns added" });
    });
  });

  app.get("/api/cleartrainertable", async (req, res) => {
    let sqlQuery = `TRUNCATE Trainers`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).send({ result: "CLEARED" });
    });
  });
  // Not in production

  app.get("/api/createexerciselibrarytable", async (req, res) => {
    let sqlQuery = `CREATE TABLE ExercisesLibrary (Name varchar(255), VideoURL varchar(255), PrimaryKey varchar(255), label varchar(255), value varchar(255))`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "Added MySQL Query" });
    });
  });

  app.get("/api/alterexerciselibrarytableaddprimarykey", async (req, res) => {
    let sqlQuery = `ALTER TABLE ExercisesLibrary ADD CONSTRAINT Primary Key (PrimaryKey) `;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "Added PrimaryKey Query" });
    });
  });

  app.get("/api/truncateexerciseslist", async (req, res) => {
    let sqlQuery = `TRUNCATE TABLE ExercisesLibrary`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "CLEARED" });
    });
  });

  app.get("/api/addcolumnstoexerciseslist", async (req, res) => {
    // let sqlQuery1 = `ALTER TABLE ExercisesLibrary ADD COLUMN Category varchar(255) `;

    // await db.query(sqlQuery1, (err, result) => {
    //   if (err) {
    //     res.status(400).send({ error: err });
    //     throw err;
    //   }
    // })

    // let sqlQuery2 = `ALTER TABLE ExercisesLibrary ADD COLUMN ImageLink varchar(255) `;

    //   await db.query(sqlQuery2, (err, result) => {
    //     if (err) {
    //       res.status(400).send({ error: err });
    //       throw err;
    //     }

    // });

    let sqlQuery = `ALTER TABLE ExercisesLibrary ADD COLUMN AudioCues TEXT`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "All columns added" });
    });
  });

  app.get("/api/addcolumnstotrainers", async (req, res) => {
    let sqlQuery = `ALTER TABLE Trainers ADD COLUMN Highlights JSON`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "Columns added to trainers" });
    });
  });
  // app.get("/api/createnotestable", async (req, res) => {
  //   let sqlQuery = `CREATE TABLE Notes (PrimaryKey varchar(255), UserUUID varchar(255), TrainerUUID varchar(255), Note text, Date date)`;
  //   let sqlQuery2 = `ALTER TABLE Notes ADD CONSTRAINT PRIMARY KEY (PrimaryKey)`
  //   await db.query(sqlQuery, (err, result) => {
  //     if (err) {
  //       res.status(400).send({ error: err });
  //       throw err;
  //     }

  //   });

  //   await db.query(sqlQuery2, (err, result)=>{
  //     if (err) {
  //       res.status(400).send({ error: err });
  //       throw err;
  //     }
  //     res.status(200).json({ success: "Added MySQL Query" });
  //   })
  // });

  app.get("/api/createmodularoworkoutstable", async (req, res) => {
    let sqlQuery = `CREATE TABLE ModularWorkouts (Name varchar(255), PrimaryKey varchar(255), Calories int, ModuleDate date, ModuleDuration int, Tag varchar(255), TrainerUUID varchar(255), ModuleDetails json)`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });

    let sqlQuery2 = `ALTER TABLE ModularWorkouts ADD CONSTRAINT Primary Key (PrimaryKey) `;

    await db.query(sqlQuery2, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "Added PrimaryKey Query" });
    });
  });

  app.get("/api/altercreatemodularoworkoutstable", async (req, res) => {});

  // app.get("/api/alterprogramstable", async (req, res) => {
  //   let sqlQuery = `ALTER TABLE Programs ADD COLUMN Feedback Text`;

  //   await db.query(sqlQuery, (err, result) => {
  //     if (err) {
  //       res.status(400).send({ error: err });
  //       throw err;
  //     }
  //   });

  //   let sqlQueryRating = `ALTER TABLE Programs ADD COLUMN Rating int`;

  //   await db.query(sqlQueryRating, (err, result) => {
  //     if (err) {
  //       res.status(400).send({ error: err });
  //       throw err;
  //     }

  //     res.status(200).json({ success: "Rating and Text feedback are added" });
  //   });
  // });
  app.get("/api/createtesttrainerstable", async (req, res) => {
    let sqlQuery = `CREATE TABLE TestTrainers (TrainerUUID varchar(255), Name varchar(255), Email varchar(255),TimeZone varchar(255), NumberOfTrainees INT, Gender varchar(255), ContactNumber varchar(255), CostPerMonth INT ,Bio TEXT, Currency varchar(255), ImageKey varchar(255), IsActive BOOL, Highlights JSON)`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });

    let sqlQuery2 = `ALTER TABLE TestTrainers ADD CONSTRAINT Primary Key (TrainerUUID) `;

    await db.query(sqlQuery2, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res
        .status(200)
        .json({ success: "Added PrimaryKey Query AND CREATED TABLE" });
    });
  });

  app.get("/api/createappversiontable", async (req, res) => {
    let sqlQuery = `CREATE TABLE AppVersion ( Name varchar(255), IOSVERSION varchar(255), ANDROIDVERSION varchar(255))`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });

    let sqlQuery2 = `ALTER TABLE AppVersion ADD CONSTRAINT Primary Key (Name) `;

    await db.query(sqlQuery2, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({
        success: "Added PrimaryKey Query AND CREATED TABLE AppVersion",
      });
    });
  });
  // Short-term
  //  PrimaryKey(SubModuleUUID) ModulesUUID UserUUID  Date Name Completed
  // Score Comment Instructions Type
  [{}];

  // PrimaryKey(SubModuleUUID) ModuleUUID Instructions Type UserUUID Score Date Name Rounds Comment Time Text CreationTime
  // 3xRounds
  // 10xSquats
  // 5xPushups
  // [{

  //   primarkey:"",
  // },{},{}]
  app.get("/api/showalltables", async (req, res) => {
    let sqlQuery = `SHOW FULL Tables`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ res: result });
    });
  });

  app.get("/api/createmodularprogramstable", async (req, res) => {
    let sqlQuery = `CREATE TABLE ModularPrograms (PrimaryKey varchar(255),TrainerUUID varchar(255), Name varchar(255),Description varchar(255), Workouts JSON,Duration INT )`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });

    let sqlQuery2 = `ALTER TABLE ModularPrograms ADD CONSTRAINT Primary Key (PrimaryKey) `;

    await db.query(sqlQuery2, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });
    res.status(200).send("Table successfully created");
  });

  app.get("/api/addpasswordcolumnstotrainers", async (req, res) => {
    let sqlQuery = `ALTER TABLE Trainers ADD COLUMN Password varchar(255)`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res.status(200).json({ success: "password column added to trainers" });
    });
  });

  app.get("/api/addresetpasswordtokencolumntotrainers", async (req, res) => {
    let sqlQuery = `ALTER TABLE Trainers ADD COLUMN ResetPasswordToken varchar(255)`;
    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
      res
        .status(200)
        .json({ success: "reset password token column added to trainers" });
    });
  });

  app.get("/api/addpostworkoutlogtotrainers", async (req, res) => {
    let sqlQuery = `ALTER TABLE Trainers ADD COLUMN Postworkoutlog JSON`;

    await db.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }

      res.status(200).json({ success: "Column added to trainers" });
    });
  });

  app.get("/api/addtrainingtypecolumn", async (req, res) => {
    let sqlTrainerQuery = `ALTER TABLE Trainers ADD COLUMN trainingType ENUM('SANDC','CROSSFIT') default 'SANDC'`;
    let sqlUserQuery = `ALTER TABLE Users ADD COLUMN trainingType ENUM('SANDC','CROSSFIT') default 'SANDC'`;

    await db.query(sqlTrainerQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });
    await db.query(sqlUserQuery, (err, result) => {
      if (err) {
        res.status(400).send({ error: err });
        throw err;
      }
    });

    res.status(200).json({ success: "Column added to Trainers & Users table" });
  });

  app.put("/api/updatetrainertypedatafortrainer", async (req, res) => {
    let params = {
      Email: req.body.trainerEmail,
    };
    let sqlQuery = `UPDATE Trainers SET trainingType = 'CROSSFIT' WHERE Email = ?`;
    db.query(sqlQuery, params.Email, async (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch</h1>");
        throw err;
      }

      res.status(200).send({ result: "updated trainer trainingType" });
    });
  });

  const updateTrainingType = (email) => {
    return new Promise(function (resolve, reject) {
      let sqlQuery = `UPDATE Users SET trainingType = 'CROSSFIT' WHERE Email = ?`;
      db.query(sqlQuery, email, async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        resolve(result);
      });
    });
  };
  app.put("/api/updatetrainertypedataforusers", async (req, res) => {
    let emails = req.body.emails;

    Promise.all(
      emails.map(async (email) => {
        await updateTrainingType(email);
      })
    )
      .then(() => res.status(200).json({ status: "success" }))
      .catch((err) => {
        res.status(400).json({ status: err });
      });
  });
  app.get("/api/fetchdatabasedetails", async (req, res) => {
    let details = new Map();
    let detailsData = [];
    let sqlQuery = `SELECT TABLE_NAME,COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'pulsefitdatabase' AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema = 'pulsefitdatabase')`;
    await db.query(sqlQuery, (err, result) => {
      const tableNames = [...new Set(result.map((item) => item.TABLE_NAME))];
      tableNames.map((i) => {
        result
          .filter((item) => item.TABLE_NAME === i)
          .map((item) => {
            let data = {
              columnName: item.COLUMN_NAME,
              dataType: item.DATA_TYPE,
            };
            detailsData.push(data);
          });
        details.set(i, detailsData);
        detailsData = [];
      });
      let dbDetails = Object.fromEntries(details);
      res.status(200).json({ status: "success", dbDetails });
    });
  });
};
