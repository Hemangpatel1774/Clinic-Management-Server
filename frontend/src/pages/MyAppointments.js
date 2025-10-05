import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, Chip, TextField
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchName, searchDate, appointments]);

  const loadAppointments = async () => {
    try {
      const endpoint = user.role === 'patient' ? '/appointments/my' : '/appointments';
      const res = await api.get(endpoint);
      setAppointments(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const cancel = async (id) => {
    try {
      await api.post(`/appointments/${id}/cancel`);
      loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const formatDate = (date) => format(new Date(date), 'dd/MM/yyyy');

  const filterAppointments = () => {
    let temp = [...appointments];

    if (searchName.trim()) {
      temp = temp.filter(a =>
        a.doctor?.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDate) {
      temp = temp.filter(a => formatDate(a.date) === formatDate(searchDate));
    }

    setFiltered(temp);
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '5px auto', padding: 3 }}>
      <Typography
        variant="h5"
        fontStyle={'italic'}
        align="center"
        // gutterBottom
        sx={{ fontWeight: 600, color: 'primary.main' }}
      >
        {user.role === 'patient' ? 'MY APPOINTMENTS' : 'ALL APPOINTMENTS'}
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search by Doctor Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />

        <DatePicker
          selected={searchDate}
          onChange={(date) => setSearchDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="DD/MM/YYYY"
          className="custom-datepicker"
        />

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => { setSearchName(''); setSearchDate(null); }}
        >
          Clear Filters
        </Button>
      </Paper>
      <div style={{
        height: 'calc(100vh - 350px)',
        overflowY: 'auto',
        scrollbarWidth: 'thin'
      }}>

        {filtered.length === 0 ? (
          <Paper sx={{ padding: 3, textAlign: 'center', backgroundColor: '#fff8e1' }}>
            <Typography variant="body1" color="text.secondary">
              No appointments found.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Doctor</TableCell>
                  {user.role === 'admin' && (
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Patient</TableCell>
                  )}
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Date & Time</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  {user.role === 'patient' && (
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Action</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody >
                {filtered.map((a, i) => (
                  <TableRow
                    key={a._id}
                    sx={{
                      backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff',
                      '&:hover': { backgroundColor: '#f0f7ff' },
                    }}
                  >
                    <TableCell align="center">{a.doctor?.name || '—'}</TableCell>
                    {user.role === 'admin' && (
                      <TableCell align="center">{a.patient?.name || '—'}</TableCell>
                    )}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {format(new Date(a.date), "dd/MM/yyyy")}
                        </Typography>
                        <Typography variant="body2" color="text.primary" fontStyle={"italic"}>
                          {format(new Date(a.date), "hh:mm a")}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={a.status}
                        color={
                          a.status === 'booked' ? 'success' :
                            a.status === 'cancelled' ? 'error' : 'default'
                        }
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    {user.role === 'patient' && (
                      <TableCell align="center">
                        {a.status === 'booked' ? (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => cancel(a._id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </Box>
  );
}
