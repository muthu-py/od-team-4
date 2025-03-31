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
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

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

const StudentReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/reports/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReport(response.data.report);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student report:', error);
        setError('Failed to load report data. Please try again later.');
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
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

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0066cc' }}>
        OD Application Statistics
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

          <StyledCard>
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
    </Box>
  );
};

export default StudentReport;