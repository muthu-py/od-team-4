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
});

// Update AppBar styling
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#0066cc',
  boxShadow: 'none',
});

// Update container styling
const StyledContainer = styled(Container)({
  '& .MuiCard-root': {
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    border: '1px solid #e0e0e0',
  },
});

// Update page title styling
const PageTitle = styled(Typography)({
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '3px',
    backgroundColor: '#0066cc',
  },
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
        <StyledContainer maxWidth="md">
            <Box sx={{ 
                mt: 4,
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <PageTitle 
                    variant="h4" 
                    fontWeight="500" 
                    sx={{
                        color: "#0066cc",
                        mb: 4,
                        textAlign: 'center',
                    }} 
                >
                    OD FORM
                </PageTitle>

                <Card sx={{ 
                    p: 3, 
                    width: '100%',
                    bgcolor: '#ffffff',
                    mb: 4
                }}>
                    <CardContent>
                        <StyledForm action="/ODForm" method="POST" onSubmit={handleSubmit}>
                            <Grid2 
                                container 
                                spacing={4} 
                                direction="column"
                                sx={{ 
                                    '& .MuiGrid2-root': { 
                                        transition: 'transform 0.2s',
                                        px: 2
                                    }
                                }}
                            >
                                {/* DateTime Picker */}
                                <Grid2 item>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                        Select Date and Time
                                    </Typography>
                                    <DateTimePicker 
                                        onStartDateChange={handleStartDateChange} 
                                        onEndDateChange={handleEndDateChange} 
                                    />
                                </Grid2>

                                {/* Text Area */}
                                <Grid2 item>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                        Reason for OD
                                    </Typography>
                                    <Textarea
                                        size="lg"
                                        name="description"
                                        placeholder="Please provide detailed reason for On-Duty request..."
                                        minRows={4}
                                        sx={{
                                            borderRadius: 1,
                                            fontSize: '1rem',
                                            '&:hover': {
                                                borderColor: '#1976d2',
                                            },
                                            '&:focus': {
                                                borderColor: '#1976d2',
                                                boxShadow: '0 0 0 2px rgba(25,118,210,0.2)',
                                            }
                                        }}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </Grid2>

                                {/* File Upload Component */}
                                <Grid2 item sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                        Supporting Documents
                                    </Typography>
                                    <InputFileUpload 
                                        onFilesSelected={handleFileChange} 
                                        onUploadError={handleFileUploadError}
                                    />
                                </Grid2>
                                
                                {/* Submit Button with loading state */}
                                <Grid2 item sx={{ mt: 3 }}>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        disabled={isLoading}
                                        sx={{ 
                                            backgroundColor: "#1976d2",
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                backgroundColor: '#1565c0',
                                                boxShadow: '0 6px 12px rgba(25,118,210,0.3)',
                                            }
                                        }} 
                                        fullWidth
                                    >
                                        {isLoading ? (
                                            <CircularProgress size={24} color="inherit" />
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
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
}