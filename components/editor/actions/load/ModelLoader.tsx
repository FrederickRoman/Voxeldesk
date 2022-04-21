import { useState } from "react";
import {
  ClickAwayListener,
  Grid,
  Paper,
  Box,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import ModelValidator from "services/world/validator/ModelValidator";
import type { Model3d } from "types/editorTypes";

type HandleChangeModelToLoad = (
  event: React.ChangeEvent<HTMLTextAreaElement>
) => void;

interface Props {
  defaultModel: Model3d;
  setLoadedModel: React.Dispatch<React.SetStateAction<Model3d>>;
  handleLoadModel: () => void;
  handleCloseOption: () => void;
}

function ModelLoader(props: Props): JSX.Element {
  const { defaultModel, setLoadedModel, handleLoadModel, handleCloseOption } =
    props;
  const handleClickAway = handleCloseOption;
  const [validationError, setValidationError] = useState<boolean>(false);
  const [validaitonMsg, setValidationMsg] = useState<string>("");

  const handleChangeModelToLoad: HandleChangeModelToLoad = (event) => {
    const model = {
      obj: event.target.value,
      mtl: defaultModel.mtl,
    };
    const { err, msg } = ModelValidator.validate(model);
    if (err) {
      console.log(err);
      setValidationError(true);
      setValidationMsg(msg);
    } else {
      setValidationError(false);
      setValidationMsg("");
      setLoadedModel(model);
    }
  };

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

        <Grid
          container
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <h3>Load model</h3>
          </Grid>
          <Grid item>
            <Grid container flexDirection="column" gap={3}>
              <Grid item>
                <TextField
                  id="model3d-loader-obj_text-field"
                  label="Write model's .obj here"
                  multiline
                  rows={10}
                  variant="outlined"
                  defaultValue={defaultModel.obj}
                  error={validationError}
                  helperText={validaitonMsg}
                  onChange={handleChangeModelToLoad}
                />
              </Grid>
              <Grid item>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={validationError}
                  onClick={handleLoadModel}
                >
                  Load
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </ClickAwayListener>
  );
}

export default ModelLoader;
