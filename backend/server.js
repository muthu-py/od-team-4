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
        const mentoremail = await User.findOne({_id:mentor});
        // console.log(mentorid)
        const mailOptions = {
            from: process.env.EMAIL,
            to: mentoremail.email,
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

// User Schema
// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
//     name: { type: String, required: true },
//     mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
//     cls_advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
// });

const Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    roll_no: { type: String, required: function() { return this.role === 'student'; }, unique: true },

    // Relationships
    cls_students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For teachers
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // For students
    cls_advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students
    handling_teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For students
    handling_students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For teachers

    // Reset password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // New fields for current and previous semesters
    cur_sem: { type: Number },
    pre_sem: [{ type: Number }]
});

const User = mongoose.model('User', Schema);

module.exports = User;


//const User = mongoose.model('users', userSchema);

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
    //checkUsers();
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function checkUsers() {
    try {
        const users = await User.find();
        for (const user of users) {
            console.log(`email: ${user.email}`);
            console.log(`password: ${user.password}`);
        }
    } catch (error) {
        console.error('❌ Error fetching users:', error);
    }
}

// 🔹 USER REGISTRATION
// app.post('/api/register', async (req, res) => {
//     try {
//         const { email, password, role, name, department } = req.body;

//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         user = new User({ email, password: hashedPassword, role, name, department });
//         await user.save();

