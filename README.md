# 📚 OD Processing System

The **On-Duty (OD) Processing System** is a workflow automation platform designed to streamline OD request submissions by students and manage multi-level approvals by faculty and mentors. This modern web-based solution replaces traditional paper-based and email-driven methods, offering a seamless, secure, and auditable process for managing OD requests in academic institutions.

---

## 🚀 Features

### 🧑‍🎓 Student Portal
- Submit OD requests via an intuitive UI  
- Track request status in real time  
- Receive email/notification updates  

### 👨‍🏫 Mentor & Faculty Dashboard
- View pending requests  
- Approve or reject with remarks  
- Filter requests by student, date, or department  

### 🛠️ Admin Control Panel
- Manage users and roles  
- Monitor system logs and request trends  
- Generate reports for audits and policy tracking  

### 🔄 Efficient Request Handling
- Utilizes a circular queue data structure  
- Ensures O(1) time complexity for enqueue/dequeue  
- Prevents memory wastage from unnecessary reallocations  

### 🔐 Secure Authentication
- Bcrypt password hashing  
- JWT-based session management  
- Role-based access control for Students, Faculty, and Admins  

---

## 🛠️ Tech Stack

- **Frontend**: React.js  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB, Mongoose  
- **Authentication**: Bcrypt (Password Hashing), JWT (Session Management)

---

## 🔁 Workflow Overview

1. **Student Submission**  
   - Student fills out an OD form via the React frontend.  
   - Form data is POSTed to the Express backend and saved to MongoDB.  
   - The request is added to a circular queue to maintain FIFO order.

2. **Request Processing**  
   - A background worker dequeues the next request.  
   - It’s sent to the mentor first for approval.  
   - If approved, it’s forwarded to the relevant faculty for final approval.

3. **Notifications and Logs**  
   - Each status change triggers a notification.  
   - Actions are logged in a MongoDB audit trail for transparency.

---

## 👥 User Roles

- **Students**  
  - Submit OD requests  
  - Track status updates  

- **Mentors & Faculty**  
  - Review and approve/reject OD requests  
  - View role-based dashboards  

- **Administrators**  
  - Manage users and approvals  
  - Access audit logs and request analytics  

---

## ✅ Future Improvements

- Email or SMS notification integration  
- Export reports as CSV or PDF  
- Bulk request approval for faculty  
- Calendar integration for approved OD days  
- Mobile-responsive enhancements  

---

## 🛡️ Security

- All passwords are hashed before storage.  
- JWT tokens are used for role-based access and session validation.  
- Requests and actions are logged for audit and traceability.

---
