import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Dasboard() {
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
    </Container>
  );
}

export default Dasboard;
