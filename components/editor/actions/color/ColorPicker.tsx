import { Box, Button, Grid, Paper } from "@mui/material";
import { HexColorPicker } from "react-colorful";

interface Props {
  color: string;
  handleColorChange: React.Dispatch<React.SetStateAction<string>>;
  handleCloseOption: () => void;
}

function ColorPicker(props: Props): JSX.Element {
  const { color, handleColorChange, handleCloseOption } = props;
  return (
    <Paper elevation={3}>
      <Grid
        container
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <Box component="h3">Pick Color</Box>
        </Grid>
        <Grid item>
          <HexColorPicker color={color} onChange={handleColorChange} />
        </Grid>
        <Grid item>
          <Button variant="text" onClick={handleCloseOption}>
            Close
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ColorPicker;
