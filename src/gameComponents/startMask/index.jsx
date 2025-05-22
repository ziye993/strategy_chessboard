import SpanButton from "../../components/SpanButton";

export default function GameMask({ start, onClick }) {
  return !start && <div className="mask">
    <SpanButton className="start_span"
      onClick={onClick}
    >
      START
    </SpanButton>
  </div>
}
