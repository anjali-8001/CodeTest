const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const axios = require("axios");

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

const client = redis.createClient();
(async () => {
  await client.connect();
})();
client.on("error", (error) => {
  console.log(error);
});
client.on("connect", (error) => {
  console.log("Connection established");
});

const cacheMiddleware = async (req, res, next) => {
  // Check if data exists in Redis cache
  try {
    const cachevalue = await client.get("result");
    const result = JSON.parse(cachevalue);
    if (cachevalue) {
      return res.status(200).send({
        message: "data from redis",
        success: true,
        result,
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

app.post("/save-data", async (req, res) => {
  try {
    const { username, language, stdin, code } = req.body;

    if (!username || !language || !code) {
      return res.status(400).send({
        message: "Missing fields!",
        success: false,
      });
    }

    // let lang_id = undefined;

    // if (language == "C++") {
    //   lang_id = 52;
    // } else if (language == "Java") {
    //   lang_id = 62;
    // } else if (language == "JavaScript") {
    //   lang_id = 63;
    // } else if (language == "Python") {
    //   lang_id = 71;
    // }

    // const options1 = {
    //   method: "POST",
    //   url: "https://judge0-ce.p.rapidapi.com/submissions",
    //   params: {
    //     base64_encoded: "true",
    //     fields: "*",
    //   },
    //   headers: {
    //     "content-type": "application/json",
    //     "X-RapidAPI-Key": "9f887d63demshe7c5f8112f5852fp155e0cjsn9b35e345fa4a",
    //     "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    //   },
    //   data: {
    //     language_id: 52,
    //     source_code: JSON.stringify(code),
    //     stdin: JSON.stringify(stdin),
    //   },
    // };
    // const response1 = await axios.request(options1);
    // console.log(response1.data.token);
    // const token = response1.data.token;

    // const options2 = {
    //   method: "GET",
    //   url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
    //   params: {
    //     base64_encoded: "true",
    //     fields: "*",
    //   },
    //   headers: {
    //     "X-RapidAPI-Key": "9f887d63demshe7c5f8112f5852fp155e0cjsn9b35e345fa4a",
    //     "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    //   },
    // };

    // const response2 = await axios.request(options2);
    // console.log(response2.data);

    const sql =
      "INSERT INTO User (username, language, stdin, code) VALUES (?, ?, ?, ?)";
    const values = [username, language, stdin, code];

    db.query(sql, values);
    client.del("result");
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

app.get("/get-data", cacheMiddleware, (req, res) => {
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
        client.set("result", JSON.stringify(result));
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
