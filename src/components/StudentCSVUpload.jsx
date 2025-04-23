import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StudentCSVUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState([]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
            setMessage('');
            setErrors([]);
        } else {
            setError('Please select a valid CSV file');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/admin/upload-students', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setErrors(response.data.errors);
            }
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Upload Student CSV
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                    Upload a CSV file containing student details. The file should have the following columns:
                    StudentName, StudentEmail, Password, RollNumber, Mentor, ClassAdvisor
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {message && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                    >
                        Select File
                        <VisuallyHiddenInput
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                </Box>

                {file && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Selected file: {file.name}
                    </Typography>
                )}

                {errors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" color="error" gutterBottom>
                            Errors in CSV:
                        </Typography>
                        {errors.map((err, index) => (
                            <Alert key={index} severity="error" sx={{ mb: 1 }}>
                                Row: {JSON.stringify(err.row)} - {err.error}
                            </Alert>
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StudentCSVUpload;