import { useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dasboard() {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    document.title = 'Muspa - Dashboard';
  }, []);
  return (
    <Container>
      <h1>Dasboard</h1>
      <Link to={'/store'}>Store</Link>
      <hr />
      <Link to={'/register'}>Register</Link>
      <hr />
      <Link to={'/shop'}>Shop</Link>
      <hr />
      {user?.role === 'admin' && (
        <>
          <Link to={'/report'}>Report</Link>
          <hr />
        </>
      )}
    </Container>
  );
}

export default Dasboard;
