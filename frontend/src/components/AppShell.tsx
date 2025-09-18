// AppShell.tsx
import React, { } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import ItineraryInput from './ItineraryInput';
import { Itinerary, ItineraryStop } from '../types';
import { clearItinerary, setItinerary } from '../redux/itinerarySlice';

// ---------------------- AppShell ----------------------
const AppShell: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const itinerary: Itinerary = useSelector((state: RootState) => state.itinerary);

  const handleUpdateItineraryStops = (newItinerary: ItineraryStop[]) => {
    dispatch(setItinerary(newItinerary));
  };

  const handleClear = () => {
    dispatch(clearItinerary());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Weathersen</Typography>
          <Tooltip title="Filters (placeholder)">
            <IconButton size="small"><FilterListIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh (placeholder)">
            <IconButton size="small"><RefreshIcon /></IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        <Box mb={2}>
          <ItineraryInput
            value={itinerary.itineraryStops as ItineraryStop[]}
            onChange={handleUpdateItineraryStops}
            onClear={handleClear}
          />
        </Box>

      </Container>

    </Box>
  );
};

export default AppShell;
