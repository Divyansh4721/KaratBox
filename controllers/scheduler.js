const cron = require("node-cron");
const backupMailer = require("../mailers/backup_mailer");
const User = require("../models/user");
const common_function = require("./common_function");
let fsSync = require("fs");
const fs = require("fs").promises;
const env = require("../config/environment");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
let scheduledTask1 = cron.schedule(env.backupTime, async () => {
  let users = await User.find();
  for (let i of users) {
    i.adminPermissionTemp = false;
    await i.save();
  }
  await common_function.scheduleDailyUpdateList();
  await common_function.scheduleDeleteAfterXDays();
  backupMailer.backupMail();
});
scheduledTask1.start();

function transformData(item) {
  let createObject = (item, name) => {
    if (item[name])
      item[name] = item[name] ? new ObjectId(item[name]) : undefined;
  };
  let createDate = (item, name) => {
    if (item[name]) item[name] = new Date(item[name]);
  };
  let createArr = (item, name, task) => {
    if (item[name] && Array.isArray(item[name]))
      item[name] = item[name].map((value) =>
        task === "date"
          ? new Date(value)
          : value
            ? new ObjectId(value)
            : undefined
      );
  };
  let temp = [
    "_id",
    "userGave",
    "user",
    "userTake",
    "dealer",
    "customer",
    "prefix",
    "ornament",
    "purity",
    "kaarigar",
    "stockType",
    "bill",
    "createdBy",
    "deletedBy"
  ];
  for (let i of temp) createObject(item, i);
  temp = [
    "approvedDate",
    "receivedDate",
    "createdAt",
    "updatedAt",
    "date",
    "createdDate",
    "deletedDate"
  ];
  for (let i of temp) createDate(item, i);
  temp = [
    "cart",
    "bills",
    "approvals",
    "opening",
    "arrival",
    "edit",
    "sold",
    "deleted",
    "totalApproval",
    "approvalGive",
    "approvalTake",
    "closing",
    "total",
    "users",
    "approveTable"
  ];
  for (let i of temp) createArr(item, i, "object");
  if (item.impDates && Array.isArray(item.impDates)) {
    item.impDates = item.impDates.map((value) => {
      return {
        remark: value.remark,
        date: new Date(value.date),
        _id: value._id ? new ObjectId(value._id) : undefined
      };
    });
  }
  if (item.payments && Array.isArray(item.payments)) {
    item.payments = item.payments.map((value) => {
      return {
        amount: value.amount,
        gold: value.gold,
        remark: value.remark,
        date: new Date(value.date),
        _id: value._id ? new ObjectId(value._id) : undefined
      };
    });
  }
  if (item.stoneTable && Array.isArray(item.stoneTable)) {
    item.stoneTable = item.stoneTable.map((value) => {
      if (value.tounch)
        return {
          tounch: value.tounch,
          labour: value.labour,
          rate: value.rate,
          _id: value._id ? new ObjectId(value._id) : undefined
        };
      else
        return {
          type: value.type ? new ObjectId(value.type) : undefined,
          ctWeight: value.ctWeight,
          gmWeight: value.gmWeight,
          purchaseRate: value.purchaseRate,
          sellRate: value.sellRate,
          dealerName: value.dealerName
            ? new ObjectId(value.dealerName)
            : undefined,
          _id: value._id ? new ObjectId(value._id) : undefined
        };
    });
  }
  if (item.updatedTable && Array.isArray(item.updatedTable)) {
    item.updatedTable = item.updatedTable.map((value) => {
      return {
        user: value.user ? new ObjectId(value.user) : undefined,
        date: new Date(value.date),
        remark: value.remark,
        _id: value._id ? new ObjectId(value._id) : undefined
      };
    });
  }
  return item;
}
module.exports.Backup = async function (req, res) {
  console.log("I am in backup");
  backupMailer.backupMail();
  return res.redirect("/");
};
module.exports.ImportData = async function (req, res) {
  try {
    let mongodbUri = "mongodb://localhost:27017";
    let databaseName = env.db;
    let client = new MongoClient(mongodbUri, {
      useUnifiedTopology: true
    });
    await client.connect();
    let db = client.db(databaseName);
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      if (await !fsSync.existsSync("backup/" + collection.name + ".json"))
        await fs.readFile("backup/" + collection.name + ".json", "utf8");
    }
    for (const collection of collections) {
      if (collection.name === "sessions") continue;
      let data = await fs.readFile(
        "backup/" + collection.name + ".json",
        "utf8"
      );
      await fs.unlink("backup/" + collection.name + ".json");
      await db.collection(collection.name).deleteMany({});
      console.log(`Dropped collection: ${collection.name}`);
      let jsonData = JSON.parse(data);
      if (jsonData.length === 0) continue;
      await db
        .collection(collection.name)
        .insertMany(jsonData.map(transformData));
    }
    req.flash("success", "Imported Successfully!");
    return res.redirect("/dev");
  } catch (error) {
    console.error(error);
    console.error("Error in importing files");
    req.flash("error", "No File to Import!");
    return res.redirect("/");
  }
};
