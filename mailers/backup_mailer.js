const nodemailer = require("nodemailer");
const env = require("../config/environment");
const MongoClient = require("mongodb").MongoClient;
const Env_Variable = require("../models/env_variable");
const common_function = require("../controllers/common_function");
async function getdata() {
  try {
    let mongodbUri = "mongodb://localhost:27017";
    let databaseName = env.db;
    let client = new MongoClient(mongodbUri, {
      useUnifiedTopology: true
    });
    await client.connect();
    let db = client.db(databaseName);
    let collectionNames = await db.listCollections().toArray();
    let backupData = [];
    for (let collection of collectionNames) {
      let tempData = [];
      tempData.push(`[`);
      let cursor = await db.collection(collection.name).find();
      await cursor.forEach((doc) => {
        tempData.push(JSON.stringify(doc, (key, value) => value));
        tempData.push(`,`);
      });
      if (tempData[tempData.length - 1] === ",") tempData.pop();
      tempData.push(`]`);
      backupData.push({
        filename: collection.name + ".json",
        content: JSON.stringify(JSON.parse(tempData.join("\n")))
      });
    }
    return backupData;
  } catch (err) {
    console.log("Error in Taking Backup!", err);
    return "";
  }
}
async function backupMail() {
  let timenow = new Date()
    .toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
    .replaceAll(" ", "")
    .replaceAll("am", "")
    .replaceAll(":", "-")
    .replaceAll(",", "-")
    .replaceAll("/", "-");
  let mailUser = await Env_Variable.findOne({
    name: "mailUser"
  });
  let mailPassword = await Env_Variable.findOne({
    name: "mailPassword"
  });
  let mailFrom = await Env_Variable.findOne({
    name: "mailFrom"
  });
  let backUpMail = await Env_Variable.findOne({
    name: "backUpMail"
  });
  env.smtp.auth.user = mailUser.value;
  env.smtp.auth.pass = mailPassword.value;
  let transporter = nodemailer.createTransport(env.smtp);
  transporter.sendMail(
    {
      from: mailFrom.value,
      to: backUpMail.value,
      subject: "Backup Jewellery Software -" + timenow,
      attachments: await getdata()
    },
    (err, info) => {
      if (err) console.log("Error in sending mail", err);
      else console.log("Mail Delivered!");
    }
  );
}
async function DeleteAllDataPage(req, res) {
  try {
    return res.render("admin_clear_site", {
      title: (await common_function.AppName()) + " | Clear Site"
    });
  } catch (err) {
    console.log("Error in Clearing Site Page!", err);
    req.flash("error", "Error in Clearing Site Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
}
async function DeleteAllData(req, res) {
  try {
    await backupMail();
    // Clear All Data
    {
      let mongodbUri = "mongodb://localhost:27017";
      let databaseName = env.db;
      let client = new MongoClient(mongodbUri, {
        useUnifiedTopology: true
      });
      await client.connect();
      let db = client.db(databaseName);
      const collections = await db.listCollections().toArray();
      for (const collection of collections)
        await db.collection(collection.name).deleteMany({});
    }
    req.flash("success", "Cleared Site Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Clearing Site Page!", err);
    req.flash("error", "Error in Clearing Site Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
}
module.exports = {
  backupMail,
  DeleteAllDataPage,
  DeleteAllData
};
