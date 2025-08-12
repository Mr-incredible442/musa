import { useEffect } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import OrdersList from '../components/orders/OrdersList';
import All from '../components/orders/All';

import { OrdersContextProvider } from '../context/OrdersContext';
import { ShopA1ContextProvider } from '../context/ShopA1Context';
import { ShopA2ContextProvider } from '../context/ShopA2Context';
import { ShopBContextProvider } from '../context/ShopBContext';
import { ShopWContextProvider } from '../context/ShopWContext';
import { StoreContextProvider } from '../context/StoreContext';

function Orders() {
  useEffect(() => {
    document.title = 'Yussman - Orders';
  }, []);

  return (
    <OrdersContextProvider>
      <StoreContextProvider>
        <ShopA1ContextProvider>
          <ShopA2ContextProvider>
            <ShopBContextProvider>
              <ShopWContextProvider>
                <Container className='my-3'>
                  <Tabs
                    defaultActiveKey='list'
                    id='orders'
                    className='mb-3'
                    justify>
                    <Tab eventKey='list' title='List'>
                      <OrdersList />
                    </Tab>
                    <Tab eventKey='all' title='All'>
                      <All />
                    </Tab>
                  </Tabs>
                </Container>
              </ShopWContextProvider>
            </ShopBContextProvider>
          </ShopA2ContextProvider>
        </ShopA1ContextProvider>
      </StoreContextProvider>
    </OrdersContextProvider>
  );
}

export default Orders;
