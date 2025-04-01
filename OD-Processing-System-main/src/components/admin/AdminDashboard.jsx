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
    Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

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
    const [error, setError] = useState('');
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
        handling_students: ''
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

    useEffect(() => {
        fetchUsers();
        fetchStatistics();
    }, [timePeriod, selectedTeacher, selectedStudent]);

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
            handling_students: ''
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
        // Allow direct input including commas
        if (editingUser) {
            setEditingUser(prev => ({
                ...prev,
                [arrayName]: value
            }));
        } else {
            setNewUser(prev => ({
                ...prev,
                [arrayName]: value
            }));
        }
    };

    const handleKeyDown = (e) => {
        // Allow comma input
        if (e.key === ',') {
            e.stopPropagation();
        }
    };

    const processArrayBeforeSubmit = (value) => {
        // Process the string into array only when submitting
        return value
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(item => item !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const processedUser = { ...newUser };
            
            // Process arrays before submission
            if (processedUser.role === 'teacher') {
                // Convert empty strings to empty arrays
                processedUser.mentees = processedUser.mentees ? processArrayBeforeSubmit(processedUser.mentees) : [];
                processedUser.cls_students = processedUser.cls_students ? processArrayBeforeSubmit(processedUser.cls_students) : [];
                processedUser.handling_students = processedUser.handling_students ? processArrayBeforeSubmit(processedUser.handling_students) : [];
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
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Statistics" />
                <Tab label="User Management" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {activeTab === 0 ? (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
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
                            {/* <Grid item xs={12} md={4}>
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
                            <Grid item xs={12} md={4}>
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
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Class Advisor</InputLabel>
                                    <Select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        label="Class Advisor"
                                    >
                                        <MenuItem value="all">All Class Advisors</MenuItem>
                                        {teachers.map((teacher) => (
                                            <MenuItem key={teacher._id} value={teacher._id}>
                                                {teacher.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
                        </Grid>
                    </Box>

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
            ) : (
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
    );
};

export default AdminDashboard; 