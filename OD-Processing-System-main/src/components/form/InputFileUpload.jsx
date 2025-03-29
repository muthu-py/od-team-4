import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Typography, 
  IconButton, 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ListItemSecondaryAction } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

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

export default function InputFileUpload({ onFilesSelected, onUploadError }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    
    // Automatically upload files when selected
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    if (files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/upload-od-files', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success && response.data.files) {
        // Pass the file URLs to the parent component
        if (onFilesSelected) {
          onFilesSelected(response.data.files);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      if (onUploadError) {
        onUploadError(error.response?.data?.message || 'Failed to upload files');
      }
      // Keep the files in the UI even if upload failed
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewFile(null);
  };

  const handleRemove = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (onFilesSelected) {
      // If we're removing all files, pass empty array
      onFilesSelected(newFiles.length === 0 ? [] : newFiles);
    }
  };

  const renderPreview = (file) => {
    const fileUrl = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      return <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />;
    } else if (file.type === 'application/pdf') {
      return <iframe src={fileUrl} width="100%" height="70vh" title="PDF Preview" />;
    } else {
      return <Typography>Preview not available for this file type</Typography>;
    }
  };

  return (
    <Box textAlign="center">
      <Button
        component="label"
        variant="contained"
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        sx={{ backgroundColor: "#015498" }}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload files'}
        <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} disabled={uploading} />
      </Button>

      {selectedFiles.length > 0 && (
        <Box
          sx={{
            marginTop: 2,
            padding: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            maxWidth: 700,
            marginX: "auto",
            textAlign: "left",
            boxShadow: 1,
          }}
        >
          <Typography variant="body1" color="gray" sx={{ mb: 2, textAlign: "center" }}>
            Uploaded Files:
          </Typography>
          <List sx={{ padding: 0 }}>
            {selectedFiles.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: 'white',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handlePreview(file)}
                    sx={{ mr: 1 }}
                  >
                    <VisibilityIcon color="primary" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemove(index)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {previewFile?.name}
            </Typography>
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewFile && renderPreview(previewFile)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
