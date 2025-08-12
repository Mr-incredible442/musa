import { Placeholder } from 'react-bootstrap';
import PropTypes from 'prop-types';

function TablePlaceholder({ cols, rows }) {
  return (
    <tbody className='table-group-divider'>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex}>
          {[...Array(cols)].map((_, colIndex) => (
            <td key={colIndex}>
              <Placeholder as='p' animation='glow'>
                <Placeholder xs={12} />
              </Placeholder>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
TablePlaceholder.propTypes = {
  cols: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
};

export default TablePlaceholder;
