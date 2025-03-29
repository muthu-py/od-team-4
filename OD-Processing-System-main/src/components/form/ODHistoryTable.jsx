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
    fontWeight: 600,
    backgroundColor: 'rgba(26, 35, 126, 0.03)',
    color: '#1a237e',
    fontSize: '0.95rem',
    padding: '16px',
    borderBottom: '2px solid rgba(26, 35, 126, 0.1)',
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    '&:first-of-type': {
        borderTopLeftRadius: '8px',
    },
    '&:last-of-type': {
        borderTopRightRadius: '8px',
    }
}));

const ContentTableCell = styled(TableCell)({
    fontSize: '0.9rem',
    padding: '16px',
    color: '#37474f',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
});

const StyledTableContainer = styled(TableContainer)({
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    height: '520px',
    '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(26, 35, 126, 0.2)',
        borderRadius: '4px',
        // '&:hover': {
        //     background: 'rgba(26, 35, 126, 0.3)',
        // },
    },
});

const StyledCard = styled(Card)({
    background: 'transparent',
    boxShadow: 'none',
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: '16px',
        pointerEvents: 'none',
    }
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
        <StyledCard>
            <CardContent sx={{ 
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#1a237e',
                            fontWeight: 600,
                            position: 'relative',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            pl: 2,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '4px',
                                height: '24px',
                                background: 'linear-gradient(to bottom, #1a237e, #0066cc)',
                                borderRadius: '2px',
                            }
                        }}
                    >
                        Application History
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: 'rgba(26, 35, 126, 0.05)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                    }}>
                        <Typography variant="body2" sx={{ color: '#1a237e', fontWeight: 500 }}>
                            Total Applications: {submissions.length}
                        </Typography>
                    </Box>
                </Box>

                <StyledTableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell width="25%">Date</StyledTableCell>
                                <StyledTableCell width="15%">Session</StyledTableCell>
                                <StyledTableCell width="25%">Purpose</StyledTableCell>
                                <StyledTableCell width="15%">Status</StyledTableCell>
                                <StyledTableCell width="20%">Remarks</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <ContentTableCell 
                                        colSpan={5} 
                                        align="center" 
                                        sx={{ 
                                            py: 8,
                                            color: 'rgba(0, 0, 0, 0.5)',
                                            fontStyle: 'italic',
                                            background: 'rgba(26, 35, 126, 0.02)',
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography variant="body1">
                                                No OD applications found
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                                                Submit your first application using the form above
                                            </Typography>
                                        </Box>
                                    </ContentTableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{ 
                                            // transition: 'all 0.3s ease',
                                            // '&:hover': { 
                                            //     backgroundColor: 'rgba(26, 35, 126, 0.02)',
                                            //     transform: 'translateX(5px)',
                                            //     '& .MuiTableCell-root': {
                                            //         color: '#1a237e'
                                            //     }
                                            // },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: 'rgba(26, 35, 126, 0.01)'
                                            }
                                        }}
                                    >
                                        <ContentTableCell>
                                            <Box sx={{ fontWeight: 500 }}>
                                                {submission.startDate}
                                                {submission.endDate !== submission.startDate && (
                                                    <Box component="span" sx={{ color: 'rgba(0, 0, 0, 0.4)', mx: 1 }}>
                                                        to
                                                    </Box>
                                                )}
                                                {submission.endDate !== submission.startDate && submission.endDate}
                                            </Box>
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
                                                    fontWeight: 500,
                                                    borderRadius: '4px',
                                                    textTransform: 'capitalize',
                                                    '& .MuiChip-label': {
                                                        px: 2
                                                    }
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
                </StyledTableContainer>
            </CardContent>
        </StyledCard>
    );
};

export default ODHistoryTable;