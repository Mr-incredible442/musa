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
      <Link to={'/store'}>Store</Link>
      <hr />
      <Link to={'/register'}>Register</Link>
      <hr />
      <Link to={'/restaurant'}>Restaurant</Link>
      <hr />
      <Link to={'/shopa1'}>Shop A1</Link>
      <hr />
      <Link to={'/shopa2'}>Shop A2</Link>
      <hr />
      <Link to={'/shopb'}>Shop B</Link>
      <hr />
      <Link to={'/orders'}>Orders</Link>
      <hr />
      <Link to={'/shopc'}>Shop C</Link>
      <hr />
      {/* <Link to={'/shopw'}>Shop W</Link>
      <hr /> */}
      <Link to={'/chinsalirestaurant'}>Chinsali</Link>
      <hr />
      <Link to={'/chinsalistore'}>Chinsali store</Link>
      <hr />
      <Link to={'/chinsaliregister'}>Chinsali Register</Link>
      <hr />
      <Link to={'/goat'}>Goat</Link>
      <hr />
      <Link to={'/credit'}>Credit</Link>
      <hr />
      <Link to={'/employees'}>Employees</Link>
    </Container>
  );
}

export default Dasboard;
