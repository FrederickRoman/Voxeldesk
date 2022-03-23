import { Box, Button, Grid, Paper } from "@mui/material";
import { HexColorPicker } from "react-colorful";

interface Props {
  color: string;
  colorsUsed: string[];
  handleColorChange: (color: string) => void;
  handleCloseOption: () => void;
}

function ColorPicker(props: Props): JSX.Element {
  const { color, colorsUsed, handleColorChange, handleCloseOption } = props;
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
          <Grid
            container
            width={200}
            my={2}
            justifyContent="space-evenly"
            alignItems="center"
          >
            {colorsUsed.map((colorUsed, i) => (
              <Grid item>
                <Box
                  key={i}
                  height={20}
                  width={20}
                  sx={{ background: colorUsed }}
                  onClick={() => handleColorChange(colorUsed)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item>
          <Box
            component={Button}
            variant="outlined"
            my={2}
            onClick={handleCloseOption}
          >
            Close
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ColorPicker;
