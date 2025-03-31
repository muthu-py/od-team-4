import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)'
    }
}));

const StatBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    borderRadius: '10px',
    background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
    marginBottom: theme.spacing(2)
}));

const Reports = () => {
    const [period, setPeriod] = useState('7days');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userRole = localStorage.getItem('userRole');

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `/api/reports/${userRole}?period=${period}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setReport(response.data.report);
        } catch (err) {
            setError('Failed to fetch report data');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [period]);

    const renderStudentReport = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    Your OD Application Report
                </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="primary">
                        Total Submitted
                    </Typography>
                    <Typography variant="h4">
                        {report?.totalSubmitted || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="success.main">
                        Approved
                    </Typography>
                    <Typography variant="h4">
                        {report?.approved || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="error.main">
                        Rejected
                    </Typography>
                    <Typography variant="h4">
                        {report?.rejected || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="warning.main">
                        Pending
                    </Typography>
                    <Typography variant="h4">
                        {report?.pending || 0}
                    </Typography>
                </StatBox>
            </Grid>
        </Grid>
    );

    const renderTeacherReport = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    Teacher Report
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Mentee Applications
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>{report?.menteeApplications?.total || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Approved</TableCell>
                                        <TableCell>{report?.menteeApplications?.approved || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Rejected</TableCell>
                                        <TableCell>{report?.menteeApplications?.rejected || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Pending</TableCell>
                                        <TableCell>{report?.menteeApplications?.pending || 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </StyledCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Class Student Applications
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>{report?.classStudentApplications?.total || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Approved</TableCell>
                                        <TableCell>{report?.classStudentApplications?.approved || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Rejected</TableCell>
                                        <TableCell>{report?.classStudentApplications?.rejected || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Pending</TableCell>
                                        <TableCell>{report?.classStudentApplications?.pending || 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </StyledCard>
            </Grid>
            <Grid item xs={12}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Your Actions
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total Actions</TableCell>
                                        <TableCell>{report?.teacherActions?.total || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Approved</TableCell>
                                        <TableCell>{report?.teacherActions?.approved || 0}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Rejected</TableCell>
                                        <TableCell>{report?.teacherActions?.rejected || 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </StyledCard>
            </Grid>
        </Grid>
    );

    const renderAdminReport = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    System-wide OD Report
                </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="primary">
                        Total Submitted
                    </Typography>
                    <Typography variant="h4">
                        {report?.totalSubmitted || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="success.main">
                        Approved
                    </Typography>
                    <Typography variant="h4">
                        {report?.approved || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="error.main">
                        Rejected
                    </Typography>
                    <Typography variant="h4">
                        {report?.rejected || 0}
                    </Typography>
                </StatBox>
            </Grid>
            <Grid item xs={12} md={3}>
                <StatBox>
                    <Typography variant="h6" color="warning.main">
                        Pending
                    </Typography>
                    <Typography variant="h4">
                        {report?.pending || 0}
                    </Typography>
                </StatBox>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            <FormControl sx={{ mb: 3, minWidth: 200 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                    value={period}
                    label="Time Period"
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <MenuItem value="7days">Last 7 Days</MenuItem>
                    <MenuItem value="30days">Last 30 Days</MenuItem>
                    <MenuItem value="year">Last Year</MenuItem>
                    <MenuItem value="lifetime">Lifetime</MenuItem>
                </Select>
            </FormControl>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    {userRole === 'student' && renderStudentReport()}
                    {userRole === 'teacher' && renderTeacherReport()}
                    {userRole === 'admin' && renderAdminReport()}
                </>
            )}
        </Box>
    );
};

export default Reports; 