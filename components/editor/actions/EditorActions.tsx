import { useEffect, useState } from "react";
import { Box, Grid, IconButton, Zoom } from "@mui/material";
import {
  Palette,
  Save,
  Edit,
  RestartAlt,
  Undo,
  Close,
  Iso,
  DownloadForOffline,
} from "@mui/icons-material";
import VoxelColorPicker from "./color/VoxelColorPicker";
import EditorResetter from "./reset/EditorResetter";
import ModelSaver from "./save/ModelSaver";
import ModelLoader from "./load/ModelLoader";
import type { Action, EditMode, Model3d } from "types/editorTypes";
import type VoxelWorld from "services/world/VoxelWorld";
import type { Color } from "three";
import EditModeSwitch from "./mode/EditModeSwitch";
import { useErrorHandler } from "react-error-boundary";

interface Props {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  world: VoxelWorld | null;
  defaultMode: EditMode;
  mode: EditMode;
  setMode: React.Dispatch<React.SetStateAction<EditMode>>;
  handleResetWorld: () => void;
}

const DEFAULT_OPEN = false;
const DEFAULT_ACTION = "";
const DEFAULT_COLOR = "#feb74c";
const DEFAULT_COLORS_USED: Color[] = [];
const DEFAULT_MODEL_3D = Object.freeze({ obj: "", mtl: "" });
const EDITING_ACTIONS: readonly { icon: JSX.Element; name: Action }[] =
  Object.freeze([
    { icon: <Iso />, name: "Add/Remove" },
    { icon: <Palette />, name: "Color" },
    { icon: <Undo />, name: "Undo" },
    { icon: <RestartAlt />, name: "Reset" },
    { icon: <Save />, name: "Save" },
    { icon: <DownloadForOffline />, name: "Load" },
  ]);

function EditorActions(props: Props): JSX.Element {
  const { canvasRef, world, defaultMode, mode, setMode, handleResetWorld } =
    props;
  const [open, setOpen] = useState<boolean>(DEFAULT_OPEN);
  const [action, setAction] = useState<Action>(DEFAULT_ACTION);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [colorsUsed, setColorsUsed] = useState<Color[]>(DEFAULT_COLORS_USED);
  const [model3d, setModel3d] = useState<Model3d>(DEFAULT_MODEL_3D);
  const [loadedModel, setLoadedModel] = useState<Model3d>(DEFAULT_MODEL_3D);
  const handleError = useErrorHandler();

  useEffect(() => {
    function keepUsedColors(event: Event): void {
      const MAX_NUM_COLORS_KEPT = 10;
      const worldColors: Color[] = (event as CustomEvent).detail.usedColors;
      const colorsUsed =
        worldColors.length <= MAX_NUM_COLORS_KEPT
          ? worldColors
          : worldColors.slice(-MAX_NUM_COLORS_KEPT);
      setColorsUsed(colorsUsed);
    }
    world?.eventBus.on("usedColorsChange", keepUsedColors);
    return () => world?.eventBus.off("usedColorsChange", keepUsedColors);
  }, [world]);

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
  const handleUndoEdit = (): void => world?.onUndo.call(world);

  const handleActionClick = (name: Action): void => {
    if (name == "Undo") {
      handleUndoEdit();
    } else {
      if (name == "Save") handleSaveModel3d();
      handleOpenAction(name);
    }
  };

  const handleLoadModel = (): void => {
    try {
      world?.onLoadModel.call(world, loadedModel);
      handleCloseAction();
      // The model render on canvas only after an interaction (e.g. mousemove).
      // So to force an immediate render, distpatch a mousemove event.
      const eventOptions = {
        view: window,
        bubbles: true,
        cancelable: true,
      };
      const triggerRenderEvent = new MouseEvent("mousemove", eventOptions);
      canvasRef.current?.dispatchEvent(triggerRenderEvent);
    } catch (error) {
      handleError(error);
    }
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
          {open ? <Close /> : <Edit />}
        </IconButton>
      </Box>
      <Box
        position="absolute"
        left="calc(100vw - 14px)"
        width={10}
        height="calc(100vh - 6px)"
        sx={{ backgroundColor: "divider" }}
      />
      <Zoom in={open} unmountOnExit>
        <Box position="relative" top={50}>
          {EDITING_ACTIONS.map(({ name, icon }) => (
            <Box key={name} onClick={() => handleActionClick(name)}>
              <Grid
                container
                gridTemplateRows={1}
                gridTemplateColumns={2}
                justifyContent="start"
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
          {action == "Add/Remove" ? (
            <EditModeSwitch
              mode={mode}
              setMode={setMode}
              handleCloseAction={handleCloseAction}
            />
          ) : action == "Color" ? (
            <VoxelColorPicker
              color={color}
              colorsUsed={colorsUsed}
              handleColorChange={handleColorChange}
              handleCloseOption={handleCloseAction}
            />
          ) : action == "Reset" ? (
            <EditorResetter
              defaultMode={defaultMode}
              defaultColor={DEFAULT_COLOR}
              defaultModel={DEFAULT_MODEL_3D}
              setMode={setMode}
              setColor={setColor}
              setColorsUsed={setColorsUsed}
              setModel3d={setModel3d}
              resetWorldScene={handleResetWorld}
              handleCloseAction={handleCloseAction}
            />
          ) : action == "Save" ? (
            <ModelSaver
              defaultModel={DEFAULT_MODEL_3D}
              model3d={model3d}
              handleCloseOption={handleCloseAction}
            />
          ) : action == "Load" ? (
            <ModelLoader
              defaultModel={DEFAULT_MODEL_3D}
              setLoadedModel={setLoadedModel}
              handleLoadModel={handleLoadModel}
              handleCloseOption={handleCloseAction}
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
