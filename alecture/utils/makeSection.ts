import { IChat, IDM } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatData: (IDM | IChat)[]) {
  const section: { [key: string]: (IDM | IChat)[] } = {};
  chatData.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (section[monthDate]) section[monthDate].push(chat);
    else section[monthDate] = [chat];
  });
  return section;
}
