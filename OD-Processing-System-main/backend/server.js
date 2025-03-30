const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

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

    // Reset password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date
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
    checkUsers();
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
        console.log(student.roll_no);
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
        const { resetToken, newPassword } = req.body;

        // Verify the JWT token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update user with new password and clear reset token fields
        const salt = await bcrypt.genSalt(10);
        //const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: decoded.userId },
            {
                password: newPassword,
                $unset: {
                    resetPasswordToken: 1,
                    resetPasswordExpires: 1
                }
            },
            { new: true, runValidators: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Add these imports at the top of your file
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
    // Accept images (jpg, jpeg, png, gif), PDFs, and common document formats
    if (
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/gif' || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload an image, PDF, or document file.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// OD Application Schema
const odApplicationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    //student email
    //email: { type: String, required: true , ref : 'User.email'  },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    startSession: { type: String, enum: ['forenoon', 'afternoon'], required: true },
    endSession: { type: String, enum: ['forenoon', 'afternoon'], required: true },
    description: { type: String, required: true },
    fileUrls: [{ type: String }],
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    mentorApproval: { 
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        remarks: { type: String }
    },
    classAdvisorApproval: {
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        remarks: { type: String }
    },
    submissionDate: { type: Date, default: Date.now }
});

const ODApplication = mongoose.model('requests', odApplicationSchema);

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
        
        // Extract date and session from the objects
        const startDate = startDateTime && startDateTime.date ? new Date(startDateTime.date) : startDateTime;
        const endDate = endDateTime && endDateTime.date ? new Date(endDateTime.date) : endDateTime;
        const startSession = startDateTime && startDateTime.session ? startDateTime.session : 'forenoon';
        const endSession = endDateTime && endDateTime.session ? endDateTime.session : 'forenoon';
        
        // Ensure fileUrls is an array
        const processedFileUrls = Array.isArray(fileUrls) ? fileUrls : [];
        
        console.log('Creating OD application with files:', processedFileUrls);
        
        // Create new OD application
        console.log(studentId       );  
        console.log(startDate       );
        console.log(endDate         );
        console.log(startSession    );
        const newApplication = new ODApplication({
            studentId,
            startDateTime: startDate,
            endDateTime: endDate,
            uemail,

            startSession,
            endSession,
            description,
            fileUrls: processedFileUrls
        });
        
        const savedApplication = await newApplication.save();
        console.log('Saved application:', savedApplication);
        
        res.status(201).json({ 
            success: true, 
            message: 'OD application submitted successfully',
            application: savedApplication
        });
    } catch (error) {
        console.error('OD application submission error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 GET STUDENT'S OD APPLICATIONS
app.get('/api/od-applications', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        // Get all applications for this student
        const applications = await ODApplication.find({ studentId })
            .sort({ submissionDate: -1 }); // Most recent first
        
        res.json({ applications });
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
        
        console.log('Found applications:', odApplications);
        
        // Get student details for each application
        const requests = [];
        for (const app of odApplications) {
            const student = await User.findById(app.studentId);
            if (student) {
                requests.push({
                    _id: app._id,
                    name: student.name || 'Unknown',
                    email: student.email || 'No email',
                    registerNumber: student.registerNumber || 'N/A',
                    startDate: app.startDateTime,
                    endDate: app.endDateTime,
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
                requests.push({
                    _id: app._id,
                    name: student.name || 'Unknown',
                    email: student.email || 'No email',
                    registerNumber: student.registerNumber || 'N/A',
                    startDate: app.startDateTime,
                    endDate: app.endDateTime,
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
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all users (admin only)
app.get('/api/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (admin only)
app.post('/api/users', isAdmin, async (req, res) => {
    try {
        const { name, email, password, role, mentor, cls_advisor, roll_no, mentees, cls_students } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate required fields for students
        if (role === 'student') {
            if (!mentor || !cls_advisor) {
                return res.status(400).json({ message: 'Both mentor and class advisor are required for students' });
            }
            if (!roll_no) {
                return res.status(400).json({ message: 'Roll number is required for students' });
            }
        }

        // Create new user with plain text password (as per your current setup)
        const user = new User({
            name,
            email,
            password,
            role,
            roll_no: role === 'student' ? roll_no : undefined
        });

        // If creating a teacher, handle mentees and class students relationships
        if (role === 'teacher') {
            // Handle mentees if provided
            if (mentees && Array.isArray(mentees)) {
                for (const rollNo of mentees) {
                    const mentee = await User.findOne({ roll_no: rollNo });
                    if (!mentee) {
                        return res.status(400).json({ message: `Student with roll number ${rollNo} not found` });
                    }
                    user.mentees.push(mentee._id);
                }
            }

            // Handle class students if provided
            if (cls_students && Array.isArray(cls_students)) {
                for (const rollNo of cls_students) {
                    const student = await User.findOne({ roll_no: rollNo });
                    if (!student) {
                        return res.status(400).json({ message: `Student with roll number ${rollNo} not found` });
                    }
                    user.cls_students.push(student._id);
                }
            }
        }

        // If creating a student, handle mentor and class advisor relationships
        if (role === 'student') {
            const mentorUser = await User.findById(mentor);
            if (!mentorUser || mentorUser.role !== 'teacher') {
                return res.status(400).json({ message: 'Invalid mentor selected' });
            }
            user.mentor = mentor;
            // Add student to mentor's mentees array
            mentorUser.mentees.push(user._id);
            await mentorUser.save();

            const advisorUser = await User.findById(cls_advisor);
            if (!advisorUser || advisorUser.role !== 'teacher') {
                return res.status(400).json({ message: 'Invalid class advisor selected' });
            }
            user.cls_advisor = cls_advisor;
            // Add student to advisor's class_students array
            advisorUser.cls_students.push(user._id);
            await advisorUser.save();
        }

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ 
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', isAdmin, async (req, res) => {
    try {
        console.log("yes");
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = decoded.userId;

        // Check if trying to delete own account
        if (adminId === req.params.id) {
            return res.status(403).json({ message: 'Admins cannot delete their own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Handle cascading delete based on user role
        if (user.role === 'student') {
            console.log(user,user.mentor,user.cls_advisor);
            // Remove student from mentor's mentees list if mentor exists
            if (user.mentor) {
                await User.findByIdAndUpdate(
                    user.mentor,
                    { $pull: { mentees: user._id } }
                );
            }

            // Remove student from class advisor's cls_students list if advisor exists
            if (user.cls_advisor) {
                await User.findByIdAndUpdate(
                    user.cls_advisor,
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
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log("yes");
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (admin only)
app.put('/api/users/:id', isAdmin, async (req, res) => {
    try {
        const { name, email, role, mentor, cls_advisor, roll_no, mentees, cls_students } = req.body;
        const userId = req.params.id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields for students
        if (role === 'student') {
            if (!mentor || !cls_advisor) {
                return res.status(400).json({ message: 'Both mentor and class advisor are required for students' });
            }
            if (!roll_no) {
                return res.status(400).json({ message: 'Roll number is required for students' });
            }
        }

        // Update basic information
        user.name = name;
        user.email = email;
        user.role = role;
        if (role === 'student') {
            user.roll_no = roll_no;
        }
        // Handle mentor relationship
        if (user.role === 'student') {
            
            // Remove old mentor relationship if exists
            if (user.mentor) {
                const oldMentor = await User.findById(user.mentor);
                if (oldMentor) {
                    oldMentor.mentees = (oldMentor.mentees || []).filter(id => id.toString() !== userId);
                    await oldMentor.save();
                }
            }

            // Add new mentor relationship if specified
            if (mentor) {
                const mentorUser = await User.findById(mentor);
                if (!mentorUser || mentorUser.role !== 'teacher') {
                    return res.status(400).json({ message: 'Invalid mentor selected' });
                }
                user.mentor = mentor;
                mentorUser.mentees.push(userId);
                await mentorUser.save();
            }

            // Remove old class advisor relationship if exists
            if (user.cls_advisor) {
                const oldAdvisor = await User.findById(user.cls_advisor);
                if (oldAdvisor) {
                    oldAdvisor.cls_students = (oldAdvisor.cls_students || []).filter(id => id.toString() !== userId);
                    await oldAdvisor.save();
                }
            }

            // Add new class advisor relationship if specified
            if (cls_advisor) {
                const advisorUser = await User.findById(cls_advisor);
                if (!advisorUser || advisorUser.role !== 'teacher') {
                    return res.status(400).json({ message: 'Invalid class advisor selected' });
                }
                user.cls_advisor = cls_advisor;
                advisorUser.cls_students.push(userId);
                await advisorUser.save();
            }
        }

        await user.save();

        // Return updated user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ 
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.log("yes");
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
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
            from: process.env.EMAIL_USER,
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

// Reset password route
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP again
        const otpData = otpStore.get(email);
        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Update password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Clear OTP
        otpStore.delete(email);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});
