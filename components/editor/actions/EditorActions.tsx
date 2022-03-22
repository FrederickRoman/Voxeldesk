import { useEffect, useState } from "react";
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { Palette, Save, Undo } from "@mui/icons-material";
import ColorPicker from "./color/ColorPicker";
import Model3dSave from "components/editor/actions/save/Model3dSave";
import EditionHistory from "./reset/ResetEditor";
import type { Model3d } from "types/editorTypes";

type Action = "Color" | "Save" | "Reset" | "";

interface Props {
  handleReset: () => void;
  color: string;
  model3d: Model3d;
  handleSaveModel3d: () => void;
  handleColorChange: React.Dispatch<React.SetStateAction<string>>;
}

const EDITING_ACTIONS: readonly { icon: JSX.Element; name: Action }[] =
  Object.freeze([
    { icon: <Palette />, name: "Color" },
    { icon: <Save />, name: "Save" },
    { icon: <Undo />, name: "Reset" },
  ]);

function EditorActions(props: Props): JSX.Element {
  const { handleReset, color, handleColorChange, model3d, handleSaveModel3d } =
    props;
  const [open, setOpen] = useState<boolean>(false);
  const [action, setAction] = useState<Action>("");

  useEffect(() => {
    if (open) setAction("");
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCloseOption = () => {
    setAction("");
    setOpen(false);
  };

  return (
    <Box component="section" height={256} mt={1}>
      <Box
        component={SpeedDial}
        ariaLabel="Editor actions speed dial"
        position="absolute"
        bottom={16}
        left={64}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="down"
      >
        {EDITING_ACTIONS.map(({ name, icon }) => (
          <SpeedDialAction
            key={name}
            icon={icon}
            tooltipTitle={name}
            tooltipOpen
            onClick={() => {
              setAction(name);
              handleClose();
            }}
          />
        ))}
      </Box>
      <Box component="section" position="relative" top={84} left={64}>
        {action == "Color" ? (
          <ColorPicker
            color={color}
            handleColorChange={handleColorChange}
            handleCloseOption={handleCloseOption}
          />
        ) : action == "Save" ? (
          <Model3dSave
            model3d={model3d}
            handleSaveModel3d={handleSaveModel3d}
          />
        ) : action == "Reset" ? (
          <EditionHistory handleReset={handleReset} />
        ) : (
          ""
        )}
      </Box>
    </Box>
  );
}

export default EditorActions;
