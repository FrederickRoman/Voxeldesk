import { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import BrandSlogan from "./slogan/BrandSlogan";
import FullBrandLogo from "./logo/FullBrandLogo";

function usePageYOffset(): number {
  const [offset, setOffset] = useState<number>(0);
  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return offset;
}

function BannerForeground(): JSX.Element {
  const PARALLAX_RATIO = -0.5;
  const pageYOffset = usePageYOffset();
  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      sx={{
        transform: "translate(-50%, -50%)",
        width: "80vw",
      }}
    >
      <Grid
        container
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          transform: `translateY(${PARALLAX_RATIO * pageYOffset}px)`,
        }}
      >
        <Grid item>
          <Box mt={1}>
            <FullBrandLogo />
          </Box>
        </Grid>
        <Grid item>
          <BrandSlogan />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BannerForeground;
