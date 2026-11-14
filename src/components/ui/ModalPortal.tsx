/**
 * 將 modal 渲染至 document.body，避免父層 transform / stacking context 導致 fixed 錯位
 */
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ModalPortal({ children }: Props) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export default ModalPortal;
