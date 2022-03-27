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
  const handleTouchStart = world?.onTouchStart.bind(world);
  const handleTouchMove = world?.onTouchMove.bind(world);
  const handleTouchEnd = world?.onTouchEnd.bind(world);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
      onContextMenu={handleLeftClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pinch-zoom"}}
    />
  );
}

export default EditorScene;
