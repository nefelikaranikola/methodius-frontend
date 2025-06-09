import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, Divider, IconButton, Tooltip, Alert } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import moment from 'moment';
import PropTypes from 'prop-types';

const Calendar = ({
  events = [],
  leaveRequests = [],
  onEventEdit = () => {},
  onEventDelete = () => {},
  onDateSelect = () => {},
  isAdmin = false
}) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dayEvents, setDayEvents] = useState([]);

  useEffect(() => {
    loadDayEvents(selectedDate);
  }, [selectedDate, events, leaveRequests]);

  const loadDayEvents = (date) => {
    const dateStr = date.format('YYYY-MM-DD');

    // Filter events for selected date
    const dayEvents = events.filter((event) => {
      const eventStart = moment(event.startDate).format('YYYY-MM-DD');
      const eventEnd = moment(event.endDate).format('YYYY-MM-DD');
      return dateStr >= eventStart && dateStr <= eventEnd;
    });

    // Filter leave requests for selected date
    const dayLeaves = leaveRequests.filter((leave) => {
      if (leave.leaveStatus?.toLowerCase() !== 'approved') return false;
      const leaveStart = moment(leave.startDate).format('YYYY-MM-DD');
      const leaveEnd = moment(leave.endDate).format('YYYY-MM-DD');
      return dateStr >= leaveStart && dateStr <= leaveEnd;
    });

    // Combine and format
    const combinedEvents = [
      ...dayEvents.map((event) => ({
        ...event,
        type: 'event',
        displayTitle: event.title,
        displaySubtitle: event.eventType,
        color: getEventColor(event.eventType)
      })),
      ...dayLeaves.map((leave) => ({
        ...leave,
        type: 'leave',
        displayTitle: `${leave.employee?.firstName} ${leave.employee?.lastName} - Άδεια`,
        displaySubtitle: leave.leaveType,
        color: 'orange'
      }))
    ];

    setDayEvents(combinedEvents);
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'Meeting':
        return 'primary';
      case 'Deadline':
        return 'error';
      case 'Holiday':
        return 'success';
      case 'Other':
        return 'info';
      default:
        return 'default';
    }
  };

  const hasEventsOnDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');

    return events.some((event) => {
      const eventStart = moment(event.startDate).format('YYYY-MM-DD');
      const eventEnd = moment(event.endDate).format('YYYY-MM-DD');
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const hasLeavesOnDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');

    return leaveRequests.some((leave) => {
      if (leave.leaveStatus?.toLowerCase() !== 'approved') return false;
      const leaveStart = moment(leave.startDate).format('YYYY-MM-DD');
      const leaveEnd = moment(leave.endDate).format('YYYY-MM-DD');
      return dateStr >= leaveStart && dateStr <= leaveEnd;
    });
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    onDateSelect(newDate);
  };

  const formatTime = (dateStr, isAllDay) => {
    if (isAllDay) return 'Όλη την Ημέρα';
    return moment(dateStr).format('HH:mm');
  };

  return (
    <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
      {/* Calendar */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ημερολόγιο
          </Typography>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              sx={{
                '& .MuiPickersDay-root': {
                  position: 'relative'
                },
                // Highlight dates with events
                '& .MuiPickersDay-root.has-events': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main'
                  }
                },
                // Highlight dates with approved leave requests
                '& .MuiPickersDay-root.has-leaves': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'orange'
                  }
                },
                // If both events and leaves exist
                '& .MuiPickersDay-root.has-events.has-leaves::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 2,
                  left: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main'
                }
              }}
              slotProps={{
                day: (dayProps) => ({
                  ...dayProps,
                  className: `${dayProps.className || ''} ${
                    hasEventsOnDate(dayProps.day) ? 'has-events' : ''
                  } ${hasLeavesOnDate(dayProps.day) ? 'has-leaves' : ''}`.trim()
                })
              }}
            />
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Events for Selected Day */}
      <Card sx={{ flex: 1, minWidth: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {selectedDate.format('MMMM D, YYYY')}
          </Typography>

          {dayEvents.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Δεν υπάρχουν εκδηλώσεις ή άδειες προγραμματισμένες για αυτήν την ημέρα.
              {(events.length > 0 || leaveRequests.length > 0) && (
                <>
                  <br />
                  Αναζητήστε επισημασμένες ημερομηνίες στο ημερολόγιο για να βρείτε προγραμματισμένες εκδηλώσεις και εγκεκριμένες άδειες.
                </>
              )}
            </Alert>
          ) : (
            <List sx={{ mt: 1 }}>
              {dayEvents.map((item, index) => (
                <React.Fragment key={`${item.type}-${item.documentId || item.id}-${index}`}>
                  <ListItem
                    sx={{
                      pl: 0,
                      alignItems: 'flex-start',
                      flexDirection: 'column'
                    }}
                  >
                    <Box display="flex" alignItems="center" width="100%" mb={1}>
                      {item.type === 'event' ? (
                        <EventIcon color={item.color} sx={{ mr: 1 }} />
                      ) : (
                        <GroupIcon color="action" sx={{ mr: 1 }} />
                      )}
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.displayTitle}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip label={item.displaySubtitle} color={item.color} size="small" />
                          {item.type === 'event' && (
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(item.startDate, item.isAllDay)}
                              {!item.isAllDay && item.startDate !== item.endDate && ` - ${formatTime(item.endDate, item.isAllDay)}`}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Actions for events only (not leave requests) */}
                      {item.type === 'event' && isAdmin && (
                        <Box>
                          <Tooltip title="Επεξεργασία Εκδήλωσης">
                            <IconButton size="small" onClick={() => onEventEdit(item)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Διαγραφή Εκδήλωσης">
                            <IconButton size="small" onClick={() => onEventDelete(item)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {/* Description for events */}
                    {item.type === 'event' && item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                        {item.description}
                      </Typography>
                    )}
                  </ListItem>
                  {index < dayEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

Calendar.propTypes = {
  events: PropTypes.array,
  leaveRequests: PropTypes.array,
  onEventEdit: PropTypes.func,
  onEventDelete: PropTypes.func,
  onDateSelect: PropTypes.func,
  isAdmin: PropTypes.bool
};

export default Calendar;
