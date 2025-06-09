import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Calendar from 'components/Calendar/Calendar';
import EventForm from 'components/Calendar/EventForm';
import { useAuth } from 'context/AuthContext';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from 'api/events';
import { fetchEmployees } from 'api/employees';
import { fetchLeaveRequests } from 'api/leaveRequests';

const CalendarPage = () => {
  const { token, employee, isAdmin } = useAuth();

  const [events, setEvents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Event form state
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventFormLoading, setEventFormLoading] = useState(false);
  const [eventFormError, setEventFormError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [token, employee]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [fetchEvents(token), fetchLeaveRequests(token)];

      // Only load employees if user is admin
      if (isAdmin()) {
        promises.push(fetchEmployees(token));
      }

      const results = await Promise.all(promises);

      setEvents(results[0].data || []);
      setLeaveRequests(results[1].data || []);

      if (isAdmin()) {
        setEmployees(results[2].data || []);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setError('Αποτυχία φόρτωσης δεδομένων ημερολογίου. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSave = async (eventData) => {
    try {
      setEventFormLoading(true);
      setEventFormError(null);

      let result;
      if (editingEvent) {
        // Update existing event
        result = await updateEvent(token, editingEvent.documentId, eventData);
        setEvents((prev) =>
          prev.map((event) =>
            event.documentId === editingEvent.documentId ? { ...result.data, employee: result.data.employee || null } : event
          )
        );
      } else {
        // Create new event
        result = await createEvent(token, eventData);
        setEvents((prev) => [...prev, { ...result.data, employee: result.data.employee || null }]);
      }

      // Close form
      setEventFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      setEventFormError('Αποτυχία αποθήκευσης εκδήλωσης. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setEventFormLoading(false);
    }
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setEventFormOpen(true);
  };

  const handleEventDelete = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmEventDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(token, eventToDelete.documentId);
      setEvents((prev) => prev.filter((event) => event.documentId !== eventToDelete.documentId));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError('Αποτυχία διαγραφής εκδήλωσης. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleEventFormClose = () => {
    setEventFormOpen(false);
    setEditingEvent(null);
    setEventFormError(null);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventFormOpen(true);
  };

  // If user is an employee, show limited access
  if (employee) {
    return (
      <MainCard title="Ημερολόγιο Εταιρείας">
        <Alert severity="info" sx={{ mb: 3 }}>
          Μπορείτε να δείτε εκδηλώσεις εταιρείας και εγκεκριμένα αιτήματα άδειας. Επικοινωνήστε με τον διαχειριστή για προσθήκη νέων εκδηλώσεων.
        </Alert>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Calendar events={events} leaveRequests={leaveRequests} isAdmin={false} />
        )}
      </MainCard>
    );
  }

  return (
    <MainCard title="Ημερολόγιο & Εκδηλώσεις Εταιρείας">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1" color="text.secondary">
          Διαχειριστείτε εκδηλώσεις εταιρείας, συναντήσεις, προθεσμίες και δείτε τα προγράμματα άδειας υπαλλήλων.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddEvent}>
          Προσθήκη Εκδήλωσης
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Calendar
            events={events}
            leaveRequests={leaveRequests}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
            isAdmin={true}
          />

          {/* Floating Action Button for mobile */}
          <Fab
            color="primary"
            aria-label="add event"
            onClick={handleAddEvent}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', md: 'none' }
            }}
          >
            <AddIcon />
          </Fab>
        </>
      )}

      {/* Event Form Dialog */}
      <EventForm
        open={eventFormOpen}
        onClose={handleEventFormClose}
        onSave={handleEventSave}
        event={editingEvent}
        employees={employees}
        loading={eventFormLoading}
        error={eventFormError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          <Typography>Είστε σίγουρος ότι θέλετε να διαγράψετε την εκδήλωση "{eventToDelete?.title}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Άκυρο</Button>
          <Button onClick={confirmEventDelete} color="error" variant="contained">
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default CalendarPage;