//         res.json({ message: '✅ User registered successfully' });
//     } catch (error) {
//         console.error('❌ Register error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
let uemail = "";
// 🔹 GET STUDENT PROFILE
app.get('/api/student/profile', async (req, res) => {
    try {
        console.log("before try");
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        console.log("after try");
        

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await User.findById(decoded.userId)
            .populate('mentor', 'name')
            .populate('cls_advisor', 'name');
        console.log('Student data from DB:', student);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        //console.log(student.roll_no);
        res.json({
            success: true,
            profile: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                roll_no: student.roll_no,
                mentor: student.mentor?.name || 'Not assigned',
                cls_advisor: student.cls_advisor?.name || 'Not assigned'
            }

        });
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 USER LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        uemail = email;
        console.log(uemail);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        //const isMatch = await bcrypt.compare(password, user.password);
        if (password != user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                mentor: user.mentor,
                cls_advisor: user.cls_advisor
            },
            success: true
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 📧 Setup Nodemailer for Sending Emails
// 🔹 FORGOT PASSWORD - Generate Reset Token
// app.post('/api/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const resetToken = jwt.sign(
//             { userId: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );
//         user.resetPasswordToken = resetToken;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//         await user.save();

//         // Here you would typically send an email with the reset token
//         // For now, we'll just return the token
//         res.json({ message: 'Password reset token sent', token: resetToken });
//     } catch (error) {
//         console.error('Forgot password error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // 🔹 RESET PASSWORD - Validate Token & Set New Password
// app.post('/api/reset-password', async (req, res) => {
//     try {
//         const { token, newPassword } = req.body;

//         const user = await User.findOne({
//             resetPasswordToken: token,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired reset token' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         await user.save();

//         res.json({ message: 'Password has been reset' });
//     } catch (error) {
//         console.error('Reset password error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // 🔹 ERROR HANDLING MIDDLEWARE
// app.use((err, req, res, next) => {
//     console.error('❌ Error:', err.stack);
//     res.status(500).json({ message: 'Something went wrong!' });
// });
// Replace the existing forgot password and reset password endpoints with these:

// 🔹 FORGOT PASSWORD - Generate and Send OTP
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 600000; // 10 minutes

        // Save OTP and expiry to user document
        await User.findOneAndUpdate(
            { _id: user._id },
            { 
                resetPasswordToken: otp,
                resetPasswordExpires: otpExpiry
            },
            { new: true, runValidators: false }
        );

        // Send OTP via email
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.`
        });

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 VERIFY OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        // Check attempts
        if (otpData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'Too many attempts. Please request a new OTP' });
        }

        // Check expiry (10 minutes)
        if (Date.now() - otpData.timestamp > 600000) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});


// 🔹 RESET PASSWORD - With Verified OTP
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP
        const otpData = otpStore.get(email);
        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check if OTP has expired (10 minutes)
        if (Date.now() - otpData.timestamp > 600000) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's password
        user.password = newPassword;
        await user.save();

        // Clear OTP from store
        otpStore.delete(email);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});


// Add these imports at the top of your file


// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// OD Application Schema
const ODApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    startSession: {
        type: String,
        enum: ['forenoon', 'afternoon', 'fullday'],
        required: true
    },
    endSession: {
        type: String,
        enum: ['forenoon', 'afternoon', 'fullday'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fileUrls: [{
        type: String
    }],
    semester: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    mentorApproval: {
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        remarks: String,
        date: Date
    },
    classAdvisorApproval: {
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        remarks: String,
        date: Date
    },
    handling_teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

const ODApplication = mongoose.model('requests', ODApplicationSchema);

// 🔹 UPLOAD FILES FOR OD APPLICATION
app.post('/api/upload-od-files', (req, res) => {
    upload.array('files', 5)(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false,
                    message: 'File too large. Maximum size is 10MB.' 
                });
            }
            return res.status(400).json({ 
                success: false,
                message: `Upload error: ${err.message}` 
            });
        } else if (err) {
            // An unknown error occurred
            return res.status(400).json({ 
                success: false,
                message: err.message 
            });
        }
        
        // Everything went fine with the upload
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                // Delete uploaded files if authentication fails
                if (req.files) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                return res.status(401).json({ message: 'Authentication required' });
            }
            
            // Verify token
            jwt.verify(token, process.env.JWT_SECRET);
            
            // Return file paths with full server URL
            const serverUrl = `http://localhost:${PORT}`;
            const filePaths = req.files.map(file => `${serverUrl}/uploads/${file.filename}`);
            
            console.log('Uploaded files:', filePaths);
            
            res.json({ 
                success: true, 
                files: filePaths,
                message: 'Files uploaded successfully'
            });
        } catch (error) {
            console.error('File upload error:', error);
            
            // Delete uploaded files if there's an error
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// 🔹 SUBMIT OD APPLICATION
app.post('/api/od-applications', async (req, res) => {
    try {
        const { startDateTime, endDateTime, description, fileUrls } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        // Get student details
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student has current semester
        if (!student.cur_sem) {
            return res.status(400).json({ message: 'Current semester not set for student' });
        }

        // Check number of OD requests for current semester
        const semesterRequests = await ODApplication.countDocuments({
            studentId,
            semester: student.cur_sem
        });

        if (semesterRequests >= 8) {
            return res.status(400).json({ 
                message: 'Maximum limit of 8 OD requests for this semester has been reached' 
            });
        }
        
        // Extract date and session from the objects
        const startDate = startDateTime && startDateTime.date ? new Date(startDateTime.date) : startDateTime;
        const endDate = endDateTime && endDateTime.date ? new Date(endDateTime.date) : endDateTime;
        const startSession = startDateTime && startDateTime.session ? startDateTime.session : 'forenoon';
        const endSession = endDateTime && endDateTime.session ? endDateTime.session : 'forenoon';
        
        // Ensure fileUrls is an array
        const processedFileUrls = Array.isArray(fileUrls) ? fileUrls : [];
        
        // Create new OD application
        const newApplication = new ODApplication({
            studentId,
            startDateTime: startDate,
            endDateTime: endDate,
            startSession,
            endSession,
            description,
            fileUrls: processedFileUrls,
            semester: student.cur_sem // Add current semester
        });
        
        const savedApplication = await newApplication.save();

        // Send email notification to mentor
        if (student.mentor) {
            console.log(student.mentor)
            await sendODRequestNotificationToMentor(student, student.mentor, savedApplication);
        }
        
        res.json({ 
            success: true, 
            message: 'OD application submitted successfully',
            application: savedApplication
        });
    } catch (error) {
        console.error('Error submitting OD application:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 GET STUDENT'S OD APPLICATIONS
app.get('/api/od-applications', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { timePeriod = 'lifetime', status = 'all', semester = 'all' } = req.query;
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        // Calculate date range based on time period
        const now = new Date();
        let startDate;
        switch(timePeriod) {
            case '7days':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case '30days':
                startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case '1year':
                startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
                break;
            default: // lifetime
                startDate = new Date(0);
        }

        // Build query
        const query = { 
            studentId,
            submissionDate: { $gte: startDate }
        };

        // Add status filter if not 'all'
        if (status !== 'all') {
            query.status = status;
        }

        // Add semester filter if not 'all'
        if (semester !== 'all') {
            query.semester = parseInt(semester);
        }
        
        // Get all applications for this student with filters
        const applications = await ODApplication.find(query)
            .sort({ submissionDate: -1 }); // Most recent first
        
        // Get student's current semester
        const student = await User.findById(studentId);
        const currentSemester = student ? student.cur_sem : null;
        const previousSemesters = student ? student.pre_sem : [];
        
        res.json({ 
            applications,
            currentSemester,
            previousSemesters
        });
    } catch (error) {
        console.error('Error fetching OD applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 UPDATE OD APPLICATION WITH FILE URLS
app.patch('/api/od-applications/:id/files', async (req, res) => {
    try {
        const { id } = req.params;
        const { fileUrls } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        // Find the application and verify ownership
        const application = await ODApplication.findById(id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        if (application.studentId.toString() !== studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Update with file URLs
        application.fileUrls = fileUrls;
        await application.save();
        
        res.json({ 
            success: true, 
            message: 'Files added to application',
            application
        });
    } catch (error) {
        console.error('Error updating application with files:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add these endpoints after your existing routes

// Add this middleware function for token authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = { id: user.userId, role: user.role };
        next();
    });
};

// Get OD requests from mentees
app.get('/api/teacher/mentee-requests', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        // Find the teacher to get their mentees list
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        console.log('Teacher ID:', teacherId);
        console.log('Teacher mentees:', teacher.mentees);
        
        // Use mentees array to find OD applications
        const studentIds = [...(teacher.mentees || [])];
        
        console.log('Looking for OD applications with studentIds:', studentIds);
        
        // Find all OD applications submitted by the teacher's mentees
        const odApplications = await ODApplication.find({
            studentId: { $in: studentIds }
        });
        
        // console.log('Found applications:', odApplications);
        
        // Get student details for each application
        const requests = [];
        for (const app of odApplications) {
            const student = await User.findById(app.studentId);
            const startDate = new Date(app.startDateTime).toLocaleDateString();
            const endDate = new Date(app.endDateTime).toLocaleDateString();
            const dateRange = startDate === endDate 
                    ? `${startDate} (${app.startSession} - ${app.endSession})` 
                    : `${startDate} to ${endDate}`;
            if (student) {
                requests.push({
                    _id: app._id,
                    name: student.name || 'Unknown',
                    email: student.email || 'No email',
                    registerNumber: student.roll_no || 'N/A',
                    startDate: app.startDateTime,
                    endDate: app.endDateTime,
                    dateRange: dateRange,
                    reason: app.description,
                    class: student.class || 'N/A',
                    odSubmissionStatus: app.status || 'Pending',
                    mentorApproval: app.mentorApproval || { status: 'Pending' },
                    rejectionReason: app.mentorApproval?.remarks || '',
                    createdAt: app.submissionDate || app.createdAt || new Date(),
                    file: app.fileUrls && app.fileUrls.length > 0 ? {
                        name: path.basename(app.fileUrls[0]),
                        url: app.fileUrls[0]
                    } : null
                });
            }
        }
        
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching mentee requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the approve request endpoint for mentors
app.post('/api/teacher/approve-request/:requestId', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { requestId } = req.params;
        
        // Find the teacher to verify role
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        // Find the OD application
        const odApplication = await ODApplication.findById(requestId);
        
        if (!odApplication) {
            return res.status(404).json({ message: 'OD application not found' });
        }
        
        // Get student details
        const student = await User.findById(odApplication.studentId)
            .populate('cls_advisor')
            .populate('handling_teachers');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Get all student IDs the teacher is responsible for
        const studentIds = [...(teacher.mentees || []), ...(teacher.cls_students || [])];
        
        // Check if this teacher is authorized to approve this application
        const studentIdStr = odApplication.studentId.toString();
        const isAuthorized = studentIds.some(id => id && id.toString() === studentIdStr);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to approve this request' });
        }
        
        // Initialize mentorApproval if it doesn't exist
        if (!odApplication.mentorApproval) {
            odApplication.mentorApproval = {};
        }
        
        // Update the mentor approval status
        odApplication.mentorApproval.status = 'Approved';
        
        // Only update overall status to Approved if both mentor and class advisor have approved
        if (odApplication.mentorApproval.status === 'Approved' && 
            odApplication.classAdvisorApproval?.status === 'Approved') {
            odApplication.status = 'Approved';
        }
        
        await odApplication.save();

        // Send email notification to class advisor
        if (student.cls_advisor) {
            await sendApprovalNotificationToClassAdvisor(student, student.cls_advisor, odApplication);
        }
        
        res.json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the reject request endpoint
app.post('/api/teacher/reject-request/:requestId', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { requestId } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        
        // Find the teacher to verify role
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        // Find the OD application
        const odApplication = await ODApplication.findById(requestId);
        
        if (!odApplication) {
            return res.status(404).json({ message: 'OD application not found' });
        }

        // Get student details BEFORE we try to use it
        const student = await User.findById(odApplication.studentId)
            .populate('cls_advisor')
            .populate('handling_teachers');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Get all student IDs the teacher is responsible for
        const studentIds = [...(teacher.mentees || []), ...(teacher.class_students || [])];
        
        // Check if this teacher is authorized to reject this application
        const studentIdStr = odApplication.studentId.toString();
        const isAuthorized = studentIds.some(id => id && id.toString() === studentIdStr);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to reject this request' });
        }
        
        // Initialize mentorApproval if it doesn't exist
        if (!odApplication.mentorApproval) {
            odApplication.mentorApproval = {};
        }
        
        // Update the application status
        odApplication.mentorApproval.status = 'Rejected';
        odApplication.mentorApproval.remarks = reason;
        odApplication.status = 'Rejected'; // Update overall status
        
        await odApplication.save();

        // Send rejection notification to student
        await sendRejectionNotification(student, odApplication, 'mentor', reason);
        
        res.json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get OD requests for class advisor
app.get('/api/teacher/class-advisor-requests', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        // Find the teacher to get their class students list
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        console.log('Teacher ID:', teacherId);
        console.log('Teacher class students:', teacher.cls_students);
        
        // Initialize studentIds as an empty array if cls_students is undefined
        const studentIds = [];
        
        // Check if cls_students exists and add them to studentIds
        if (teacher.cls_students && Array.isArray(teacher.cls_students)) {
            teacher.cls_students.forEach(id => studentIds.push(id));
        }
        
        console.log('Looking for OD applications with studentIds:', studentIds);
        
        // Find all OD applications submitted by the teacher's class students
        // Only show applications that have been approved by the mentor
        const odApplications = await ODApplication.find({
            studentId: { $in: studentIds },
            'mentorApproval.status': 'Approved'
        });
        
        console.log('Found applications:', odApplications);
        
        // Get student details for each application
        const requests = [];
        for (const app of odApplications) {
            const student = await User.findById(app.studentId);
            if (student) {
                const startDate = new Date(app.startDateTime).toLocaleDateString();
                const endDate = new Date(app.endDateTime).toLocaleDateString();
                const dateRange = startDate === endDate 
                    ? `${startDate} (${app.startSession} - ${app.endSession})` 
                    : `${startDate} to ${endDate}`;
                requests.push({
                    _id: app._id,
                    name: student.name || 'Unknown',
                    email: student.email || 'No email',
                    registerNumber: student.roll_no || 'N/A',
                    startDate: app.startDateTime,
                    endDate: app.endDateTime,
                    dateRange: dateRange,
                    reason: app.description,
                    class: student.class || 'N/A',
                    odSubmissionStatus: app.status || 'Pending',
                    mentorApproval: app.mentorApproval || { status: 'Pending' },
                    classAdvisorApproval: app.classAdvisorApproval || null,
                    rejectionReason: app.classAdvisorApproval?.remarks || '',
                    createdAt: app.submissionDate || app.createdAt || new Date(),
                    file: app.fileUrls && app.fileUrls.length > 0 ? {
                        name: path.basename(app.fileUrls[0]),
                        url: app.fileUrls[0]
                    } : null
                });
            }
        }
        
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching class advisor requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Class Advisor approve request endpoint
app.post('/api/teacher/class-advisor-approve/:requestId', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { requestId } = req.params;
        
        // Find the teacher to verify role
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        // Find the OD application
        const odApplication = await ODApplication.findById(requestId);
        
        if (!odApplication) {
            return res.status(404).json({ message: 'OD application not found' });
        }
        
        // Check if mentor has already approved
        if (odApplication.mentorApproval?.status !== 'Approved') {
            return res.status(400).json({ message: 'Mentor approval is required first' });
        }

        // Get student details with handling teachers
        const student = await User.findById(odApplication.studentId)
            .populate('cls_advisor')
            .populate('handling_teachers');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Initialize studentIds as an empty array
        const studentIds = [];
        
        // Check if cls_students exists and add them to studentIds
        if (teacher.cls_students && Array.isArray(teacher.cls_students)) {
            teacher.cls_students.forEach(id => studentIds.push(id));
        }
        
        // Check if this teacher is authorized to approve this application
        const studentIdStr = odApplication.studentId.toString();
        const isAuthorized = studentIds.some(id => id && id.toString() === studentIdStr);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to approve this request' });
        }
        
        // Initialize classAdvisorApproval if it doesn't exist
        if (!odApplication.classAdvisorApproval) {
            odApplication.classAdvisorApproval = {};
        }
        
        // Update the application status
        odApplication.classAdvisorApproval.status = 'Approved';
        
        // Only update overall status to Approved if both mentor and class advisor have approved
        if (odApplication.mentorApproval.status === 'Approved' && 
            odApplication.classAdvisorApproval.status === 'Approved') {
            odApplication.status = 'Approved';

            // Send final approval notifications to student and handling teachers
            await sendFinalApprovalNotifications(student, odApplication, student.handling_teachers || []);
        }
        
        await odApplication.save();
        
        res.json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Class Advisor reject request endpoint
app.post('/api/teacher/class-advisor-reject/:requestId', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { requestId } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        
        // Find the teacher to verify role
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }
        
        // Find the OD application
        const odApplication = await ODApplication.findById(requestId);
        const student = await User.findById(odApplication.studentId)
        .populate('cls_advisor')
        .populate('handling_teachers');
        if (!odApplication) {
            return res.status(404).json({ message: 'OD application not found' });
        }
        
        // Check if mentor has already approved
        if (odApplication.mentorApproval?.status !== 'Approved') {
            return res.status(400).json({ message: 'Mentor approval is required first' });
        }
        
        // Get all student IDs the teacher is responsible for as class advisor
        const studentIds = [...(teacher.cls_students || [])];
        
        // Check if this teacher is authorized to reject this application
        const studentIdStr = odApplication.studentId.toString();
        const isAuthorized = studentIds.some(id => id && id.toString() === studentIdStr);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to reject this request' });
        }
        
        // Initialize classAdvisorApproval if it doesn't exist
        if (!odApplication.classAdvisorApproval) {
            odApplication.classAdvisorApproval = {};
        }
        
        // Update the application status
        odApplication.classAdvisorApproval.status = 'Rejected';
        odApplication.classAdvisorApproval.remarks = reason;
        odApplication.status = 'Rejected'; // Update overall status to Rejected
        
        await odApplication.save();

        // Send rejection notification to student
        await sendRejectionNotification(student, odApplication, 'class advisor', reason);
        
        res.json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all users (admin only)
app.get('/api/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        // For each teacher, get the roll numbers of their students
        const enhancedUsers = await Promise.all(users.map(async user => {
            const userObj = user.toObject();
            
            if (user.role === 'teacher') {
                // Get mentees roll numbers
                if (user.mentees && user.mentees.length > 0) {
                    const mentees = await User.find({ _id: { $in: user.mentees } }).select('roll_no');
                    userObj.menteeRollNumbers = mentees.map(mentee => mentee.roll_no);
                }
                
                // Get class students roll numbers
                if (user.cls_students && user.cls_students.length > 0) {
                    const classStudents = await User.find({ _id: { $in: user.cls_students } }).select('roll_no');
                    userObj.classStudentRollNumbers = classStudents.map(student => student.roll_no);
                }
                
                // Get handling students roll numbers
                if (user.handling_students && user.handling_students.length > 0) {
                    const handlingStudents = await User.find({ _id: { $in: user.handling_students } }).select('roll_no');
                    userObj.handlingStudentRollNumbers = handlingStudents.map(student => student.roll_no);
                }
            }
            
            return userObj;
        }));
        
        res.json({ users: enhancedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (admin only)
app.post('/api/users', isAdmin, async (req, res) => {
    try {
        const { name, email, password, role, mentor, cls_advisor, roll_no, mentees, cls_students, handling_students, cur_sem, pre_sem } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this email' 
            });
        }

        // Validate role-specific requirements
        if (role === 'student' && !roll_no) {
            return res.status(400).json({
                success: false,
                message: 'Roll number is required for student users'
            });
        }

        // Create new user with basic info
        const user = new User({
            name,
            email,
            password,
            role,
            roll_no: role === 'student' ? roll_no : undefined,
            cur_sem,
            pre_sem
        });

        // If creating a teacher, handle relationships
        if (role === 'teacher') {
            // Initialize empty arrays if not provided
            user.mentees = [];
            user.cls_students = [];
            user.handling_students = [];

            // Handle mentees
            if (mentees && Array.isArray(mentees)) {
                for (const rollNo of mentees) {
                    const mentee = await User.findOne({ roll_no: rollNo });
                    if (mentee) {
                    user.mentees.push(mentee._id);
                        mentee.mentor = user._id;
                        await mentee.save();
                    }
                }
            }

            // Handle class students
            if (cls_students && Array.isArray(cls_students)) {
                for (const rollNo of cls_students) {
                    const student = await User.findOne({ roll_no: rollNo });
                    if (student) {
                    user.cls_students.push(student._id);
                        student.cls_advisor = user._id;
                        await student.save();
                    }
                }
            }

            // Handle handling students
            if (handling_students && Array.isArray(handling_students)) {
                for (const rollNo of handling_students) {
                    const student = await User.findOne({ roll_no: rollNo });
                    if (student) {
                        user.handling_students.push(student._id);
                        if (!student.handling_teachers) {
                            student.handling_teachers = [];
                        }
                        student.handling_teachers.push(user._id);
                        await student.save();
                    }
                }
            }
        }

        // If creating a student, handle mentor and class advisor
        if (role === 'student') {
            if (mentor) {
                user.mentor = mentor;
            }
            if (cls_advisor) {
            user.cls_advisor = cls_advisor;
            }
        }

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ 
            success: true,
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating user',
            error: error.message 
        });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', isAdmin, async (req, res) => {

    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = decoded.userId;

        // Check if trying to delete own account
        if (adminId === req.params.id) {
            return res.status(403).json({ message: 'Admins cannot delete their own account' });
        }

        const user = await User.findById(req.params.id).populate('mentor').populate('cls_advisor');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user,user.mentor,user.cls_advisor);

        // Handle cascading delete based on user role
        if (user.role === 'student') {
            // Remove student from mentor's mentees list if mentor exists
            if (user.mentor) {
                await User.findByIdAndUpdate(
                    user.mentor._id,
                    { $pull: { mentees: user._id } }
                );
            }

            // Remove student from class advisor's cls_students list if advisor exists
            if (user.cls_advisor) {
                await User.findByIdAndUpdate(
                    user.cls_advisor._id,
                    { $pull: { cls_students: user._id } }
                );
            }

            // Delete all OD applications associated with the student
            await ODApplication.deleteMany({ studentId: user._id });
        } else if (user.role === 'teacher') {
            // Update all students who have this teacher as mentor
            await User.updateMany(
                { mentor: user._id },
                { $set: { mentor: null } }
            );

            // Update all students who have this teacher as class advisor
            await User.updateMany(
                { cls_advisor: user._id },
                { $set: { cls_advisor: null } }
            );

            // Delete all OD applications where this teacher is involved in approvals
            await ODApplication.deleteMany({
                $or: [
                    { 'mentorApproval.teacherId': user._id },
                    { 'classAdvisorApproval.teacherId': user._id }
                ]
            });
        }

        // Finally, delete the user
        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user endpoint
app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;

        // Find the existing user
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Validate required fields
        if (!updates.name || !updates.email || !updates.role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and role are required fields' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Check if email is already taken by another user
        const duplicateEmail = await User.findOne({ 
            email: updates.email, 
            _id: { $ne: userId } 
        });
        if (duplicateEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is already taken' 
            });
        }

        // Handle role-specific updates
        if (updates.role === 'teacher') {
            try {
                // Store old relationships to clean up later
                const oldMentees = [...(existingUser.mentees || [])];
                const oldClsStudents = [...(existingUser.cls_students || [])];
                const oldHandlingStudents = [...(existingUser.handling_students || [])];

                // Reset relationships
                updates.mentees = [];
                updates.cls_students = [];
                updates.handling_students = [];

                // Process mentees
                if (updates.menteeRollNumbers && Array.isArray(updates.menteeRollNumbers)) {
                    const menteeRollNumbers = updates.menteeRollNumbers
                        .filter(roll => roll && roll.trim())
                        .map(roll => roll.trim());

                    const menteeStudents = await User.find({ 
                        roll_no: { $in: menteeRollNumbers },
                        role: 'student'
                    });

                    // Update mentees array
                    updates.mentees = menteeStudents.map(student => student._id);

                    // Update mentor reference for each mentee
                    await User.updateMany(
                        { _id: { $in: oldMentees } },
                        { $unset: { mentor: "" } }
                    );
                    await User.updateMany(
                        { _id: { $in: updates.mentees } },
                        { $set: { mentor: userId } }
                    );
                }

                // Process class students
                if (updates.classStudentRollNumbers && Array.isArray(updates.classStudentRollNumbers)) {
                    const classRollNumbers = updates.classStudentRollNumbers
                        .filter(roll => roll && roll.trim())
                        .map(roll => roll.trim());

                    const classStudents = await User.find({ 
                        roll_no: { $in: classRollNumbers },
                        role: 'student'
                    });

                    // Update class students array
                    updates.cls_students = classStudents.map(student => student._id);

                    // Update class advisor reference for each student
                    await User.updateMany(
                        { _id: { $in: oldClsStudents } },
                        { $unset: { cls_advisor: "" } }
                    );
                    await User.updateMany(
                        { _id: { $in: updates.cls_students } },
                        { $set: { cls_advisor: userId } }
                    );
                }

                // Process handling students
                if (updates.handlingStudentRollNumbers && Array.isArray(updates.handlingStudentRollNumbers)) {
                    const handlingRollNumbers = updates.handlingStudentRollNumbers
                        .filter(roll => roll && roll.trim())
                        .map(roll => roll.trim());

                    const handlingStudents = await User.find({ 
                        roll_no: { $in: handlingRollNumbers },
                        role: 'student'
                    });

                    // Update handling students array
                    updates.handling_students = handlingStudents.map(student => student._id);

                    // Update handling teachers reference for each student
                    await User.updateMany(
                        { _id: { $in: oldHandlingStudents } },
                        { $pull: { handling_teachers: userId } }
                    );
                    await User.updateMany(
                        { _id: { $in: updates.handling_students } },
                        { $addToSet: { handling_teachers: userId } }
                    );
                }

                // Clean up temporary fields
                delete updates.menteeRollNumbers;
                delete updates.classStudentRollNumbers;
                delete updates.handlingStudentRollNumbers;
            } catch (error) {
                console.error('Error processing teacher relationships:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Error processing teacher relationships. Please check the student roll numbers.',
                    error: error.message
                });
            }
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('mentees', 'roll_no')
         .populate('cls_students', 'roll_no')
         .populate('handling_students', 'roll_no');

        // Format the response
        const userResponse = {
            ...updatedUser.toObject(),
            menteeRollNumbers: updatedUser.mentees?.map(m => m.roll_no) || [],
            classStudentRollNumbers: updatedUser.cls_students?.map(s => s.roll_no) || [],
            handlingStudentRollNumbers: updatedUser.handling_students?.map(s => s.roll_no) || []
        };

        // Return success response
        res.json({ 
            success: true,
            message: 'User updated successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user',
            error: error.message 
        });
    }
});

// Send OTP route
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email exists in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with timestamp (expires in 10 minutes)
        otpStore.set(email, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <h2>Password Reset Request</h2>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Get OD statistics for a student
app.get('/api/od-statistics', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        // Get current date and calculate date ranges
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
        
        // Get counts for different time periods
        const [last7Days, last30Days, lastYear, lifetime] = await Promise.all([
            ODApplication.countDocuments({ 
                studentId,
                submissionDate: { $gte: sevenDaysAgo }
            }),
            ODApplication.countDocuments({ 
                studentId,
                submissionDate: { $gte: thirtyDaysAgo }
            }),
            ODApplication.countDocuments({ 
                studentId,
                submissionDate: { $gte: oneYearAgo }
            }),
            ODApplication.countDocuments({ studentId })
        ]);
        
        res.json({
            last7Days,
            last30Days,
            lastYear,
            lifetime
        });
    } catch (error) {
        console.error('Error fetching OD statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get OD statistics for teachers
app.get('/api/teacher/od-statistics', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { studentId, startDate, endDate, semester } = req.query;
        
        // Find the teacher to verify role and get associated students
        const teacher = await User.findById(teacherId);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized as a teacher' });
        }

        // Get student IDs based on specific student filter or all associated students
        let studentIds = [];
        if (studentId) {
            // Verify that the student is associated with this teacher
            const isStudentMentee = teacher.mentees?.includes(studentId);
            const isClassStudent = teacher.cls_students?.includes(studentId);
            
            if (!isStudentMentee && !isClassStudent) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Not authorized to view this student\'s statistics' 
                });
            }
            studentIds = [studentId];
        } else {
            // Combine both mentees and class students
            const menteeIds = teacher.mentees || [];
            const classStudentIds = teacher.cls_students || [];
            studentIds = [...new Set([...menteeIds, ...classStudentIds])]; // Remove duplicates
        }

        // Build match query
        const matchQuery = {
            studentId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
        };

        // Add date range filter if both dates are provided
        if (startDate && endDate) {
            matchQuery.startDateTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add semester filter if provided
        if (semester && semester !== 'all') {
            matchQuery.semester = parseInt(semester);
        }

        // Get statistics
        const stats = await ODApplication.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get detailed requests with student information
        const requests = await ODApplication.find(matchQuery)
            .populate('studentId', 'name email roll_no')
            .sort({ startDateTime: -1 });

        // Format response
        const result = stats[0] || { total: 0, approved: 0, rejected: 0, pending: 0 };
        
        res.json({
            success: true,
            statistics: {
                total: result.total || 0,
                approved: result.approved || 0,
                rejected: result.rejected || 0,
                pending: result.pending || 0
            },
            requests: requests.map(req => ({
                _id: req._id,
                name: req.studentId?.name || 'Unknown',
                email: req.studentId?.email || 'No email',
                registerNumber: req.studentId?.roll_no || 'N/A',
                startDateTime: req.startDateTime,
                endDateTime: req.endDateTime,
                description: req.description,
                status: req.status,
                semester: req.semester,
                mentorApproval: req.mentorApproval,
                classAdvisorApproval: req.classAdvisorApproval,
                rejectionReason: req.mentorApproval?.remarks || req.classAdvisorApproval?.remarks || '',
                file: req.fileUrls && req.fileUrls.length > 0 ? {
                    name: path.basename(req.fileUrls[0]),
                    url: req.fileUrls[0]
                } : null
            }))
        });
    } catch (error) {
        console.error('Error fetching teacher OD statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching statistics',
            error: error.message 
        });
    }
});

// Add this new endpoint for admin statistics
app.get('/api/admin/od-statistics', isAdmin, async (req, res) => {
    try {
        const { timePeriod = '7days', teacherId = 'all', studentId = 'all' } = req.query;

        // Calculate date range based on time period
        const now = new Date();
        let startDate;
        switch(timePeriod) {
            case '7days':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case '30days':
                startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case '1year':
                startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
                break;
            default: // lifetime
                startDate = new Date(0);
        }

        // Build match query
        const matchQuery = {
            submissionDate: { $gte: startDate }
        };

        // Add student filter if specified
        if (studentId !== 'all') {
            try {
                matchQuery.studentId = new mongoose.Types.ObjectId(studentId);
            } catch (error) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid student ID format' 
                });
            }
        }

        // Get all teachers for the query
        const teachers = await User.find({ role: 'teacher' });
        const teacherIds = teachers.map(t => t._id);

        // Get statistics
        const stats = await ODApplication.aggregate([
            {
                $match: matchQuery
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $unwind: '$student'
            },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get teacher-wise statistics if no specific teacher is selected
        let teacherStats = [];
        if (teacherId === 'all') {
            teacherStats = await Promise.all(teachers.map(async (teacher) => {
                const teacherRequests = await ODApplication.aggregate([
                    {
                        $match: {
                            ...matchQuery,
                            studentId: { $in: [...teacher.mentees, ...teacher.cls_students] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalHandled: { $sum: 1 },
                            approved: {
                                $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                            },
                            rejected: {
                                $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                            },
                            pending: {
                                $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                            }
                        }
                    }
                ]);

                return {
                    teacherId: teacher._id,
                    teacherName: teacher.name,
                    teacherEmail: teacher.email,
                    stats: teacherRequests[0] || { totalHandled: 0, approved: 0, rejected: 0, pending: 0 }
                };
            }));
        } else {
            try {
                // Get statistics for specific teacher
                const teacher = await User.findById(teacherId);
                if (teacher) {
                    const teacherRequests = await ODApplication.aggregate([
                        {
                            $match: {
                                ...matchQuery,
                                studentId: { $in: [...teacher.mentees, ...teacher.cls_students] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalHandled: { $sum: 1 },
                                approved: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                                },
                                rejected: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                                },
                                pending: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                                }
                            }
                        }
                    ]);

                    teacherStats = [{
                        teacherId: teacher._id,
                        teacherName: teacher.name,
                        teacherEmail: teacher.email,
                        stats: teacherRequests[0] || { totalHandled: 0, approved: 0, rejected: 0, pending: 0 }
                    }];
                }
            } catch (error) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid teacher ID format' 
                });
            }
        }

        res.json({
            success: true,
            overall: stats[0] || { totalRequests: 0, approved: 0, rejected: 0, pending: 0 },
            teacherStats
        });
    } catch (error) {
        console.error('Error fetching admin OD statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching statistics',
            error: error.message 
        });
    }
});

