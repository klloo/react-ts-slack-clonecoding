import React, { VFC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import { Redirect, Route, Switch, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { IChannel, IUser } from '@typings/db';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  WorkspaceWrapper,
  Workspaces,
} from './styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import useShowValue from '@hooks/useShowValue';
import ChannelList from '@components/ChannelList';
import useSocket from '@hooks/useSocket';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));
const Menu = loadable(() => import('@components/Menu'));
const CreateWorkspaceModal = loadable(() => import('@components/CreateWorkspaceModal'));
const DMList = loadable(() => import('@components/DMList'));

const Workspace: VFC = () => {
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('api/users', fetcher, {
    dedupingInterval: 2000, // 2초. 2초간은 요청 안보내고 캐시된 메모리 가져옴
  });

  const { workspace } = useParams<{ workspace: string }>();

  const { data: channelData } = useSWR<IChannel[]>(userData ? `api/workspaces/${workspace}/channels` : null, fetcher);

  const { data: memberData, mutate: memberMutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateWorkspaceModal, onClickCreateWorkspace, setShowCreateWorkspaceModal] = useShowValue(false);
  const [showCreateChannelModal, onClickCreateChannel, setShowCreateChannelModal] = useShowValue(false);
  const [showInviteWorkspaceModal, onClickInviteWorkspace, setShowInviteWorkspacelModal] = useShowValue(false);
  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    if (userData && socket && channelData) {
      const data = {
        id: userData.id,
        channels: channelData.map((ch) => ch.id),
      };
      socket.emit('login', data);
    }
  }, [userData, socket, channelData]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [workspace, disconnect]);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspacelModal(false);
  }, []);

  const onLogout = () => {
    axios.post('/api/users/logout').then(() => {
      mutate(false, false);
    });
  };

  const toggleProfileModal = useCallback((e) => {
    e.stopPropagation();
    setShowUserProfile((prev) => !prev);
  }, []);

  const toggleWorkspaceModal = useCallback((e) => {
    e.stopPropagation();
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={toggleProfileModal}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.email} />
            <Menu style={{ right: 0, top: 38 }} show={showUserProfile} onCloseModal={toggleProfileModal}>
              <ProfileModal>
                <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.email} />
                <div>
                  <span id="profile-name">{userData.nickname}</span>
                  <span id="profile-active">Active</span>
                </div>
              </ProfileModal>
              <div>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </div>
            </Menu>
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces?.map((ws) => (
            <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
              <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
            </Link>
          ))}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>{workspace}</WorkspaceName>
          <MenuScroll>
            <Menu style={{ top: 95, left: 80 }} show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal}>
              <WorkspaceModal>
                <h2>{workspace}</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickCreateChannel}>채널 생성</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <CreateWorkspaceModal show={showCreateWorkspaceModal} onCloseModal={onCloseModal} />
      <CreateChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} />
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default Workspace;
