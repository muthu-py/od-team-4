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
        <Container maxWidth="lg">
            <Box sx={{ 
                padding: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                {/* Dashboard Header */}
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

                {/* Enhanced Profile Section */}
                <Card 
                    variant="outlined" 
                    sx={{ 
                        mb: 4,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0'
                    }}
                >
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
                </Card>

                {/* Cards Grid */}
                <Grid 
                    container 
                    spacing={3} 
                    justifyContent="center"
                    alignItems="stretch"
                >
                    {cards.map((card) => (
                        <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            key={card.id} 
                            sx={{ 
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <Link 
                                to={card.path} 
                                style={{ 
                                    textDecoration: 'none',
                                    width: '100%',
                                    maxWidth: '360px',
                                    color: 'grey'
                                }}
                            >
                                <Card 
                                    variant="outlined" 
                                    sx={{ 
                                        height: '100%',
                                        position: 'relative',
                                        borderRadius: 2,
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
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
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}
//when the mentees card is clicks it should point out to mentees.jsx file
