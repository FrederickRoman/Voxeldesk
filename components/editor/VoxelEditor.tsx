import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import EditorActions from "components/editor/actions/EditorActions";
import VoxelWorld from "services/VoxelWorld";
import EditorScene from "./scene/EditorScene";
import type { EditMode } from "types/editorTypes";

function VoxelEditor(): JSX.Element {
  const DEFAULT_EDIT_MODE = "add";
  const [world, setWorld] = useState<VoxelWorld | null>(null);
  const [mode, setMode] = useState<EditMode>(DEFAULT_EDIT_MODE);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const world = new VoxelWorld(canvas);
      setWorld(world);
      world.render();
      return () => setWorld(null);
    }
  }, []);

  useEffect(() => {
    if (world) {
      const resize = world.resize.bind(world);
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }
  }, [world]);

  const handleResetWorld = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const world = new VoxelWorld(canvas);
      setWorld(world);
      world.render();
    }
  };

  return (
    <Box component="section" position="relative">
      <EditorScene canvasRef={canvasRef} world={world} mode={mode} />
      <Box position="absolute" top={0} left={6}>
        <EditorActions
          world={world}
          defaultMode={DEFAULT_EDIT_MODE}
          mode={mode}
          setMode={setMode}
          handleResetWorld={handleResetWorld}
        />
      </Box>
    </Box>
  );
}

export default VoxelEditor;
