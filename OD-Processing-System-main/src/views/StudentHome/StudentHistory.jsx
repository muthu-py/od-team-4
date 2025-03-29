import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ODHistoryTable from '../../components/form/ODHistoryTable';
import axios from 'axios';

export default function StudentHistory() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('http://localhost:5000/api/od-applications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setApplications(response.data.applications || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching OD applications:', error);
        setError(error.message || 'Failed to load applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 1, 
            color: '#0066cc',
            fontWeight: 'bold'
          }}
        >
          OD Application History
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View and track all your submitted On-Duty applications
        </Typography>
      </Box>

      {loading ? (
        <Typography>Loading your applications...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <ODHistoryTable submissions={applications} />
      )}
    </Container>
  );
}