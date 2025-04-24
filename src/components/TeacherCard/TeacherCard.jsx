import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Button } from '@mui/material';
import axios from 'axios';

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
        <Card>
            <CardContent>
                <Typography variant="h5">{request.name}</Typography>
                <Typography variant="body2">{request.subject}</Typography>
            </CardContent>
        </Card>
    );
};

export default TeacherCard; 