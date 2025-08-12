/* eslint-disable react/prop-types */
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NewGoatModal from './NewGoatModal';

const GoatNav = (props) => {
  return (
    <Container className='mb-2' fluid>
      <Row>
        <Col>
          <NewGoatModal createNew={props.createNew} />
        </Col>
        <Col className='text-center text-white'>
          <h5>Amount Due : K{props.total.toLocaleString()}</h5>
        </Col>
      </Row>
    </Container>
  );
};

export default GoatNav;
