const mongoose = require('mongoose');

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

module.exports = {
    User,
    ODApplication
}; 