import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export default function PopupReject({ open, onClose, request, onReject }) {
  if (!request) return null; // Ensure request is valid before rendering

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reject Request</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to reject the request from {request.name}?</Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button 
          onClick={() => {
            onReject(request._id, "Request rejected"); // Pass a default reason
            onClose(); // Close the popup after rejecting
          }} 
          color="error" 
          variant="contained"
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
