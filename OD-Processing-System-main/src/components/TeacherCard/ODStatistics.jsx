import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

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

const ODStatistics = () => {
    const [statistics, setStatistics] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
    });
    const [requests, setRequests] = useState([]);
    const [timePeriod, setTimePeriod] = useState('7days');
    const [status, setStatus] = useState('');
    const [studentType, setStudentType] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/teacher/od-statistics', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    timePeriod,
                    status: status || undefined,
                    studentType
                }
            });
            setStatistics(response.data.statistics);
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [timePeriod, status, studentType]);

    const handleDetailsClick = (request) => {
        setSelectedRequest(request);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
        setSelectedRequest(null);
        setOpenDetailsDialog(false);
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
                OD Request Statistics
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Time Period</InputLabel>
                        <Select
                            value={timePeriod}
                            label="Time Period"
                            onChange={(e) => setTimePeriod(e.target.value)}
                        >
                            <MenuItem value="7days">Last 7 Days</MenuItem>
                            <MenuItem value="30days">Last 30 Days</MenuItem>
                            <MenuItem value="1year">Last Year</MenuItem>
                            <MenuItem value="all">All Time</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Student Type</InputLabel>
                        <Select
                            value={studentType}
                            label="Student Type"
                            onChange={(e) => setStudentType(e.target.value)}
                        >
                            <MenuItem value="all">All Students</MenuItem>
                            <MenuItem value="mentees">Mentees</MenuItem>
                            <MenuItem value="class_students">Class Students</MenuItem>
                        </Select>
                    </FormControl>
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
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>{request.name}</TableCell>
                                <TableCell>{request.registerNumber}</TableCell>
                                <TableCell>
                                    {request.startDate}
                                    {request.endDate !== request.startDate && (
                                        <Box component="span" sx={{ mx: 1, color: 'rgba(0, 0, 0, 0.4)' }}>
                                            to
                                        </Box>
                                    )}
                                    {request.endDate !== request.startDate && request.endDate}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={request.odSubmissionStatus}
                                        color={getStatusColor(request.odSubmissionStatus)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleDetailsClick(request)}
                                        sx={{
                                            borderColor: '#1a237e',
                                            color: '#1a237e',
                                            '&:hover': {
                                                borderColor: '#0066cc',
                                                backgroundColor: 'rgba(26, 35, 126, 0.05)'
                                            }
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={openDetailsDialog} 
                onClose={handleCloseDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #1a237e 0%, #0066cc 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    OD Request Details
                    <Button onClick={handleCloseDetailsDialog} sx={{ color: 'white' }}>
                        ✕
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedRequest && (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Student Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedRequest.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Register Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedRequest.registerNumber}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Date Range
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedRequest.startDate}
                                        {selectedRequest.endDate !== selectedRequest.startDate && (
                                            <Box component="span" sx={{ mx: 1, color: 'rgba(0, 0, 0, 0.4)' }}>
                                                to
                                            </Box>
                                        )}
                                        {selectedRequest.endDate !== selectedRequest.startDate && selectedRequest.endDate}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Status
                                    </Typography>
                                    <Chip 
                                        label={selectedRequest.odSubmissionStatus}
                                        color={getStatusColor(selectedRequest.odSubmissionStatus)}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Purpose
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedRequest.reason}
                                    </Typography>
                                </Grid>
                                {selectedRequest.rejectionReason && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                            Rejection Reason
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            {selectedRequest.rejectionReason}
                                        </Typography>
                                    </Grid>
                                )}
                                {selectedRequest.file && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                                            Attached File
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={selectedRequest.file.url}
                                            target="_blank"
                                            sx={{
                                                borderColor: '#1a237e',
                                                color: '#1a237e',
                                                '&:hover': {
                                                    borderColor: '#0066cc',
                                                    backgroundColor: 'rgba(26, 35, 126, 0.05)'
                                                }
                                            }}
                                        >
                                            View File
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog} sx={{ color: '#1a237e' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ODStatistics; 