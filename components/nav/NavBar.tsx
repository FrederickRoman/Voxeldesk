import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import Image from "next/image";

function HomeLink(): JSX.Element {
  return (
    <Box>
      <Button>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item sx={{ display: "grid", placeContent:"center", mx:1}}>
            <Image src="/img/voxeldesk_logo.png" width={30} height={30}/>
          </Grid>
          <Grid item>
            <Typography variant="h6" sx={{ color: "background.default" }}>
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
        <HelpIcon sx={{ color: "background.default" }} />
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
