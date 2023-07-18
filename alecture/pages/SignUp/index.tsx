import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { Header, Label, Input, Form, Button, LinkContainer, Error, Success } from './styles';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const SignUp = () => {
  const { data } = useSWR('api/users', fetcher, {
    dedupingInterval: 100000,
  });

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, , setPassword] = useInput('');
  const [passwordCheck, , setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck],
  );
  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password],
  );
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (mismatchError || signUpError) return;
      const user = {
        email,
        nickname,
        password,
      };
      setSignUpSuccess(false);
      setSignUpError('');
      axios
        .post('api/users', user)
        .then((response) => {
          setSignUpSuccess(true);
        })
        .catch((error) => {
          setSignUpError(error.response.data);
        });
    },
    [email, nickname, password, passwordCheck],
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
          <span>닉네임</span>
          <div>
            <Input type="text" value={nickname} onChange={onChangeNickname}></Input>
          </div>
        </Label>
        <Label>
          <span>비밀번호</span>
          <div>
            <Input type="password" value={password} onChange={onChangePassword}></Input>
          </div>
        </Label>
        <Label>
          <span>비밀번호 확인</span>
          <div>
            <Input type="password" value={passwordCheck} onChange={onChangePasswordCheck}></Input>
          </div>
        </Label>
        {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
        {!nickname && <Error>닉네임을 입력해주세요.</Error>}
        {signUpError && <Error>{signUpError}</Error>}
        {signUpSuccess && <Success>회원가입 되었습니다! 로그인 해주세요.</Success>}
        <Button>회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;
