import { Box, Button, Grid, Paper } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import type { Color } from "three";

interface Props {
  color: string;
  colorsUsed: Color[];
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
          <Box component="h4" sx={{ textAlign: "center" }}>
            {color}
          </Box>
        </Grid>
        <Grid item>
          <HexColorPicker color={color} onChange={handleColorChange} />
        </Grid>
        <Grid item>
          <Grid
            container
            width={200}
            my={1}
            justifyContent="space-evenly"
            alignItems="center"
          >
            {colorsUsed
              .map((colorUsed) => `#${colorUsed.getHexString()}`)
              .map((colorUsedHexString, i) => (
                <Grid item key={i}>
                  <Box
                    height={20}
                    width={20}
                    m={1}
                    border="1px solid black"
                    sx={{ background: colorUsedHexString }}
                    onClick={() => handleColorChange(colorUsedHexString)}
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
