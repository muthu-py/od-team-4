import React, {useState} from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, TextField } from "@mui/material";

export default function PopupReject({ open, onClose, request, onReject }) {
  const [reason, setReason] = useState("");
  if (!request) return null; // Ensure request is valid before rendering

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reject Request</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to reject the request from {request.name}?</Typography>
        <TextField
            autoFocus
            required
            margin="dense"
            label="Reason for rejection"
            type="text"
            fullWidth
            variant="standard"
            color="error"
            value={reason} // Controlled component
            onChange={(e) => setReason(e.target.value)} // Update state when typing
          />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button 
          onClick={() => {
            onReject(request.id,reason); // Call the reject function from Mentees.jsx
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
