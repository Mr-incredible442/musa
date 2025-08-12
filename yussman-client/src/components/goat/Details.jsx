import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { GoatContext } from '../../context/GoatContext';
import { AuthContext } from '../../context/AuthContext';

import Delete from './Delete';

import { Container, Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { BsArrowLeftShort } from 'react-icons/bs';
import PayModal from './PayModal';

// eslint-disable-next-line react/prop-types
const Details = ({ handleDelete, handleUpdate }) => {
  const [goat, setGoat] = useState({});
  const [amount, setAmount] = useState(0);
  const [kgs, setKgs] = useState(0);
  const [isloading, setIsLoading] = useState(true);

  const [suppliers] = useContext(GoatContext);
  const { user } = useContext(AuthContext);

  let { id } = useParams();
  // get the single goat
  useEffect(() => {
    handleSingleGoat(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    isloading
      ? ''
      : setAmount(
          goat.kgs
            .map((kg) => (kg < 20 ? kg * 15 : kg * 25))
            .reduce((a, c) => a + c),
        );

    isloading ? '' : setKgs(goat.kgs.reduce((a, c) => a + c));
  }, [isloading, goat]);

  const handleSingleGoat = (id) => {
    if (suppliers !== null) {
      suppliers.map((goat) => {
        if (goat._id === id) {
          setGoat(goat);
          setIsLoading(false);
        }
      });
    }
  };

  if (suppliers === null) {
    return;
  }

  return (
    <div>
      <Link to={'/goat'}>
        <Button variant='outline-secondary m-3'>
          <BsArrowLeftShort />
          Back
        </Button>
      </Link>
      {isloading ? (
        <div className='text-center mt-5 pt-5'>
          <Spinner
            variant='light'
            className='text-center'
            style={{ width: '8rem', height: '8rem' }}
          />
        </div>
      ) : (
        <Container className='mt-2'>
          <Card>
            <Card.Header as='h2'>{goat.name}</Card.Header>
            <Card.Body>
              <Card.Title>Total KGs : {kgs}</Card.Title>
              <Card.Title>
                Total Amount : K {amount.toLocaleString()}{' '}
              </Card.Title>
              <Card.Text>Date : {goat.date}</Card.Text>
              <Card.Text>Collection Date : {goat.collectionDate}</Card.Text>
              <div className='d-flex justify-content-between'>
                <PayModal
                  id={id}
                  amount={amount}
                  handleUpdate={handleUpdate}
                  name={goat.name}
                />
                {user !== null && user.role === 'admin' && (
                  <Delete id={id} handleDelete={handleDelete} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>
      )}
    </div>
  );
};

export default Details;
