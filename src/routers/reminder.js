const express = require("express");
const { default: axios } = require("axios");
const nodemailer = require("nodemailer");
const Reminder = require("../models/reminder");
const cron = require("node-cron");
const { getReminderTime } = require("../utils/common");

const router = new express.Router();

router.get("/get/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find({}).sort({ createdAt: -1 });
    res.json({ reminders });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/add/reminder", async (req, res) => {
  try {
    const { origins, destination, time, email } = req.body;
    const r1 = new Reminder({ email, to: "ADD REMINDER" });
    await r1.save();

    if (!origins || !destination || !time || !email)
      res.status(400).json({ error: "Data not correct" });

    let { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origins.toString()}&destinations=${destination.toString()}&key=${
        process.env.GMAPS_API_KEY
      }`
    );
    const r2 = new Reminder({ email, to: "MAPS" });
    r2.save();
    data = data.rows[0].elements[0];
    if (data.status !== "OK")
      res
        .status(500)
        .json({ error: "Google Maps unreachable, try again later!" });

    const actualTime = time.split(":");
    // console.log(
    //   "reminder duration actual",
    //   getReminderTime(actualTime, data.duration.value),
    //   data.duration.value,
    //   actualTime
    // );
    const reminderTime = getReminderTime(actualTime, data.duration.value);
    if (!reminderTime)
      res.status(400).json({ error: "You cannot reach on time!" });
    const task = cron.schedule(
      `${reminderTime[1]} ${reminderTime[0]} * * *`,
      function () {
        const output = `
    <p>You have a new reminder</p>
    <h2>Leave for ${destination.toString()}</h2>
    <p>Thank you for using our services!</p>
  `;

        let transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "test2110x@gmail.com",
            pass: "Test@2110",
          },
        });

        let mailOptions = {
          from: '"Nodemailer Contact" <rose51@ethereal.email>',
          to: email,
          subject: "Reminder",
          text: "Hello world?",
          html: output,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        });
        task.stop();
      }
    );
    res.send();
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
