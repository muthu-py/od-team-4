import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Box,
    Typography,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    backgroundColor: 'rgba(26, 35, 126, 0.03)',
    color: '#1a237e',
    fontSize: '0.95rem',
    padding: '16px',
    borderBottom: '2px solid rgba(26, 35, 126, 0.1)',
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    '&:first-of-type': {
        borderTopLeftRadius: '8px',
    },
    '&:last-of-type': {
        borderTopRightRadius: '8px',
    }
}));

const ContentTableCell = styled(TableCell)({
    fontSize: '0.9rem',
    padding: '16px',
    color: '#37474f',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
});

const StyledTableContainer = styled(TableContainer)({
    borderRadius: '12px',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    height: 'calc(100vh - 300px)',
    '&::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '5px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(26, 35, 126, 0.3)',
        borderRadius: '5px',
        '&:hover': {
            background: 'rgba(26, 35, 126, 0.5)',
        },
    },
});

const StyledCard = styled(Card)({
    background: 'transparent',
    boxShadow: 'none',
    position: 'relative',
    width: '100%',
    height: '100%',
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
        pointerEvents: 'none',
    }
});

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

const FilterContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    alignItems: 'center',
    flexWrap: 'wrap'
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 200,
    background: 'white',
    borderRadius: '8px',
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(26, 35, 126, 0.2)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(26, 35, 126, 0.3)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#1a237e',
        },
    }
}));

