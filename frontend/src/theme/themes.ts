import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003580', // Brand Blue (Used in Navbar, Buttons)
      light: '#335da9',
      dark: '#002255', // Hover state
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d32f2f', // Red (e.g., for cancellation or errors)
    },
    background: {
      default: '#F5F7FA', // The light grey background for the whole app
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a', // Soft Black
      secondary: '#6c757d', // Grey text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 800, // Make h5 bold by default (for headings)
    },
    button: {
      textTransform: 'none', // Stop buttons from being ALL CAPS
      fontWeight: 600,
    },
  },
  components: {
    // Global overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Rounded corners for all buttons
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#003580', // Default Navbar color
        },
      },
    },
  },
});

export default theme;