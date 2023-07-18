import React, { VFC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { IUser, IChannel } from '@typings/db';
import loadable from '@loadable/component';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { useParams } from 'react-router';
import { IModalProps } from '@typings/props';

const Modal = loadable(() => import('@components/Modal'));

const CreateChannelModal: VFC<IModalProps> = ({ show, onCloseModal }) => {
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();

  const {
    data: channelData,
    error: channelError,
    mutate: channelMutate,
  } = useSWR<IChannel[]>(userData ? `api/workspaces/${workspace}/channels` : null, fetcher);

  const [newChanneleName, onChangeNewChannelName, setNewChannelName] = useInput('');

  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      if (!newChanneleName || !newChanneleName.trim()) return;
      const newChannel = {
        name: newChanneleName,
      };
      axios
        .post(`/api/workspaces/${workspace}/channels`, newChannel)
        .then(() => {
          channelMutate();
          setNewChannelName('');
          onCloseModal();
        })
        .catch((e) => {
          console.dir(e);
          toast.error(e.response?.data, { position: 'bottom-center' });
        });
    },
    [newChanneleName],
  );
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널 이름</span>
          <Input id="channel" value={newChanneleName} onChange={onChangeNewChannelName} type="text"></Input>
        </Label>
        <Button>생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
