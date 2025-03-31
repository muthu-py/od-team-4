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
  ToggleButtonGroup,
  ToggleButton
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

// Update the component to accept reportData prop
const TeacherReport = ({ reportData }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(0);
  const [studentType, setStudentType] = useState('combined');

  useEffect(() => {
    // If reportData is provided, use it directly
    if (reportData) {
      setReport(reportData);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/reports/teacher', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReport(response.data.report);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher report:', error);
        setError('Failed to load report data. Please try again later.');
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportData]);

  // Rest of the component remains the same