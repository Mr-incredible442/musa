import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useContext, useEffect, useState } from 'react';
import { ShopWContext } from '../../context/ShopWContext';

import CashModal from './modals/CashModal';
import DeleteCashorChange from './modals/DeleteCashorChange';

const endpoint = 'deletecash';

function CashAndChange() {
  const [cash, setCash] = useState([]);
  const { shopWShift } = useContext(ShopWContext);

  useEffect(() => {
    if (Object.keys(shopWShift).length !== 0) {
      setCash(shopWShift.cash);
    }
  }, [shopWShift]);

  return (
    <Container>
      <Row>
        <Col>
          <div className='d-flex justify-content-between p-2'>
            <h5>Cash</h5>
            <h5>Total: K {cash.reduce((a, b) => a + b, 0).toLocaleString()}</h5>
            <CashModal id={shopWShift._id} />
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
                    id={shopWShift._id}
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
