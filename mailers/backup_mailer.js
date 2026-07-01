const nodemailer = require("nodemailer");
const env = require("../config/environment");
const MongoClient = require("mongodb").MongoClient;
const Env_Variable = require("../models/env_variable");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const common_function = require("../controllers/common_function");
async function getdata() {
    try {
        let mongodbUri = "mongodb://localhost:27017";
        let databaseName = env.db;
        let client = new MongoClient(mongodbUri);
        await client.connect();
        let db = client.db(databaseName);
        let collectionNames = await db.listCollections().toArray();
        let backupDir = path.join(__dirname, "../backup_temp");
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
        for (let collection of collectionNames) {
            let data = await db.collection(collection.name).find().toArray();
            fs.writeFileSync(
                path.join(backupDir, collection.name + ".json"),
                JSON.stringify(data, null, 2)
            );
        }
        await client.close();
        return backupDir;
    } catch (err) {
        console.log("Error in Taking Backup!", err);
        return "";
    }
}
async function backupMail() {
    try {
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
        let mailUser = await Env_Variable.findOne({ name: "mailUser" });
        let mailPassword = await Env_Variable.findOne({ name: "mailPassword" });
        let mailFrom = await Env_Variable.findOne({ name: "mailFrom" });
        let backUpMail = await Env_Variable.findOne({ name: "backUpMail" });
        env.smtp.auth.user = mailUser.value;
        env.smtp.auth.pass = mailPassword.value;
        const transporter = nodemailer.createTransport(env.smtp);
        // Get all JSON backups
        const backupDir = await getdata();
        const zipFilePath = path.join(__dirname, `../backup_${timenow}.zip`);
        // Compress backup folder
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver("zip", { zlib: { level: 9 } });
            output.on("close", resolve);
            archive.on("error", reject);
            archive.pipe(output);
            archive.directory(backupDir, false);
            archive.finalize();
        });
        // Send email with ZIP attachment
        await transporter.sendMail({
            from: mailFrom.value,
            to: backUpMail.value,
            subject: "Backup Jewellery Software - " + timenow,
            attachments: [{ filename: `backup_${timenow}.zip`, path: zipFilePath }]
        });
        console.log("Mail Delivered!");
        // Cleanup
        fs.rmSync(backupDir, { recursive: true, force: true });
        fs.unlinkSync(zipFilePath);
    } catch (err) {
        console.log("Error in sending mail", err);
    }
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
