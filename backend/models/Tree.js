const TreeNode = require('./TreeNode');
const mongoose = require('mongoose');

class Tree {
    constructor() {
        this.root = new TreeNode('root');
        this.studentsNode = new TreeNode('students');
        this.teachersNode = new TreeNode('teachers');
        this.root.addChild('students', this.studentsNode);
        this.root.addChild('teachers', this.teachersNode);
    }

    // Initialize tree from MongoDB data
    async initializeFromMongoDB(User, ODApplication) {
        try {
            // Get all students and teachers
            const students = await User.find({ role: 'student' });
            const teachers = await User.find({ role: 'teacher' });

            // Initialize students branch
            for (const student of students) {
                const studentNode = new TreeNode('student', student);
                this.studentsNode.addChild(student._id.toString(), studentNode);

                // Create semester nodes for each student
                const semesters = [...(student.pre_sem || []), student.cur_sem].filter(Boolean);
                for (const sem of semesters) {
                    const semesterNode = new TreeNode('semester', { semester: sem });
                    semesterNode.initCircularQueue();
                    studentNode.addChild(`semester_${sem}`, semesterNode);

                    // Populate OD requests for this semester
                    const odRequests = await ODApplication.find({
                        studentId: student._id,
                        semester: sem
                    }).sort({ startDateTime: -1 }).limit(8);

                    for (const request of odRequests) {
                        semesterNode.enqueueODRequest(request);
                    }
                }
            }

            // Initialize teachers branch
            for (const teacher of teachers) {
                const teacherNode = new TreeNode('teacher', teacher);
                this.teachersNode.addChild(teacher._id.toString(), teacherNode);

                // Create mentees node
                const menteesNode = new TreeNode('mentees');
                teacherNode.addChild('mentees', menteesNode);

                // Create class students node
                const clsStudentsNode = new TreeNode('cls_students');
                teacherNode.addChild('cls_students', clsStudentsNode);

                // Populate mentees
                const mentees = await User.find({ mentor: teacher._id, role: 'student' });
                for (const mentee of mentees) {
                    const menteeNode = new TreeNode('student', mentee);
                    menteesNode.addChild(mentee._id.toString(), menteeNode);

                    // Create semester nodes for each mentee
                    const semesters = [...(mentee.pre_sem || []), mentee.cur_sem].filter(Boolean);
                    for (const sem of semesters) {
                        const semesterNode = new TreeNode('semester', { semester: sem });
                        semesterNode.initCircularQueue();
                        menteeNode.addChild(`semester_${sem}`, semesterNode);

                        // Populate OD requests for this semester
                        const odRequests = await ODApplication.find({
                            studentId: mentee._id,
                            semester: sem
                        }).sort({ startDateTime: -1 }).limit(8);

                        for (const request of odRequests) {
                            semesterNode.enqueueODRequest(request);
                        }
                    }
                }

                // Populate class students
                const classStudents = await User.find({ cls_advisor: teacher._id, role: 'student' });
                for (const student of classStudents) {
                    const studentNode = new TreeNode('student', student);
                    clsStudentsNode.addChild(student._id.toString(), studentNode);

                    // Create semester nodes for each class student
                    const semesters = [...(student.pre_sem || []), student.cur_sem].filter(Boolean);
                    for (const sem of semesters) {
                        const semesterNode = new TreeNode('semester', { semester: sem });
                        semesterNode.initCircularQueue();
                        studentNode.addChild(`semester_${sem}`, semesterNode);

                        // Populate OD requests for this semester
                        const odRequests = await ODApplication.find({
                            studentId: student._id,
                            semester: sem
                        }).sort({ startDateTime: -1 }).limit(8);

                        for (const request of odRequests) {
                            semesterNode.enqueueODRequest(request);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing tree from MongoDB:', error);
            throw error;
        }
    }

    // Add new OD request and sync with MongoDB
    async addODRequest(odRequest, ODApplication) {
        try {
            // Save to MongoDB first
            const savedRequest = await new ODApplication(odRequest).save();

            // Update tree structure
            const studentId = odRequest.studentId.toString();
            const semester = odRequest.semester;

            // Update in students branch
            const studentNode = this.studentsNode.getChild(studentId);
            if (studentNode) {
                const semesterNode = studentNode.getChild(`semester_${semester}`);
                if (semesterNode) {
                    semesterNode.enqueueODRequest(savedRequest);
                }
            }

            // Update in teachers branch (both mentees and class students)
            for (const teacherNode of this.teachersNode.getAllChildren()) {
                // Check mentees
                const menteesNode = teacherNode.getChild('mentees');
                const menteeNode = menteesNode?.getChild(studentId);
                if (menteeNode) {
                    const semesterNode = menteeNode.getChild(`semester_${semester}`);
                    if (semesterNode) {
                        semesterNode.enqueueODRequest(savedRequest);
                    }
                }

                // Check class students
                const clsStudentsNode = teacherNode.getChild('cls_students');
                const clsStudentNode = clsStudentsNode?.getChild(studentId);
                if (clsStudentNode) {
                    const semesterNode = clsStudentNode.getChild(`semester_${semester}`);
                    if (semesterNode) {
                        semesterNode.enqueueODRequest(savedRequest);
                    }
                }
            }

            return savedRequest;
        } catch (error) {
            console.error('Error adding OD request:', error);
            throw error;
        }
    }

    // Get OD requests for a student in a specific semester
    getStudentODRequests(studentId, semester) {
        const studentNode = this.studentsNode.getChild(studentId);
        if (!studentNode) return [];

        const semesterNode = studentNode.getChild(`semester_${semester}`);
        return semesterNode ? semesterNode.getODRequests() : [];
    }

    // Get all OD requests for a mentor's mentees
    getMenteeODRequests(teacherId) {
        const teacherNode = this.teachersNode.getChild(teacherId);
        if (!teacherNode) return [];

        const menteesNode = teacherNode.getChild('mentees');
        if (!menteesNode) return [];

        const requests = [];
        for (const menteeNode of menteesNode.getAllChildren()) {
            for (const semesterNode of menteeNode.getAllChildren()) {
                if (semesterNode.type === 'semester') {
                    requests.push({
                        student: menteeNode.data,
                        semester: semesterNode.data.semester,
                        requests: semesterNode.getODRequests()
                    });
                }
            }
        }
        return requests;
    }

    // Get all OD requests for a class advisor's students
    getClassStudentODRequests(teacherId) {
        const teacherNode = this.teachersNode.getChild(teacherId);
        if (!teacherNode) return [];

        const clsStudentsNode = teacherNode.getChild('cls_students');
        if (!clsStudentsNode) return [];

        const requests = [];
        for (const studentNode of clsStudentsNode.getAllChildren()) {
            for (const semesterNode of studentNode.getAllChildren()) {
                if (semesterNode.type === 'semester') {
                    requests.push({
                        student: studentNode.data,
                        semester: semesterNode.data.semester,
                        requests: semesterNode.getODRequests()
                    });
                }
            }
        }
        return requests;
    }
}

module.exports = Tree;