interface Props {
  visible: boolean;
  text: string;
}

export function Spinner({ visible, text }: Props) {
  return (
    <div id="spinner" className={visible ? 'on' : ''} role="status">
      <span className="spinner-icon" aria-hidden />
      <span id="spinnerText">{text}</span>
    </div>
  );
}
