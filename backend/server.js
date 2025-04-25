const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const odTree = require('./treeDataStructure');
const { User, ODApplication } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'image/jpeg' || 
            file.mimetype === 'image/png' || 
            file.mimetype === 'image/jpg' || 
            file.mimetype === 'image/gif' || 
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file format'), false);
        }
    }
});

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email notification functions
async function sendODRequestNotificationToMentor(student, mentor, odRequest) {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: mentor.email,
            subject: 'New OD Request Submitted',
            html: `
                <h2>New OD Request Notification</h2>
                <p>Student ${student.name} (${student.roll_no}) has submitted a new OD request.</p>
                <h3>Request Details:</h3>
                <ul>
                    <li>Start Date: ${new Date(odRequest.startDateTime).toLocaleString()}</li>
                    <li>End Date: ${new Date(odRequest.endDateTime).toLocaleString()}</li>
                    <li>Description: ${odRequest.description}</li>
                </ul>
                <p>Please review the request at your earliest convenience.</p>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email to mentor:', error);
    }
}

async function sendApprovalNotificationToClassAdvisor(student, classAdvisor, odRequest) {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: classAdvisor.email,
            subject: 'OD Request Approved by Mentor',
            html: `
                <h2>OD Request Pending Your Approval</h2>
                <p>An OD request from student ${student.name} (${student.roll_no}) has been approved by their mentor.</p>
                <h3>Request Details:</h3>
                <ul>
                    <li>Start Date: ${new Date(odRequest.startDateTime).toLocaleString()}</li>
                    <li>End Date: ${new Date(odRequest.endDateTime).toLocaleString()}</li>
                    <li>Description: ${odRequest.description}</li>
                </ul>
                <p>Please review and provide your approval/rejection.</p>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email to class advisor:', error);
    }
}

async function sendFinalApprovalNotifications(student, odRequest, handlingTeachers) {
    try {
        // Email to student
        const studentMailOptions = {
            from: process.env.EMAIL,
            to: student.email,
            subject: 'OD Request Approved',
            html: `
                <h2>Your OD Request has been Approved</h2>
                <h3>Request Details:</h3>
                <ul>
                    <li>Start Date: ${new Date(odRequest.startDateTime).toLocaleString()}</li>
                    <li>End Date: ${new Date(odRequest.endDateTime).toLocaleString()}</li>
                    <li>Description: ${odRequest.description}</li>
                </ul>
                <p>Your OD request has been approved by both your mentor and class advisor.</p>
            `
        };
        await transporter.sendMail(studentMailOptions);

        // Email to handling teachers
        for (const teacher of handlingTeachers) {
            const teacherMailOptions = {
                from: process.env.EMAIL,
                to: teacher.email,
                subject: 'Student OD Request Notification',
                html: `
                    <h2>Student OD Request Notification</h2>
                    <p>Student ${student.name} (${student.roll_no}) will be on OD for the following period:</p>
                    <ul>
                        <li>Start Date: ${new Date(odRequest.startDateTime).toLocaleString()}</li>
                        <li>End Date: ${new Date(odRequest.endDateTime).toLocaleString()}</li>
                        <li>Description: ${odRequest.description}</li>
                    </ul>
                    <p>This request has been approved by both mentor and class advisor.</p>
                `
            };
            await transporter.sendMail(teacherMailOptions);
        }
    } catch (error) {
        console.error('Error sending final approval notifications:', error);
    }
}

async function sendRejectionNotification(student, odRequest, rejectedBy, reason) {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: student.email,
            subject: 'OD Request Rejected',
            html: `
                <h2>Your OD Request has been Rejected</h2>
                <p>Your OD request has been rejected by your ${rejectedBy}.</p>
                <h3>Request Details:</h3>
                <ul>
                    <li>Start Date: ${new Date(odRequest.startDateTime).toLocaleString()}</li>
                    <li>End Date: ${new Date(odRequest.endDateTime).toLocaleString()}</li>
                    <li>Description: ${odRequest.description}</li>
                </ul>
                <p><strong>Reason for rejection:</strong> ${reason}</p>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending rejection notification:', error);
    }
}

// Generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// MongoDB Connection
console.log('MongoDB URI:', process.env.MONGODB_URI); // Log the MongoDB URI for debugging
if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is not defined. Please check your .env file.');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await odTree.initialize();
    console.log('✅ Tree data structure initialized');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// ... rest of the code ...