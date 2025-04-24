import { 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Paper, 
  Button, 
  Chip 
} from '@mui/material';

export default function MenteeRequestsTable({ requests, onApprove, onReject }) {
  // Debug the requests data
  console.log("Mentee Requests:", requests);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650 }} aria-label="mentee requests table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Student Name</TableCell>
            <TableCell>Register Number</TableCell>
            <TableCell>Date Range</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests && requests.length > 0 ? (
            requests.map((request) => {
              // Use dateRange directly if available, otherwise calculate it
              let dateRange = request.dateRange || 'N/A';
              
              // If dateRange is not available, try to calculate it
              if (dateRange === 'N/A') {
                try {
                  // Check for different date field names
                  const startDateValue = request.startDate || request.startDateTime || null;
                  const endDateValue = request.endDate || request.endDateTime || null;
                  
                  if (startDateValue && endDateValue) {
                    const startDate = new Date(startDateValue).toLocaleDateString();
                    const endDate = new Date(endDateValue).toLocaleDateString();
                    
                    // Format the date range
                    dateRange = startDate === endDate 
                      ? `${startDate} (${request.startSession || 'FN'} - ${request.endSession || 'AN'})` 
                      : `${startDate} to ${endDate}`;
                  }
                } catch (error) {
                  console.error("Date formatting error:", error);
                }
              }
              
              // Get status with proper formatting - check multiple possible status fields
              const status = request.odSubmissionStatus || 
                            request.mentorApproval?.status || 
                            request.status || 
                            'Pending';
              
              return (
                <TableRow key={request._id || request.id}>
                  <TableCell>{request.name || request.studentName || 'Unknown'}</TableCell>
                  <TableCell>{request.registerNumber || request.roll_no || 'N/A'}</TableCell>
                  <TableCell>{request.dat}</TableCell>
                  <TableCell>
                    <Chip 
                      label={status} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    {status === 'Pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => onApprove(request._id || request.id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => onReject(request._id || request.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {status !== 'Pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          // Handle view details action
                          console.log('View details for:', request);
                        }}
                      >
                        VIEW DETAILS
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No pending requests from your mentees
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}