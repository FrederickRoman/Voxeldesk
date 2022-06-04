import { Box } from "@mui/material";
import BannerBackground from "./background/BannerBackground";
import BannerForeground from "./foreground/BannerForeground";

function HeroBanner(): JSX.Element {
  return (
    <Box component="section" role="banner" position="relative">
      <BannerBackground />
      <BannerForeground />
    </Box>
  );
}

export default HeroBanner;
