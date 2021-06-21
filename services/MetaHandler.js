const MetaFile = require("../models/metaFile");
const axios = require("axios");
const moment = require("moment");

/**
 * Get MetaFile by ID
 *
 * @param {String} id
 * @returns {MetaFile} results
 */
exports.getMetaFile = async function (id) {
  // Find MetaFile by ID
  let results = await MetaFile.findById(id);
  const { fileId } = results;
  let hash;

  // Check if MetaFile is Available
  if (!results.availability) {
    return null;
  }

  // Request the hash url from database
  try {
    const dudRes = await axios.post(process.env.URL_DUD + "returnurl", {
      type: "RequestHash",
      data: { fileId },
    });

    ({ hash } = dudRes.data.data);
  } catch (err) {
    return err;
  }

  // Decrement entry Limit iff it is set
  if (results.accessLimit) {
    results.accessLimit -= 1;
  }

  // If the entry limit is now 0
  if (results.accessLimit === 0) {
    try {
      // Delete File from all 3 services
      await this.deleteFromAll([fileId]); // Note: fileId is in a single item array
    } catch (e) {
      console.log(e);
    }
  }

  // Save changes
  await results.save();

  // Return hash from Axios request
  return hash;
};

/**
 * Updates MetaFile with the fields from the sent JSON file including id of file
 *
 * @param {Object} json contains the information wanting to update
 *
 * @returns {Boolean} status
 */
exports.updateFile = async function (json) {
  // exit if json file is empty
  if (!json) {
    return false;
  }

  let result = await MetaFile.findById(json.id);

  // Going through and replacing if not null
  if (json.name != null) {
    result.name = json.name;
  }

  if (json.accessLimit != null) {
    result.accessLimit = json.accessLimit;
  }

  if (json.timeLimit != null) {
    result.timeLimit = moment(json.timeLimit).set({ hour: 23, minute: 59 }).toDate();
  }

  // Save changes and exit
  await result.save();

  return result;
};

/*
    Get All Meta Files
*/
exports.metaFiles = async () => MetaFile.find().exec();

/**
 * Add new MetaFile instance to database
 *
 * @param {Object} body information regarding MetaFile (body == req.body.data)
 * @returns {MetaFile} newMetaFile
 */
exports.createMetaFile = async function ({ fileId, fileName, accessLimit, timeLimit }) {
  // Validation: If any input in body is false then throw error
  if (!this.validateBody(fileId, fileName, accessLimit, timeLimit)) {
    throw "Body invalid.";
  }

  const doc = {
    name: fileName,
    fileId: fileId,
    availability: true,
  }

  if (accessLimit) {
    doc.accessLimit = accessLimit;
  }

  if (timeLimit) {
    doc.timeLimit = moment(timeLimit).toDate();
  }

  const newMetaFile = new MetaFile(doc);

  await newMetaFile.save();
  return newMetaFile;
};

/**
 * Delete MetaFile by ID
 *
 *
 * @param {String[]} fileIds
 *
 * @returns {Promise}
 */
exports.deleteMetaFile = async (fileIds) =>
  MetaFile.deleteMany({ fileId: { $in: fileIds } }).exec();

/**
 * Delete files from all 3 services.
 *
 * @param {String[]} fileIds
 *
 * @returns {Promise}
 */
exports.deleteFromAll = async function (fileIds) {
  return Promise.all([
    this.deleteMetaFile(fileIds),
    axios.post(process.env.URL_DUD + "delete", {
      type: "FileDeleted",
      data: { fileIds },
    }),
    axios.post(process.env.URL_USER + "delete", {
      data: { fileIds },
    }),
  ]);
};

/**
 * Validates body
 *
 * @param {String} fileId
 * @param {String} fileName
 * @param {Number} accessLimit
 * @param {String} timeLimit
 *
 * @returns {Boolean} status
 */
exports.validateBody = async function (fileId, fileName, accessLimit, timeLimit) {
  // Check required fields
  if (!fileId || !fileName) {
    return false;
  }

  // Check access limit
  if (accessLimit && accessLimit <= 0) {
    return false;
  }

  // Check time limit
  if (timeLimit) {
    const parsedTime = moment(timeLimit);
    if (!parsedTime.isValid()) {
      return false;
    }

    if (parsedTime.set({ hour: 23, minute: 59 }).isSameOrBefore(moment())) {
      return false;
    }
  }

  return true;
};

/*
// Code that I wanted to work on but will leave in comments in case I want to get back to it.

    // Returns the MetaFile but with the availability changed
    setAvailability(MetaFile, boolean) {
        const file = MetaFile;
        file.availability = boolean;
        return file;
    }

    // returns boolean
    checkAvailability(MetaFile) {
        return MetaFile.availability;
    }
*/
