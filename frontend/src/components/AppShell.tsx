// AppShell.tsx
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Collapse,
  Tooltip,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import ItineraryInput from './ItineraryInput';
import { Itinerary, ItineraryState, ItineraryStop } from '../types';
import { clearItinerary, setItinerary } from '../redux/itinerarySlice';

// ---------------------- Utilities ----------------------
const formatTemp = (c?: number) => (typeof c === 'number' ? `${c.toFixed(0)}°C` : '—');
const formatPct = (n?: number) => (typeof n === 'number' ? `${n}%` : '—');

// ---------------------- Compact Expandable Row ----------------------
const CompactRow: React.FC<{ row: ItineraryStop }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ '& .MuiTableCell-root': { py: 0.75 } }}>
        <TableCell width={40} padding="checkbox">
          <IconButton size="small" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Collapse' : 'Expand'}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.date || '—'}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{row.location || '—'}</Typography>
            {typeof row.forecast?.daytimeForecast?.precipitation?.probability === 'number' && row.forecast?.daytimeForecast?.precipitation?.probability >= 40 && (
              <Chip size="small" label="Rain" color="primary" variant="outlined" />
            )}
          </Stack>
        </TableCell>
        <TableCell align="right">{formatTemp(row.forecast?.minTemperature?.degrees)}</TableCell>
        <TableCell align="right">{formatTemp(row.forecast?.maxTemperature?.degrees)}</TableCell>
        <TableCell align="right">{formatPct(row.forecast?.daytimeForecast?.precipitation?.probability)}</TableCell>
        <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {/* {row.summary ?? '—'} */}
          Summary
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box px={2} pb={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                <Typography variant="caption">UV: {row.forecast?.daytimeForecast?.uvIndex ?? '—'}</Typography>
                <Typography variant="caption">Clouds: {formatPct(row.forecast?.daytimeForecast?.cloudCover ?? 0)}</Typography>
                <Typography variant="caption">Wind: {row.forecast?.daytimeForecast?.wind?.speed.value ? `${row.forecast?.daytimeForecast?.wind?.speed.value} kph` : '—'}</Typography>
                <Typography variant="caption">Sunrise: {row.forecast?.sunEvents?.sunrise ?? '—'}</Typography>
                <Typography variant="caption">Sunset: {row.forecast?.sunEvents?.sunset ?? '—'}</Typography>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ---------------------- Summary Table ----------------------
const SummaryTable: React.FC<{ rows: ItineraryStop[] }> = ({ rows }) => {
  if (!rows[0]) {
    return <Typography variant="body2">Add itinerary stops to see the summary table.</Typography>;
  }
  return (
    <TableContainer component={Paper}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={40} />
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell align="right">Min</TableCell>
            <TableCell align="right">Max</TableCell>
            <TableCell align="right">Precip</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <CompactRow key={r.id} row={r} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------------- AppShell ----------------------
const AppShell: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

  const itinerary: ItineraryState = useSelector((state: RootState) => state.itinerary);
  const rows: (ItineraryStop | null)[] = itinerary.itineraryStops;

  // 1) Own the itinerary here so ItineraryInput + SummaryTable share the same data
  // const [itinerary, setItinerary] = useState<Itinerary>([
  //   // seed with one empty stop (today) — ItineraryInput will display it:
  //   { id: crypto.randomUUID(), location: '', date: new Date().toISOString().slice(0, 10) },
  // ]);

  // 2) Rows are derived from itinerary + any available forecast data
  // const rows = useMemo(() => mergeItineraryWithForecasts(itinerary, sampleData), [itinerary]);

  const handleUpdateItinerary = (newItinerary: Itinerary) => {
    console.log("handleUpdateItinerary:", newItinerary);
    dispatch(setItinerary(newItinerary));
  };

  const handleClear = () => {
    dispatch(clearItinerary());
    // setItinerary([{ id: crypto.randomUUID(), location: '', date: new Date().toISOString().slice(0, 10) }]);
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
        {/* Itinerary Input */}
        <Box mb={2}>
          <ItineraryInput
            value={itinerary.itineraryStops as ItineraryStop[]}
            onChange={handleUpdateItinerary}
            onClear={handleClear}
          />
        </Box>

        {/* Summary table derived from itinerary */}
        {/* <Typography variant="subtitle1" gutterBottom>
          Forecast overview with expandable rows for details
        </Typography>
        <SummaryTable rows={rows as ItineraryStop[]} /> */}
      </Container>

      <Box component="footer" sx={{ py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" color="text.secondary">
            Demo UI • Replace sample data with real forecast data sources later.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AppShell;
