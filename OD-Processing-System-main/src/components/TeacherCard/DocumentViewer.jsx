import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '90%',
        maxWidth: '1000px',
        height: '90vh',
        maxHeight: '800px',
        borderRadius: '12px',
        overflow: 'hidden',
    }
}));

const StyledDialogTitle = styled(DialogTitle)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'linear-gradient(45deg, #1a237e 30%, #0066cc 90%)',
    color: 'white',
    '& .MuiTypography-root': {
        fontSize: '1.2rem',
        fontWeight: 600,
    }
});

const StyledDialogContent = styled(DialogContent)({
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
});

const DocumentViewer = ({ open, onClose, documentUrl, fileName }) => {
    return (
        <StyledDialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <StyledDialogTitle>
                <Typography>View Document</Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                    sx={{
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </StyledDialogTitle>
            <StyledDialogContent>
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        File Name: {fileName || 'Document'}
                    </Typography>
                    <Box sx={{ 
                        flex: 1, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5'
                    }}>
                        <iframe
                            src={documentUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            title="Document Viewer"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                                }
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            href={documentUrl}
                            target="_blank"
                            sx={{
                                background: 'linear-gradient(45deg, #1a237e 30%, #0066cc 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #0066cc 30%, #1a237e 90%)',
                                }
                            }}
                        >
                            Download
                        </Button>
                    </Box>
                </Box>
            </StyledDialogContent>
        </StyledDialog>
    );
};

export default DocumentViewer; 