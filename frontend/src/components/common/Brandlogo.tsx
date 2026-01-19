import { Box, Typography } from '@mui/material';

const BrandLogo = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 40, 
        left: 250, // Standard is Top-Left. Change to 'right: 32' if you really want it on the right side.
        zIndex: 2,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Typography
        variant="h3"
        fontWeight={900}
        sx={{ 
          letterSpacing: 2,
          background: 'linear-gradient(180deg, #ffffff 50%, #ffffff 60%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `
            0px 0px 8px rgba(255,255,255,0.8),
            0px 2px 6px rgba(0,0,0,0.25)
        `,
          cursor: 'default'
        }}
      >
        TRAVEL POINT
      </Typography>
    </Box>
  );
};

export default BrandLogo;