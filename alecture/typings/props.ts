import { CSSProperties } from 'react';

export interface IModalProps {
  style?: CSSProperties;
  show: boolean;
  onCloseModal: (e?: any) => void;
}

export interface IMenuProps extends IModalProps {
  showCloseButton?: boolean;
}
