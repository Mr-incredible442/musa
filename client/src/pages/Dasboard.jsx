import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Dasboard() {
  useEffect(() => {
    document.title = 'Yussman';
  }, []);
  return (
    <Container>
      <h1>Dasboard</h1>
      <Link to={'/bomastore'}>Store</Link>
      <hr />
      <Link to={'/bomaregister'}>Register</Link>
      <hr />
      <Link to={'/shopc'}>Shop</Link>
      <hr />
    </Container>
  );
}

export default Dasboard;
