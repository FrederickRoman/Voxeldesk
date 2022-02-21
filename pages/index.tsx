import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import VoxelEditor from "../components/editor/VoxelEditor";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Voxeldesk</title>
        <meta
          name="description"
          content="Create voxel art online by clicking on a grid."
        />
      </Head>
      <VoxelEditor />
    </>
  );
};

export default Home;
