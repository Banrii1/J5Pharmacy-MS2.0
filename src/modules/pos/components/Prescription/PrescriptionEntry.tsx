import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Stack,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Paper,
  Alert,
  Snackbar,
  SelectChangeEvent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import CropIcon from '@mui/icons-material/Crop';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadPrescriptionImage, savePrescription } from '../../api/prescriptionApi';
import { Prescription, PrescriptionDetails } from './types';

interface PrescriptionEntryProps {
  open: boolean;
  onClose: () => void;
  onSave: (prescription: Prescription) => Promise<void>;
  editPrescription?: Prescription;
}

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  minHeight: '100px',
  padding: '8px',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.divider}`,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
}));

const PrescriptionEntry: React.FC<PrescriptionEntryProps> = ({ open, onClose, onSave, editPrescription }) => {
  const [activeCamera, setActiveCamera] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [videoDevices, setVideoDevices] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enlargedView, setEnlargedView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [prescriptionDetails, setPrescriptionDetails] = useState<PrescriptionDetails[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get list of available cameras
  const getVideoDevices = async () => {
    console.log('Getting video devices...');
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser');
      }

      // Check if we have permission to access the camera
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('Camera permission status:', permissionStatus.state);

      if (permissionStatus.state === 'denied') {
        throw new Error('Camera permission is denied. Please allow camera access in your browser settings.');
      }

      // First request permission to ensure labels are available
      console.log('Requesting initial camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log('Initial permission granted, stopping test stream...');
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });

      console.log('Enumerating devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
        }));
      
      console.log('Found video devices:', videoDevs);
      
      if (videoDevs.length === 0) {
        throw new Error('No cameras found. Please connect a camera and try again.');
      }

      setVideoDevices(videoDevs);
      
      // Select the first device by default if none is selected
      if (!selectedDevice) {
        console.log('Setting default device:', videoDevs[0].deviceId);
        setSelectedDevice(videoDevs[0].deviceId);
      }
    } catch (error: any) {
      console.error('Error getting video devices:', error);
      setError(error.message || 'Failed to access camera devices. Please check permissions.');
      setLoading(false);
    }
  };

  // Initialize camera handling
  useEffect(() => {
    console.log('Dialog open state changed:', open);
    if (open) {
      getVideoDevices();
    }
    return () => {
      console.log('Cleaning up camera...');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [open]);

  const handleStartCamera = async () => {
    console.log('Starting camera with device:', selectedDevice);
    try {
      setLoading(true);
      setError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActiveCamera(true);
      setLoading(false);
    } catch (error) {
      console.error('Error starting camera:', error);
      setError('Failed to start camera. Please check permissions and try again.');
      setLoading(false);
    }
  };

  const handleDeviceChange = async (event: SelectChangeEvent<string>) => {
    const newDeviceId = event.target.value;
    setSelectedDevice(newDeviceId);
    if (activeCamera) {
      // Stop current stream before starting new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setActiveCamera(false);
      // Small delay to ensure stream is properly stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      handleStartCamera();
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActiveCamera(false);
  };

  const generateImageName = () => {
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    return `prescription-${timestamp}.jpg`;
  };

  const saveImageToPublic = async (imageData: string): Promise<string> => {
    try {
      const imageName = generateImageName();
      
      // Remove the data URL prefix to get just the base64 data
      const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
      
      // Convert base64 to Blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      const file = new File([blob], imageName, { type: 'image/jpeg' });
      
      // Upload the file using the API
      const response = await uploadPrescriptionImage(file);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload image');
      }
      
      return response.imagePath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPrescriptionImage(imageDataUrl);
    setOriginalImage(imageDataUrl);

    // Stop the camera
    handleStopCamera();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!patientName.trim()) {
        throw new Error('Patient name is required');
      }
      if (!doctorName.trim()) {
        throw new Error('Doctor name is required');
      }
      if (prescriptionDetails.length === 0) {
        throw new Error('At least one medicine detail is required');
      }

      // Save prescription image if exists
      let finalImagePath = '';
      if (prescriptionImage) {
        const imageBlob = await fetch(prescriptionImage).then(r => r.blob());
        const imageFile = new File([imageBlob], generateImageName(), { type: 'image/jpeg' });
        const uploadResponse = await uploadPrescriptionImage(imageFile);
        
        if (!uploadResponse.success) {
          throw new Error('Failed to upload prescription image');
        }
        finalImagePath = uploadResponse.imagePath;
      }

      const prescription: Prescription = {
        id: `PRES-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        date: format(new Date(), 'yyyy-MM-dd'),
        prescriptionImage,
        imagePath: finalImagePath,
        notes: notes.trim(),
        status: 'pending',
        details: prescriptionDetails.map(detail => ({
          ...detail,
          medicineName: detail.medicineName.trim(),
          dosage: detail.dosage.trim(),
          frequency: detail.frequency.trim(),
          duration: detail.duration.trim(),
        }))
      };

      const response = await savePrescription(prescription);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save prescription');
      }

      // Pass the saved prescription to parent component
      if (response.prescription) {
        await onSave(response.prescription);
      }

      // Clear form after successful save
      setPrescriptionImage(null);
      setImagePath('');
      setPatientName('');
      setDoctorName('');
      setNotes('');
      setPrescriptionDetails([]);
      
      onClose();
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      setError(error.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleStopCamera();
    setPatientName('');
    setDoctorName('');
    setNotes('');
    setPrescriptionImage(null);
    setImagePath('');
    onClose();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1)); // Min zoom 1x
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  const handleCropImage = () => {
    const imgRef = imageRef.current;
    if (!imgRef || !completedCrop || !canvasRef.current || !prescriptionImage) return;

    const image = new Image();
    image.src = originalImage || prescriptionImage;

    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use original image dimensions
      const scaleX = image.naturalWidth / imgRef.width;
      const scaleY = image.naturalHeight / imgRef.height;

      // Set canvas to the cropped dimensions at full resolution
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the cropped portion of the image at full resolution
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert to high-quality JPEG
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
      setPrescriptionImage(croppedImageUrl);
      setIsCropping(false);
      setCompletedCrop(null);
    };
  };

  const handleResetCrop = () => {
    if (originalImage) {
      setPrescriptionImage(originalImage);
      setIsCropping(false);
      setCompletedCrop(null);
    }
  };

  const handleAddDetails = () => {
    setPrescriptionDetails([
      ...prescriptionDetails,
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 0
      }
    ]);
  };

  const handleUpdateDetails = (index: number, field: keyof PrescriptionDetails, value: string | number) => {
    const newDetails = [...prescriptionDetails];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };
    setPrescriptionDetails(newDetails);
  };

  const handleRemoveDetails = (index: number) => {
    setPrescriptionDetails(prescriptionDetails.filter((_, i) => i !== index));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ p: 2, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              Prescription Book
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 1 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    setError(null);
                    getVideoDevices();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
            {/* Camera Section */}
            <Grid item xs={12} md={6} sx={{ height: '100%' }}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: activeCamera ? 'block' : 'none'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                  {prescriptionImage ? (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff',
                        display: activeCamera ? 'none' : 'block'
                      }}
                    >
                      {isCropping ? (
                        <Box sx={{ 
                          height: '100%', 
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={handleCropComplete}
                            aspect={undefined}
                          >
                            <img
                              ref={imageRef}
                              src={prescriptionImage}
                              alt="Prescription"
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                transform: `rotate(${rotation}deg)`,
                                transition: 'transform 0.3s ease-in-out'
                              }}
                            />
                          </ReactCrop>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                            }}
                          >
                            <IconButton
                              onClick={handleCropImage}
                              disabled={!completedCrop}
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                            >
                              <DoneIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleResetCrop}
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                            >
                              <RestartAltIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setIsCropping(false)}
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Stack>
                        </Box>
                      ) : (
                        <>
                          <img
                            ref={imageRef}
                            src={prescriptionImage}
                            alt="Prescription"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              cursor: 'pointer',
                              transform: `rotate(${rotation}deg)`,
                              transition: 'transform 0.3s ease-in-out'
                            }}
                            onClick={() => setEnlargedView(true)}
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                            }}
                          >
                            <IconButton
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                              onClick={() => setEnlargedView(true)}
                            >
                              <ZoomInIcon />
                            </IconButton>
                            <IconButton
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                              onClick={handleRotate}
                            >
                              <RotateRightIcon />
                            </IconButton>
                            <IconButton
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                              onClick={() => setIsCropping(true)}
                            >
                              <CropIcon />
                            </IconButton>
                            <IconButton
                              sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                              onClick={() => {
                                setPrescriptionImage(null);
                                setImagePath('');
                                setRotation(0);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </>
                      )}
                    </Box>
                  ) : !activeCamera && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        backgroundColor: '#fff',
                      }}
                    >
                      <CameraAltIcon sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="body2">
                        Select a camera to start
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Stack spacing={2}>
                  <FormControl size="small">
                    <InputLabel id="camera-select-label">Select Camera</InputLabel>
                    <Select
                      labelId="camera-select-label"
                      value={selectedDevice}
                      onChange={(e) => handleDeviceChange(e)}
                      label="Select Camera"
                    >
                      {videoDevices.map((device) => (
                        <MenuItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleStartCamera}
                      disabled={!selectedDevice || loading}
                      startIcon={loading ? <CircularProgress size={24} /> : <CameraAltIcon />}
                      sx={{ py: 1.5 }}
                      fullWidth
                    >
                      {loading ? 'Starting...' : activeCamera ? 'Restart' : 'Start Camera'}
                    </Button>
                    
                    {activeCamera && (
                      <>
                        <Button
                          variant="contained"
                          onClick={handleCapture}
                          color="primary"
                          startIcon={<PhotoCameraIcon />}
                          sx={{ py: 1.5 }}
                          fullWidth
                        >
                          Capture
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleStopCamera}
                          color="primary"
                          sx={{ py: 1.5, px: 3 }}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Form Section */}
            <Grid item xs={12} md={6} sx={{ height: '100%' }}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2} sx={{ flex: 1 }}>
                  <TextField
                    label="Patient Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Doctor Name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                  />
                  
                  {prescriptionDetails.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">Medicine Details</Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => setShowDetailsDialog(true)}
                            sx={{ ml: 'auto' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Stack>
                        <Box 
                          sx={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            pr: 1,
                            mr: -1,
                            '&::-webkit-scrollbar': {
                              width: '8px',
                              backgroundColor: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'grey.300',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: 'grey.400',
                              },
                            },
                          }}
                        >
                          <Stack spacing={1}>
                            {prescriptionDetails.map((detail, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  p: 1, 
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}
                              >
                                <Grid container spacing={1}>
                                  <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="primary">
                                      {detail.medicineName || 'Unnamed Medicine'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                      {detail.dosage && (
                                        <Typography variant="body2" color="text.secondary">
                                          Dosage: {detail.dosage}
                                        </Typography>
                                      )}
                                      {detail.frequency && (
                                        <Typography variant="body2" color="text.secondary">
                                          • Frequency: {detail.frequency}
                                        </Typography>
                                      )}
                                      {detail.duration && (
                                        <Typography variant="body2" color="text.secondary">
                                          • Duration: {detail.duration}
                                        </Typography>
                                      )}
                                      {detail.quantity > 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                          • Qty: {detail.quantity}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Grid>
                                </Grid>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                  
                  {prescriptionImage && (
                    <Button
                      variant="outlined"
                      onClick={() => setShowDetailsDialog(true)}
                      startIcon={<AddIcon />}
                    >
                      {prescriptionDetails.length > 0 ? 'Edit Medicine Details' : 'Add Medicine Details'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={!prescriptionImage || !patientName || !doctorName}
                    fullWidth
                  >
                    Save Prescription
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {prescriptionDetails.map((detail, index) => (
              <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle1">Item {index + 1}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveDetails(index)}
                      sx={{ ml: 'auto' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                  <TextField
                    label="Medicine Name"
                    value={detail.medicineName}
                    onChange={(e) => handleUpdateDetails(index, 'medicineName', e.target.value)}
                    fullWidth
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Dosage"
                      value={detail.dosage}
                      onChange={(e) => handleUpdateDetails(index, 'dosage', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Frequency"
                      value={detail.frequency}
                      onChange={(e) => handleUpdateDetails(index, 'frequency', e.target.value)}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Duration"
                      value={detail.duration}
                      onChange={(e) => handleUpdateDetails(index, 'duration', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => handleUpdateDetails(index, 'quantity', parseInt(e.target.value) || 0)}
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              onClick={handleAddDetails}
              startIcon={<AddIcon />}
              fullWidth
            >
              Add Medicine
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowDetailsDialog(false);
            }} 
            variant="contained"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Enlargement Dialog */}
      <Dialog
        open={enlargedView}
        onClose={() => {
          setEnlargedView(false);
          setZoomLevel(1);
        }}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '90vw',
            height: '90vh',
            maxWidth: 'none',
            backgroundColor: '#000',
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#000', color: '#fff' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Prescription Image</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                sx={{ color: '#fff' }}
              >
                <ZoomOutIcon />
              </IconButton>
              <IconButton
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
                sx={{ color: '#fff' }}
              >
                <RestartAltIcon />
              </IconButton>
              <IconButton
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                sx={{ color: '#fff' }}
              >
                <ZoomInIcon />
              </IconButton>
              <IconButton
                onClick={handleRotate}
                sx={{ color: '#fff' }}
              >
                <RotateRightIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setEnlargedView(false);
                  setZoomLevel(1);
                }}
                sx={{ color: '#fff' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            overflow: 'auto'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto'
            }}
          >
            <img
              src={prescriptionImage || imagePath}
              alt="Enlarged Prescription"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PrescriptionEntry;
