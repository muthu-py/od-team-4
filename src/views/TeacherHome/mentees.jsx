import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    Box, 
    Typography, 
    Paper, 
    Card, 
    CardContent, 
    Button,
    Chip,
    Container,
    Grid,
    Snackbar,
    Alert,
    Divider,
    Stack,
    CircularProgress,
    Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PopupReject from '../../components/TeacherCard/RejectPopUp';

// Styled components for better organization
const InfoLabel = styled(Typography)({
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'inline-block',
    width: '140px'
});

const InfoValue = styled(Typography)({
    color: '#333',
    fontSize: '0.9rem',
    display: 'inline-block'
});

const InfoRow = styled(Box)({
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
});

// Initial data for mentee requests
const initialRequests = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        registerNumber: '123456',
        odSubmissionDate: '2023-10-01',
        odSubmissionStatus: 'Pending',
        startDate: '2023-10-05',
        endDate: '2023-10-10',
        reason: 'Family emergency',
        class: 'Mathematics',
        file: { name: 'od_request_john_doe.pdf', size: 1500, url: '/path/to/od_request_john_doe.pdf' }
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        registerNumber: '654321',
        odSubmissionDate: '2023-10-02',
        odSubmissionStatus: 'Pending',
        startDate: '2023-10-12',
        endDate: '2023-10-15',
        reason: 'Medical appointment',
        class: 'Science',
        file: { name: 'od_request_jane_smith.docx', size: 1800, url: '/path/to/od_request_jane_smith.docx' }
    },
    {
        id: 3,
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        registerNumber: '789012',
        odSubmissionDate: '2023-10-03',
        odSubmissionStatus: 'Approved',
        startDate: '2023-10-15',
        endDate: '2023-10-18',
        reason: 'Sports event',
        class: 'Physics',
        file: { name: 'od_request_alice.pdf', size: 1600, url: '/path/to/od_request_alice.pdf' }
    }
    // Add more students as needed
];

export default function Mentees() {
    // State to manage requests and snackbar notifications
    const [requests, setRequests] = useState(initialRequests);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate=useNavigate();


    // Function to approve a request
    const handleApprove = (id) => {
        setRequests(requests.map(request => 
            request.id === id ? { ...request, odSubmissionStatus: 'Approved' } : request
        ));
    };

    // Function to reject a request
    const handleReject = (id,reason) => {
        setRequests(requests.map(request => 
            request.id === id ? { ...request, odSubmissionStatus: 'Rejected', rejectionReason: reason } : request
        ));
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setRejectPopupOpen(true);
    };
    

    // Function to get the color for the status chip
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    // Function to close the snackbar notification
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Separate requests into pending and completed
    const pendingRequests = requests.filter(request => request.odSubmissionStatus === 'Pending');
    const completedRequests = requests.filter(request => request.odSubmissionStatus !== 'Pending');

    // Show notification when the component mounts
    useEffect(() => {
        setSnackbarMessage('New submissions are available!');
        setSnackbarOpen(true);
    }, []);

    return (
        <Container maxWidth="xl">
            <Box sx={{ padding: 3 }}>
                {/* Back button */}
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/teacher')}
                    sx={{ mb: 2 , color:'#015498'}}
                >
                    Back to Dashboard
                </Button>
                {/* Main title for the page */}
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold',
                        color: '#015498',
                        borderBottom: '2px solid #015498',
                        paddingBottom: 1,
                        marginBottom: 3
                    }}
                >
                    Mentees OD Submissions
                </Typography>

                {/* Display total counts of pending and completed requests */}
                <Typography variant="subtitle1" color="text.secondary" sx={{ marginBottom: 2 }}>
                    Total Pending Requests: {pendingRequests.length} | Total Completed Requests: {completedRequests.length}
                </Typography>

                {/* Pending Requests Section */}
                <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Pending Requests
                </Typography>
                <Grid container spacing={3}>
                    {pendingRequests.map((request) => (
                        <Grid item xs={12} sm={6} lg={4} key={request.id}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    },
                                    height: '100%' // Ensure all cards have the same height
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{request.name}</Typography>
                                        <Typography color="textSecondary">{request.email}</Typography>
                                        <InfoRow>
                                            <InfoLabel>Register Number:</InfoLabel>
                                            <InfoValue>{request.registerNumber}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Class:</InfoLabel>
                                            <InfoValue>{request.class}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Submission Date:</InfoLabel>
                                            <InfoValue>{request.odSubmissionDate}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Start Date:</InfoLabel>
                                            <InfoValue>{request.startDate} {request.startTime}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>End Date:</InfoLabel>
                                            <InfoValue>{request.endDate} {request.endTime}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Reason:</InfoLabel>
                                            <InfoValue>{request.reason}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>File:</InfoLabel>
                                            <InfoValue>
                                                {request.file ? (
                                                    <a href={request.file.url} target="_blank" rel="noopener noreferrer">
                                                        {request.file.name} ({(request.file.size / 1024).toFixed(2)} KB)
                                                    </a>
                                                ) : (
                                                    'No file uploaded'
                                                )}
                                            </InfoValue>
                                        </InfoRow>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Chip 
                                                label={request.odSubmissionStatus}
                                                color={getStatusColor(request.odSubmissionStatus)}
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button 
                                                    variant="contained" 
                                                    color="success" 
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={request.odSubmissionStatus !== 'Pending'}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="contained" 
                                                    color="error" 
                                                    onClick={() => handleRejectClick(request)}
                                                    disabled={request.odSubmissionStatus !== 'Pending'}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Completed Requests Section */}
                <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
                    Completed Requests
                </Typography>
                <Grid container spacing={3}>
                    {completedRequests.map((request) => (
                        <Grid item xs={12} sm={6} lg={4} key={request.id}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    },
                                    height: '100%' // Ensure all cards have the same height
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{request.name}</Typography>
                                        <Typography color="textSecondary">{request.email}</Typography>
                                        <InfoRow>
                                            <InfoLabel>Register Number:</InfoLabel>
                                            <InfoValue>{request.registerNumber}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Class:</InfoLabel>
                                            <InfoValue>{request.class}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Submission Date:</InfoLabel>
                                            <InfoValue>{request.odSubmissionDate}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Start Date:</InfoLabel>
                                            <InfoValue>{request.startDate} {request.startTime}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>End Date:</InfoLabel>
                                            <InfoValue>{request.endDate} {request.endTime}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Reason:</InfoLabel>
                                            <InfoValue>{request.reason}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>Rejection Reason:</InfoLabel>
                                            <InfoValue>{request.odSubmissionStatus === 'Rejected' ? request.rejectionReason : '—'}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                            <InfoLabel>File:</InfoLabel>
                                            <InfoValue>
                                                {request.file ? (
                                                    <a href={request.file.url} target="_blank" rel="noopener noreferrer">
                                                        {request.file.name} ({(request.file.size / 1024).toFixed(2)} KB)
                                                    </a>
                                                ) : (
                                                    'No file uploaded'
                                                )}
                                            </InfoValue>
                                        </InfoRow>
                                        <Chip 
                                            label={request.odSubmissionStatus}
                                            color={getStatusColor(request.odSubmissionStatus)}
                                            sx={{ 
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Add the PopupReject component here */}
            {rejectPopupOpen && (
            <PopupReject 
                open={rejectPopupOpen} 
                onClose={() => setRejectPopupOpen(false)} 
                request={selectedRequest} 
                onReject={handleReject}
            />
            )}
        </Container>
    );
}