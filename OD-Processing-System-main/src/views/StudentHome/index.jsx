import React, { useState, useEffect } from 'react';
import Form from '../../components/form/Form';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Container, 
    Grid, 
    Divider,
    Avatar,
    Paper,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';

// Styled components for profile section
const ProfileCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 8px 12px rgba(0,0,0,0.08)',
    }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #0066cc 0%, #4e94e4 100%)',
    padding: theme.spacing(3),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3)
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    color: '#0066cc',
    fontSize: '2rem',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    border: '3px solid white'
}));

const InfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transform: 'scale(1.02)',
    }
}));

const InfoIcon = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2),
    color: '#0066cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

// Add this import at the top with other imports
import StudentReport from '../../components/form/StudentReport';

// Add this to the component, right before the Form component
<Box sx={{ mb: 4 }}>
  <StudentReport />
</Box>

export default function StudentHome() {
    const [studentProfile, setStudentProfile] = useState({
        name: 'Loading...',
        email: 'Loading...',
        department: 'Loading...',
        roll_no: 'Loading...',
        mentor: 'Loading...',
        classAdvisor: 'Loading...'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    // Extract mentor and class advisor names if they exist as objects
                    const mentorName = data.profile.mentor && typeof data.profile.mentor === 'object' 
                        ? data.profile.mentor.name || 'Not assigned'
                        : data.profile.mentor || 'Not assigned';
                    
                    const classAdvisorName = data.profile.cls_advisor && typeof data.profile.cls_advisor === 'object'
                        ? data.profile.cls_advisor.name || 'Not assigned'
                        : data.profile.cls_advisor || 'Not assigned';
                    
                    setStudentProfile({
                        name: data.profile.name || 'Not available',
                        email: data.profile.email || 'Not available',
                        department: data.profile.department || 'IT',
                        roll_no: data.profile.roll_no || 'Not available',
                        mentor: mentorName,
                        classAdvisor: classAdvisorName
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    // Get first letter of name for avatar
    const getInitials = (name) => {
        return name && name !== 'Loading...' && name !== 'Not available' 
            ? name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'S';
    };

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Profile Section */}
                <ProfileCard sx={{ mb: 4 }}>
                    <ProfileHeader>
                        <StyledAvatar>{getInitials(studentProfile.name)}</StyledAvatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {studentProfile.name}
                            </Typography>
                            <Chip 
                                label="Student" 
                                size="small" 
                                icon={<SchoolIcon />} 
                                sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)', 
                                    color: 'white',
                                    fontWeight: 'bold',
                                    backdropFilter: 'blur(10px)'
                                }} 
                            />
                        </Box>
                    </ProfileHeader>
                    
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <InfoItem>
                                    <InfoIcon>
                                        <EmailIcon />
                                    </InfoIcon>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {studentProfile.email}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                                
                                <InfoItem>
                                    <InfoIcon>
                                        <BusinessIcon />
                                    </InfoIcon>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Department
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {studentProfile.department}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <InfoItem>
                                    <InfoIcon>
                                        <BadgeIcon />
                                    </InfoIcon>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Roll Number
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {studentProfile.roll_no}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                                
                                <InfoItem>
                                    <InfoIcon>
                                        <SupervisorAccountIcon />
                                    </InfoIcon>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Mentor
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {studentProfile.mentor}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                                
                                <InfoItem>
                                    <InfoIcon>
                                        <PersonIcon />
                                    </InfoIcon>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Class Advisor
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {studentProfile.classAdvisor}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                            </Grid>
                        </Grid>
                    </CardContent>
                </ProfileCard>
                
                {/* OD Application Form */}
                <Form />
            </Container>
        </>
    );
}