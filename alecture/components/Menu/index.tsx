import React, { FC, CSSProperties, useCallback } from 'react';
import { CreateMenu, CloseModalButton } from './styles';
import { IMenuProps } from '@typings/props';

const Menu: FC<IMenuProps> = ({ children, style, show, onCloseModal, showCloseButton }) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;
  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {showCloseButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

Menu.defaultProps = {
  showCloseButton: true,
};
export default Menu;