// CSV Upload endpoint for student registration
app.post('/api/admin/upload-students', isAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const errors = [];
        let successCount = 0;

        // Read and parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                for (const student of results) {
                    try {
                        // Validate required fields
                        if (!student.StudentName || !student.StudentEmail || !student.Password || 
                            !student.RollNumber || !student.Mentor || !student.ClassAdvisor) {
                            errors.push({
                                row: student,
                                error: 'Missing required fields'
                            });
                            continue;
                        }

                        // Check if student already exists
                        const existingStudent = await User.findOne({ 
                            $or: [
                                { email: student.StudentEmail },
                                { roll_no: student.RollNumber }
                            ]
                        });

                        if (existingStudent) {
                            errors.push({
                                row: student,
                                error: 'Student already exists'
                            });
                            continue;
                        }

                        // Find mentor and class advisor
                        const mentor = await User.findOne({ 
                            email: student.Mentor,
                            role: 'teacher'
                        });

                        const classAdvisor = await User.findOne({ 
                            email: student.ClassAdvisor,
                            role: 'teacher'
                        });

                        if (!mentor || !classAdvisor) {
                            errors.push({
                                row: student,
                                error: 'Mentor or Class Advisor not found'
                            });
                            continue;
                        }

                        // Hash password
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(student.Password, salt);

                        // Create new student
                        const newStudent = new User({
                            name: student.StudentName,
                            email: student.StudentEmail,
                            password: hashedPassword,
                            role: 'student',
                            roll_no: student.RollNumber,
                            mentor: mentor._id,
                            cls_advisor: classAdvisor._id
                        });

                        await newStudent.save();
                        successCount++;

                        // Update mentor's mentees
                        mentor.mentees.push(newStudent._id);
                        await mentor.save();

                        // Update class advisor's students
                        classAdvisor.cls_students.push(newStudent._id);
                        await classAdvisor.save();

                    } catch (error) {
                        errors.push({
                            row: student,
                            error: error.message
                        });
                    }
                }

                // Delete the uploaded file
                fs.unlinkSync(req.file.path);

                res.json({
                    message: `Successfully processed ${successCount} students`,
                    errors: errors
                });
            });
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(500).json({ message: 'Error processing CSV file' });
    }
});

