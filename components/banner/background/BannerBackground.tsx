import { Box, Grid } from "@mui/material";

function BannerBackground(): JSX.Element {
  const BG_COLOR = "#191970";
  const BG_IMG_URL = "url(/img/textures/cubes_by_Sander_Ottens_under_CC.png)";
  return (
    <Box
      top={0}
      left={0}
      sx={{
        height: "100vh",
        bgcolor: BG_COLOR,
        backgroundImage: BG_IMG_URL,
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid item>
          <Box />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BannerBackground;
