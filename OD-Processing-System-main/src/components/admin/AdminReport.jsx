import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import StudentReport from '../form/StudentReport';
import TeacherReport from '../form/TeacherReport';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  }
}));

const StatCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  background: color === 'primary' ? 'linear-gradient(135deg, #0066cc 0%, #4e94e4 100%)' :
             color === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)' :
             color === 'warning' ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' :
             color === 'error' ? 'linear-gradient(135deg, #f44336 0%, #e57373 100%)' :
             'white',
  color: color ? 'white' : 'inherit',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  }
}));

const AdminReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [userReportLoading, setUserReportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch admin report
        const reportResponse = await axios.get('http://localhost:5000/api/reports/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch users for dropdown
        const usersResponse = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReport(reportResponse.data.report);
        setUsers(usersResponse.data.users || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin report data:', error);
        setError('Failed to load report data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
    setUserReport(null);
  };

  const fetchUserReport = async () => {
    if (!selectedUser) return;
    
    try {
      setUserReportLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reports/user/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserReport(response.data.report);
      setUserReportLoading(false);
    } catch (error) {
      console.error('Error fetching user report:', error);
      setError('Failed to load user report data.');
      setUserReportLoading(false);
    }
  };

  const getTimeRangeData = () => {
    if (!report) return null;
    
    switch (timeRange) {
      case 0:
        return { data: report.past7Days, label: 'Past 7 Days' };
      case 1:
        return { data: report.past30Days, label: 'Past 30 Days' };
      case 2:
        return { data: report.pastYear, label: 'Past Year' };
      case 3:
        return { data: report.lifetime, label: 'Lifetime' };
      default:
        return { data: report.past7Days, label: 'Past 7 Days' };
    }
  };

  const currentData = getTimeRangeData();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !report) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0066cc' }}>
        System-wide OD Application Statistics
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Past 7 Days" />
          <Tab label="Past 30 Days" />
          <Tab label="Past Year" />
          <Tab label="Lifetime" />
        </Tabs>
      </Paper>

      {currentData && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
            {currentData.label} Summary
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="primary">
                <Typography variant="h3" fontWeight="bold">
                  {currentData.data.total}
                </Typography>
                <Typography variant="subtitle1">
                  Total Requests
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="success">
                <Typography variant="h3" fontWeight="bold">
                  {currentData.data.approved}
                </Typography>
                <Typography variant="subtitle1">
                  Approved
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="error">
                <Typography variant="h3" fontWeight="bold">
                  {currentData.data.rejected}
                </Typography>
                <Typography variant="subtitle1">
                  Rejected
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="warning">
                <Typography variant="h3" fontWeight="bold">
                  {currentData.data.pending}
                </Typography>
                <Typography variant="subtitle1">
                  Pending
                </Typography>
              </StatCard>
            </Grid>
          </Grid>

          <StyledCard sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Approval Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Box sx={{ 
                  position: 'relative', 
                  display: 'inline-flex',
                  width: '150px',
                  height: '150px'
                }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={currentData.data.total > 0 ? (currentData.data.approved / currentData.data.total) * 100 : 0} 
                    size={150}
                    thickness={5}
                    sx={{ color: '#4caf50' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" component="div" color="text.secondary">
                      {currentData.data.total > 0 ? 
                        `${Math.round((currentData.data.approved / currentData.data.total) * 100)}%` : 
                        '0%'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </>
      )}

      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0066cc' }}>
        User-specific Reports
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Autocomplete
          options={users}
          getOptionLabel={(option) => `${option.name} (${option.role})`}
          sx={{ flex: 1 }}
          renderInput={(params) => <TextField {...params} label="Select User" />}
          value={selectedUser}
          onChange={handleUserChange}
        />
        <Button 
          variant="contained" 
          onClick={fetchUserReport}
          disabled={!selectedUser || userReportLoading}
          sx={{ minWidth: '120px', height: { sm: '56px' } }}
        >
          {userReportLoading ? <CircularProgress size={24} /> : 'View Report'}
        </Button>
      </Box>

      {userReport && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Report for {userReport.userName} ({userReport.userEmail})
            </Typography>
            
            {userReport.userType === 'student' ? (
              <Box sx={{ mt: 2 }}>
                <StudentReport reportData={userReport} />
              </Box>
            ) : userReport.userType === 'teacher' ? (
              <Box sx={{ mt: 2 }}>
                <TeacherReport reportData={userReport} />
              </Box>
            ) : (
              <Typography>No report data available for this user type.</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminReport;