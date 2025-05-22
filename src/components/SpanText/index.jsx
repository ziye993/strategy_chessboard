import './index.css';


function SpanText(props) {
  const { className = '', ...otherProps } = props;
  return (
    <span  {...otherProps} className={`span_text ${className}`}>{props.children}</span>
  );
}

export default SpanText;