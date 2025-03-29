import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const TeacherCard = ({ teacher }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{teacher.name}</Typography>
                <Typography variant="body2">{teacher.subject}</Typography>
            </CardContent>
        </Card>
    );
};

export default TeacherCard; 