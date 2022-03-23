import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Zoom,
} from "@mui/material";
import { Palette, Save, Undo, Edit } from "@mui/icons-material";
import ColorPicker from "./color/ColorPicker";
import Model3dSave from "components/editor/actions/save/Model3dSave";
import ResetEditor from "./reset/ResetEditor";
import type { Action, Model3d } from "types/editorTypes";
import type VoxelWorld from "services/VoxelWord";

interface Props {
  world: VoxelWorld | null;
  handleResetWorld: () => void;
}

const DEFAULT_COLOR = "#feb74c";
const DEFAULT_MODEL_3D = Object.freeze({ obj: "", mtl: "" });

const EDITING_ACTIONS: readonly { icon: JSX.Element; name: Action }[] =
  Object.freeze([
    { icon: <Palette />, name: "Color" },
    { icon: <Save />, name: "Save" },
    { icon: <Undo />, name: "Reset" },
  ]);

function EditorActions(props: Props): JSX.Element {
  const { world, handleResetWorld } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [action, setAction] = useState<Action>("");
  const [model3d, setModel3d] = useState<Model3d>(DEFAULT_MODEL_3D);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [colorsUsed, setColorsUsed] = useState<string[]>([DEFAULT_COLOR]);

  useEffect(() => world?.setPickedColor(color), [world, color]);

  useEffect(() => {
    if (open) setAction("");
  }, [open]);

  const handleOpen = (): void => setOpen(true);

  const handleClose = (): void => setOpen(false);

  const handleCloseAction = (): void => {
    setAction("");
    setOpen(false);
  };

  const handleColorChange = (color: string): void => {
    const MAX_NUM_COLORS_KEPT = 5;
    setColorsUsed((prevColorsUsed) =>
      prevColorsUsed.includes(color)
        ? prevColorsUsed
        : prevColorsUsed.length < MAX_NUM_COLORS_KEPT
        ? [...prevColorsUsed, color]
        : [...prevColorsUsed.slice(-(MAX_NUM_COLORS_KEPT - 1)), color]
    );
    setColor(color);
  };

  const handleSaveModel3d = (): void => {
    if (world) setModel3d(world.onSave.call(world));
  };

  return (
    <Box component="section" height={256} mt={1}>
      <Box
        // component={SpeedDial}
        // ariaLabel="Editor actions speed dial"
        position="absolute"
        // bottom={16}
        // left={64}
        // icon={<SpeedDialIcon />}
        // onClose={handleClose}
        // onOpen={handleOpen}
        // open={open}
        // direction="down"
        onClick={() => setOpen((v) => !v)}
      >
        <IconButton
          size="large"
          aria-label="edit"
          sx={{
            color: "white",
            width: 40,
            height: 40,
            backgroundColor: "primary.main",
            borderRadius: "50%",
            padding: 0.2,
            "&:hover": { color: "white", backgroundColor: "primary.dark" },
          }}
        >
          <Edit />
        </IconButton>
      </Box>
      <Zoom in={open} unmountOnExit>
        <Box position="relative" top={50}>
          {EDITING_ACTIONS.map(({ name, icon }) => (
            <Box
              key={name}
              // icon={icon}
              // tooltipTitle={name}
              // tooltipOpen
              onClick={() => {
                setAction(name);
                handleClose();
              }}
            >
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                gap={1}
                my={1}
              >
                <Grid item>
                  <IconButton
                    aria-label="edit"
                    sx={{
                      color: "white",

                      backgroundColor: "primary.light",
                      borderRadius: "50%",

                      "&:hover": {
                        color: "white",
                        backgroundColor: "primary.main",
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                </Grid>
                <Grid item>{name}</Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </Zoom>
      <Zoom
        in={action !== ""}
        style={{ transitionDelay: "300ms" }}
        unmountOnExit
      >
        <Box component="section" position="relative" top={50}>
          {action == "Color" ? (
            <ColorPicker
              color={color}
              colorsUsed={colorsUsed}
              handleColorChange={handleColorChange}
              handleCloseOption={handleCloseAction}
            />
          ) : action == "Save" ? (
            <Model3dSave
              model3d={model3d}
              handleSaveModel3d={handleSaveModel3d}
            />
          ) : action == "Reset" ? (
            <ResetEditor
              defaultColor={DEFAULT_COLOR}
              defaultModel={DEFAULT_MODEL_3D}
              setColor={setColor}
              setColorsUsed={setColorsUsed}
              setModel3d={setModel3d}
              resetWorldScene={handleResetWorld}
            />
          ) : (
            ""
          )}
        </Box>
      </Zoom>
    </Box>
  );
}

export default EditorActions;
