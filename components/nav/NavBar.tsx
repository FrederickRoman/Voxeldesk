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
  
  function HomeLink(): JSX.Element {
    return (
      <Box>
        <Button>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item>{/* Insert logo image here */}</Grid>
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