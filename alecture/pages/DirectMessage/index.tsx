import { Header } from '@pages/DirectMessage/styles';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import gravatar from 'gravatar';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import { Container } from '@pages/Channel/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';

const PAGE_SIZE = 20;

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR<IUser>('api/users', fetcher);
  const { data: userData } = useSWR<IUser>(`api/workspaces/${workspace}/users/${id}`, fetcher);

  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite(
    (index: number) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const onMessage = useCallback(
    (chatData: IDM) => {
      if (chatData.SenderId !== Number(id) || myData?.id === chatData.SenderId) return;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift(chatData);
        return prevChatData;
      }).then(() => {
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
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
    [id, mutateChat, myData, workspace],
  );

  useEffect(() => {
    if (chatData?.length === 1) scrollbarRef.current?.scrollToBottom();
  }, [chatData]);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
    return () => {
      localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
    };
  }, [workspace, id]);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!chat || !chat.trim()) return;
      const newChat = {
        content: chat,
      };
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData?.[0][0]?.id || 0) + 1,
          content: newChat.content,
          SenderId: myData?.id,
          Sender: myData,
          ReceiverId: userData?.id,
          Receiver: userData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false).then(() => {
        setChat('');
        scrollbarRef.current?.scrollToBottom();
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
      });
      axios
        .post(`/api/workspaces/${workspace}/dms/${id}/chats`, newChat)
        .then(() => {
          mutateChat();
        })
        .catch((e) => {
          console.dir(e);
        });
    },
    [chat, chatData, id, mutateChat, myData, setChat, userData, workspace],
  );

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!userData || !myData) return null;

  return (
    <div>
      <Container>
        <Header>
          <img src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.email} />
          <span>{userData.nickname}</span>
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
          placeholder={`Message ${userData.nickname}`}
        />
      </Container>
    </div>
  );
};

export default DirectMessage;
