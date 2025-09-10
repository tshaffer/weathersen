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
  Tabs,
  Tab,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// ---------------------- Types ----------------------
interface Forecast {
  id: string; // unique id for keying
  date: string; // YYYY-MM-DD
  location: string; // City, ST or lat/lng label
  minTempC: number;
  maxTempC: number;
  precipChancePct: number; // 0-100
  windKph?: number;
  uvIndex?: number;
  cloudCoverPct?: number;
  sunrise?: string; // 07:01
  sunset?: string; // 19:15
  summary?: string; // 1-liner used in details view
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
const formatTemp = (c: number) => `${c.toFixed(0)}°C`;
const formatPct = (n?: number) => (n == null ? '—' : `${n}%`);

// ---------------------- Details Row ----------------------
const DetailsRow: React.FC<{ row: Forecast }> = ({ row }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell width={48}>
          <IconButton size="small" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Collapse' : 'Expand'}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>{row.location}</Typography>
            {row.precipChancePct >= 40 && <Chip size="small" label="Rain risk" color="primary" variant="outlined" />}
          </Stack>
        </TableCell>
        <TableCell>{formatTemp(row.minTempC)}</TableCell>
        <TableCell>{formatTemp(row.maxTempC)}</TableCell>
        <TableCell>{formatPct(row.precipChancePct)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box p={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
                <Paper variant="outlined" sx={{ p: 2, minWidth: 220 }}>
                  <Typography variant="subtitle2" gutterBottom>Overview</Typography>
                  <Typography variant="body2">{row.summary ?? '—'}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 220 }}>
                  <Typography variant="subtitle2" gutterBottom>Atmospherics</Typography>
                  <Typography variant="body2">UV Index: {row.uvIndex ?? '—'}</Typography>
                  <Typography variant="body2">Cloud Cover: {formatPct(row.cloudCoverPct)}</Typography>
                  <Typography variant="body2">Wind: {row.windKph ? `${row.windKph} kph` : '—'}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 220 }}>
                  <Typography variant="subtitle2" gutterBottom>Sun</Typography>
                  <Typography variant="body2">Sunrise: {row.sunrise ?? '—'}</Typography>
                  <Typography variant="body2">Sunset: {row.sunset ?? '—'}</Typography>
                </Paper>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ---------------------- Summary Table ----------------------
const SummaryTable: React.FC<{ rows: Forecast[] }> = ({ rows }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
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
            <TableRow key={r.id} hover>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r.location}</TableCell>
              <TableCell align="right">{formatTemp(r.minTempC)}</TableCell>
              <TableCell align="right">{formatTemp(r.maxTempC)}</TableCell>
              <TableCell align="right">{formatPct(r.precipChancePct)}</TableCell>
              <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.summary ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------------- Details Table ----------------------
const DetailsTable: React.FC<{ rows: Forecast[] }> = ({ rows }) => {
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={48} />
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Min</TableCell>
            <TableCell>Max</TableCell>
            <TableCell>Precip</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <DetailsRow key={r.id} row={r} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------------- AppShell ----------------------
const AppShell: React.FC = () => {
  const [tab, setTab] = useState<'summary' | 'details'>('summary');

  // In the future, rows would come from props / Redux / SWR
  const rows = useMemo(() => sampleData, []);

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
        <Container maxWidth="lg">
          <Tabs
            value={tab === 'summary' ? 0 : 1}
            onChange={(_, v) => setTab(v === 0 ? 'summary' : 'details')}
            aria-label="View mode"
          >
            <Tab label="Summary" />
            <Tab label="Details" />
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        {tab === 'summary' ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Compact overview — one line per day/location
            </Typography>
            <SummaryTable rows={rows} />
          </>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Expand rows for hour-by-hour or extra details (placeholder content)
            </Typography>
            <DetailsTable rows={rows} />
          </>
        )}
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
