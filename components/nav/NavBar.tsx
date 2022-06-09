import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Box,
  Button,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface Props {
  href: string;
  children: React.ReactNode;
}

function NavBarLink(props: Props): JSX.Element {
  const { href, children } = props;
  return (
    <Link href={href} passHref>
      <Box component="a" sx={{ textDecoration: "none" }}>
        {children}
      </Box>
    </Link>
  );
}

function HomeLink(): JSX.Element {
  return (
    <NavBarLink href="/">
      <Button>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item sx={{ display: "grid", placeContent: "center", mx: 1 }}>
            <Box pt={2}>
              <Image
                src="/img/voxeldesk_logo.svg"
                width={50}
                height={50}
                alt="Voxeldesk logo"
              />
            </Box>
          </Grid>
          <Grid item>
            <Typography
              variant="h6"
              sx={{ color: "background.default", textTransform: "none" }}
            >
              Voxeldesk
            </Typography>
          </Grid>
        </Grid>
      </Button>
    </NavBarLink>
  );
}

function AboutLink(): JSX.Element {
  return (
    <NavBarLink href="/about">
      <IconButton size="large" aria-label="about">
        <InfoIcon sx={{ color: "background.default" }} />
      </IconButton>
    </NavBarLink>
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
