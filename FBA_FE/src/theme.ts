import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export const designTokens = {
  radius: { control: 14, card: 24, overlay: 28 },
  blur: { navigation: 18, overlay: 24 },
  motion: '180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
};

export const createAppTheme = (mode: PaletteMode) => {
  const dark = mode === 'dark';
  const paper = dark ? '#202a3b' : '#ffffff';
  const border = dark ? 'rgba(218,232,255,0.14)' : 'rgba(255,255,255,0.85)';
  const glass = dark ? 'rgba(28,39,57,0.84)' : 'rgba(255,255,255,0.78)';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#85b6ff' : '#1769c2' },
      secondary: { main: dark ? '#c5adff' : '#6756b3' },
      background: { default: dark ? '#101826' : '#eaf1fa', paper },
      text: { primary: dark ? '#f3f7ff' : '#19283d', secondary: dark ? '#b9c7db' : '#52627a' },
    },
    shape: { borderRadius: designTokens.radius.control },
    typography: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', h4: { fontWeight: 700, letterSpacing: '-0.035em' }, h5: { fontWeight: 700, letterSpacing: '-0.025em' }, h6: { fontWeight: 650 }, button: { fontWeight: 650, textTransform: 'none' } },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { backgroundImage: dark ? 'radial-gradient(ellipse at 15% 5%, rgba(55,101,175,.22), transparent 45%), radial-gradient(ellipse at 90% 70%, rgba(91,75,145,.13), transparent 45%)' : 'radial-gradient(ellipse at 10% 0%, rgba(112,174,244,.22), transparent 42%), radial-gradient(ellipse at 95% 75%, rgba(168,194,235,.18), transparent 45%)', backgroundAttachment: 'fixed' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: { styleOverrides: { root: { borderRadius: designTokens.radius.card, border: '1px solid', borderColor: dark ? 'rgba(213,229,255,.12)' : 'rgba(255,255,255,.9)', backgroundColor: dark ? 'rgba(31,42,61,.94)' : 'rgba(255,255,255,.94)', boxShadow: dark ? '0 12px 38px rgba(0,0,0,.18)' : '0 12px 36px rgba(50,83,130,.08)', transition: 'box-shadow '+designTokens.motion+', transform '+designTokens.motion, '&:hover': { boxShadow: dark ? '0 16px 42px rgba(0,0,0,.25)' : '0 18px 44px rgba(50,83,130,.12)' } } } },
      MuiAppBar: { styleOverrides: { root: { color: dark ? '#f3f7ff' : '#1c3150', backgroundColor: glass, borderBottom: '1px solid '+border, boxShadow: '0 8px 32px rgba(20,50,90,.08)', backdropFilter: 'blur(18px) saturate(145%)', WebkitBackdropFilter: 'blur(18px) saturate(145%)', '@supports not (backdrop-filter: blur(1px))': { backgroundColor: paper } } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 13, minHeight: 42, transition: 'background-color '+designTokens.motion+', transform '+designTokens.motion, '&:active': { transform: 'scale(.98)' } }, contained: { boxShadow: '0 5px 16px rgba(26,105,190,.17)' } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14, backgroundColor: dark ? 'rgba(10,20,36,.25)' : 'rgba(248,251,255,.85)', '&.Mui-focused': { boxShadow: '0 0 0 3px '+alpha(dark ? '#85b6ff' : '#1769c2',.16) } } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 26, border: '1px solid '+border, backgroundColor: glass, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', '@supports not (backdrop-filter: blur(1px))': { backgroundColor: paper }, width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)' } } },
      MuiMenu: { styleOverrides: { paper: { borderRadius: 16, border: '1px solid '+border, backgroundColor: glass, backdropFilter: 'blur(16px)', '@supports not (backdrop-filter: blur(1px))': { backgroundColor: paper } } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 10, padding: '8px 12px' } } },
      MuiTableContainer: { styleOverrides: { root: { borderRadius: 18, maxWidth: '100%', overflowX: 'auto' } } },
      MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid '+(dark ? 'rgba(255,255,255,.08)' : 'rgba(20,55,90,.08)') }, head: { fontWeight: 700, whiteSpace: 'nowrap' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 600 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiIconButton: { styleOverrides: { root: { minWidth: 42, minHeight: 42 } } },
      MuiSwitch: { styleOverrides: { root: { padding: 9 } } },
    },
  });
};
export const theme = createAppTheme('light');
