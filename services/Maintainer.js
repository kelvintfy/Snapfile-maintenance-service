const CronJob = require("cron").CronJob;
const MetaFile = require("../models/metaFile");
const MetaHandler = require("./MetaHandler");

// Cron
// Run This job every hour
const MaintainerJob = new CronJob("0 0 * * * *", async () => {
  console.log("Running Maintainer...");
  // noinspection JSCheckFunctionSignatures
  const fileIds = (await MetaFile.find({
    $or: [
      {availability: false},
      {timeLimit: {$lt: Date.now()}}
    ]
  }, "fileId").exec())
    .map(({fileId}) => fileId);

  try {
    await Promise.all([
      MetaHandler.deleteFromAll(fileIds),
      MetaFile.deleteMany({"fileId": {$in: fileIds}}).exec()
    ]);
  } catch (e) {
    console.log(e);
  }
});

module.exports = MaintainerJob;
