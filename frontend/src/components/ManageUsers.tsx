import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AppDispatch, RootState } from '../redux/store';
import { clearAuthError, createUser, deleteUser, fetchUsers } from '../redux/authSlice';

const ManageUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, token, error } = useSelector((state: RootState) => state.auth);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchUsers(token));
  }, [dispatch, token]);

  const handleAdd = async () => {
    if (!token) return;
    dispatch(clearAuthError());
    setSaving(true);
    const result = await dispatch(createUser({ name, email, password, token }));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setAddOpen(false);
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  const handleDelete = (id: string) => {
    if (token) dispatch(deleteUser({ id, token }));
  };

  const handleClose = () => {
    setAddOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    dispatch(clearAuthError());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Users</Typography>
        <Tooltip title="Add user">
          <IconButton size="small" onClick={() => setAddOpen(true)}>
            <PersonAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List disablePadding>
        {users.map(user => (
          <ListItem
            key={user.id}
            disablePadding
            secondaryAction={
              !user.isAdmin && (
                <Tooltip title="Remove user">
                  <IconButton edge="end" color="error" size="small" onClick={() => handleDelete(user.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <ListItemText
              primary={user.name}
              secondary={`${user.email}${user.isAdmin ? ' · admin' : ''}`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={addOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Username"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={saving || !name || !email || !password}
          >
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
