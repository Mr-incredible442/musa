import { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

import { LOCAL_URL } from '../helpers/variables';
import { AuthContext } from '../context/AuthContext';

function Login() {
  useEffect(() => {
    document.title = 'Muspa - Login';
  }, []);

  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberError, setNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { dispatch } = useContext(AuthContext);

  const validateNumber = (value) => {
    if (!value) {
      setNumberError('Number is required');
      return false;
    }
    if (!/^\d{10}$/.test(value)) {
      setNumberError('Number must be exactly 10 digits');
      return false;
    }
    setNumberError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setNumber(value);
      validateNumber(value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSignin = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateNumber(number) || !validatePassword(password)) {
      setLoading(false);
      return;
    }

    axios
      .post(`${LOCAL_URL}/users/login`, {
        number,
        password,
      })
      .then((res) => {
        dispatch({ type: 'LOGIN', payload: res.data.user });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.msg + '. Please refresh the page' ||
            'An error occurred please refresh the page',
        );
        setLoading(false);
      });
  };

  return (
    <Container className='px-4'>
      <div className='col-12 col-md-8 col-lg-6 mx-auto mt-5 border p-3 p-md-5 rounded'>
        <div className='text-center mb-4'>
          <h2 className='mb-2'>Welcome Back</h2>
          <p className='text-muted'>Please enter your credentials to login</p>
        </div>
        {error && (
          <Alert variant='danger' className='mb-3'>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSignin}>
          <Form.Group className='mb-3' controlId='number'>
            <Form.Label>Number</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter number'
              required
              autoFocus
              minLength={10}
              maxLength={10}
              value={number}
              autoComplete='off'
              onChange={handleNumberChange}
              isInvalid={!!numberError}
            />
            <Form.Control.Feedback type='invalid'>
              {numberError}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className='mb-3' controlId='password'>
            <Form.Label>Password</Form.Label>
            <div className='position-relative'>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password'
                required
                value={password}
                onChange={handlePasswordChange}
                isInvalid={!!passwordError}
                style={{ paddingRight: '5rem' }}
              />
              <Button
                variant='link'
                className='position-absolute top-50 translate-middle-y text-decoration-none'
                onClick={() => setShowPassword(!showPassword)}
                type='button'
                style={{
                  right: '3.5rem',
                  zIndex: 2,
                }}>
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Form.Control.Feedback type='invalid' style={{ zIndex: 1 }}>
              {passwordError}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant='primary' type='submit' disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className='me-2'
                />
                Loading...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default Login;
