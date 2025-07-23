import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { Grid, Container, Divider, Paper, Button, Tabs, Tab, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { Badge } from '@mui/material';
import * as ROUTES from '../../constants/routes';
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';
import TeacherCard from '../../components/TeacherCard/TeacherCard';
import ODStatistics from '../../components/TeacherCard/ODStatistics';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f5f7fa 0%, #e8edf5 100%)',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& h1': {
        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        letterSpacing: '0.5px',
    },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: theme.spacing(1),
}));

const ProfileRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
}));

const ActionCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: '16px',
    background: 'white',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
}));

const CardDescription = styled(Typography)(({ theme }) => ({
            color: '#666',
    fontSize: '0.95rem',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    color: '#1976d2',
}));

export default function TeacherHome() {
    const [teacherProfile, setTeacherProfile] = useState({
        name: 'Loading...',
        email: 'Loading...',
        department: 'Loading...',
        phone: 'Loading...'
    });
    const [activeTab, setActiveTab] = useState(0);
    const [odRequests, setOdRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                setTeacherProfile({
                    name: userData.name || 'Not available',
                    email: userData.email || 'Not available',
                    department: userData.department || 'IT',
                    phone: userData.phone || 'Not available'
                });
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }, []);

    useEffect(() => {
        fetchODRequests();
    }, []);

    const fetchODRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/teacher/mentee-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOdRequests(response.data.requests || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching OD requests:', error);
            setError('Failed to fetch OD requests');
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/teacher/approve-request/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchODRequests();
        } catch (error) {
            console.error('Error approving OD request:', error);
        }
    };

    const handleReject = async (requestId, reason) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/teacher/reject-request/${requestId}`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchODRequests();
        } catch (error) {
            console.error('Error rejecting OD request:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const cards = [
        {
            id: 1,
            title: 'Mentees',
            description: 'View and manage your mentees\' OD submissions',
            path: ROUTES.MENTEES,
            icon: <GroupIcon sx={{ fontSize: 28 }} />,
        },
        {
            id: 2,
            title: 'Students',
            description: 'Review and process student OD applications',
            path: ROUTES.STUDENTS,
            icon: <SchoolIcon sx={{ fontSize: 28 }} />,
        }
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <StyledContainer maxWidth="lg">
            <DashboardHeader>
                <Typography variant="h4" component="h1">
                    Teacher Dashboard
                    </Typography>
                <Divider sx={{ mt: 2, mb: 4, opacity: 0.1 }} />
            </DashboardHeader>

            <ProfileCard elevation={0}>
                    <CardContent sx={{ p: 3 }}>
                    <CardTitle variant="h5" gutterBottom>
                                Profile Information
                    </CardTitle>
                    <ProfileSection>
                        <ProfileRow>
                            <IconWrapper>
                                <AccountCircleIcon />
                            </IconWrapper>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                                <Typography variant="body1">{teacherProfile.name}</Typography>
                            </Box>
                        </ProfileRow>
                        <ProfileRow>
                            <IconWrapper>
                                <EmailIcon />
                            </IconWrapper>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography variant="body1">{teacherProfile.email}</Typography>
                            </Box>
                        </ProfileRow>
                        <ProfileRow>
                            <IconWrapper>
                                <BusinessIcon />
                            </IconWrapper>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                                <Typography variant="body1">{teacherProfile.department}</Typography>
                            </Box>
                        </ProfileRow>
                        <ProfileRow>
                            <IconWrapper>
                                <PhoneIcon />
                            </IconWrapper>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                                <Typography variant="body1">{teacherProfile.phone}</Typography>
                            </Box>
                        </ProfileRow>
                    </ProfileSection>
                    </CardContent>
            </ProfileCard>

            <Grid container spacing={4} sx={{ mt: 4, mb: 4 }}>
                    {cards.map((card) => (
                    <Grid item xs={12} sm={6} key={card.id}>
                        <Link to={card.path} style={{ textDecoration: 'none' }}>
                            <ActionCard>
                                <CardActionArea>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <IconWrapper>
                                                {card.icon}
                                            </IconWrapper>
                                            <CardTitle variant="h6">
                                                    {card.title}
                                            </CardTitle>
                                            </Box>
                                        <CardDescription>
                                                {card.description}
                                        </CardDescription>
                                        </CardContent>
                                    </CardActionArea>
                            </ActionCard>
                            </Link>
                        </Grid>
                    ))}
                </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Statistics" />
                    <Tab label="Pending Requests" />
                    <Tab label="All Requests" />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <ODStatistics />
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {odRequests
                        .filter(request => request.odSubmissionStatus === 'Pending')
                        .map(request => (
                            <Grid item xs={12} key={request._id}>
                                <TeacherCard
                                    request={request}
                                    onApprove={() => handleApprove(request._id)}
                                    onReject={(reason) => handleReject(request._id, reason)}
                                />
                            </Grid>
                        ))}
                </Grid>
            )}

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    {odRequests.map(request => (
                        <Grid item xs={12} key={request._id}>
                            <TeacherCard
                                request={request}
                                onApprove={() => handleApprove(request._id)}
                                onReject={(reason) => handleReject(request._id, reason)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </StyledContainer>
    );
}
