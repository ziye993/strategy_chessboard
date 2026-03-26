
import styles from './index.module.less';

function SpanText(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className = '', ...otherProps } = props;
  return (
    <span  {...otherProps} className={`${styles.span_text} ${className}`}>{props.children}</span>
  );
}

export default SpanText;