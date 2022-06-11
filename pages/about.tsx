import Head from "next/head";
import type { NextPage } from "next";
import { Grid, Box, Stack, Typography, Divider } from "@mui/material";

const PageHead = (): JSX.Element => (
  <Head>
    <meta charSet="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />
    <title>Voxeldesk</title>
    <meta
      name="description"
      content="Create voxel art online by clicking on a grid."
    />
  </Head>
);

const AboutApp = (): JSX.Element => (
  <Box component="section">
    <Typography variant="h2" style={{ textAlign: "center" }}>
      Voxeldesk
    </Typography>
    <Stack spacing={2} divider={<Divider sx={{ borderColor: "white" }} />}>
      <Box>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <Box py={4}>
              <Typography variant="h5">
                Voxeldesk is an app to voxel art online by clicking on a grid.
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box component="video" autoPlay loop muted maxWidth={300}>
              <source src="video/model_display.mp4" type="video/mp4" />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="h3" style={{ textAlign: "center" }}>
          Main actions
        </Typography>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h4" style={{ textAlign: "center" }}>
              Add/remove voxels
            </Typography>
            <Typography paragraph style={{ textAlign: "center" }}>
              Switch between adding and removing voxels. Pick the color of each
              voxel.
            </Typography>
            <Box component="video" autoPlay loop muted width="99vw">
              <source src="video/voxel_addition.mp4" type="video/mp4" />
            </Box>
          </Stack>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h4" style={{ textAlign: "center" }}>
              Save/load voxel models
            </Typography>
            <Typography paragraph style={{ textAlign: "center" }}>
              Save and load models in .obj format
            </Typography>
            <Box component="video" autoPlay loop muted width="99vw">
              <source src="video/model_save_and_load.mp4" type="video/mp4" />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  </Box>
);

const AboutPage: NextPage = () => (
  <>
    <PageHead />
    <Box p={5} sx={{ bgcolor: "black", color: "white" }}>
      <Box py={10}>
        <Typography variant="h1" style={{ textAlign: "center" }}>
          About
        </Typography>
      </Box>
      <AboutApp />
    </Box>
  </>
);

export default AboutPage;
