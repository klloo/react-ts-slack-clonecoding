import React, { VFC, useCallback } from 'react';
import loadable from '@loadable/component';
import { IModalProps } from '@typings/props';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';

const Modal = loadable(() => import('@components/Modal'));

const InviteWorkspaceModal: VFC<IModalProps> = ({ show, onCloseModal }) => {
  const { data: userData } = useSWR<IUser | false>('api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const [userEmail, onChangeUserEmail, setUserEmail] = useInput('');

  const { workspace } = useParams<{ workspace: string }>();

  const { mutate: memberMutate } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  const onInviteChannel = useCallback(
    (e) => {
      e.preventDefault();
      if (!userEmail || !userEmail.trim()) return;
      const member = {
        email: userEmail,
      };
      axios
        .post(`api/workspaces/${workspace}/members`, member)
        .then(() => {
          memberMutate();
          onCloseModal();
          setUserEmail('');
        })
        .catch((e) => {
          console.dir(e);
          toast.error(e.response?.data, { position: 'bottom-center' });
        });
    },
    [userEmail, workspace],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteChannel}>
        <Label id="member-label">
          <span>사용자 이메일</span>
          <Input id="member" value={userEmail} onChange={onChangeUserEmail} type="email"></Input>
        </Label>
        <Button>초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
