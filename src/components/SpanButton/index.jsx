import './index.css';


function SpanButton(props) {
  const { size = "normal", className = '', ...otherProps } = props;
  return (
    <span  {...otherProps} className={`span_button span_button_size_${size} ${className}`}>{props.children}</span>
  );
}

export default SpanButton;