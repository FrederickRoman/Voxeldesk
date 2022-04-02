import { Button, ClickAwayListener, Grid, Paper } from "@mui/material";
import type { Model3d } from "types/editorTypes";
import type { Color } from "three";

interface Props {
  defaultColor: string;
  defaultModel: Model3d;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setColorsUsed: React.Dispatch<React.SetStateAction<Color[]>>;
  setModel3d: React.Dispatch<React.SetStateAction<Model3d>>;
  resetWorldScene: () => void;
  handleCloseAction: () => void;
}

function EditorResetter(props: Props): JSX.Element {
  const { resetWorldScene, handleCloseAction, ...worldState } = props;
  const { defaultColor, setColor, setColorsUsed, defaultModel, setModel3d } =
    worldState;

  const resetWorldState = (): void => {
    setColor(defaultColor);
    setColorsUsed([]);
    setModel3d(defaultModel);
  };
  const handleResetEditor = (): void => {
    resetWorldScene();
    resetWorldState();
    handleCloseAction();
  };

  return (
    <ClickAwayListener onClickAway={handleCloseAction}>
      <Paper
        elevation={3}
        sx={{
          textAlign: "center",
          color: "palette.text.secondary",
          width: 200,
          padding: 2,
        }}
      >
        <Grid container flexDirection="column" gap={3}>
          <Grid item>
            <Grid
              container
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <strong>Are you sure you want to reset the editor?</strong>
              </Grid>
              <Grid item>You would lose all changes.</Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justifyContent="space-around" alignItems="center">
              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleResetEditor}
                >
                  Yes
                </Button>
              </Grid>
              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(defaultButton) => defaultButton?.focus()}
                  onClick={handleCloseAction}
                >
                  No
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </ClickAwayListener>
  );
}

export default EditorResetter;
