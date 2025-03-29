import React, { useState, useEffect } from "react";
import DateTimePicker from "./DateTimePicker";
import InputFileUpload from "./InputFileUpload";
import ODHistoryTable from "./ODHistoryTable";
import Navbar from "../common/Navbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {Grid2} from "@mui/material";
import Typography from "@mui/material/Typography";
import Textarea from "@mui/joy/Textarea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const StyledForm = styled('form')({
  width: '100%',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: '16px',
    pointerEvents: 'none',
  }
});

// Update AppBar styling
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#0066cc',
  boxShadow: 'none',
});

// Update container styling
const StyledContainer = styled(Container)({
  '& .MuiCard-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    // '&:hover': {
    //   transform: 'translateY(-5px)',
    //   boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    // }
  },
  '& .MuiGrid2-root': {
    transition: 'transform 0.3s ease',
    // '&:hover': {
    //   transform: 'translateX(5px)',
    // }
  }
});

// Update page title styling
const PageTitle = styled(Typography)({
  position: 'relative',
  color: '#1a237e',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontWeight: 600,
  textAlign: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #1a237e 0%, #0066cc 100%)',
    borderRadius: '2px',
  }
});

// Remove Navbar-related imports
// Remove StyledAppBar component

export default function Form() {
    const [formData, setFormData] = useState({
        startDateTime: null,
        endDateTime: null,
        description: "",
        fileUrls: [], // Changed from files to fileUrls
    });
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    useEffect(() => {
        // Fetch user's OD applications from the backend
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('http://localhost:5000/api/od-applications', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.applications) {
                    // Transform the data to match the table format
                    const formattedSubmissions = response.data.applications.map(app => ({
                        startDate: new Date(app.startDateTime).toLocaleDateString(),
                        endDate: new Date(app.endDateTime).toLocaleDateString(),
                        session: getSession(app.startDateTime),
                        purpose: app.description.substring(0, 30) + (app.description.length > 30 ? '...' : ''),
                        status: app.status,
                        remarks: getMostRecentRemark(app)
                    }));
                    
                    setSubmissions(formattedSubmissions);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to load your OD history',
                    severity: 'error'
                });
            }
        };

        fetchSubmissions();
    }, []);

    // Helper function to determine session (morning/afternoon)
    const getSession = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const hours = date.getHours();
        return hours < 12 ? 'Forenoon' : 'Afternoon';
    };

    // Helper function to get the most recent remark
    const getMostRecentRemark = (application) => {
        if (application.classAdvisorApproval.remarks) {
            return application.classAdvisorApproval.remarks;
        } else if (application.mentorApproval.remarks) {
            return application.mentorApproval.remarks;
        }
        return 'Under review';
    };

    const handleStartDateChange = (date) => {
        setFormData((prev) => ({ ...prev, startDateTime: date }));
    };

    const handleEndDateChange = (date) => {
        setFormData((prev) => ({ ...prev, endDateTime: date }));
    };

    const handleFileChange = (fileUrls) => {
        setFormData((prev) => ({ ...prev, fileUrls }));
    };

    const handleFileUploadError = (errorMessage) => {
        setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.startDateTime || !formData.endDateTime) {
            setSnackbar({
                open: true,
                message: 'Please select start and end date/time',
                severity: 'error'
            });
            return;
        }
        
        if (!formData.description.trim()) {
            setSnackbar({
                open: true,
                message: 'Please provide a reason for your OD request',
                severity: 'error'
            });
            return;
        }
        
        if (formData.fileUrls.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please upload supporting documents',
                severity: 'error'
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({
                    open: true,
                    message: 'You must be logged in to submit an application',
                    severity: 'error'
                });
                setIsLoading(false);
                return;
            }
            
            // Submit the OD application with file URLs
            const response = await axios.post(
                'http://localhost:5000/api/od-applications', 
                {
                    startDateTime: formData.startDateTime,
                    endDateTime: formData.endDateTime,
                    description: formData.description,
                    fileUrls: formData.fileUrls
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Reset form
            setFormData({
                startDateTime: null,
                endDateTime: null,
                description: "",
                fileUrls: []
            });
            
            // Show success message
            setSnackbar({
                open: true,
                message: 'OD application submitted successfully!',
                severity: 'success'
            });
            
            // Refresh the submissions list
            fetchSubmissions();
            
        } catch (error) {
            console.error('Error submitting OD application:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to submit OD application',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:5000/api/od-applications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.applications) {
                // Transform the data to match the table format
                const formattedSubmissions = response.data.applications.map(app => ({
                    startDate: new Date(app.startDateTime).toLocaleDateString(),
                    endDate: new Date(app.endDateTime).toLocaleDateString(),
                    session: getSession(app.startDateTime),
                    purpose: app.description.substring(0, 30) + (app.description.length > 30 ? '...' : ''),
                    status: app.status,
                    remarks: getMostRecentRemark(app)
                }));
                
                setSubmissions(formattedSubmissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load your OD history',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleRemoveFile = (index) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
            py: 4,
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '200px',
                background: 'linear-gradient(180deg, rgba(26, 35, 126, 0.05) 0%, transparent 100%)',
                pointerEvents: 'none',
            }
        }}>
            <StyledContainer maxWidth="lg">
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>
                    <PageTitle 
                        variant="h4" 
                        sx={{
                            mb: 2,
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '40px',
                                height: '4px',
                                background: 'linear-gradient(90deg, #1a237e 0%, #0066cc 100%)',
                                borderRadius: '2px',
                            }
                        }} 
                    >
                        On-Duty Application Form
                    </PageTitle>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                        gap: 4,
                        alignItems: 'stretch',
                        '& > *': {
                            height: '100%',
                        }
                    }}>
                        {/* OD Form */}
                        <Card sx={{ 
                            p: 4, 
                            position: 'relative',
                            overflow: 'visible',
                            display: 'flex',
                            flexDirection: 'column',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                borderRadius: '16px',
                                zIndex: 0,
                            }
                        }}>
                            <CardContent sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                p: '0 !important',
                            }}>
                                <StyledForm 
                                    action="/ODForm" 
                                    method="POST" 
                                    onSubmit={handleSubmit}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Grid2 
                                        container 
                                        spacing={3} 
                                        direction="column"
                                        sx={{ 
                                            height: '100%',
                                            '& .MuiGrid2-root': { 
                                                transition: 'all 0.3s ease',
                                                px: 2,
                                                // '&:hover': {
                                                //     transform: 'translateX(5px)',
                                                // }
                                            }
                                        }}
                                    >
                                        {/* DateTime Picker */}
                                        <Grid2 item>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 2, 
                                                    color: '#1a237e',
                                                    fontWeight: 500,
                                                    position: 'relative',
                                                    pl: 2,
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '4px',
                                                        height: '20px',
                                                        background: 'linear-gradient(to bottom, #1a237e, #0066cc)',
                                                        borderRadius: '2px',
                                                    }
                                                }}
                                            >
                                                Select Date and Time
                                            </Typography>
                                            <DateTimePicker 
                                                onStartDateChange={handleStartDateChange} 
                                                onEndDateChange={handleEndDateChange} 
                                            />
                                        </Grid2>

                                        {/* Text Area */}
                                        <Grid2 item sx={{ flex: 1 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 2, 
                                                    color: '#1a237e',
                                                    fontWeight: 500,
                                                    position: 'relative',
                                                    pl: 2,
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '4px',
                                                        height: '20px',
                                                        background: 'linear-gradient(to bottom, #1a237e, #0066cc)',
                                                        borderRadius: '2px',
                                                    }
                                                }}
                                            >
                                                Reason for OD
                                            </Typography>
                                            <Textarea
                                                size="lg"
                                                name="description"
                                                placeholder="Please provide detailed reason for On-Duty request..."
                                                minRows={4}
                                                value={formData.description}
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(5px)',
                                                    transition: 'all 0.3s ease',
                                                    // '&:hover': {
                                                    //     borderColor: '#1976d2',
                                                    //     background: 'rgba(255, 255, 255, 1)',
                                                    // },
                                                    '&:focus': {
                                                        borderColor: '#1976d2',
                                                        boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
                                                        background: 'rgba(255, 255, 255, 1)',
                                                    },
                                                    '&::placeholder': {
                                                        color: 'rgba(0, 0, 0, 0.6)',
                                                    }
                                                }}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </Grid2>

                                        {/* File Upload Component */}
                                        <Grid2 item sx={{ mt: 2 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 2, 
                                                    color: '#1a237e',
                                                    fontWeight: 500,
                                                    position: 'relative',
                                                    pl: 2,
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '4px',
                                                        height: '20px',
                                                        background: 'linear-gradient(to bottom, #1a237e, #0066cc)',
                                                        borderRadius: '2px',
                                                    }
                                                }}
                                            >
                                                Supporting Documents
                                            </Typography>
                                            <InputFileUpload 
                                                onFilesSelected={handleFileChange} 
                                                onUploadError={handleFileUploadError}
                                            />
                                        </Grid2>

                                        {/* Submit Button */}
                                        <Grid2 item sx={{ mt: 3 }}>
                                            <Button 
                                                type="submit" 
                                                variant="contained" 
                                                disabled={isLoading}
                                                sx={{ 
                                                    background: 'linear-gradient(45deg, #1a237e 30%, #0066cc 90%)',
                                                    py: 2,
                                                    px: 4,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    letterSpacing: '1px',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
                                                    // '&:hover': {
                                                    //     background: 'linear-gradient(45deg, #0066cc 30%, #1a237e 90%)',
                                                    //     transform: 'translateY(-2px)',
                                                    //     boxShadow: '0 6px 25px rgba(26, 35, 126, 0.3)',
                                                    // },
                                                    '&:disabled': {
                                                        background: 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)',
                                                        boxShadow: 'none',
                                                    }
                                                }} 
                                                fullWidth
                                            >
                                                {isLoading ? (
                                                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                                                ) : (
                                                    'Submit Application'
                                                )}
                                            </Button>
                                        </Grid2>
                                    </Grid2>
                                </StyledForm>
                            </CardContent>
                        </Card>

                        {/* OD History Table */}
                        <ODHistoryTable submissions={submissions} />
                    </Box>
                </Box>
                
                {/* Snackbar for notifications */}
                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseSnackbar} 
                        severity={snackbar.severity}
                        sx={{ 
                            width: '100%',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </StyledContainer>
        </Box>
    );
}