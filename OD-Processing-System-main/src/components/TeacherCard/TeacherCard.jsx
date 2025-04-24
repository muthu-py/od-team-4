import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import RejectPopUp from './RejectPopUp';

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    }
}));

const StatCard = styled(Card)(({ theme }) => ({
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

const TeacherCard = ({ request, onApprove, onReject }) => {
    const [statistics, setStatistics] = useState({
        statistics: {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
        },
        requests: []
    });
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/teacher/od-statistics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatistics(response.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };
        fetchStatistics();
    }, []);

    const handleRejectClick = () => {
        setOpenRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setOpenRejectDialog(false);
    };

    const handleDetailsClick = () => {
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <StyledCard>
            <CardContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 2 }}>
                        OD Request Statistics
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard>
                                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 600 }}>
                                    {statistics.statistics.total}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Total Requests
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Chip 
                                        label={`${statistics.statistics.approved} Approved`}
                                        color="success"
                                        size="small"
                                    />
                                    <Chip 
                                        label={`${statistics.statistics.rejected} Rejected`}
                                        color="error"
                                        size="small"
                                    />
                                </Box>
                            </StatCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard>
                                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                                    {statistics.statistics.approved}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Approved
                                </Typography>
                            </StatCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard>
                                <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                                    {statistics.statistics.rejected}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Rejected
                                </Typography>
                            </StatCard>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard>
                                <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 600 }}>
                                    {statistics.statistics.pending}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Pending
                                </Typography>
                            </StatCard>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                }}>
                    <Typography variant="h6" sx={{ color: '#1a237e' }}>
                        {request.name}
                    </Typography>
                    <Chip 
                        label={request.status || request.odSubmissionStatus}
                        color={getStatusColor(request.status || request.odSubmissionStatus)}
                        size="small"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                        Date Range
                    </Typography>
                    <Typography variant="body1">
                        {formatDate(request.startDateTime || request.startDate)}
                        {(request.endDateTime || request.endDate) !== (request.startDateTime || request.startDate) && (
                            <>
                                <Box component="span" sx={{ mx: 1, color: 'rgba(0, 0, 0, 0.4)' }}>
                                    to
                                </Box>
                                {formatDate(request.endDateTime || request.endDate)}
                            </>
                        )}
                    </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 2 }}>
                    {request.description || request.reason}
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    justifyContent: 'flex-end'
                }}>
                    <Button 
                        variant="outlined" 
                        onClick={handleDetailsClick}
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
                    {(request.status === 'Pending' || request.odSubmissionStatus === 'Pending') && (
                        <>
                            <Button variant="contained" onClick={onApprove}>
                                Approve
                            </Button>
                            <Button variant="outlined" color="error" onClick={handleRejectClick}>
                                Reject
                            </Button>
                        </>
                    )}
                </Box>
            </CardContent>

            <RejectPopUp 
                open={openRejectDialog} 
                onClose={handleCloseRejectDialog}
                onReject={onReject}
            />

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
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Student Name
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {request.name}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Register Number
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {request.registerNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Date Range
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {request.startDate}
                                    {request.endDate !== request.startDate && (
                                        <Box component="span" sx={{ mx: 1, color: 'rgba(0, 0, 0, 0.4)' }}>
                                            to
                                        </Box>
                                    )}
                                    {request.endDate !== request.startDate && request.endDate}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Status
                                </Typography>
                                <Chip 
                                    label={request.status || request.odSubmissionStatus}
                                    color={getStatusColor(request.status || request.odSubmissionStatus)}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                    Purpose
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {request.reason}
                                </Typography>
                            </Grid>
                            {request.rejectionReason && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Rejection Reason
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {request.rejectionReason}
                                    </Typography>
                                </Grid>
                            )}
                            {request.file && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                                        Attached File
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={request.file.url}
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog} sx={{ color: '#1a237e' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default TeacherCard; 