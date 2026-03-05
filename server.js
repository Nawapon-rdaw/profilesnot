require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let otpStore = {}; // เก็บ OTP ชั่วคราว

// ================= MAIL SETUP =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ================= REQUEST OTP =================
app.post('/request-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "ไม่พบอีเมล" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
        code: otp,
        expire: Date.now() + 2 * 60 * 1000 // 2 นาที
    };

    try {
        await transporter.sendMail({
            from: `"OTP System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "รหัส OTP ของคุณ",
            html: `
                <h2>รหัส OTP ของคุณ</h2>
                <h1>${otp}</h1>
                <p>รหัสนี้หมดอายุใน 2 นาที</p>
            `
        });

        res.json({ message: "ส่ง OTP แล้ว" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "ส่งอีเมลไม่สำเร็จ" });
    }
});

// ================= VERIFY OTP =================
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
        return res.status(400).json({ message: "ไม่พบ OTP" });
    }

    if (Date.now() > record.expire) {
        delete otpStore[email];
        return res.status(400).json({ message: "OTP หมดอายุแล้ว" });
    }

    if (record.code !== otp) {
        return res.status(400).json({ message: "OTP ไม่ถูกต้อง" });
    }

    delete otpStore[email];

    res.json({ message: "ยืนยันสำเร็จ" });
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});