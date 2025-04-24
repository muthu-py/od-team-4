import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { Grid, Container, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Badge } from '@mui/material';
import * as ROUTES from '../../constants/routes';
import styled from '@emotion/styled';

// Sample teacher profile data
const teacherProfile = {
    name: 'Dr. Jane Doe',
    email: 'jane.doe@example.com',
    department: 'Mathematics',
    phone: '123-456-7890'
};

// Import the initial requests data
const menteesinitialRequests = [
    {
        id: 1,
        name: 'John Doe',
        odSubmissionStatus: 'Pending',
        // ... other fields
    },
    {
        id: 2,
        name: 'Jane Smith',
        odSubmissionStatus: 'Pending',
        // ... other fields
    }
    // ... other requests
];

const studentinitialRequests = [
    {
        id: 1,
        name: 'John Doe',
        odSubmissionStatus: 'Pending',
        // ... other fields
    },
    {
        id: 2,
        name: 'Jane Smith',
        odSubmissionStatus: 'Pending',
        // ... other fields
    },
    {
        id: 3,
        name: 'Jane Smith',
        odSubmissionStatus: 'Pending',
        // ... other fields
    }
    // ... other requests
];
// Updated profile section styling
const ProfileLabel = ({ children }) => (
    <Typography 
        component="span" 
        sx={{ 
            color: '#666',
            minWidth: '120px',
            display: 'inline-block',
            fontWeight: 500
        }}
    >
        {children}
    </Typography>
);

const ProfileValue = ({ children }) => (
    <Typography 
        component="span" 
        sx={{ 
            color: '#333',
            fontWeight: 400
        }}
    >
        {children}
    </Typography>
);

const PageWrapper = styled('div')({
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(145deg, #f5f7fa 0%, #e8edf5 100%)',
    display: 'flex',
    flexDirection: 'column'
});

const StyledContainer = styled(Container)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column'
}));

const MainContent = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
});

const ProfileCard = styled(Card)({
    marginBottom: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0'
});

const ActionCard = styled(Card)({
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
    }
});

export default function TeacherHome() {
    // Get the count of pending requests
    const menteespendingCount = menteesinitialRequests.filter(
        request => request.odSubmissionStatus === 'Pending'
    ).length;

    const studentpendingCount = studentinitialRequests.filter(
        request => request.odSubmissionStatus === 'Pending'
    ).length;

    const cards = [
        {
            id: 1,
            title: 'Mentees',
            description: 'View Mentees\' OD submissions',
            path: ROUTES.MENTEES
        },
        {
            id: 2,
            title: 'Students',
            description: 'View Students\' OD submissions',
            path: ROUTES.STUDENTS
        }
    ];

    return (
        <PageWrapper>
            <StyledContainer maxWidth="lg">
                <MainContent>
                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 600,
                                color: '#015498',
                                mb: 1
                            }}
                        >
                            Dashboard
                        </Typography>
                        <Divider />
                    </Box>

                    <ProfileCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Typography 
                                    variant="h5" 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: '#015498',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    Profile Information
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ProfileLabel>Name:</ProfileLabel>
                                    <ProfileValue>{teacherProfile.name}</ProfileValue>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ProfileLabel>Email:</ProfileLabel>
                                    <ProfileValue>{teacherProfile.email}</ProfileValue>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ProfileLabel>Department:</ProfileLabel>
                                    <ProfileValue>{teacherProfile.department}</ProfileValue>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ProfileLabel>Phone:</ProfileLabel>
                                    <ProfileValue>{teacherProfile.phone}</ProfileValue>
                                </Box>
                            </Box>
                        </CardContent>
                    </ProfileCard>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {cards.map((card) => (
                            <Grid item xs={12} sm={6} key={card.id}>
                                <Link 
                                    to={card.path} 
                                    style={{ 
                                        textDecoration: 'none',
                                        display: 'block',
                                        height: '100%'
                                    }}
                                >
                                    <ActionCard>
                                        <CardActionArea 
                                            sx={{ 
                                                height: '100%',
                                                padding: 1
                                            }}
                                        >
                                            <CardContent 
                                                sx={{ 
                                                    padding: 3,
                                                    '&:last-child': { 
                                                        paddingBottom: 3 
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', mb: 2 }}>
                                                    {card.id === 1 && menteespendingCount > 0 && (
                                                        <Badge 
                                                            badgeContent={menteespendingCount}
                                                            color="error"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                '& .MuiBadge-badge': {
                                                                    fontSize: '0.75rem',
                                                                    height: '22px',
                                                                    minWidth: '22px',
                                                                    borderRadius: '11px',
                                                                    fontWeight: 600
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    {card.id === 2 && studentpendingCount > 0 && (
                                                        <Badge 
                                                            badgeContent={studentpendingCount}
                                                            color="error"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                '& .MuiBadge-badge': {
                                                                    fontSize: '0.75rem',
                                                                    height: '22px',
                                                                    minWidth: '22px',
                                                                    borderRadius: '11px',
                                                                    fontWeight: 600
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    <Typography 
                                                        variant="h5" 
                                                        component="div"
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            color: 'text.primary',
                                                            letterSpacing: '-0.5px'
                                                        }}
                                                    >
                                                        {card.title}
                                                    </Typography>
                                                </Box>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        mt: 1,
                                                        fontSize: '0.95rem',
                                                        lineHeight: 1.5
                                                    }}
                                                >
                                                    {card.description}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </ActionCard>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </MainContent>
            </StyledContainer>
        </PageWrapper>
    );
}
//when the mentees card is clicks it should point out to mentees.jsx file
