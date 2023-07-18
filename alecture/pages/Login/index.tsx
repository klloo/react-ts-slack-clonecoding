import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { Header, Label, Input, Form, Button, LinkContainer, Error, Success } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const Login = () => {
  const { data, error, mutate } = useSWR('api/users', fetcher, {
    dedupingInterval: 100000,
  });

  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const [loginError, setLoginError] = useState('');

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      const user = {
        email,
        password,
      };
      setLoginError('');
      axios
        .post('api/users/login', user)
        .then((response) => {
          mutate(response.data, false);
        })
        .catch((error) => {
          setLoginError(error.response?.data);
        });
    },
    [email, password],
  );

  if (data === undefined) {
    return <div>로딩 중...</div>;
  }

  if (data) {
    return <Redirect to={`/workspace/sleact/channel/일반`} />;
  }

  return (
    <div>
      <Header>Sleact</Header>
      <Form onSubmit={onSubmitForm}>
        <Label>
          <span>이메일 주소</span>
          <div>
            <Input type="email" value={email} onChange={onChangeEmail}></Input>
          </div>
        </Label>
        <Label>
          <span>비밀번호</span>
          <div>
            <Input type="password" value={password} onChange={onChangePassword}></Input>
          </div>
        </Label>
        {loginError && <Error>{loginError}</Error>}
        <Button>로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default Login;
