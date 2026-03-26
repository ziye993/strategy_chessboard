import SpanButton from "../../components/SpanButton";

interface IProps {
  start: boolean, onClick: () => void
}

export default function GameMask({ start, onClick }: IProps) {
  return !start && <div className="mask">
    <SpanButton className="start_span"
      onClick={onClick}
    >
      START
    </SpanButton>
  </div>
}