// 🔹 ADMIN: Update student semester
app.patch('/api/admin/student/:studentId/semester', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { currentSemester, previousSemesters } = req.body;

        // Validate input
        if (currentSemester === undefined) {
            return res.status(400).json({ message: 'Current semester is required' });
        }

        if (!Array.isArray(previousSemesters)) {
            return res.status(400).json({ message: 'Previous semesters must be an array' });
        }

        // Find student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update student's semesters
        student.cur_sem = currentSemester;
        student.pre_sem = previousSemesters;

        await student.save();

        res.json({
            success: true,
            message: 'Student semesters updated successfully',
            student: {
                id: student._id,
                name: student.name,
                currentSemester: student.cur_sem,
                previousSemesters: student.pre_sem
            }
        });
    } catch (error) {
        console.error('Error updating student semesters:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 ADMIN: Get student OD requests with filtering
app.get('/api/admin/student-od-requests/:studentId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { semester = 'all', status = 'all', startDate, endDate } = req.query;

        // Find the student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Build query
        const query = { studentId };

        // Add semester filter if not 'all'
        if (semester !== 'all') {
            query.semester = parseInt(semester);
        }

        // Add status filter if not 'all'
        if (status !== 'all') {
            query.status = status;
        }

        // Add date range filter if provided
        if (startDate && endDate) {
            query.submissionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get OD requests
        const requests = await ODApplication.find(query)
            .sort({ submissionDate: -1 })
            .populate('studentId', 'name roll_no');

        // Format the response
        const formattedRequests = requests.map(request => ({
            _id: request._id,
            startDateTime: request.startDateTime,
            endDateTime: request.endDateTime,
            description: request.description,
            status: request.status,
            mentorApproval: request.mentorApproval,
            classAdvisorApproval: request.classAdvisorApproval,
            semester: request.semester,
            submissionDate: request.submissionDate,
            fileUrls: request.fileUrls
        }));

        res.json({ requests: formattedRequests });
    } catch (error) {
        console.error('Error fetching student OD requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 ADMIN: Get teacher OD requests with filtering
app.get('/api/admin/teacher-od-requests/:teacherId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { semester = 'all', status = 'all', startDate, endDate } = req.query;

        // Find the teacher
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Get all student IDs the teacher is responsible for
        const studentIds = [...(teacher.mentees || []), ...(teacher.cls_students || [])];

        // Build query
        const query = { studentId: { $in: studentIds } };

        // Add semester filter if not 'all'
        if (semester !== 'all') {
            query.semester = parseInt(semester);
        }

        // Add status filter if not 'all'
        if (status !== 'all') {
            query.status = status;
        }

        // Add date range filter if provided
        if (startDate && endDate) {
            query.submissionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get OD requests
        const requests = await ODApplication.find(query)
            .sort({ submissionDate: -1 })
            .populate('studentId', 'name roll_no');

        // Format the response
        const formattedRequests = requests.map(request => ({
            _id: request._id,
            studentName: request.studentId.name,
            studentRollNo: request.studentId.roll_no,
            startDateTime: request.startDateTime,
            endDateTime: request.endDateTime,
            description: request.description,
            status: request.status,
            approvalStatus: teacher.mentees.includes(request.studentId._id) 
                ? request.mentorApproval?.status 
                : request.classAdvisorApproval?.status,
            semester: request.semester,
            submissionDate: request.submissionDate,
            fileUrls: request.fileUrls
        }));

        res.json({ requests: formattedRequests });
    } catch (error) {
        console.error('Error fetching teacher OD requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin statistics endpoint
app.get('/api/admin/statistics', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { teacherId, studentId, startDate, endDate, semester } = req.query;
        
        // Build match query
        const matchQuery = {};
        
        // Add date range filter if provided
        if (startDate && endDate) {
            matchQuery.startDateTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add semester filter if provided
        if (semester && semester !== 'all') {
            matchQuery.semester = parseInt(semester);
        }

        // Add teacher filter if provided
        if (teacherId && teacherId !== 'all') {
            try {
                matchQuery.handling_teachers = new mongoose.Types.ObjectId(teacherId);
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Invalid teacher ID format' });
            }
        }

        // Add student filter if provided
        if (studentId && studentId !== 'all') {
            try {
                matchQuery.studentId = new mongoose.Types.ObjectId(studentId);
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Invalid student ID format' });
            }
        }

        console.log('Match Query:', matchQuery);

        // Fetch OD applications with populated fields
        const applications = await ODApplication.find(matchQuery)
            .populate('studentId', 'name email registerNumber class')
            .populate('handling_teachers', 'name email')
            .sort({ submissionDate: -1 });

        console.log('Found applications:', applications);

        // Calculate statistics
        const statistics = {
            total: applications.length,
            approved: applications.filter(app => app.status === 'Approved').length,
            rejected: applications.filter(app => app.status === 'Rejected').length,
            pending: applications.filter(app => app.status === 'Pending').length
        };

        res.json({
            success: true,
            statistics,
            requests: applications.map(app => ({
                _id: app._id,
                name: app.studentId.name,
                email: app.studentId.email,
                registerNumber: app.studentId.registerNumber,
                class: app.studentId.class,
                startDateTime: app.startDateTime,
                endDateTime: app.endDateTime,
                startSession: app.startSession,
                endSession: app.endSession,
                semester: app.semester,
                description: app.description,
                reason: app.description,
                status: app.status,
                mentorApproval: app.mentorApproval,
                classAdvisorApproval: app.classAdvisorApproval,
                handlingTeachers: app.handling_teachers,
                submissionDate: app.submissionDate,
                fileUrls: app.fileUrls
            }))
        });
    } catch (error) {
        console.error('Error fetching admin statistics:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// Get students for a teacher (both mentees and class students)
app.get('/api/teacher/students', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        // Find the teacher and populate both mentees and class students
        const teacher = await User.findById(teacherId)
            .populate('mentees', 'name email roll_no')
            .populate('cls_students', 'name email roll_no');
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized as a teacher' 
            });
        }

        // Combine and deduplicate students
        const mentees = teacher.mentees || [];
        const classStudents = teacher.cls_students || [];
        
        // Create a map to deduplicate students by ID
        const studentMap = new Map();
        
        // Add mentees with their role
        mentees.forEach(student => {
            studentMap.set(student._id.toString(), {
                ...student.toObject(),
                role: ['Mentee']
            });
        });
        
        // Add or update class students with their role
        classStudents.forEach(student => {
            const studentId = student._id.toString();
            if (studentMap.has(studentId)) {
                // If student already exists as mentee, add class student role
                const existingStudent = studentMap.get(studentId);
                existingStudent.role.push('Class Student');
            } else {
                // If new student, add as class student
                studentMap.set(studentId, {
                    ...student.toObject(),
                    role: ['Class Student']
                });
            }
        });
        
        // Convert map values to array
        const students = Array.from(studentMap.values());
        
        res.json({
            success: true,
            students: students.map(student => ({
                _id: student._id,
                name: student.name,
                email: student.email,
                roll_no: student.roll_no,
                roles: student.role
            }))
        });
        
    } catch (error) {
        console.error('Error fetching teacher\'s students:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching students',
            error: error.message 
        });
    }
});