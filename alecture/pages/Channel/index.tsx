import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import { Container, Header } from '@pages/Channel/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import useShowValue from '@hooks/useShowValue';
import InviteChannelModal from '@components/InviteChannelModal';

const PAGE_SIZE = 20;
const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR<IUser>('api/users', fetcher);
  const { data: channelData } = useSWR<IChannel>(`api/workspaces/${workspace}/channels/${channel}`, fetcher);

  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);
  const [showInviteChannelModal, onClickInviteChannel, setShowInviteChannelModal] = useShowValue(false);

  const { data: channelMembersData, mutate: channelMembersMutate } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite(
    (index: number) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const onMessage = useCallback(
    (chatData: IChat) => {
      mutateChat((prevChatData) => {
        if (chatData.Channel.name === channel && myData?.id !== chatData.UserId) {
          prevChatData?.[0].unshift(chatData);
          return prevChatData;
        }
      }).then(() => {
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            scrollbarRef.current?.scrollToBottom();
          }
        }
      });
    },
    [mutateChat, channel, myData],
  );

  useEffect(() => {
    if (chatData?.length === 1) scrollbarRef.current?.scrollToBottom();
  }, [chatData]);

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
    return () => {
      localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
    };
  }, [workspace, channel]);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!chat || !chat.trim() || !channelData) return;
      const newChat = {
        content: chat,
      };
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData?.[0][0]?.id || 0) + 1,
          content: newChat.content,
          UserId: myData?.id,
          User: myData,
          ChannelId: channelData.id,
          Channel: channelData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false).then(() => {
        setChat('');
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        scrollbarRef.current?.scrollToBottom();
      });
      axios
        .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, newChat)
        .then(() => {
          mutateChat();
        })
        .catch((e) => {
          console.dir(e);
        });
    },
    [chat, chatData, channel, mutateChat, myData, setChat, workspace, channelData],
  );

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!myData) return null;
  return (
    <div>
      <Container>
        <Header>
          <span># {channel}</span>{' '}
          <div className="header-right">
            <span>{channelMembersData?.length}</span>
            <button
              onClick={onClickInviteChannel}
              className="c-button-unstyled p-ia__view_header__button"
              aria-label="Add people to #react-native"
              data-sk="tooltip_parent"
              type="button"
            >
              <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
            </button>
          </div>
        </Header>
        <ChatList
          chatSections={chatSections}
          ref={scrollbarRef}
          isEmpty={isEmpty}
          setSize={setSize}
          isReachingEnd={isReachingEnd}
        />
        <ChatBox
          chat={chat}
          onChangeChat={onChangeChat}
          onSubmitForm={onSubmitForm}
          placeholder={`Message #${channel}`}
        />
      </Container>
      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} />
    </div>
  );
};

export default Channel;
