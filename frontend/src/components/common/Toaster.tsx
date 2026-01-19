import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useUI } from '../../context/UIProvider'; 

export const Toaster = () => {
  // 1. Get the state directly from the Context
  const { toastOpen, toastTitle, toastMessage, toastSeverity, hideToast } = useUI();

  return (
    <Snackbar 
      open={toastOpen} 
      autoHideDuration={3000} 
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
      sx = {{mt:2}}
    >
      <Alert 
        onClose={hideToast} 
        severity={toastSeverity} 
        // variant="filled" 
        sx={{ 
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
            bgcolor: 'white',
            color: 'black',
            border: '1px solid rgba(0,0,0,0.05',
            
            '& .MuiAlert-icon': {
                color: (theme) => theme.palette[toastSeverity].main,
                fontSize: '1.8rem',
            },
            '& .MuiAlert-action': {
               color: 'rgba(0,0,0,0.5)'
            }
        }}
      >
        {toastTitle && (
             <AlertTitle sx={{ fontWeight: 800, color: '#000000', mb: 0.5, fontSize: '1.1rem' }}>
                {toastTitle}
             </AlertTitle>
        )}
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};