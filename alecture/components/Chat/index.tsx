import React, { VFC, memo, useMemo } from 'react';
import { IChat, IDM, IUser } from '@typings/db';
import gravatar from 'gravatar';
import { ChatWrapper } from './styles';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';
interface Props {
  data: IDM | IChat;
}
const Chat: VFC<Props> = ({ data }) => {
  const user: IUser = 'Sender' in data ? data.Sender : data.User;
  const { workspace } = useParams<{ workspace: string }>();
  const result = useMemo(() => {
    return regexifyString({
      input: data.content,
      pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
      decorator(match, index) {
        const arr = match.match(/@\[(.+?)]\((\d+?)\)/)!;
        if (arr) {
          return (
            <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
              @{arr[1]}
            </Link>
          );
        }
        return <br key={index} />;
      },
    });
  }, [data.content, workspace]);

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.email} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);
