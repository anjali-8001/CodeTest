const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const axios = require("axios");
const mongoose = require("mongoose");
const connectDb = require("./db");
const InfoModel = require("./InfoModel");

const app = express();
require("dotenv").config();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "https://codetest-sigma.vercel.app",
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connectDb();

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-14554.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 14554,
  },
});

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

    let lang_id = undefined;

    if (language == "C++") {
      lang_id = 52;
    } else if (language == "Java") {
      lang_id = 62;
    } else if (language == "JavaScript") {
      lang_id = 63;
    } else if (language == "Python") {
      lang_id = 71;
    }

    const options1 = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: {
        base64_encoded: "false",
        fields: "*",
      },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "9f887d63demshe7c5f8112f5852fp155e0cjsn9b35e345fa4a",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: {
        language_id: lang_id,
        source_code: code,
        stdin: stdin,
      },
    };
    const response1 = await axios.request(options1);
    const token = response1.data.token;

    const options2 = {
      method: "GET",
      url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      params: {
        base64_encoded: "false",
        fields: "",
      },
      headers: {
        "X-RapidAPI-Key": "9f887d63demshe7c5f8112f5852fp155e0cjsn9b35e345fa4a",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    };

    let response2 = await axios.request(options2);

    while (response2.data.status.id === 1 || response2.data.status.id === 2) {
      response2 = await axios.request(options2);
    }
    let output = "";
    if (response2.data.stderr) {
      output = response2.data.stderr;
    } else if (response2.data.compile_output) {
      output = response2.data.compile_output;
    } else {
      output = response2.data.stdout;
    }

    const info = await new InfoModel({
      username,
      language,
      stdin,
      code,
      output,
    }).save();

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

app.get("/get-data", cacheMiddleware, async (req, res) => {
  try {
    const result = await InfoModel.find({});

    client.set("result", JSON.stringify(result));
    res.status(200).send({
      message: "Data fetched successfully",
      result,
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

app.listen(8000, () => {
  console.log("listening...");
});
