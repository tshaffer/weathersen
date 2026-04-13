import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AppShell from './AppShell';
import Login from './Login';

export default function WeathersenPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <AppShell /> : <Login />;
}
