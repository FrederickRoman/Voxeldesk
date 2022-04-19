import {
  ClickAwayListener,
  Grid,
  Paper,
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { Model3d } from "types/editorTypes";

interface Props {
  defaultModel: Model3d;
  model3d: Model3d;
  handleCloseOption: () => void;
}

function Model3dSave(props: Props): JSX.Element {
  const { defaultModel, model3d, handleCloseOption } = props;
  const isModel3dEmpty =
    model3d.obj == defaultModel.obj && model3d.mtl == defaultModel.mtl;
  const handleClickAway = handleCloseOption;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        component={Paper}
        elevation={3}
        position="relative"
        sx={{
          textAlign: "center",
          color: "palette.text.secondary",
          width: "100%",
          padding: 2,
        }}
      >
        <Box position="absolute" top={3} right={3}>
          <IconButton
            aria-label="close"
            size="small"
            sx={{
              color: "primary.light",
              "&:hover": { color: "primary.main" },
            }}
            onClick={handleCloseOption}
          >
            <Close />
          </IconButton>
        </Box>

        {isModel3dEmpty ? (
          <h3>There is nothing to save</h3>
        ) : (
          <Grid
            container
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <h3>Saved model</h3>
            </Grid>
            <Grid item>
              <Grid container justifyContent="center" alignItems="center">
                <Grid item>
                  <TextField
                    id="model3d-obj_text-field"
                    label=".obj"
                    multiline
                    rows={10}
                    value={model3d.obj}
                    variant="outlined"
                  />
                </Grid>
                <Grid item>
                  <TextField
                    id="model3d-mtl_text-field"
                    label=".mtl"
                    multiline
                    rows={10}
                    value={model3d.mtl}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default Model3dSave;
