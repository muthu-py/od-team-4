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
