import { Dispatch, SetStateAction, useState } from 'react';

type ReturnTypes = [boolean, () => void, Dispatch<SetStateAction<boolean>>];
const useShowValue = (initialData: boolean): ReturnTypes => {
  const [value, setValue] = useState(initialData);
  const onClickhandler = () => {
    setValue(true);
  };
  return [value, onClickhandler, setValue];
};

export default useShowValue;
