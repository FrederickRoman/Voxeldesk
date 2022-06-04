import Image from "next/image";
import { Box, Grid, Typography } from "@mui/material";
import logoImg from "public/img/voxeldesk_logo.svg";

function FullBrandLogo(): JSX.Element {
  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item>
        <Box pt={3}>
          <Image src={logoImg} width="120" height="120" alt="Voxeldesk logo" />
        </Box>
      </Grid>
      <Grid item>
        <Box>
          <Typography
            variant="h1"
            sx={{
              color: "background.default",
              fontSize: "clamp(2rem, 10vw, 5rem)",
              textAlign: "center",
            }}
          >
            Voxeldesk
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default FullBrandLogo;
