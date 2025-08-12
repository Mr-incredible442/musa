import apiCall from '../helpers/apiCall';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
import Theme from './Theme';
import { Button } from 'react-bootstrap';

import { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../context/AuthContext';
import { LOCAL_URL } from '../helpers/variables';

function NavBar() {
  const [loading, setLoading] = useState(false);
  const { user, dispatch } = useContext(AuthContext);
  const token = localStorage.getItem('accessToken');

  const handleLogout = async () => {
    setLoading(true);
    if (!token) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      setLoading(false);
      return;
    }

    try {
      await apiCall.post(`${LOCAL_URL}/users/logout`, { token });
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setLoading(false);
    } catch (error) {
      console.error('Logout failed:', error.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      setLoading(false);
    }
  };

  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, 60_000 * 30);
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);

      clearTimeout(inactivityTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEliasOrIlyas =
    user && (user.firstName === 'elias' || user.firstName === 'ilyas');

  return (
    <Navbar expand='lg' bg='black' data-bs-theme='dark'>
      <Container>
        <Navbar.Brand>
          <Nav.Link as={Link} to={'/'}>
            Yussman
          </Nav.Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        {user && (
          <Navbar.Collapse id='basic-navbar-nav'>
            {' '}
            <Nav className='me-auto'>
              {user.firstName === 'hamda' || user.firstName === 'hamdi' ? (
                <Nav.Link as={Link} to={'/lusakashop'}>
                  Lusaka Shop
                </Nav.Link>
              ) : isEliasOrIlyas ? (
                <>
                  <Nav.Link as={Link} to={'/shopc'}>
                    Shop
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/bomastore'}>
                    Store
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/bomaregister'}>
                    Register
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to={'/register'}>
                    Register
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/store'}>
                    Store
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/restaurant'}>
                    Restaurant
                  </Nav.Link>
                  <NavDropdown title='Shops' id='basic-nav-dropdown'>
                    <NavDropdown.Item as={Link} to={'/shopa1'}>
                      Shop A1
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/shopa2'}>
                      Shop A2
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/shopb'}>
                      Shop B
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title='Boma' id='basic-nav-dropdown'>
                    <NavDropdown.Item as={Link} to={'/shopc'}>
                      Shop
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/bomastore'}>
                      Store
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/bomaregister'}>
                      Register
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title='Chinsali' id='basic-nav-dropdown'>
                    <NavDropdown.Item as={Link} to={'/chinsalirestaurant'}>
                      Restaurant
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/chinsalistore'}>
                      Store
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/chinsaliregister'}>
                      Register
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title='Chansa' id='basic-nav-dropdown'>
                    <NavDropdown.Item as={Link} to={'/chansarestaurant'}>
                      Restaurant
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/chansastore'}>
                      Store
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/chansaregister'}>
                      Register
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={'/lusakashop'}>
                      Lusaka Shop
                    </NavDropdown.Item>
                  </NavDropdown>
                  {/* <Nav.Link as={Link} to={'/shopw'}>
                    Shop W
                  </Nav.Link> */}
                  <Nav.Link as={Link} to={'/goat'}>
                    Goat
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/credit'}>
                    Credit
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/employees'}>
                    Employees
                  </Nav.Link>
                  <Nav.Link as={Link} to={'/orders'}>
                    Orders
                  </Nav.Link>
                  {user.role === 'admin' && (
                    <>
                      <Nav.Link as={Link} to={'/users'}>
                        Users
                      </Nav.Link>
                      <Nav.Link as={Link} to={'/logs'}>
                        Logs
                      </Nav.Link>
                    </>
                  )}
                </>
              )}
            </Nav>
            <div className='d-flex align-items-center '>
              <span className='me-2 text-capitalize'>{user.firstName}</span>
              <Button
                variant='outline-info'
                className='me-2'
                disabled={loading}
                onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Navbar.Collapse>
        )}
        <Theme />
      </Container>
    </Navbar>
  );
}

export default NavBar;
