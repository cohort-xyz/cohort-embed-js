import {useState} from 'react';
import ExperienceSpace from './ExperienceSpace';

function LoginForm({onSubmit}: {onSubmit: (email: string) => void}) {
  const [email, setEmail] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(email);
      }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

function LogoutForm({onSubmit, userEmail}: {onSubmit: () => void, userEmail: string}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <p>Welcome, {userEmail}!</p>
      <button type="submit">Logout</button>
    </form>
  );
}

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  return (
    <div style={{
      width: '100%',
      height: '100%',
    }}>
      {userEmail ? (
        <LogoutForm
          userEmail={userEmail}
          onSubmit={() => setUserEmail(null)}
        />
      ) : (
        <LoginForm onSubmit={email => setUserEmail(email)} />
      )}
      <ExperienceSpace userEmail={userEmail} />
    </div>
  );
}

export default App;
