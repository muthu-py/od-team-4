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
    Alert
} from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        mentor: '',
        cls_advisor: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users);
            // Filter teachers for mentor and class advisor selection
            setTeachers(response.data.users.filter(user => user.role === 'teacher'));
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'student',
            mentor: '',
            cls_advisor: ''
        });
    };

    const handleChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('User created successfully');
            handleClose();
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://localhost:5000/api/users/${userId}`, {
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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    User Management
                </Typography>
                <Button variant="contained" color="primary" onClick={handleOpen}>
                    Add New User
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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

                        {newUser.role === 'student' && (
                            <>
                                <FormControl fullWidth margin="normal">
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

                                <FormControl fullWidth margin="normal">
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
        </Container>
    );
};

export default AdminDashboard; 