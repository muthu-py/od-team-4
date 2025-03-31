import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

export default function Mentees() {
    // State to manage requests and snackbar notifications
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();

    // Function to get color based on status
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'pending':
            default:
                return 'warning';
        }
    };

    // Fetch mentee requests on component mount
    useEffect(() => {
        fetchMenteeRequests();
    }, []);

    // Function to fetch mentee requests
    const fetchMenteeRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.get('http://localhost:5000/api/teacher/mentee-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('Mentee requests:', response.data.requests);
            setRequests(response.data.requests || []);
            setLoading(false);
            
            // Show notification if there are requests
            if (response.data.requests && response.data.requests.length > 0) {
                setSnackbarMessage(`${response.data.requests.length} OD requests pending your approval`);
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('No pending OD requests found');
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Error fetching mentee requests:', error);
            setError(error.message || 'Failed to load requests');
            setLoading(false);
            setSnackbarMessage('Failed to load mentee requests. Please try again later.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Function to approve a request
    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.post(`http://localhost:5000/api/teacher/approve-request/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update the local state to reflect the approval
            setRequests(requests.map(request => 
                request._id === id 
                    ? { ...request, mentorApproval: { status: 'Approved' } } 
                    : request
            ));
            
            setSnackbarMessage('Request approved successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Refresh the requests list
            fetchMenteeRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            setSnackbarMessage(error.response?.data?.message || 'Failed to approve request');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Function to open reject popup
    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setRejectPopupOpen(true);
    };

    // Function to handle reject popup close
    const handleRejectPopupClose = () => {
        setRejectPopupOpen(false);
        setSelectedRequest(null);
    };

    // Function to reject a request
    const handleReject = async (id, reason) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.post(`http://localhost:5000/api/teacher/reject-request/${id}`, 
                { reason: "Request rejected" }, // Use a default reason
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the local state to reflect the rejection
            setRequests(requests.map(request => 
                request._id === id 
                    ? { ...request, mentorApproval: { status: 'Rejected', remarks: "Request rejected" } } 
                    : request
            ));
            
            setSnackbarMessage('Request rejected successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Close the reject popup
            setRejectPopupOpen(false);
            setSelectedRequest(null);
            
            // Refresh the requests list
            fetchMenteeRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            setSnackbarMessage(error.response?.data?.message || 'Failed to reject request');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Separate requests into pending and completed
    const pendingRequests = requests.filter(request => 
        !request.mentorApproval || request.mentorApproval.status === 'Pending'
    );

    const completedRequests = requests.filter(request => 
        request.mentorApproval && 
        (request.mentorApproval.status === 'Approved' || request.mentorApproval.status === 'Rejected')
    );

    // Handle snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Mentee OD Requests
            </Typography>
            
            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {/* Loading state */}
            {loading ? (
                <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={100} />
                </Box>
            ) : (
                <>
                    {/* Pending Requests Section */}
                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        Pending Requests ({pendingRequests.length})
                    </Typography>
                    
                    {pendingRequests.length === 0 ? (
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1">No pending requests found.</Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingRequests.map((request) => (
                                <Grid item xs={12} md={6} key={request._id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {request.name}
                                            </Typography>
                                            
                                            <InfoRow>
                                                <InfoLabel>Email:</InfoLabel>
                                                <InfoValue>{request.email}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Register Number:</InfoLabel>
                                                <InfoValue>{request.registerNumber}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Class:</InfoLabel>
                                                <InfoValue>{request.class}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Start Date:</InfoLabel>
                                                <InfoValue>
                                                    {new Date(request.startDate).toLocaleDateString()}
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>End Date:</InfoLabel>
                                                <InfoValue>
                                                    {new Date(request.endDate).toLocaleDateString()}
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Reason:</InfoLabel>
                                                <InfoValue>{request.reason}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Status:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.mentorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.mentorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            {request.file && (
                                                <InfoRow>
                                                    <InfoLabel>Attachment:</InfoLabel>
                                                    <InfoValue>
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small"
                                                            href={request.file.url}
                                                            target="_blank"
                                                        >
                                                            View Document
                                                        </Button>
                                                    </InfoValue>
                                                </InfoRow>
                                            )}
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                <Button 
                                                    variant="contained" 
                                                    color="primary"
                                                    onClick={() => handleApprove(request._id)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="error"
                                                    onClick={() => handleRejectClick(request)}
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    
                    {/* Completed Requests Section */}
                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        Completed Requests ({completedRequests.length})
                    </Typography>
                    
                    {completedRequests.length === 0 ? (
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1">No completed requests found.</Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {completedRequests.map((request) => (
                                <Grid item xs={12} md={6} key={request._id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {request.name}
                                            </Typography>
                                            
                                            <InfoRow>
                                                <InfoLabel>Email:</InfoLabel>
                                                <InfoValue>{request.email}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Register Number:</InfoLabel>
                                                <InfoValue>{request.registerNumber}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Class:</InfoLabel>
                                                <InfoValue>{request.class}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Start Date:</InfoLabel>
                                                <InfoValue>
                                                    {new Date(request.startDate).toLocaleDateString()}
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>End Date:</InfoLabel>
                                                <InfoValue>
                                                    {new Date(request.endDate).toLocaleDateString()}
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Reason:</InfoLabel>
                                                <InfoValue>{request.reason}</InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Status:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.mentorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.mentorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            {request.mentorApproval?.status === 'Rejected' && (
                                                <InfoRow>
                                                    <InfoLabel>Rejection Reason:</InfoLabel>
                                                    <InfoValue>{request.rejectionReason || 'No reason provided'}</InfoValue>
                                                </InfoRow>
                                            )}
                                            
                                            {request.file && (
                                                <InfoRow>
                                                    <InfoLabel>Attachment:</InfoLabel>
                                                    <InfoValue>
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small"
                                                            href={request.file.url}
                                                            target="_blank"
                                                        >
                                                            View Document
                                                        </Button>
                                                    </InfoValue>
                                                </InfoRow>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
            
            {/* Reject Popup */}
            <PopupReject
                open={rejectPopupOpen}
                onClose={handleRejectPopupClose}
                request={selectedRequest}
                onReject={handleReject}
            />
            
            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}