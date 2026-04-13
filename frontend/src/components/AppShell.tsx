// AppShell.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  PeopleAlt as PeopleAltIcon,
  Logout as LogoutIcon,
  BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';

import ItineraryInput from './ItineraryInput';
import ManageUsers from './ManageUsers';
import SavedItineraries from './SavedItineraries';
import { Itinerary, ItineraryStop } from '../types';
import { clearItinerary, setItineraryStartDate, setItineraryStops } from '../redux/itinerarySlice';
import { logout } from '../redux/authSlice';
import { fetchSavedItineraries, clearSavedItineraries } from '../redux/savedItinerariesSlice';
import { Dayjs } from 'dayjs';
import { toISODate } from '../utilities';

// ---------------------- AppShell ----------------------
const AppShell: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();
  const itinerary: Itinerary = useSelector((state: RootState) => state.itinerary);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const token = useSelector((state: RootState) => state.auth.token);

  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [savedItinerariesOpen, setSavedItinerariesOpen] = useState(false);

  React.useEffect(() => {
    if (token) dispatch(fetchSavedItineraries(token));
  }, [dispatch, token]);

  const handleUpdateItineraryStartDate = (newDate: Dayjs) => {
    dispatch(setItineraryStartDate(toISODate(newDate)!));
  };

  const handleUpdateItineraryStops = (newItinerary: ItineraryStop[]) => {
    dispatch(setItineraryStops(newItinerary));
  };

  const handleClear = () => {
    dispatch(clearItinerary());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearSavedItineraries());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Weathersen</Typography>

          {currentUser && (
            <Chip label={currentUser.name} size="small" variant="outlined" />
          )}

          <Tooltip title="Filters (placeholder)">
            <IconButton size="small"><FilterListIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh (placeholder)">
            <IconButton size="small"><RefreshIcon /></IconButton>
          </Tooltip>

          <Tooltip title="Saved itineraries">
            <IconButton size="small" onClick={() => setSavedItinerariesOpen(o => !o)}>
              <BookmarkIcon />
            </IconButton>
          </Tooltip>

          {currentUser?.isAdmin && (
            <Tooltip title="Manage users">
              <IconButton size="small" onClick={() => setManageUsersOpen(o => !o)}>
                <PeopleAltIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Sign out">
            <Button
              size="small"
              startIcon={<LogoutIcon fontSize="small" />}
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </Tooltip>
        </Toolbar>
        <Divider />
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        <Collapse in={savedItinerariesOpen}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <SavedItineraries />
          </Paper>
        </Collapse>

        {currentUser?.isAdmin && (
          <Collapse in={manageUsersOpen}>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <ManageUsers />
            </Paper>
          </Collapse>
        )}

        <Box mb={2}>
          <ItineraryInput
            itineraryStart={itinerary.itineraryStart}
            itineraryStops={itinerary.itineraryStops as ItineraryStop[]}
            onUpdateItineraryStartDate={handleUpdateItineraryStartDate}
            onUpdateItineraryStops={handleUpdateItineraryStops}
            onClear={handleClear}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default AppShell;
