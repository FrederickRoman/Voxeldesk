import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import EditorActions from "components/editor/actions/EditorActions";
import VoxelWorld from "services/VoxelWord";
import type { Model3d } from "types/editorTypes";
import EditorScene from "./scene/EditorScene";

function VoxelEditor(): JSX.Element {
  const DEFAULT_COLOR = "#feb74c";
  const DEFAULT_MODEL_3D = Object.freeze({ obj: "", mtl: "" });
  const [world, setWorld] = useState<VoxelWorld | null>(null);
  const [model3d, setModel3d] = useState<Model3d>(DEFAULT_MODEL_3D);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
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

  useEffect(() => world?.setPickedColor(color), [world, color]);

  const saveModel3d = (): void => {
    if (world) setModel3d(world.onSave.call(world));
  };

  const resetWorld = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const world = new VoxelWorld(canvas);
      setWorld(world);
      world.render();
      setColor(DEFAULT_COLOR);
    }
  };

  const handleColorChange = setColor;
  const handleSaveModel3d = saveModel3d;
  const handleReset = resetWorld;

  return (
    <Box component="section" position="relative">
      <EditorScene canvasRef={canvasRef} world={world} />
      <Box position="absolute" top={0} left={24}>
        <EditorActions
          handleReset={handleReset}
          color={color}
          model3d={model3d}
          handleColorChange={handleColorChange}
          handleSaveModel3d={handleSaveModel3d}
        />
      </Box>
    </Box>
  );
}

export default VoxelEditor;
