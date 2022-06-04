import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Image from "next/image";

function HomeLink(): JSX.Element {
  return (
    <Box>
      <Button>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item sx={{ display: "grid", placeContent: "center", mx: 1 }}>
            <Box pt={2}>
              <Image
                src="/img/voxeldesk_logo.svg"
                width={50}
                height={50}
                alt="Voxeldesk logo"
              />
            </Box>
          </Grid>
          <Grid item>
            <Typography
              variant="h6"
              sx={{ color: "background.default", textTransform: "none" }}
            >
              Voxeldesk
            </Typography>
          </Grid>
        </Grid>
      </Button>
    </Box>
  );
}

function AboutLink(): JSX.Element {
  return (
    <Box>
      <IconButton size="large" aria-label="about">
        <InfoIcon sx={{ color: "background.default" }} />
      </IconButton>
    </Box>
  );
}

function NavBar(): JSX.Element {
  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <HomeLink />
          </Grid>
          <Grid item>
            <AboutLink />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
