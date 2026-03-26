import styles from './index.module.less';

interface IProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "normal" | "small" | "large";
  className?: string;
  children?: React.ReactNode;
}

function SpanButton(props: IProps) {
  const { size = "normal", className = '', ...otherProps } = props;
  return (
    <span  {...otherProps} className={`${styles.span_button} ${styles['span_button_size_' + size]} ${className}`}>{props.children}</span>
  );
}

export default SpanButton;