import type VoxelWorld from "services/VoxelWord";

interface Props {
  world: VoxelWorld | null;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

function EditorScene(props: Props): JSX.Element {
  const { world, canvasRef } = props;
  const handleMouseDown = world?.onMouseDown.bind(world);
  const handleMouseMove = world?.onMouseMove.bind(world);
  const handleMouseUp = world?.onMouseUp.bind(world);
  const handleLeftClick = world?.onRightClick.bind(world);
  
  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
      onContextMenu={handleLeftClick}
    />
  );
}

export default EditorScene;
