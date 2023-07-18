import { Dispatch, SetStateAction, useState } from 'react';

type ReturnTypes<T = any> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];
const useInput = <T = any>(initialData: T): ReturnTypes => {
  const [value, setValue] = useState(initialData);
  const handler = (e: any) => {
    setValue(e.target.value);
  };
  return [value, handler, setValue];
};

export default useInput;
