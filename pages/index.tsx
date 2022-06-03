import type { NextPage } from "next";
import Head from "next/head";
import VoxelEditor from "components/editor/VoxelEditor";
import { ErrorBoundary } from "react-error-boundary";

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

const Home: NextPage = () => (
  <>
    <PageHead />
    <ErrorBoundary
      FallbackComponent={() => <div> Oops! Something went wrong</div>}
    >
      <VoxelEditor />
    </ErrorBoundary>
  </>
);

export default Home;
