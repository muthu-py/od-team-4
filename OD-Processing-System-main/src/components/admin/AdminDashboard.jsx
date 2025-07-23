import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert,
    IconButton,
    Grid,
    Card,
    CardContent,
    Chip,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import StudentCSVUpload from '../StudentCSVUpload';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const StatsCard = ({ title, value, color = 'primary' }) => (
    <Card sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.05) 0%, rgba(26, 35, 126, 0.1) 100%)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(26, 35, 126, 0.1)',
        }
    }}>
        <CardContent>
            <Typography variant="h6" color="textSecondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h3" color={`${color}.main`}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        mentor: '',
        cls_advisor: '',
        roll_no: '',
        mentees: '',
        cls_students: '',
        handling_students: '',
        cur_sem: '',
        pre_sem: []
    });
    const [editingUser, setEditingUser] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [statistics, setStatistics] = useState({
        overall: { totalRequests: 0, approved: 0, rejected: 0, pending: 0 },
        teacherStats: []
    });
    const [timePeriod, setTimePeriod] = useState('7days');
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [studentODRequests, setStudentODRequests] = useState([]);
    const [teacherODRequests, setTeacherODRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [studentStartDate, setStudentStartDate] = useState(null);
    const [studentEndDate, setStudentEndDate] = useState(null);
    const [teacherStatistics, setTeacherStatistics] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
    });
    const [studentStatistics, setStudentStatistics] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
    });

    useEffect(() => {
        fetchUsers();
        fetchStatistics();
        if (selectedStudent !== 'all') {
            fetchStudentODRequests();
        }
        if (selectedTeacher !== 'all') {
            fetchTeacherODRequests();
        }
    }, [timePeriod, selectedStudent, selectedTeacher, selectedSemester, selectedStatus]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users);
            setTeachers(response.data.users.filter(user => user.role === 'teacher'));
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/admin/od-statistics?timePeriod=${timePeriod}&teacherId=${selectedTeacher}&studentId=${selectedStudent}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStatistics(response.data);
        } catch (error) {
            setError('Failed to fetch statistics');
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchTeacherODRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!selectedTeacher || !startDate || !endDate) {
                setTeacherODRequests([]);
                setTeacherStatistics({
                    total: 0,
                    approved: 0,
                    rejected: 0,
                    pending: 0
                });
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/admin/statistics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    teacherId: selectedTeacher === 'all' ? undefined : selectedTeacher,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            if (response.data.success) {
                setTeacherODRequests(response.data.requests || []);
                setTeacherStatistics(response.data.statistics);
            } else {
                throw new Error(response.data.message || 'Failed to fetch teacher OD requests');
            }
        } catch (error) {
            console.error('Error fetching teacher OD requests:', error);
            setError(error.response?.data?.message || 'Failed to fetch teacher OD requests');
            setTeacherODRequests([]);
            setTeacherStatistics({
                total: 0,
                approved: 0,
                rejected: 0,
                pending: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentODRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!selectedStudent) {
                setStudentODRequests([]);
                setStudentStatistics({
                    total: 0,
                    approved: 0,
                    rejected: 0,
                    pending: 0
                });
                setLoading(false);
                return;
            }

            // Build query parameters
            const params = {
                studentId: selectedStudent === 'all' ? undefined : selectedStudent
            };

            // Add semester if selected
            if (selectedSemester && selectedSemester !== 'all') {
                params.semester = selectedSemester;
            }

            // Add date range if provided
            if (studentStartDate && studentEndDate) {
                params.startDate = studentStartDate.toISOString();
                params.endDate = studentEndDate.toISOString();
            }

            const response = await axios.get(`http://localhost:5000/api/admin/statistics`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setStudentODRequests(response.data.requests || []);
                setStudentStatistics(response.data.statistics);
            } else {
                throw new Error(response.data.message || 'Failed to fetch student OD requests');
            }
        } catch (error) {
            console.error('Error fetching student OD requests:', error);
            setError(error.response?.data?.message || 'Failed to fetch student OD requests');
            setStudentODRequests([]);
            setStudentStatistics({
                total: 0,
                approved: 0,
                rejected: 0,
                pending: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // Add useEffect to trigger fetch when filters change
    useEffect(() => {
        if (selectedStudent) {
            fetchStudentODRequests();
        }
    }, [selectedStudent, selectedSemester, studentStartDate, studentEndDate]);

    // Add clear dates handler
    const handleClearDates = () => {
        setStudentStartDate(null);
        setStudentEndDate(null);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setError('');
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'student',
            mentor: '',
            cls_advisor: '',
            roll_no: '',
            mentees: '',
            cls_students: '',
            handling_students: '',
            cur_sem: '',
            pre_sem: []
        });
    };

    const handleEditOpen = (user) => {
        // Format the user data for editing
        const editUser = {
            ...user,
            mentees: user.menteeRollNumbers?.join('\n') || '',
            cls_students: user.classStudentRollNumbers?.join('\n') || '',
            handling_students: user.handlingStudentRollNumbers?.join('\n') || ''
        };
        setEditingUser(editUser);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e) => {
        if (editingUser) {
            setEditingUser({
                ...editingUser,
                [e.target.name]: e.target.value
            });
        } else {
            setNewUser({
                ...newUser,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleArrayChange = (e, arrayName) => {
        const value = e.target.value;
        if (editingUser) {
            setEditingUser({
                ...editingUser,
                [arrayName]: value
            });
        } else {
            setNewUser({
                ...newUser,
                [arrayName]: value
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    };

    const processArrayBeforeSubmit = (value) => {
        return value.split(/[\n,]/).map(item => item.trim()).filter(item => item);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const processedUser = { ...newUser };
            
            // Process arrays before submission
            if (processedUser.role === 'teacher') {
                processedUser.mentees = processedUser.mentees ? processArrayBeforeSubmit(processedUser.mentees) : [];
                processedUser.cls_students = processedUser.cls_students ? processArrayBeforeSubmit(processedUser.cls_students) : [];
                processedUser.handling_students = processedUser.handling_students ? processArrayBeforeSubmit(processedUser.handling_students) : [];
            }

            // Process semester data for students
            if (processedUser.role === 'student') {
                processedUser.cur_sem = parseInt(processedUser.cur_sem) || 1;
                processedUser.pre_sem = processedUser.pre_sem ? processArrayBeforeSubmit(processedUser.pre_sem).map(Number) : [];
            }

            // Remove empty fields for student role
            if (processedUser.role === 'student') {
                delete processedUser.mentees;
                delete processedUser.cls_students;
                delete processedUser.handling_students;
            }

            const response = await axios.post('http://localhost:5000/api/users', processedUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setSuccess('User created successfully');
                handleClose();
                fetchUsers();
            } else {
                setError(response.data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error.response?.data?.message || 'Failed to create user. Please check the input values.');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const processedUser = { ...editingUser };
            
            // Process arrays for teacher role
            if (processedUser.role === 'teacher') {
                processedUser.menteeRollNumbers = processArrayBeforeSubmit(processedUser.mentees);
                processedUser.classStudentRollNumbers = processArrayBeforeSubmit(processedUser.cls_students);
                processedUser.handlingStudentRollNumbers = processArrayBeforeSubmit(processedUser.handling_students);
                
                // Remove the original array fields
                delete processedUser.mentees;
                delete processedUser.cls_students;
                delete processedUser.handling_students;
            }

            // Process semester data for students
            if (processedUser.role === 'student') {
                processedUser.cur_sem = parseInt(processedUser.cur_sem) || 1;
                processedUser.pre_sem = processedUser.pre_sem ? processArrayBeforeSubmit(processedUser.pre_sem).map(Number) : [];
            }

            const response = await axios.put(
                `http://localhost:5000/api/users/${editingUser._id}`,
                processedUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('User updated successfully');
                handleEditClose();
                fetchUsers();
            } else {
                setError(response.data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.response?.data?.message || 'Failed to update user. Please check the input values.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (error) {
                if (error.response?.status === 403) {
                    setError('You cannot delete your own admin account');
                } else {
                    setError(error.response?.data?.message || 'Failed to delete user');
                }
            }
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (selectedTeacher !== 'all') {
            fetchTeacherODRequests();
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (selectedTeacher !== 'all') {
            fetchTeacherODRequests();
        }
    };

    const handleStudentStartDateChange = (date) => {
        setStudentStartDate(date);
        if (selectedStudent !== 'all') {
            fetchStudentODRequests();
        }
    };

    const handleStudentEndDateChange = (date) => {
        setStudentEndDate(date);
        if (selectedStudent !== 'all') {
            fetchStudentODRequests();
        }
    };

    // Add table display for Student OD Requests
    const renderStudentODTable = () => {
        if (loading) {
            return <CircularProgress />;
        }

        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }

        if (!studentODRequests || studentODRequests.length === 0) {
            return <Typography>No OD requests found for the selected criteria.</Typography>;
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Session</TableCell>
                            <TableCell>Semester</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Mentor Approval</TableCell>
                            <TableCell>Class Advisor Approval</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {studentODRequests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>
                                    {new Date(request.startDateTime || request.startDate).toLocaleDateString()} - 
                                    {new Date(request.endDateTime || request.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {request.startSession} - {request.endSession}
                                </TableCell>
                                <TableCell>
                                    Semester {request.semester}
                                </TableCell>
                                <TableCell>{request.description || request.reason}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.status} 
                                        color={
                                            request.status === 'Approved' ? 'success' :
                                            request.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.mentorApproval?.status || 'Pending'} 
                                        color={
                                            request.mentorApproval?.status === 'Approved' ? 'success' :
                                            request.mentorApproval?.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.classAdvisorApproval?.status || 'Pending'} 
                                        color={
                                            request.classAdvisorApproval?.status === 'Approved' ? 'success' :
                                            request.classAdvisorApproval?.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    // Add table display for Teacher OD Requests
    const renderTeacherODTable = () => {
        if (loading) {
            return <CircularProgress />;
        }

        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }

        if (!teacherODRequests || teacherODRequests.length === 0) {
            return <Typography>No OD requests found for the selected criteria.</Typography>;
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Approval Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teacherODRequests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>{request.name}</TableCell>
                                <TableCell>
                                    {new Date(request.startDate).toLocaleDateString()} - 
                                    {new Date(request.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{request.reason}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.status} 
                                        color={
                                            request.status === 'Approved' ? 'success' :
                                            request.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {request.mentorApproval && (
                                        <Chip 
                                            label={`Mentor: ${request.mentorApproval.status}`}
                                            color={
                                                request.mentorApproval.status === 'Approved' ? 'success' :
                                                request.mentorApproval.status === 'Rejected' ? 'error' : 'warning'
                                            }
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    )}
                                    {request.classAdvisorApproval && (
                                        <Chip 
                                            label={`Advisor: ${request.classAdvisorApproval.status}`}
                                            color={
                                                request.classAdvisorApproval.status === 'Approved' ? 'success' :
                                                request.classAdvisorApproval.status === 'Rejected' ? 'error' : 'warning'
                                            }
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Overview" />
                        <Tab label="User Management" />
                        <Tab label="Bulk Student Upload" />
                    </Tabs>
                </Box>

                {/* Error message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading indicator */}
                {loading && (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                )}

                {tabValue === 0 && (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Time Period</InputLabel>
                                        <Select
                                            value={timePeriod}
                                            onChange={(e) => setTimePeriod(e.target.value)}
                                            label="Time Period"
                                        >
                                            <MenuItem value="7days">Last 7 Days</MenuItem>
                                            <MenuItem value="30days">Last 30 Days</MenuItem>
                                            <MenuItem value="1year">Last Year</MenuItem>
                                            <MenuItem value="lifetime">Lifetime</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Student</InputLabel>
                                        <Select
                                            value={selectedStudent}
                                            onChange={(e) => setSelectedStudent(e.target.value)}
                                            label="Student"
                                        >
                                            <MenuItem value="all">All Students</MenuItem>
                                            {users.filter(u => u.role === 'student').map((student) => (
                                                <MenuItem key={student._id} value={student._id}>
                                                    {student.name} ({student.roll_no})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Teacher</InputLabel>
                                        <Select
                                            value={selectedTeacher}
                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                            label="Teacher"
                                        >
                                            <MenuItem value="all">All Teachers</MenuItem>
                                            {teachers.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Approved">Approved</MenuItem>
                                            <MenuItem value="Rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Student OD Requests Section */}
                        {selectedStudent !== 'all' && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    Student OD Requests
                                </Typography>
                                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Semester</InputLabel>
                                            <Select
                                                value={selectedSemester}
                                                onChange={(e) => setSelectedSemester(e.target.value)}
                                                label="Semester"
                                            >
                                                <MenuItem value="all">All Semesters</MenuItem>
                                                {users.find(u => u._id === selectedStudent)?.cur_sem && (
                                                    <MenuItem value={users.find(u => u._id === selectedStudent).cur_sem}>
                                                        Current Semester ({users.find(u => u._id === selectedStudent).cur_sem})
                                                    </MenuItem>
                                                )}
                                                {users.find(u => u._id === selectedStudent)?.pre_sem?.map((sem) => (
                                                    <MenuItem key={sem} value={sem}>
                                                        Semester {sem}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Start Date"
                                                value={studentStartDate}
                                                onChange={handleStudentStartDateChange}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: "small"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="End Date"
                                                value={studentEndDate}
                                                onChange={handleStudentEndDateChange}
                                                minDate={studentStartDate}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: "small"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={handleClearDates}
                                            fullWidth
                                        >
                                            Clear Dates
                                        </Button>
                                    </Grid>
                                </Grid>
                                {renderStudentODTable()}
                            </Box>
                        )}

                        {/* Teacher OD Requests Section */}
                        {selectedTeacher !== 'all' && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    Teacher OD Requests
                                </Typography>
                                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Semester</InputLabel>
                                            <Select
                                                value={selectedSemester}
                                                onChange={(e) => setSelectedSemester(e.target.value)}
                                                label="Semester"
                                            >
                                                <MenuItem value="all">All Semesters</MenuItem>
                                                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                                                    <MenuItem key={sem} value={sem}>
                                                        Semester {sem}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Start Date"
                                                value={startDate}
                                                onChange={handleStartDateChange}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: "small"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="End Date"
                                                value={endDate}
                                                onChange={handleEndDateChange}
                                                minDate={startDate}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: "small"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => {
                                                setStartDate(null);
                                                setEndDate(null);
                                                if (selectedTeacher !== 'all') {
                                                    fetchTeacherODRequests();
                                                }
                                            }}
                                            fullWidth
                                        >
                                            Clear Dates
                                        </Button>
                                    </Grid>
                                </Grid>
                                {renderTeacherODTable()}
                            </Box>
                        )}

                        <Typography variant="h5" sx={{ mb: 3 }}>Overall Statistics</Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatsCard 
                                    title="Total Requests" 
                                    value={statistics.overall.totalRequests} 
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatsCard 
                                    title="Approved" 
                                    value={statistics.overall.approved} 
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatsCard 
                                    title="Rejected" 
                                    value={statistics.overall.rejected} 
                                    color="error"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatsCard 
                                    title="Pending" 
                                    value={statistics.overall.pending} 
                                    color="warning"
                                />
                            </Grid>
                        </Grid>

                        {selectedTeacher === 'all' && (
                            <>
                                <Typography variant="h5" sx={{ mb: 3 }}>Teacher Statistics</Typography>
                                <TableContainer component={Paper} sx={{ mb: 4 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Teacher Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Total Handled</TableCell>
                                                <TableCell>Approved</TableCell>
                                                <TableCell>Rejected</TableCell>
                                                <TableCell>Pending</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {statistics.teacherStats.map((teacher) => (
                                                <TableRow key={teacher.teacherId}>
                                                    <TableCell>{teacher.teacherName}</TableCell>
                                                    <TableCell>{teacher.teacherEmail}</TableCell>
                                                    <TableCell>{teacher.stats.totalHandled}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={teacher.stats.approved}
                                                            color="success"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={teacher.stats.rejected}
                                                            color="error"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={teacher.stats.pending}
                                                            color="warning"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </>
                )}

                {tabValue === 1 && (
                    <>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5">
                                User Management
                            </Typography>
                            <Button variant="contained" color="primary" onClick={handleOpen}>
                                Add New User
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Mentor</TableCell>
                                        <TableCell>Class Advisor</TableCell>
                                        <TableCell>Current Semester</TableCell>
                                        <TableCell>Previous Semesters</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                {user.mentor ? 
                                                    users.find(u => u._id === user.mentor)?.name || 'Unknown' : 
                                                    'Not Assigned'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {user.cls_advisor ? 
                                                    users.find(u => u._id === user.cls_advisor)?.name || 'Unknown' : 
                                                    'Not Assigned'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'student' ? user.cur_sem || 'Not Set' : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'student' ? 
                                                    (user.pre_sem && user.pre_sem.length > 0 ? 
                                                        user.pre_sem.join(', ') : 'None') : 
                                                    '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditOpen(user)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {tabValue === 2 && (
                    <Box sx={{ mt: 3 }}>
                        <StudentCSVUpload />
                    </Box>
                )}

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogContent>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={newUser.name}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={newUser.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={newUser.password}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleChange}
                                    label="Role"
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>

                            {newUser.role === 'teacher' && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Mentees (comma-separated roll numbers)"
                                        name="mentees"
                                        value={newUser.mentees}
                                        onChange={(e) => handleArrayChange(e, 'mentees')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Class Students (comma-separated roll numbers)"
                                        name="cls_students"
                                        value={newUser.cls_students}
                                        onChange={(e) => handleArrayChange(e, 'cls_students')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Handling Students (comma-separated roll numbers)"
                                        name="handling_students"
                                        value={newUser.handling_students}
                                        onChange={(e) => handleArrayChange(e, 'handling_students')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                </>
                            )}

                            {newUser.role === 'student' && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Roll Number"
                                        name="roll_no"
                                        value={newUser.roll_no}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Current Semester"
                                        name="cur_sem"
                                        type="number"
                                        value={newUser.cur_sem}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                        inputProps={{ min: 1, max: 8 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Previous Semesters (comma-separated)"
                                        name="pre_sem"
                                        value={newUser.pre_sem}
                                        onChange={(e) => handleArrayChange(e, 'pre_sem')}
                                        margin="normal"
                                        helperText="Enter previous semester numbers separated by commas (e.g., 1,2,3)"
                                    />
                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel>Mentor</InputLabel>
                                        <Select
                                            name="mentor"
                                            value={newUser.mentor}
                                            onChange={handleChange}
                                            label="Mentor"
                                        >
                                            <MenuItem value="">Select Mentor</MenuItem>
                                            {teachers.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel>Class Advisor</InputLabel>
                                        <Select
                                            name="cls_advisor"
                                            value={newUser.cls_advisor}
                                            onChange={handleChange}
                                            label="Class Advisor"
                                        >
                                            <MenuItem value="">Select Class Advisor</MenuItem>
                                            {teachers.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            Create User
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={editOpen} onClose={handleEditClose}>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={editingUser?.name || ''}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={editingUser?.email || ''}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={editingUser?.role || ''}
                                    onChange={handleChange}
                                    label="Role"
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>

                            {editingUser?.role === 'teacher' && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Mentees (comma-separated roll numbers)"
                                        name="mentees"
                                        value={editingUser.mentees || ''}
                                        onChange={(e) => handleArrayChange(e, 'mentees')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Class Students (comma-separated roll numbers)"
                                        name="cls_students"
                                        value={editingUser.cls_students || ''}
                                        onChange={(e) => handleArrayChange(e, 'cls_students')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Handling Students (comma-separated roll numbers)"
                                        name="handling_students"
                                        value={editingUser.handling_students || ''}
                                        onChange={(e) => handleArrayChange(e, 'handling_students')}
                                        onKeyDown={handleKeyDown}
                                        margin="normal"
                                        helperText="Enter student roll numbers separated by commas or new lines"
                                        multiline
                                        rows={2}
                                    />
                                </>
                            )}

                            {editingUser?.role === 'student' && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Roll Number"
                                        name="roll_no"
                                        value={editingUser.roll_no || ''}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Current Semester"
                                        name="cur_sem"
                                        type="number"
                                        value={editingUser.cur_sem || ''}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                        inputProps={{ min: 1, max: 8 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Previous Semesters (comma-separated)"
                                        name="pre_sem"
                                        value={editingUser.pre_sem ? editingUser.pre_sem.join(', ') : ''}
                                        onChange={(e) => handleArrayChange(e, 'pre_sem')}
                                        margin="normal"
                                        helperText="Enter previous semester numbers separated by commas (e.g., 1,2,3)"
                                    />
                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel>Mentor</InputLabel>
                                        <Select
                                            name="mentor"
                                            value={editingUser?.mentor || ''}
                                            onChange={handleChange}
                                            label="Mentor"
                                        >
                                            <MenuItem value="">Select Mentor</MenuItem>
                                            {teachers.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth margin="normal" required>
                                        <InputLabel>Class Advisor</InputLabel>
                                        <Select
                                            name="cls_advisor"
                                            value={editingUser?.cls_advisor || ''}
                                            onChange={handleChange}
                                            label="Class Advisor"
                                        >
                                            <MenuItem value="">Select Class Advisor</MenuItem>
                                            {teachers.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose}>Cancel</Button>
                        <Button onClick={handleEditSubmit} variant="contained" color="primary">
                            Update User
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
};

export default AdminDashboard; 