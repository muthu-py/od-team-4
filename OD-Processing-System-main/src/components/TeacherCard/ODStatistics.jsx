import React, { useState, useEffect } from 'react';
import { 
    Grid, 
    Autocomplete, 
    TextField, 
    Box, 
    Typography,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.05) 0%, rgba(26, 35, 126, 0.1) 100%)',
    borderRadius: '12px',
    padding: theme.spacing(2),
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(26, 35, 126, 0.1)',
    }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 200,
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover fieldset': {
            borderColor: '#1a237e',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#1a237e',
        },
    }
}));

const ODStatistics = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [statistics, setStatistics] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
    });
    const [requests, setRequests] = useState([]);
    const [semesters, setSemesters] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);

    useEffect(() => {
        fetchStudents();
        fetchStatistics();
    }, [selectedStudent, startDate, endDate, selectedSemester]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/teacher/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                studentId: selectedStudent?._id,
                semester: selectedSemester !== 'all' ? selectedSemester : undefined
            };

            // Add date range parameters if both dates are selected
            if (startDate && endDate) {
                params.startDate = startDate.toISOString();
                params.endDate = endDate.toISOString();
            }

            const response = await axios.get('http://localhost:5000/api/teacher/od-statistics', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            
            // Get the requests from the response
            let filteredRequests = response.data.requests || [];

            // Filter requests based on date range if dates are selected
            if (startDate && endDate) {
                const start = startDate.getTime();
                const end = endDate.getTime();
                filteredRequests = filteredRequests.filter(request => {
                    const requestDate = new Date(request.startDateTime || request.startDate).getTime();
                    return requestDate >= start && requestDate <= end;
                });
            }

            // Calculate statistics based on filtered requests
            const stats = {
                total: filteredRequests.length,
                approved: filteredRequests.filter(r => r.status?.toLowerCase() === 'approved').length,
                rejected: filteredRequests.filter(r => r.status?.toLowerCase() === 'rejected').length,
                pending: filteredRequests.filter(r => r.status?.toLowerCase() === 'pending').length
            };

            setStatistics(stats);
            setRequests(filteredRequests);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleClearDates = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const handleSemesterChange = (event) => {
        setSelectedSemester(event.target.value);
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
                OD Request Statistics
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Autocomplete
                        value={selectedStudent}
                        onChange={(event, newValue) => setSelectedStudent(newValue)}
                        options={students}
                        getOptionLabel={(option) => {
                            if (!option) return '';
                            return `${option.name} (${option.roll_no}) - ${option.roles.join(', ')}`;
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Box>
                                    <Typography variant="body1">{option.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.roll_no} - {option.roles.join(', ')}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Select Student" 
                                fullWidth
                                placeholder="Search by name or register number"
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StyledFormControl fullWidth>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            value={selectedSemester}
                            onChange={handleSemesterChange}
                            label="Semester"
                        >
                            <MenuItem value="all">All Semesters</MenuItem>
                            {semesters.map((sem) => (
                                <MenuItem key={sem} value={sem}>
                                    Semester {sem}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                minDate={startDate}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small"
                                    }
                                }}
                            />
                        </LocalizationProvider>
                        <Button 
                            variant="outlined" 
                            onClick={handleClearDates}
                            sx={{ minWidth: 'auto' }}
                        >
                            Clear
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 600 }}>
                            {statistics.total}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Total Requests
                        </Typography>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            {statistics.approved}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Approved
                        </Typography>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                            {statistics.rejected}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Rejected
                        </Typography>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 600 }}>
                            {statistics.pending}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Pending
                        </Typography>
                    </StyledCard>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Register Number</TableCell>
                            <TableCell>Date Range</TableCell>
                            <TableCell>Semester</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Purpose</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>{request.name}</TableCell>
                                <TableCell>{request.registerNumber}</TableCell>
                                <TableCell>
                                    {formatDate(request.startDateTime || request.startDate)} -
                                    {formatDate(request.endDateTime || request.endDate)}
                                </TableCell>
                                <TableCell>{request.semester || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.status || request.odSubmissionStatus}
                                        color={getStatusColor(request.status || request.odSubmissionStatus)}
                                        size="small"
                                        sx={{
                                            minWidth: 85,
                                            fontWeight: 500,
                                            borderRadius: '4px',
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{request.description}</TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No OD requests found for the selected criteria
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ODStatistics; 