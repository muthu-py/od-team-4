import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Box,
    Typography,
    Card,
    CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontSize: '0.95rem',
    padding: '16px'
}));

const ContentTableCell = styled(TableCell)({
    fontSize: '0.9rem',
    padding: '16px'
});

const ODHistoryTable = ({ submissions = [] }) => {
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

    // Add a function to get the appropriate remarks based on status
    const getDefaultRemarks = (status, existingRemarks) => {
        // If there are already specific remarks provided, use those
        if (existingRemarks && existingRemarks !== 'Under review' && existingRemarks !== 'Request rejected') {
            return existingRemarks;
        }
        
        // Otherwise, provide default remarks based on status
        switch(status?.toLowerCase()) {
            case 'approved':
                return 'Application approved';
            case 'pending':
                return 'Under review';
            case 'rejected':
                return 'Request rejected';
            default:
                return existingRemarks || 'No remarks';
        }
    };

    return (
        <Card sx={{ 
            width: '100%',
            bgcolor: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: 'none'
        }}>
            <CardContent>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: 3,
                        color: '#0066cc',
                        fontWeight: 500,
                        position: 'relative',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-8px',
                            left: 0,
                            width: '50px',
                            height: '2px',
                            backgroundColor: '#0066cc',
                        }
                    }}
                >
                    Application History
                </Typography>

                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Session</StyledTableCell>
                                <StyledTableCell>Purpose</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Remarks</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <ContentTableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        No OD applications found
                                    </ContentTableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: '#f8f9fa'
                                            },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: '#fafafa'
                                            }
                                        }}
                                    >
                                        <ContentTableCell>
                                            {submission.startDate}
                                            {submission.endDate !== submission.startDate && 
                                                ` to ${submission.endDate}`}
                                        </ContentTableCell>
                                        <ContentTableCell>{submission.session}</ContentTableCell>
                                        <ContentTableCell>{submission.purpose}</ContentTableCell>
                                        <ContentTableCell>
                                            <Chip 
                                                label={submission.status}
                                                color={getStatusColor(submission.status)}
                                                size="small"
                                                sx={{ 
                                                    minWidth: 85,
                                                    fontWeight: 500
                                                }}
                                            />
                                        </ContentTableCell>
                                        <ContentTableCell>
                                            {getDefaultRemarks(submission.status, submission.remarks)}
                                        </ContentTableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default ODHistoryTable;