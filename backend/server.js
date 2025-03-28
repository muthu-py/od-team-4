const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

    // Relationships
    class_students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

// const User = mongoose.model('users', UserSchema);

// MongoDB Connection
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
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// 🔹 FORGOT PASSWORD - Generate Reset Token
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Here you would typically send an email with the reset token
        // For now, we'll just return the token
        res.json({ message: 'Password reset token sent', token: resetToken });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 RESET PASSWORD - Validate Token & Set New Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🔹 ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
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
