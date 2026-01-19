import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Box, Alert, IconButton, 
    TextField, CircularProgress, Tooltip 
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { AiService } from '../../services/api/services/AiService';
import { useAuth } from '../../context/AuthProvider';
import { useUI } from '../../context/UIProvider';

interface ApiKeyDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onClose }) => {
    const { user } = useAuth();
    const { showToast } = useUI(); // Assuming you have this context for notifications
    
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Reset state when closing
    const handleClose = () => {
        setApiKey(null);
        setCopied(false);
        onClose();
    };

    const handleGenerate = async () => {
        if (!user?.user_id) return;
        
        setLoading(true);
        try {
            const response: any = await AiService.postAiGenerateKey({ user_id: user.user_id });
            
            if (response.success && response.apiKey) {
                setApiKey(response.apiKey);
                showToast("Success", "New API Key generated", "success");
            } else {
                showToast("Error", "Failed to generate key", "error");
            }
        } catch (error) {
            console.error("API Gen Error:", error);
            showToast("Error", "Server error while generating key", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset icon after 2s
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon color="primary" />
                {apiKey ? "Your API Access Key" : "Generate AI Access Key"}
            </DialogTitle>
            
            <DialogContent dividers>
                {!apiKey ? (
                    // STATE A: WARNING & CONFIRMATION
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <WarningAmberIcon color="warning" sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="body1" paragraph>
                            This will generate a unique secret key allowing programmatic access to Travel Point AI features.
                        </Typography>
                        <Alert severity="warning" sx={{ textAlign: 'left', mb: 2 }}>
                            <strong>Warning:</strong> Generating a new key will immediately 
                            invalidate any existing keys you may have created previously.
                        </Alert>
                    </Box>
                ) : (
                    // STATE B: SUCCESS & COPY
                    <Box sx={{ py: 3 }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Success! Here is your new API key.
                        </Alert>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            CLICK TO COPY
                        </Typography>
                        <TextField
                            fullWidth
                            value={apiKey}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <Tooltip title={copied ? "Copied!" : "Copy to Clipboard"}>
                                        <IconButton onClick={handleCopy} edge="end" color={copied ? "success" : "default"}>
                                            {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                        </IconButton>
                                    </Tooltip>
                                ),
                                sx: { fontFamily: 'monospace', bgcolor: '#f5f5f5' }
                            }}
                        />
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            * Save this key now. For security, we may not show it again.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    {apiKey ? "Close" : "Cancel"}
                </Button>
                
                {!apiKey && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleGenerate}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <KeyIcon />}
                    >
                        {loading ? "Generating..." : "Generate Key"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};