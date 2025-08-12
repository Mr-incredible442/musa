import { useEffect, useState, useContext } from 'react';
import socket from '../helpers/socket';
import { Container, Table } from 'react-bootstrap';
import { BsCircleFill } from 'react-icons/bs';

import { AuthContext } from '../context/AuthContext';

import { LOCAL_URL } from '../helpers/variables';
import NewUserModal from '../components/users/modals/NewUserModal';
import DeleteUser from '../components/users/modals/DeleteUser';
import BlacklistUser from '../components/users/modals/BlacklistUser';
import apiCall from '../helpers/apiCall';
import LogOutUser from '../components/users/modals/LogOutUser';
import LogEveryoneOut from '../components/users/modals/LogEveryoneOut';

function UserManager() {
  const [users, setUsers] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Yussman - Users';

    apiCall
      .get(`${LOCAL_URL}/users`)
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err.response.data.msg);
      });

    socket.connect();
    socket.on('allLoggedInUsers', (data) => {
      setUsers(data);
    });
    return () => {
      socket.off('allLoggedInUsers'); // Remove event listener
      socket.disconnect(); // Disconnect the socket
    };
  }, []);

  return (
    <Container>
      <h2 className='text-center my-2'>Users Manager</h2>
      <div className='d-flex justify-content-end align-items-center gap-3 my-2'>
        {['0972278488', '0967162444', '0977330011'].includes(user.number) && (
          <span title='Log everyone out'>
            <LogEveryoneOut />
          </span>
        )}
        <span title='Add new user'>
          <NewUserModal />
        </span>
      </div>
      <Table responsive bordered size='sm' className='text-center'>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Number</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {users.length > 0 &&
            users.map((usr, index) => (
              <tr key={usr._id}>
                <td>{index + 1}</td>
                <td className='text-capitalize'>{usr.firstName}</td>
                <td className='text-capitalize'>{usr.lastName}</td>
                <td>{usr.number}</td>
                <td className='text-capitalize'>{usr.role}</td>
                <td>
                  {usr.isLoggedIn ? (
                    <BsCircleFill className='text-success' />
                  ) : (
                    <BsCircleFill className='text-secondary' />
                  )}
                </td>
                <td className='d-flex ps-3 flex-wrap gap-3 align-items-center'>
                  {usr.number !== '0972278488' &&
                    usr.number !== '0967162444' &&
                    usr.number !== '0977330011' && (
                      <>
                        <span title={`Delete ${usr.firstName}`}>
                          <DeleteUser id={usr._id} name={usr.firstName} />
                        </span>
                        <span
                          title={
                            usr.active
                              ? `Blacklist ${usr.firstName}`
                              : `Remove ${usr.firstName} from blacklist`
                          }>
                          <BlacklistUser
                            id={usr._id}
                            isActive={usr.active}
                            name={usr.firstName}
                          />
                        </span>
                      </>
                    )}
                  {usr.isLoggedIn &&
                    usr.number !== '0972278488' &&
                    usr.number !== '0967162444' &&
                    usr.number !== user.number && (
                      <span title={`Log out ${usr.firstName}`}>
                        <LogOutUser id={usr._id} name={usr.firstName} />
                      </span>
                    )}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserManager;
