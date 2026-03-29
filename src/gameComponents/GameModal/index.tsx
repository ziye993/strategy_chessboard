import { MouseEventHandler, ReactNode, useEffect, useState } from 'react';
import './index.css';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
  showConfirm?: boolean | undefined;
  showCancel?: boolean | undefined;
  onConfirm: () => void;
  closeOnOverlayClick?: boolean | undefined;
  className?: string | undefined;
}

// 暗黑主题弹框组件
const GameModal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = '确认',
  cancelText = '取消',
  showConfirm = true,
  showCancel = true,
  onConfirm,
  closeOnOverlayClick = true,
  className = ''
}: IProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // 处理弹框打开/关闭状态
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (!isClosing) {
      // 开始关闭动画
      setIsClosing(true);
    }
  }, [isOpen]);

  // 动画结束后隐藏组件
  const handleAnimationEnd = () => {
    if (isClosing) {
      setShouldRender(false);
      // 通知父组件关闭完成
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  // 点击背景遮罩关闭弹框
  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (closeOnOverlayClick && e?.target === e?.currentTarget && !isClosing) {
      setIsClosing(true);
    }
  };

  // 关闭按钮点击处理
  const handleCloseClick = () => {
    if (!isClosing) {
      setIsClosing(true);
    }
  };

  // 确认按钮点击处理
  const handleConfirmClick = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    } //暗黑主题弹框组件
    // 默认行为是关闭弹框
    if (!isClosing) {
      setIsClosing(true);
    }
  };

  return (
    shouldRender && (
      <div
        className={`dark-modal-overlay ${className} ${isClosing ? 'closing' : ''}`}
        onClick={handleOverlayClick}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={`dark-modal ${isClosing ? 'closing' : ''}`}>
          <div className="dark-modal-header">
            <h3 className="dark-modal-title">{title}</h3>
            <button className="dark-modal-close" onClick={handleCloseClick}>
              ×
            </button>
          </div>
          <div className="dark-modal-content">{children}</div>
          <div className="dark-modal-footer">
            {showCancel && (
              <button className="dark-modal-cancel" onClick={handleCloseClick}>
                {cancelText}
              </button>
            )}
            {showConfirm && (
              <button className="dark-modal-confirm" onClick={handleConfirmClick}>
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default GameModal;