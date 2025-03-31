import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
    marginBottom: theme.spacing(2)
}));

const NavButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 1),
    color: 'white',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)'
    }
}));

const StudentNav = () => {
    return (
        <StyledAppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Student Portal
                </Typography>
                <Box>
                    <NavButton
                        component={Link}
                        to="/student/home"
                        color="inherit"
                    >
                        Home
                    </NavButton>
                    <NavButton
                        component={Link}
                        to="/student/od-form"
                        color="inherit"
                    >
                        OD Form
                    </NavButton>
                    <NavButton
                        component={Link}
                        to="/student/reports"
                        color="inherit"
                        startIcon={<AssessmentIcon />}
                    >
                        Reports
                    </NavButton>
                    <NavButton
                        component={Link}
                        to="/logout"
                        color="inherit"
                    >
                        Logout
                    </NavButton>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default StudentNav; 