import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useContext, useEffect, useState } from 'react';
import { ShopBContext } from '../../context/ShopBContext';

import CashModal from './modals/CashModal';
import DeleteCashorChange from './modals/DeleteCashorChange';

const endpoint = 'deletecash';

function CashAndChange() {
  const [cash, setCash] = useState([]);
  const { shopBShift } = useContext(ShopBContext);

  useEffect(() => {
    if (Object.keys(shopBShift).length !== 0) {
      setCash(shopBShift.cash);
    }
  }, [shopBShift]);

  return (
    <Container>
      <Row>
        <Col>
          <div className='d-flex justify-content-between p-2'>
            <h5>Cash</h5>
            <h5>Total: K {cash.reduce((a, b) => a + b, 0).toLocaleString()}</h5>
            <CashModal id={shopBShift._id} />
          </div>
          <Card>
            <ListGroup variant='flush'>
              {cash.map((cash) => (
                <ListGroup.Item
                  key={Math.floor(Math.random() * 100_000)}
                  id={Math.floor(Math.random() * 100_000)}
                  className='d-flex justify-content-between '>
                  K{cash.toLocaleString()}
                  <DeleteCashorChange
                    endpoint={endpoint}
                    id={shopBShift._id}
                    amount={cash}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CashAndChange;
