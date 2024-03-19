const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
// const redis = require("redis");

const app = express();
require("dotenv").config();
app.use(bodyParser.json());

app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.post("/save-data", (req, res) => {
  try {
    const { username, language, stdin, code } = req.body;
    if (!username || !language || !stdin || !code) {
      res.status(400).send({
        message: "Missing fields!",
        success: false,
      });
    }
    const sql =
      "INSERT INTO User (username, language, stdin, code) VALUES (?, ?, ?, ?)";
    const values = [username, language, stdin, code];

    db.query(sql, values);
    res.status(200).send({
      message: "Data added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Something went wrong",
      error,
      success: false,
    });
  }
});

app.get("/get-data", (req, res) => {
  try {
    const sql = "SELECT * FROM User";

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error in getting data:", err);
        res.status(500).send({
          message: "Error in fetching data",
          error: err,
          success: false,
        });
      } else {
        res.status(200).send({
          message: "Data fetched successfully",
          result, 
          success: true,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Something went wrong",
      error,
      success: false,
    });
  }
});

app.listen(8000, () => {
  console.log("listening...");
});

// const client = redis.createClient();

// client.on("error", (error) => {
//   console.log(error);
// });
// client.on("connect", (error) => {
//   console.log("Connection established");
// });

// const cacheMiddleware = (req, res, next) => {
//   // Check if data exists in Redis cache
//   client.get((err, data) => {
//     if (err) throw err;

//     if (data !== null) {
//       // Data exists in cache, return it to the client
//       res.send(data);
//     } else {
//       // Data not found in cache, proceed to fetch it from the database
//       next();
//     }
//   });
// };
