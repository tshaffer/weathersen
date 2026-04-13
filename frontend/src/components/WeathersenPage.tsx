import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { loginUser, loadStoredCredentials } from '../redux/authSlice';
import AppShell from './AppShell';
import Login from './Login';

export default function WeathersenPage() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const [autoLogging, setAutoLogging] = useState(() => !token && !!loadStoredCredentials());

  useEffect(() => {
    if (token || !autoLogging) return;
    const credentials = loadStoredCredentials();
    if (!credentials) {
      setAutoLogging(false);
      return;
    }
    dispatch(loginUser(credentials)).finally(() => setAutoLogging(false));
  }, []);

  if (autoLogging) return null;
  return token ? <AppShell /> : <Login />;
}