const ODHistoryTable = ({ submissions = [] }) => {
    const [selectedOD, setSelectedOD] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [timePeriod, setTimePeriod] = useState('lifetime');
    const [status, setStatus] = useState('all');
    const [semester, setSemester] = useState('all');
    const [filteredSubmissions, setFilteredSubmissions] = useState(submissions);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [previousSemesters, setPreviousSemesters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [timePeriod, status, semester]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/od-applications?timePeriod=${timePeriod}&status=${status}&semester=${semester}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setFilteredSubmissions(response.data.applications || []);
            setCurrentSemester(response.data.currentSemester);
            setPreviousSemesters(response.data.previousSemesters || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (od) => {
        setSelectedOD(od);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOD(null);
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSessionDisplay = (startSession, endSession) => {
        if (startSession === endSession) {
            return startSession === 'fullday' ? 'Full Day' : 
                   startSession === 'forenoon' ? 'Forenoon' : 'Afternoon';
        }
        return `${startSession === 'forenoon' ? 'Forenoon' : 'Afternoon'} to ${endSession === 'forenoon' ? 'Forenoon' : 'Afternoon'}`;
    };

    const handleTimePeriodChange = (event) => {
        setTimePeriod(event.target.value);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    return (
        <StyledCard>
            <CardContent sx={{ 
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#1a237e',
                            fontWeight: 600,
                            position: 'relative',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            pl: 2,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '4px',
                                height: '24px',
                                background: 'linear-gradient(to bottom, #1a237e, #0066cc)',
                                borderRadius: '2px',
                            }
                        }}
                    >
                        Application History
                    </Typography>
                </Box>

                <FilterContainer>
                    <StyledFormControl>
                        <InputLabel>Time Period</InputLabel>
                        <Select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            label="Time Period"
                        >
                            <MenuItem value="lifetime">Lifetime</MenuItem>
                            <MenuItem value="7days">Last 7 Days</MenuItem>
                            <MenuItem value="30days">Last 30 Days</MenuItem>
                            <MenuItem value="1year">Last Year</MenuItem>
                        </Select>
                    </StyledFormControl>

                    <StyledFormControl>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </StyledFormControl>

                    <StyledFormControl>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            label="Semester"
                        >
                            <MenuItem value="all">All Semesters</MenuItem>
                            {currentSemester && (
                                <MenuItem value={currentSemester}>
                                    Current Semester ({currentSemester})
                                </MenuItem>
                            )}
                            {previousSemesters.map((sem) => (
                                <MenuItem key={sem} value={sem}>
                                    Semester {sem}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </FilterContainer>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <StyledTableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell width="8%">S.No</StyledTableCell>
                                    <StyledTableCell width="20%">Date</StyledTableCell>
                                    <StyledTableCell width="15%">Session</StyledTableCell>
                                    <StyledTableCell width="25%">Purpose</StyledTableCell>
                                    <StyledTableCell width="15%">Status</StyledTableCell>
                                    <StyledTableCell width="17%">Remarks</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <ContentTableCell 
                                            colSpan={6} 
                                            align="center" 
                                            sx={{ 
                                                py: 8,
                                                color: 'rgba(0, 0, 0, 0.5)',
                                                fontStyle: 'italic',
                                                background: 'rgba(26, 35, 126, 0.02)',
                                            }}
                                        >
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Typography variant="body1">
                                                    No OD applications found
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                                                    Submit your first application using the form above
                                                </Typography>
                                            </Box>
                                        </ContentTableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map((submission, index) => (
                                        <TableRow 
                                            key={index}
                                            onClick={() => handleRowClick(submission)}
                                            sx={{ 
                                                cursor: 'pointer',
                                                '&:nth-of-type(even)': {
                                                    backgroundColor: 'rgba(26, 35, 126, 0.01)'
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(26, 35, 126, 0.05)'
                                                }
                                            }}
                                        >
                                            <ContentTableCell>
                                                <Typography sx={{ 
                                                    fontWeight: 500,
                                                    color: '#1a237e',
                                                    textAlign: 'center'
                                                }}>
                                                    {index + 1}
                                                </Typography>
                                            </ContentTableCell>
                                            <ContentTableCell>
                                                <Box sx={{ fontWeight: 500 }}>
                                                    {formatDate(submission.startDateTime)}
                                                    {submission.endDateTime !== submission.startDateTime && (
                                                        <>
                                                            <Box component="span" sx={{ color: 'rgba(0, 0, 0, 0.4)', mx: 1 }}>
                                                                to
                                                            </Box>
                                                            {formatDate(submission.endDateTime)}
                                                        </>
                                                    )}
                                                </Box>
                                            </ContentTableCell>
                                            <ContentTableCell>
                                                {getSessionDisplay(submission.startSession, submission.endSession)}
                                            </ContentTableCell>
                                            <ContentTableCell>{submission.description}</ContentTableCell>
                                            <ContentTableCell>
                                                <Chip 
                                                    label={submission.status}
                                                    color={getStatusColor(submission.status)}
                                                    size="small"
                                                    sx={{ 
                                                        minWidth: 85,
                                                        fontWeight: 500,
                                                        borderRadius: '4px',
                                                        textTransform: 'capitalize',
                                                        '& .MuiChip-label': {
                                                            px: 2
                                                        }
                                                    }}
                                                />
                                            </ContentTableCell>
                                            <ContentTableCell>
                                                {submission.mentorApproval?.remarks || 
                                                 submission.classAdvisorApproval?.remarks || 
                                                 (submission.status === 'Pending' ? 'Under review' : 
                                                  submission.status === 'Approved' ? 'Application approved' : 
                                                  'Request rejected')}
                                            </ContentTableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                )}
            </CardContent>

            {/* Details Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
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
                    OD Application Details
                    <Button onClick={handleCloseDialog} sx={{ color: 'white' }}>
                        ✕
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedOD && (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Date Range
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {formatDate(selectedOD.startDateTime)}
                                        {selectedOD.endDateTime !== selectedOD.startDateTime && (
                                            <>
                                                <Box component="span" sx={{ mx: 1, color: 'rgba(0, 0, 0, 0.4)' }}>
                                                    to
                                                </Box>
                                                {formatDate(selectedOD.endDateTime)}
                                            </>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Session
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {getSessionDisplay(selectedOD.startSession, selectedOD.endSession)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Purpose
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedOD.description}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Status
                                    </Typography>
                                    <Chip 
                                        label={selectedOD.status}
                                        color={getStatusColor(selectedOD.status)}
                                        size="small"
                                        sx={{ 
                                            minWidth: 85,
                                            fontWeight: 500,
                                            borderRadius: '4px',
                                            textTransform: 'capitalize',
                                            mb: 2
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Remarks
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedOD.mentorApproval?.remarks || 
                                         selectedOD.classAdvisorApproval?.remarks || 
                                         (selectedOD.status === 'Pending' ? 'Under review' : 
                                          selectedOD.status === 'Approved' ? 'Application approved' : 
                                          'Request rejected')}
                                    </Typography>
                                </Grid>
                                {selectedOD.fileUrls && selectedOD.fileUrls.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                                            Attached Files
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {selectedOD.fileUrls.map((file, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outlined"
                                                    size="small"
                                                    href={file}
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
                                                    View File {index + 1}
                                                </Button>
                                            ))}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ color: '#1a237e' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default ODHistoryTable;