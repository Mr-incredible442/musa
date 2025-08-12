import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import NavBar from './components/NavBar';
import Dasboard from './pages/Dasboard';

import Login from './pages/Login';
import UserManager from './pages/UserManager';
import ShopC from './pages/ShopC';

import ShopCDetails from './components/shopC/ShopCDetails';

//Boma
import BomaRegister from './pages/BomaRegister';
import BomaRegisterDetails from './components/bomaRegister/BomaRegisterDetails';
import BomaStore from './pages/BomaStore';
import BomaStoreShiftDetails from './components/bomaStore/ShiftDetails';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <NavBar />
      <Routes>
        <Route
          path='/login'
          element={!user ? <Login /> : <Navigate to='/' />}
        />
        <Route
          path='/login'
          element={!user ? <Login /> : <Navigate to='/shopc' />}
        />
        <Route
          path='/shopc'
          element={user ? <ShopC /> : <Navigate to='/login' />}
        />
        <Route
          path='/shopc/:id'
          element={user ? <ShopCDetails /> : <Navigate to='/login' />}
        />
        <Route
          path='/bomastore'
          element={user ? <BomaStore /> : <Navigate to='/login' />}
        />
        <Route
          path='/bomastore/:id'
          element={user ? <BomaStoreShiftDetails /> : <Navigate to='/login' />}
        />
        <Route
          path='/bomaregister'
          element={user ? <BomaRegister /> : <Navigate to='/login' />}
        />
        <Route
          path='/bomaregister/:id'
          element={user ? <BomaRegisterDetails /> : <Navigate to='/login' />}
        />
        <Route path='*' element={<Navigate to='/shopc' />} />
        <Route
          path='/'
          element={user ? <Dasboard /> : <Navigate to='/login' />}
        />

        <Route
          path='/shopc'
          element={user ? <ShopC /> : <Navigate to='/login' />}
        />

        <Route
          path='bomaregister'
          element={user ? <BomaRegister /> : <Navigate to='/login' />}
        />
        <Route
          path='bomastore'
          element={user ? <BomaStore /> : <Navigate to='/login' />}
        />
        <Route
          path='bomastore/:id'
          element={user ? <BomaStoreShiftDetails /> : <Navigate to='/login' />}
        />
        <Route
          path='bomaregister/:id'
          element={user ? <BomaRegisterDetails /> : <Navigate to='/login' />}
        />
        <Route
          path='/users'
          element={
            user && user.role === 'admin' ? (
              <UserManager />
            ) : (
              <Navigate to='/login' />
            )
          }
        />

        <Route
          path='/shopc/:id'
          element={user ? <ShopCDetails /> : <Navigate to='/login' />}
        />

        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </>
  );
}

export default App;
