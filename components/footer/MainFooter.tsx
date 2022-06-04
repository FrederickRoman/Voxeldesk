import { AppBar, Grid, Link, Toolbar, Typography } from "@mui/material";

function MainFooter(): JSX.Element {
  const currentYear: number = new Date().getFullYear();
  return (
    <AppBar position="static" sx={{ py: 2 }}>
      <Toolbar>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Grid
              container
              flexDirection="column"
              justifyContent="center"
              alignItems="start"
            >
              <Grid item>
                <Link
                  color="inherit"
                  underline="hover"
                  href="https://www.frederickroman.com/"
                >
                  <Typography variant="body1" color="white" align="center">
                    © &nbsp; Frederick Roman {currentYear} &amp;
                  </Typography>
                  <br />
                </Link>
              </Grid>

              <Grid item>
                <Link
                  color="inherit"
                  underline="hover"
                  href="https://homeroroman.com/"
                >
                  <Typography variant="body1" color="white" align="center">
                    © &nbsp; Homero Roman {currentYear}
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Link
              color="inherit"
              underline="hover"
              href="/about"
            >
              About
            </Link>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default MainFooter;
