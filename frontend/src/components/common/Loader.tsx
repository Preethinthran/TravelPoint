import { Backdrop, CircularProgress, Typography } from '@mui/material';
import { useUI } from '../../context/UIProvider';

export const Loader = () => {
  // 1. Get the state directly from the Context
  const { loaderOpen, loaderMessage } = useUI();

  return (
    <Backdrop
      sx={{ 
        color: '#003580', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: 'flex', flexDirection: 'column', gap: 2
      }}
      open={loaderOpen}
    >
      <CircularProgress color="inherit" size={60} thickness={4} />
      {loaderMessage && (
        <Typography variant="h6" fontWeight="500">
          {loaderMessage}
        </Typography>
      )}
    </Backdrop>
  );
};