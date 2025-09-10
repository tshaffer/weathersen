// AppShell.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

interface Forecast {
  date: string;
  location: string;
  minTemp: number;
  maxTemp: number;
  precipChance: string;
  details: string;
}

const sampleData: Forecast[] = [
  {
    date: '2025-09-10',
    location: 'San Francisco, CA',
    minTemp: 16,
    maxTemp: 22,
    precipChance: '10%',
    details: 'Mostly cloudy, light winds. UV Index 6. Sunset 7:15 PM.',
  },
  {
    date: '2025-09-11',
    location: 'Los Angeles, CA',
    minTemp: 18,
    maxTemp: 28,
    precipChance: '0%',
    details: 'Sunny and warm. UV Index 8. Sunset 7:10 PM.',
  },
  {
    date: '2025-09-12',
    location: 'Portland, OR',
    minTemp: 12,
    maxTemp: 20,
    precipChance: '45%',
    details: 'Chance of showers in the afternoon. Cloud cover 70%.',
  },
];

const ForecastRow: React.FC<{ forecast: Forecast }> = ({ forecast }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{forecast.date}</TableCell>
        <TableCell>{forecast.location}</TableCell>
        <TableCell>{forecast.minTemp}°C</TableCell>
        <TableCell>{forecast.maxTemp}°C</TableCell>
        <TableCell>{forecast.precipChance}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="body2">{forecast.details}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AppShell: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Weathersen – Forecast by Itinerary
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Min Temp</TableCell>
              <TableCell>Max Temp</TableCell>
              <TableCell>Precip Chance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((forecast) => (
              <ForecastRow key={forecast.date + forecast.location} forecast={forecast} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AppShell;
