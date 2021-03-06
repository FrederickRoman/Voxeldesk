import dynamic from "next/dynamic";
import Head from "next/head";
import { ErrorBoundary } from "react-error-boundary";
import HeroBanner from "components/banner/HeroBanner";
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { NextPage } from "next";

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

const PageIntro = (): JSX.Element => (
  <Box component="section" py={10} sx={{ bgcolor: "black", color: "white" }}>
    <Box py={5}>
      <Typography variant="h3" sx={{ textAlign: "center" }}>
        Create voxel-based 3D models easily
      </Typography>
    </Box>
    <Box component="video" autoPlay loop muted width="100vw">
      <source src="video/model_display.mp4" type="video/mp4" />
    </Box>
  </Box>
);

/**
 * To avoid "Build failed because of webpack errors" caused by
 * "HookWebpackError: EMFILE: too many open files",
 * import dynamically VoxelEditor component and disable SSR.
 */
const VoxelEditor = dynamic(() => import("components/editor/VoxelEditor"), {
  ssr: process.env.NODE_ENV === "production",
  loading: () => (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={6}
      sx={{ width: "98vw", height: "90vh" }}
    >
      <Grid item>
        <Typography variant="h4"> Loading editor ...</Typography>
      </Grid>
      <Grid item>
        <CircularProgress disableShrink size={80} />
      </Grid>
    </Grid>
  ),
});

const VoxelEditorFallback = (): JSX.Element => (
  <div> Oops! Something went wrong with the editor</div>
);

const Home: NextPage = () => (
  <>
    <PageHead />
    <HeroBanner />
    <PageIntro />
    <ErrorBoundary FallbackComponent={VoxelEditorFallback}>
      <VoxelEditor />
    </ErrorBoundary>
  </>
);

export default Home;
