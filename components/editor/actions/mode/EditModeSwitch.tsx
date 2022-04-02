import { Close } from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { EditMode } from "types/editorTypes";

interface Props {
  mode: EditMode;
  setMode: React.Dispatch<React.SetStateAction<EditMode>>;
  handleCloseAction: () => void;
}

function EditModeSwitch(props: Props): JSX.Element {
  const { mode, setMode, handleCloseAction } = props;
  const hasMouseSupport = useMediaQuery("(hover:hover)");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode((event.target as HTMLInputElement).value as EditMode);
  };
  return (
    <ClickAwayListener onClickAway={handleCloseAction}>
      <Box component={Paper} elevation={3}>
        <Box position="absolute" top={3} right={3}>
          <IconButton
            aria-label="close"
            size="small"
            sx={{
              color: "primary.light",
              "&:hover": { color: "primary.main" },
            }}
            onClick={handleCloseAction}
          >
            <Close />
          </IconButton>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            color: "palette.text.secondary",
            width: 200,
            padding: 2,
          }}
        >
          <FormControl>
            <FormLabel id="edit-mode_radio-buttons-group">
              Press to ...
            </FormLabel>
            <RadioGroup
              aria-labelledby="edit-mode_radio-buttons-group"
              name="edit-mode_radio-buttons-group"
              value={mode}
              onChange={handleChange}
            >
              <FormControlLabel
                value="add"
                control={<Radio />}
                label="Add voxels"
              />
              <FormControlLabel
                value="remove"
                control={<Radio />}
                label="Remove voxels"
              />
            </RadioGroup>
          </FormControl>
          {hasMouseSupport && (
            <>
              <hr />
              <section>Tip: Use right-click to remove voxels</section>
            </>
          )}
        </Box>
      </Box>
    </ClickAwayListener>
  );
}

export default EditModeSwitch;
