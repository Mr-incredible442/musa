import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useContext, useEffect, useState } from 'react';
import { ChinsaliRestaurantContext } from '../../context/ChinsaliRestaurantContext';
import { AuthContext } from '../../context/AuthContext';

import CashModal from './modals/CashModal';
import ChangeModal from './modals/ChangeModal';
import DeleteCashorChange from './modals/DeleteCashorChange';

const endpoint = 'deletecash';
const endpoint2 = 'deletechange';

function CashAndChange() {
  const [cash, setCash] = useState([]);
  const [change, setChange] = useState([]);
  const { shift } = useContext(ChinsaliRestaurantContext);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(shift).length !== 0) {
      setCash(shift.cash);
      setChange(shift.change);
    }
  }, [shift]);

  return (
    <Container>
      <Row>
        <Col>
          {user !== null && user.role === 'admin' && (
            <>
              <div className='d-flex justify-content-between p-2'>
                <h5>Cash</h5>
                <h5>
                  Total: K {cash.reduce((a, b) => a + b, 0).toLocaleString()}
                </h5>
                <CashModal id={shift._id} />
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
                        id={shift._id}
                        amount={cash}
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </>
          )}
        </Col>
        <Col>
          <div className='d-flex justify-content-between p-2'>
            <h5>Change</h5>
            <h5>
              Total: K {change.reduce((a, b) => a + b, 0).toLocaleString()}
            </h5>
            <ChangeModal id={shift._id} />
          </div>
          <Card>
            <ListGroup variant='flush'>
              {change.map((change) => (
                <ListGroup.Item
                  key={Math.floor(Math.random() * 100_000)}
                  id={Math.floor(Math.random() * 100_000)}
                  className='d-flex justify-content-between '>
                  K{change.toLocaleString()}
                  <DeleteCashorChange
                    endpoint={endpoint2}
                    id={shift._id}
                    amount={change}
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
