require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const port = process.env.PORT || 4002;
const app = express();

// Connect to Database
mongoose
  .connect(process.env.DB_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;
db.on("error", () => {
  console.log("Failed to connect to database");
  process.exit(1);
});

// Open port if open
db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () =>
    console.log(`Server running, connected to port: ${port}`)
  );
});

// Routes
const metaRoute = require("./routes/Meta");
app.use(process.env.NODE_ENV === "development" ? "/meta" : "/", metaRoute);

// Cron
const MaintainerJob = require("./services/Maintainer");
MaintainerJob.start();

