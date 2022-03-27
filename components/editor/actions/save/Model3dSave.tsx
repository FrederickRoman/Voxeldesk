import { ClickAwayListener, Grid, Paper, TextField } from "@mui/material";
import type { Model3d } from "types/editorTypes";

interface Props {
  defaultModel: Model3d;
  model3d: Model3d;
  handleCloseOption: () => void;
}

function Model3dSave(props: Props): JSX.Element {
  const { defaultModel, model3d, handleCloseOption } = props;
  const isModel3dDefault =
    model3d.obj == defaultModel.obj && model3d.mtl == defaultModel.mtl;
  const handleClickAway = handleCloseOption;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        elevation={3}
        sx={{
          textAlign: "center",
          color: "palette.text.secondary",
          width: "100%",
          padding: 2,
        }}
      >
        {isModel3dDefault ? (
          <div>There is nothing to save</div>
        ) : (
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
        )}
      </Paper>
    </ClickAwayListener>
  );
}

export default Model3dSave;
