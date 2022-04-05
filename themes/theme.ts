import type { Theme } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { grey, blue, indigo, amber } from "@mui/material/colors";

const theme: Theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: grey[100],
    },
    primary: {
      main: indigo[900],
    },
    secondary: {
      main: amber[400],
    },
  },
});

export default theme;
