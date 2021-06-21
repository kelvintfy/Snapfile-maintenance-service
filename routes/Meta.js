const express = require("express");
const router = express.Router();
const MetaHandler = require("../services/MetaHandler");

router.use(express.json()); // parse JSON

// Return all entries in Database
router.get("/get", async (req, res) => {
  try {
    let result = await MetaHandler.metaFiles();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get _id entry from Database
router.get("/get/:id", async (req, res) => {
  try {
    // Get file, if successful result with contain hash, else will contain either null or an error message
    let hash = await MetaHandler.getMetaFile(req.params.id);

    if (!hash) {
      res.status(500).send("Empty hash");
      return;
    }

    res.redirect(process.env.URL_DUD_PUBLIC + "download/" + hash);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Add MetaFile
router.post("/add", async (req, res) => {
  // Get the data section from req body
  const json = req.body.data;

  try {
    // Create MetaFile with the given json data
    let result = await MetaHandler.createMetaFile(json);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update MetaFile
router.post("/update", async (req, res) => {
  // Get the data section from req body
  // Note: the id/URL should be inside the json file (can change later)
  const json = req.body;

  try {
    // Update Metafile based on json contents
    let result = await MetaHandler.updateFile(json);
    res.send(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete from database
router.post("/delete", async (req, res) => {
  try {
    // Deletes record from this service before deleting in S3.
    await MetaHandler.deleteMetaFile(req.body.data.fileIds);

    res.status(200).json({
      status: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
