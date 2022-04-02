import { Box, Grid, IconButton, Paper } from "@mui/material";
import { Close } from "@mui/icons-material";
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
    <Box component={Paper} elevation={3} position="relative">
      <Box position="absolute" top={3} right={3}>
        <IconButton
          aria-label="close"
          size="small"
          sx={{ color: "primary.light", "&:hover": { color: "primary.main" } }}
          onClick={handleCloseOption}
        >
          <Close />
        </IconButton>
      </Box>
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
        {colorsUsed.length > 0 && (
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
        )}
      </Grid>
    </Box>
  );
}

export default ColorPicker;
