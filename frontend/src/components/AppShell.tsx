// AppShell.tsx
import React, { useMemo, useState } from 'react';
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
  Button,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import GoogleMapsProvider from './GoogleMapsProvider';

import ItineraryInput, { Itinerary, ItineraryStop } from './ItineraryInput';

// ---------------------- Types ----------------------
// Make these optional so we can display placeholders before we have real data:
interface Forecast {
  id: string;
  date: string;
  location: string;
  minTempC?: number;
  maxTempC?: number;
  precipChancePct?: number;
  windKph?: number;
  uvIndex?: number;
  cloudCoverPct?: number;
  sunrise?: string;
  sunset?: string;
  summary?: string;
}

// ---------------------- Sample Data ----------------------
const sampleData: Forecast[] = [
  {
    id: 'sf-2025-09-10',
    date: '2025-09-10',
    location: 'San Francisco, CA',
    minTempC: 16,
    maxTempC: 22,
    precipChancePct: 10,
    windKph: 14,
    uvIndex: 6,
    cloudCoverPct: 90,
    sunrise: '06:48',
    sunset: '19:15',
    summary: 'Mostly cloudy, light winds',
  },
  {
    id: 'la-2025-09-11',
    date: '2025-09-11',
    location: 'Los Angeles, CA',
    minTempC: 18,
    maxTempC: 28,
    precipChancePct: 0,
    windKph: 9,
    uvIndex: 8,
    cloudCoverPct: 10,
    sunrise: '06:33',
    sunset: '19:09',
    summary: 'Sunny and warm',
  },
  {
    id: 'pdx-2025-09-12',
    date: '2025-09-12',
    location: 'Portland, OR',
    minTempC: 12,
    maxTempC: 20,
    precipChancePct: 45,
    windKph: 12,
    uvIndex: 5,
    cloudCoverPct: 70,
    sunrise: '06:45',
    sunset: '19:29',
    summary: 'Showers likely in afternoon',
  },
];

// ---------------------- Utilities ----------------------
const formatTemp = (c?: number) => (typeof c === 'number' ? `${c.toFixed(0)}°C` : '—');
const formatPct = (n?: number) => (typeof n === 'number' ? `${n}%` : '—');

const keyFor = (loc: string, date: string) =>
  `${(loc || '').toLowerCase().trim()}|${(date || '').trim()}`;

function mergeItineraryWithForecasts(itinerary: Itinerary, samples: Forecast[]): Forecast[] {
  const sampleIndex = new Map(samples.map(s => [keyFor(s.location, s.date), s]));
  return itinerary
    .filter(s => s.location || s.date) // ignore completely blank rows
    .map((s) => {
      const sample = sampleIndex.get(keyFor(s.location, s.date));
      if (sample) return sample;
      // Placeholder row until real fetch wires in:
      return {
        id: `it-${s.id}`,
        date: s.date,
        location: s.location,
        summary: '—',
      } as Forecast;
    });
}

// ---------------------- Compact Expandable Row ----------------------
const CompactRow: React.FC<{ row: Forecast }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  return (
    <GoogleMapsProvider>
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
              {typeof row.precipChancePct === 'number' && row.precipChancePct >= 40 && (
                <Chip size="small" label="Rain" color="primary" variant="outlined" />
              )}
            </Stack>
          </TableCell>
          <TableCell align="right">{formatTemp(row.minTempC)}</TableCell>
          <TableCell align="right">{formatTemp(row.maxTempC)}</TableCell>
          <TableCell align="right">{formatPct(row.precipChancePct)}</TableCell>
          <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.summary ?? '—'}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box px={2} pb={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Typography variant="caption">UV: {row.uvIndex ?? '—'}</Typography>
                  <Typography variant="caption">Clouds: {formatPct(row.cloudCoverPct)}</Typography>
                  <Typography variant="caption">Wind: {row.windKph ? `${row.windKph} kph` : '—'}</Typography>
                  <Typography variant="caption">Sunrise: {row.sunrise ?? '—'}</Typography>
                  <Typography variant="caption">Sunset: {row.sunset ?? '—'}</Typography>
                </Stack>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    </GoogleMapsProvider>
  );
};

// ---------------------- Summary Table ----------------------
const SummaryTable: React.FC<{ rows: Forecast[] }> = ({ rows }) => {
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
  // 1) Own the itinerary here so ItineraryInput + SummaryTable share the same data
  const [itinerary, setItinerary] = useState<Itinerary>([
    // seed with one empty stop (today) — ItineraryInput will display it:
    { id: crypto.randomUUID(), location: '', date: new Date().toISOString().slice(0, 10) },
  ]);

  // 2) Rows are derived from itinerary + any available forecast data
  const rows = useMemo(() => mergeItineraryWithForecasts(itinerary, sampleData), [itinerary]);

  const handleClear = () => {
    setItinerary([{ id: crypto.randomUUID(), location: '', date: new Date().toISOString().slice(0, 10) }]);
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
            value={itinerary}
            onChange={setItinerary}
            onClear={handleClear}
          />
        </Box>

        {/* Summary table derived from itinerary */}
        <Typography variant="subtitle1" gutterBottom>
          Forecast overview with expandable rows for details
        </Typography>
        <SummaryTable rows={rows} />
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
