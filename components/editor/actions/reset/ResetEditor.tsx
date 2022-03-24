import type { Model3d } from "types/editorTypes";
import type { Color } from "three";

interface Props {
  resetWorldScene: () => void;
  defaultColor: string;
  defaultModel: Model3d;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setColorsUsed: React.Dispatch<React.SetStateAction<Color[]>>;
  setModel3d: React.Dispatch<React.SetStateAction<Model3d>>;
}

function ResetEditor(props: Props): JSX.Element {
  const { resetWorldScene, ...worldState } = props;
  const { defaultColor, setColor, setColorsUsed, defaultModel, setModel3d } =
    worldState;

  const resetWorldState = (): void => {
    setColor(defaultColor);
    setColorsUsed([]);
    setModel3d(defaultModel);
  };
  const handleResetEditor = (): void => {
    resetWorldScene();
    resetWorldState();
  };

  return <button onClick={handleResetEditor}>Reset</button>;
}

export default ResetEditor;
