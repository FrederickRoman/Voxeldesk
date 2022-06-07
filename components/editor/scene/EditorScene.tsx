import type VoxelWorld from "services/world/VoxelWorld";

interface Props {
  world: VoxelWorld | null;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  mode: "add" | "remove";
}

function EditorScene(props: Props): JSX.Element {
  const { world, canvasRef, mode } = props;

  const handleMouseDown = world?.onMouseDown.bind(world);
  const handleMouseMove = world?.onMouseMove.bind(world);
  const handleMouseUp = (event: React.MouseEvent) =>
    world?.onMouseUp.bind(world)(event, mode);
  const handleRightClick = world?.onRightClick.bind(world);
  
  const handleTouchStart = world?.onTouchStart.bind(world);
  const handleTouchMove = world?.onTouchMove.bind(world);
  const handleTouchEnd = (event: React.TouchEvent) =>
    world?.onTouchEnd.bind(world)(event, mode);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
      onContextMenu={handleRightClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pinch-zoom" }}
    />
  );
}

export default EditorScene;
