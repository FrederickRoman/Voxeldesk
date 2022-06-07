import dynamic from "next/dynamic";
import Head from "next/head";
import { ErrorBoundary } from "react-error-boundary";
import HeroBanner from "components/banner/HeroBanner";
import { Skeleton } from "@mui/material";
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

/**
 * To avoid "Build failed because of webpack errors" caused by
 * "HookWebpackError: EMFILE: too many open files",
 * import dynamically VoxelEditor component and disable SSR.
 */
const VoxelEditor = dynamic(() => import("components/editor/VoxelEditor"), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" animation="wave" width="98vw" height="90vh">
      <canvas width="100vw" height="100vh" />
    </Skeleton>
  ),
});

const Home: NextPage = () => (
  <>
    <PageHead />
    <HeroBanner />
    <ErrorBoundary
      FallbackComponent={() => <div> Oops! Something went wrong</div>}
    >
      <VoxelEditor />
    </ErrorBoundary>
  </>
);

export default Home;
