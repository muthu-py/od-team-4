const mongoose = require('mongoose');
const { User, ODApplication } = require('./models');

class CircularQueue {
    constructor(size = 8) {
        this.size = size;
        this.queue = new Array(size);
        this.front = -1;
        this.rear = -1;
    }

    enqueue(item) {
        if ((this.rear + 1) % this.size === this.front) {
            // Queue is full, remove oldest item
            this.dequeue();
        }
        if (this.front === -1) {
            this.front = 0;
        }
        this.rear = (this.rear + 1) % this.size;
        this.queue[this.rear] = item;
    }

    dequeue() {
        if (this.front === -1) {
            return null;
        }
        const item = this.queue[this.front];
        if (this.front === this.rear) {
            this.front = -1;
            this.rear = -1;
        } else {
            this.front = (this.front + 1) % this.size;
        }
        return item;
    }

    toArray() {
        if (this.front === -1) return [];
        let result = [];
        let i = this.front;
        do {
            result.push(this.queue[i]);
            i = (i + 1) % this.size;
        } while (i !== (this.rear + 1) % this.size);
        return result;
    }
}

class SemesterNode {
    constructor(semesterNumber) {
        this.semesterNumber = semesterNumber;
        this.odRequests = new CircularQueue();
    }
}

class StudentNode {
    constructor(studentData) {
        this.studentId = studentData._id;
        this.name = studentData.name;
        this.email = studentData.email;
        this.roll_no = studentData.roll_no;
        this.semesters = new Map();
        this.cur_sem = studentData.cur_sem;
        this.pre_sem = studentData.pre_sem || [];
        
        // Initialize semesters
        const allSemesters = [...this.pre_sem, this.cur_sem];
        allSemesters.forEach(sem => {
            this.semesters.set(sem, new SemesterNode(sem));
        });
    }

    async loadODRequests() {
        const odRequests = await ODApplication.find({ studentId: this.studentId });
        for (const request of odRequests) {
            const semester = request.semester;
            if (this.semesters.has(semester)) {
                this.semesters.get(semester).odRequests.enqueue(request);
            }
        }
    }
}

class TeacherNode {
    constructor(teacherData) {
        this.teacherId = teacherData._id;
        this.name = teacherData.name;
        this.email = teacherData.email;
        this.mentees = new Map();
        this.cls_students = new Map();
    }

    async loadMentees() {
        const mentees = await User.find({ mentor: this.teacherId });
        for (const mentee of mentees) {
            const studentNode = new StudentNode(mentee);
            await studentNode.loadODRequests();
            this.mentees.set(mentee._id.toString(), studentNode);
        }
    }

    async loadClassStudents() {
        const classStudents = await User.find({ cls_advisor: this.teacherId });
        for (const student of classStudents) {
            const studentNode = new StudentNode(student);
            await studentNode.loadODRequests();
            this.cls_students.set(student._id.toString(), studentNode);
        }
    }
}

class ODTree {
    constructor() {
        this.students = new Map();
        this.teachers = new Map();
        this.admin = null;
    }

    async initialize() {
        // Load all students
        const students = await User.find({ role: 'student' });
        for (const student of students) {
            const studentNode = new StudentNode(student);
            await studentNode.loadODRequests();
            this.students.set(student._id.toString(), studentNode);
        }

        // Load all teachers
        const teachers = await User.find({ role: 'teacher' });
        for (const teacher of teachers) {
            const teacherNode = new TeacherNode(teacher);
            await teacherNode.loadMentees();
            await teacherNode.loadClassStudents();
            this.teachers.set(teacher._id.toString(), teacherNode);
        }

        // Load admin
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            this.admin = {
                adminId: admin._id,
                name: admin.name,
                email: admin.email
            };
        }
    }

    async addODRequest(studentId, odRequest) {
        const studentNode = this.students.get(studentId.toString());
        if (!studentNode) return null;

        const semester = odRequest.semester;
        if (!studentNode.semesters.has(semester)) {
            studentNode.semesters.set(semester, new SemesterNode(semester));
        }

        const semesterNode = studentNode.semesters.get(semester);
        semesterNode.odRequests.enqueue(odRequest);

        // Update MongoDB
        const newODRequest = new ODApplication(odRequest);
        await newODRequest.save();

        return newODRequest;
    }

    async updateODRequest(requestId, updates) {
        // Update MongoDB first
        const updatedRequest = await ODApplication.findByIdAndUpdate(
            requestId,
            updates,
            { new: true }
        );

        if (!updatedRequest) return null;

        // Update tree structure
        const studentId = updatedRequest.studentId.toString();
        const studentNode = this.students.get(studentId);
        if (!studentNode) return null;

        const semester = updatedRequest.semester;
        const semesterNode = studentNode.semesters.get(semester);
        if (!semesterNode) return null;

        // Find and update the request in the circular queue
        const requests = semesterNode.odRequests.toArray();
        const index = requests.findIndex(req => req._id.toString() === requestId);
        if (index !== -1) {
            requests[index] = updatedRequest;
            // Rebuild the queue
            semesterNode.odRequests = new CircularQueue();
            requests.forEach(req => semesterNode.odRequests.enqueue(req));
        }

        return updatedRequest;
    }

    getStudentODRequests(studentId, semester) {
        const studentNode = this.students.get(studentId.toString());
        if (!studentNode) return [];

        if (semester) {
            const semesterNode = studentNode.semesters.get(semester);
            return semesterNode ? semesterNode.odRequests.toArray() : [];
        }

        // Return all semester requests
        const allRequests = [];
        for (const [_, semesterNode] of studentNode.semesters) {
            allRequests.push(...semesterNode.odRequests.toArray());
        }
        return allRequests;
    }

    getTeacherMenteeRequests(teacherId) {
        const teacherNode = this.teachers.get(teacherId.toString());
        if (!teacherNode) return [];

        const allRequests = [];
        for (const [_, studentNode] of teacherNode.mentees) {
            for (const [_, semesterNode] of studentNode.semesters) {
                allRequests.push(...semesterNode.odRequests.toArray());
            }
        }
        return allRequests;
    }

    getTeacherClassStudentRequests(teacherId) {
        const teacherNode = this.teachers.get(teacherId.toString());
        if (!teacherNode) return [];

        const allRequests = [];
        for (const [_, studentNode] of teacherNode.cls_students) {
            for (const [_, semesterNode] of studentNode.semesters) {
                allRequests.push(...semesterNode.odRequests.toArray());
            }
        }
        return allRequests;
    }
}

module.exports = new ODTree(); 