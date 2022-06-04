import { Typography } from "@mui/material";

function BrandSlogan(): JSX.Element {
  return (
    <Typography
      variant="h2"
      sx={{
        color: "background.default",
        fontSize: "clamp(1rem, 5vw, 2.5rem)",
        textAlign: "center",
        padding: 2,
      }}
    >
      User-friendly voxel-based 3D editor.
    </Typography>
  );
}

export default BrandSlogan;
