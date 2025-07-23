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
  CircularProgress,
  Paper
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

const StyledUploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1a237e 30%, #0066cc 90%)',
  borderRadius: '8px',
  padding: '12px 24px',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
  '&:hover': {
    background: 'linear-gradient(45deg, #0066cc 30%, #1a237e 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(26, 35, 126, 0.3)',
  },
  '&:disabled': {
    background: 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)',
    boxShadow: 'none',
  }
}));

const StyledFileList = styled(Box)({
  marginTop: '24px',
  padding: '24px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  maxWidth: '700px',
  marginX: 'auto',
  textAlign: 'left',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
});

const StyledListItem = styled(ListItem)({
  background: 'rgba(255, 255, 255, 0.9)',
  marginBottom: '12px',
  borderRadius: '8px',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(26, 35, 126, 0.02)',
    transform: 'translateX(5px)',
  },
  '&:last-child': {
    marginBottom: 0,
  }
});

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  background: 'rgba(26, 35, 126, 0.03)',
  borderBottom: '1px solid rgba(26, 35, 126, 0.1)',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#1a237e' : 'rgba(26, 35, 126, 0.2)'}`,
  borderRadius: '12px',
  padding: '40px',
  textAlign: 'center',
  background: isDragActive ? 'rgba(26, 35, 126, 0.05)' : 'rgba(255, 255, 255, 0.95)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#1a237e',
    background: 'rgba(26, 35, 126, 0.05)',
  }
}));

const DropZoneContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const DropZoneIcon = styled(CloudUploadIcon)(({ theme }) => ({
  fontSize: '48px',
  color: '#1a237e',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

export default function InputFileUpload({ onFilesSelected, onUploadError }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    await uploadFiles(files);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
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
      <DropZone
        component="div"
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <DropZoneContent>
          <DropZoneIcon />
          <Box>
            <Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
              {uploading ? 'Uploading...' : 'Drag & Drop Files Here'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
              or click to browse
            </Typography>
          </Box>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          {uploading && (
            <CircularProgress size={24} sx={{ color: '#1a237e' }} />
          )}
        </DropZoneContent>
      </DropZone>

      {selectedFiles.length > 0 && (
        <StyledFileList>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              color: '#1a237e',
              fontWeight: 500,
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '2px',
                background: 'linear-gradient(90deg, #1a237e 0%, #0066cc 100%)',
                borderRadius: '2px',
              }
            }}
          >
            Uploaded Files
          </Typography>
          <List sx={{ padding: 0 }}>
            {selectedFiles.map((file, index) => (
              <StyledListItem key={index}>
                <ListItemText
                  primary={
                    <Typography sx={{ color: '#37474f', fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.85rem' }}>
                      {`${(file.size / 1024).toFixed(2)} KB`}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handlePreview(file)}
                    sx={{ 
                      mr: 1,
                      color: '#1a237e',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#0066cc',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemove(index)}
                    sx={{ 
                      color: '#d32f2f',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#f44336',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </StyledListItem>
            ))}
          </List>
        </StyledFileList>
      )}

      {/* Preview Dialog */}
      <StyledDialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <StyledDialogTitle>
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 500 }}>
            File Preview
          </Typography>
          <IconButton
            onClick={handleClosePreview}
            sx={{ 
              color: '#1a237e',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#0066cc',
                transform: 'rotate(90deg)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {previewFile && renderPreview(previewFile)}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(26, 35, 126, 0.1)' }}>
          <Button 
            onClick={handleClosePreview}
            sx={{ 
              color: '#1a237e',
              fontWeight: 500,
              '&:hover': {
                background: 'rgba(26, 35, 126, 0.05)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
}
