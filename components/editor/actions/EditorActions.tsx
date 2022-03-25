import { useEffect, useState } from "react";
import { Box, Grid, IconButton, Zoom } from "@mui/material";
import { Palette, Save, Undo, Edit } from "@mui/icons-material";
import ColorPicker from "./color/ColorPicker";
import Model3dSave from "components/editor/actions/save/Model3dSave";
import ResetEditor from "./reset/ResetEditor";
import type { Action, Model3d } from "types/editorTypes";
import type VoxelWorld from "services/VoxelWord";
import type { Color } from "three";

interface Props {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
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
  const { canvasRef, world, handleResetWorld } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [action, setAction] = useState<Action>("");
  const [model3d, setModel3d] = useState<Model3d>(DEFAULT_MODEL_3D);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [colorsUsed, setColorsUsed] = useState<Color[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    function keepWorldChanges(event: Event): void {
      const MAX_NUM_COLORS_KEPT = 10;
      const worldColors = (event as CustomEvent).detail.name;
      const colorsUsed =
        worldColors.length <= MAX_NUM_COLORS_KEPT
          ? worldColors
          : worldColors.slice(-MAX_NUM_COLORS_KEPT);
      setColorsUsed(colorsUsed);
    }
    canvas?.addEventListener("worldChange", keepWorldChanges);
    return () => canvas?.removeEventListener("worldChange", keepWorldChanges);
  }, []);

  useEffect(() => world?.setPickedColor(color), [world, color]);

  useEffect(() => {
    if (open) setAction("");
  }, [open]);

  const handleToggleList = () => setOpen((open) => !open);
  const handleCloseList = (): void => setOpen(false);
  const handleOpenAction = (name: Action): void => {
    setAction(name);
    handleCloseList();
  };
  const handleCloseAction = (): void => {
    setAction("");
    handleCloseList();
  };
  const handleColorChange = setColor;
  const handleSaveModel3d = (): void => {
    if (world) setModel3d(world.onSave.call(world));
  };

  return (
    <Box component="section" height={256} mt={1}>
      <Box position="absolute" onClick={handleToggleList}>
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
              onClick={() => {
                if (name == "Save") handleSaveModel3d();
                handleOpenAction(name);
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
            <Model3dSave model3d={model3d} handleCloseOption={handleCloseAction}/>
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
