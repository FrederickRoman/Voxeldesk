interface Props {
  handleReset: () => void;
}

function ResetEditor(props: Props): JSX.Element {
  const { handleReset } = props;
  return <button onClick={handleReset}>Reset</button>;
}

export default ResetEditor;
