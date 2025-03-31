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
    background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
    boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
    marginBottom: theme.spacing(2)
}));

const NavButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 1),
    color: 'white',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)'
    }
}));

const AdminNav = () => {
    return (
        <StyledAppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Admin Portal
                </Typography>
                <Box>
                    <NavButton
                        component={Link}
                        to="/admin/home"
                        color="inherit"
                    >
                        Home
                    </NavButton>
                    <NavButton
                        component={Link}
                        to="/admin/users"
                        color="inherit"
                    >
                        Manage Users
                    </NavButton>
                    <NavButton
                        component={Link}
                        to="/admin/reports"
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

export default AdminNav; 