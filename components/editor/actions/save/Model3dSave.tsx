import { Box } from "@mui/material";
import type { Model3d } from "types/editorTypes";

interface Props {
  model3d: Model3d;
  handleSaveModel3d: () => void;
}

function Model3dSave(props: Props): JSX.Element {
  const { model3d, handleSaveModel3d } = props;

  return (
    <section>
      <button onClick={handleSaveModel3d}>Save</button>
      <Box>{model3d.obj}</Box>
      <Box>{model3d.mtl}</Box>
    </section>
  );
}

export default Model3dSave;
