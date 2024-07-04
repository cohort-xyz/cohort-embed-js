import {Link} from 'react-router-dom';

export default function Home() {
  return (
    <div id='home'>
      <h3>Select a use case</h3>
      <ul>
        <li>
          <Link to='/xps-custom'>Experience Space with Custom Login</Link>
        </li>
        <li>
          <Link to='/xps-cohort'>Experience Space with Cohort Login</Link>
        </li>
      </ul>
    </div>
  );
}
