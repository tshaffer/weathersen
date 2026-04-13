import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import { AppDispatch, RootState } from '../redux/store';
import {
  fetchSavedItineraries,
  saveNewItinerary,
  updateSavedItinerary,
  removeSavedItinerary,
} from '../redux/savedItinerariesSlice';
import {
  setItineraryStartDate,
  setItineraryStops,
  setItinerarySavedId,
  setItineraryName,
  fetchForecast,
} from '../redux/itinerarySlice';
import { ItineraryStop, SavedItinerary } from '../types';

const SavedItineraries: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { list } = useSelector((state: RootState) => state.savedItineraries);
  const itinerary = useSelector((state: RootState) => state.itinerary);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [itineraryName, setItineraryNameLocal] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedItinerary | null>(null);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    if (itinerary.savedId) {
      // Update existing
      await dispatch(updateSavedItinerary({
        id: itinerary.savedId,
        name: itineraryName,
        itineraryStart: itinerary.itineraryStart,
        itineraryStops: itinerary.itineraryStops as ItineraryStop[],
        token,
      }));
      dispatch(setItineraryName(itineraryName));
    } else {
      // Create new
      const result = await dispatch(saveNewItinerary({
        name: itineraryName,
        itineraryStart: itinerary.itineraryStart,
        itineraryStops: itinerary.itineraryStops as ItineraryStop[],
        token,
      }));
      if (saveNewItinerary.fulfilled.match(result)) {
        dispatch(setItinerarySavedId(result.payload._id));
        dispatch(setItineraryName(result.payload.name));
      }
    }
    setSaving(false);
    setSaveDialogOpen(false);
  };

  const handleLoad = (saved: SavedItinerary) => {
    // Rebuild ItineraryStop array from saved stops (no forecasts yet)
    const stops: ItineraryStop[] = saved.itineraryStops.map(s => ({
      id: s.stopId,
      placeName: s.placeName,
      location: s.location,
    }));
    dispatch(setItineraryStartDate(saved.itineraryStart));
    dispatch(setItineraryStops(stops));
    dispatch(setItinerarySavedId(saved._id));
    dispatch(setItineraryName(saved.name));

    // Re-fetch forecasts for each stop that has a location
    stops.forEach((stop, idx) => {
      if (stop.location) {
        const date = dayjs(saved.itineraryStart).add(idx, 'day').format('YYYY-MM-DD');
        dispatch(fetchForecast({ location: stop.location.geometry.location, date, index: idx }));
      }
    });
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    await dispatch(removeSavedItinerary({ id: deleteTarget._id, token }));
    setDeleteTarget(null);
  };

  const openSaveDialog = () => {
    setItineraryNameLocal(itinerary.name ?? '');
    setSaveDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Saved Itineraries</Typography>
        <Tooltip title="Save current itinerary">
          <span>
            <IconButton
              size="small"
              onClick={openSaveDialog}
              disabled={itinerary.itineraryStops.length === 0}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {list.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No saved itineraries yet.</Typography>
      ) : (
        <List disablePadding>
          {list.map((saved, idx) => (
            <React.Fragment key={saved._id}>
              {idx > 0 && <Divider />}
              <ListItem
                disablePadding
                secondaryAction={
                  <Tooltip title="Delete">
                    <IconButton edge="end" color="error" size="small" onClick={() => setDeleteTarget(saved)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemButton onClick={() => handleLoad(saved)} selected={itinerary.savedId === saved._id}>
                  <ListItemText
                    primary={saved.name}
                    secondary={`${dayjs(saved.itineraryStart).format('MMM D, YYYY')} · ${saved.itineraryStops.length} stop${saved.itineraryStops.length !== 1 ? 's' : ''} · saved ${dayjs(saved.updatedAt).format('MMM D')}`}
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{itinerary.savedId ? 'Update Itinerary' : 'Save Itinerary'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={itineraryName}
            onChange={e => setItineraryNameLocal(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !itineraryName.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete itinerary?</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteTarget?.name}" will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedItineraries;
