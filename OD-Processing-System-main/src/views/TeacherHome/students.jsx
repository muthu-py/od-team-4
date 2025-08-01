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
import DocumentViewer from '../../components/TeacherCard/DocumentViewer';

// Styled components for better organization
const InfoLabel = styled(Typography)({
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'inline-block',
    width: '140px',
    transition: 'all 0.3s ease',
    '&:hover': {
        color: '#1a237e',
    }
});

const InfoValue = styled(Typography)({
    color: '#333',
    fontSize: '0.9rem',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    '&:hover': {
        color: '#1a237e',
    }
});

const InfoRow = styled(Box)({
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateX(5px)',
    }
});

const StyledCard = styled(Card)({
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    }
});

const StyledButton = styled(Button)({
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    }
});

export default function Students() {
    // State to manage requests and snackbar notifications
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
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

    // Fetch class advisor requests on component mount
    useEffect(() => {
        fetchClassAdvisorRequests();
    }, []);

    // Function to fetch class advisor requests
    const fetchClassAdvisorRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await axios.get('http://localhost:5000/api/teacher/class-advisor-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('Class advisor requests:', response.data.requests);
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
            console.error('Error fetching class advisor requests:', error);
            setError(error.message || 'Failed to load requests');
            setLoading(false);
            setSnackbarMessage('Failed to load class advisor requests. Please try again later.');
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
            
            const response = await axios.post(`http://localhost:5000/api/teacher/class-advisor-approve/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update the local state to reflect the approval
            setRequests(requests.map(request => 
                request._id === id 
                    ? { ...request, classAdvisorApproval: { status: 'Approved' } } 
                    : request
            ));
            
            setSnackbarMessage('Request approved successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Refresh the requests list
            fetchClassAdvisorRequests();
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
            
            const response = await axios.post(`http://localhost:5000/api/teacher/class-advisor-reject/${id}`, 
                { reason }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the local state to reflect the rejection
            setRequests(requests.map(request => 
                request._id === id 
                    ? { ...request, classAdvisorApproval: { status: 'Rejected', remarks: reason } } 
                    : request
            ));
            
            setSnackbarMessage('Request rejected successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Close the reject popup
            setRejectPopupOpen(false);
            setSelectedRequest(null);
            
            // Refresh the requests list
            fetchClassAdvisorRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            setSnackbarMessage(error.response?.data?.message || 'Failed to reject request');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Separate requests into pending and completed
    const pendingRequests = requests.filter(request => 
        !request.classAdvisorApproval || request.classAdvisorApproval.status === 'Pending'
    );

    const completedRequests = requests.filter(request => 
        request.classAdvisorApproval && 
        (request.classAdvisorApproval.status === 'Approved' || request.classAdvisorApproval.status === 'Rejected')
    );

    // Handle snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleViewDocument = (file) => {
        setSelectedDocument(file);
        setDocumentViewerOpen(true);
    };

    const handleCloseDocumentViewer = () => {
        setDocumentViewerOpen(false);
        setSelectedDocument(null);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Class Advisor OD Requests
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
                                    <StyledCard>
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{
                                                    color: '#1a237e',
                                                    fontWeight: 600,
                                                    position: 'relative',
                                                    pb: 1,
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        width: '40px',
                                                        height: '3px',
                                                        background: 'linear-gradient(90deg, #1a237e, #0066cc)',
                                                        borderRadius: '2px',
                                                    }
                                                }}
                                            >
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
                                                <InfoLabel>Mentor Status:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.mentorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.mentorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Class Advisor:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.classAdvisorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.classAdvisorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            {request.file && (
                                                <InfoRow>
                                                    <InfoLabel>Attachment:</InfoLabel>
                                                    <InfoValue>
                                                        <StyledButton
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleViewDocument(request.file)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                                                                }
                                                            }}
                                                        >
                                                            View Document
                                                        </StyledButton>
                                                    </InfoValue>
                                                </InfoRow>
                                            )}
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                <StyledButton
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleApprove(request._id)}
                                                    sx={{
                                                        background: 'linear-gradient(45deg, #1a237e 30%, #0066cc 90%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #0066cc 30%, #1a237e 90%)',
                                                        }
                                                    }}
                                                >
                                                    Approve
                                                </StyledButton>
                                                <StyledButton
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleRejectClick(request)}
                                                >
                                                    Reject
                                                </StyledButton>
                                            </Stack>
                                        </CardContent>
                                    </StyledCard>
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
                                    <StyledCard>
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{
                                                    color: '#1a237e',
                                                    fontWeight: 600,
                                                    position: 'relative',
                                                    pb: 1,
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        width: '40px',
                                                        height: '3px',
                                                        background: 'linear-gradient(90deg, #1a237e, #0066cc)',
                                                        borderRadius: '2px',
                                                    }
                                                }}
                                            >
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
                                                <InfoLabel>Mentor Status:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.mentorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.mentorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            <InfoRow>
                                                <InfoLabel>Class Advisor:</InfoLabel>
                                                <InfoValue>
                                                    <Chip 
                                                        label={request.classAdvisorApproval?.status || "Pending"}
                                                        color={getStatusColor(request.classAdvisorApproval?.status || "Pending")}
                                                        size="small"
                                                    />
                                                </InfoValue>
                                            </InfoRow>
                                            
                                            {request.classAdvisorApproval?.status === 'Rejected' && (
                                                <InfoRow>
                                                    <InfoLabel>Rejection Reason:</InfoLabel>
                                                    <InfoValue>{request.rejectionReason || 'No reason provided'}</InfoValue>
                                                </InfoRow>
                                            )}
                                            
                                            {request.file && (
                                                <InfoRow>
                                                    <InfoLabel>Attachment:</InfoLabel>
                                                    <InfoValue>
                                                        <StyledButton
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleViewDocument(request.file)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                                                                }
                                                            }}
                                                        >
                                                            View Document
                                                        </StyledButton>
                                                    </InfoValue>
                                                </InfoRow>
                                            )}
                                        </CardContent>
                                    </StyledCard>
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
            
            {/* Document Viewer */}
            <DocumentViewer
                open={documentViewerOpen}
                onClose={handleCloseDocumentViewer}
                documentUrl={selectedDocument?.url}
                fileName={selectedDocument?.name}
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