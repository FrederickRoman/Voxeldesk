import { Model3d } from "types/editorTypes";

interface Props {
  resetWorldScene: () => void;
  defaultColor: string;
  defaultModel: Model3d;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setModel3d: React.Dispatch<React.SetStateAction<Model3d>>;
}

function ResetEditor(props: Props): JSX.Element {
  const { resetWorldScene, ...worldState } = props;
  const { defaultColor, setColor, defaultModel, setModel3d } = worldState;
  const resetWorldState = (): void => {
    setColor(defaultColor);
    setModel3d(defaultModel);
  };
  const handleResetEditor = (): void => {
    resetWorldScene();
    resetWorldState();
  };
  return <button onClick={handleResetEditor}>Reset</button>;
}

export default ResetEditor;
