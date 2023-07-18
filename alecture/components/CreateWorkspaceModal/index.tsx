import React, { VFC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';
import loadable from '@loadable/component';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IModalProps } from '@typings/props';

const Modal = loadable(() => import('@components/Modal'));

const CreateWorkspaceModal: VFC<IModalProps> = ({ show, onCloseModal }) => {
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('api/users', fetcher, {
    dedupingInterval: 2000, // 2초. 2초간은 요청 안보내고 캐시된 메모리 가져옴
  });

  const [newWorkspaceName, onChangeNewWorkspaceName, setNewWorkspaceName] = useInput('');
  const [newWorkspaceUrl, onChangeNewWorkspaceUrl, setNewWorkspaceUrl] = useInput('');

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspaceName || !newWorkspaceName.trim()) return;
      if (!newWorkspaceUrl || !newWorkspaceUrl.trim()) return;
      const newWorkspace = {
        workspace: newWorkspaceName,
        url: newWorkspaceUrl,
      };
      axios
        .post('/api/workspaces', newWorkspace)
        .then(() => {
          mutate();
          setNewWorkspaceName('');
          setNewWorkspaceUrl('');
          onCloseModal();
        })
        .catch((e) => {
          console.dir(e);
          toast.error(e.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspaceName, newWorkspaceUrl],
  );
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateWorkspace}>
        <Label id="workspace-label">
          <span>워크스페이스 이름</span>
          <Input id="workspace" value={newWorkspaceName} onChange={onChangeNewWorkspaceName} type="text"></Input>
        </Label>
        <Label id="workspace-label">
          <span>워크스페이스 url</span>
          <Input id="workspace" value={newWorkspaceUrl} onChange={onChangeNewWorkspaceUrl} type="text"></Input>
        </Label>
        <Button>생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
