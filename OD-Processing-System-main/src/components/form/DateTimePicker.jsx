import React, { useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import { Box, Typography, InputBase, Paper, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StyledDatePickerContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    position: 'relative',
    '& .react-datepicker-wrapper': {
        width: '100%',
    },
    '& .react-datepicker__input-container': {
        width: '100%',
    },
    '& .react-datepicker-popper': {
        transform: 'translate3d(-105%, 0, 0) !important',
        inset: '0px auto auto 0px !important',
    },
    '& .react-datepicker': {
        border: '1px solid rgba(26, 35, 126, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        fontFamily: 'inherit',
        overflow: 'hidden',
    },
    '& .react-datepicker__header': {
        background: 'rgba(26, 35, 126, 0.03)',
        borderBottom: '1px solid rgba(26, 35, 126, 0.1)',
        padding: '12px 0',
    },
    '& .react-datepicker__current-month': {
        color: '#1a237e',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
    '& .react-datepicker__day-name': {
        color: '#1a237e',
        fontWeight: 500,
    },
    '& .react-datepicker__day': {
        color: '#37474f',
        borderRadius: '50%',
        width: '2rem',
        height: '2rem',
        lineHeight: '2rem',
        margin: '0.2rem',
    },
    '& .react-datepicker__day--selected': {
        backgroundColor: '#1a237e',
        color: '#fff',
        fontWeight: 500,
    },
    '& .react-datepicker__day--keyboard-selected': {
        backgroundColor: 'rgba(26, 35, 126, 0.2)',
        color: '#1a237e',
    },
    '& .react-datepicker__day--disabled': {
        color: '#ccc',
    },
    '& .react-datepicker__navigation': {
        top: '12px',
    },
    '& .react-datepicker__navigation-icon': {
        '&::before': {
            borderColor: '#1a237e',
        }
    },
    '& .react-datepicker__year-read-view--down-arrow': {
        borderColor: '#1a237e',
    }
});

const StyledDateInput = styled('input')({
    width: '100%',
    padding: '12px',
    fontSize: '0.95rem',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    color: '#37474f',
    background: 'rgba(255, 255, 255, 0.9)',
    '&:focus': {
        outline: 'none',
        borderColor: '#1976d2',
        boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
    }
});

const StyledSelect = styled(Select)({
    '& .MuiSelect-select': {
        padding: '10px 14px',
        fontSize: '0.95rem',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.9)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
        borderWidth: '1px',
        boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
    }
});

const DateTimeGroup = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
});

const DateLabel = styled(Typography)({
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#37474f',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
});

export default function DateTimePicker({ onStartDateChange, onEndDateChange }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startSession, setStartSession] = useState('forenoon');
    const [endSession, setEndSession] = useState('forenoon');

    // Calculate date range (30 days before and after today)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const isNotSunday = (date) => date.getDay() !== 0;

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (onStartDateChange) {
            onStartDateChange({ date, session: startSession });
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (onEndDateChange) {
            onEndDateChange({ date, session: endSession });
        }
    };

    const handleStartSessionChange = (event) => {
        setStartSession(event.target.value);
        if (onStartDateChange) {
            onStartDateChange({ date: startDate, session: event.target.value });
        }
    };

    const handleEndSessionChange = (event) => {
        setEndSession(event.target.value);
        if (onEndDateChange) {
            onEndDateChange({ date: endDate, session: event.target.value });
        }
    };

    return (
        <StyledDatePickerContainer>
            <Box>
                <DateLabel>
                    <CalendarTodayIcon sx={{ fontSize: '1.1rem', color: '#1a237e' }} />
                    Start Date
                </DateLabel>
                <DateTimeGroup>
                    <Box sx={{ flex: 1 }}>
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            minDate={thirtyDaysAgo}
                            maxDate={thirtyDaysFromNow}
                            dateFormat="MMMM d, yyyy"
                            customInput={<StyledDateInput />}
                            filterDate={isNotSunday}
                            popperModifiers={[
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 0],
                                    },
                                },
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        mainAxis: false,
                                        altAxis: true,
                                    },
                                },
                            ]}
                            popperPlacement="left-start"
                        />
                    </Box>
                    <FormControl sx={{ minWidth: 150 }}>
                        <StyledSelect
                            value={startSession}
                            onChange={handleStartSessionChange}
                            size="small"
                        >
                            <MenuItem value="forenoon">Forenoon</MenuItem>
                            <MenuItem value="afternoon">Afternoon</MenuItem>
                            <MenuItem value="fullday">Full Day</MenuItem>
                        </StyledSelect>
                    </FormControl>
                </DateTimeGroup>
            </Box>

            <Box>
                <DateLabel>
                    <CalendarTodayIcon sx={{ fontSize: '1.1rem', color: '#1a237e' }} />
                    End Date
                </DateLabel>
                <DateTimeGroup>
                    <Box sx={{ flex: 1 }}>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            minDate={thirtyDaysAgo}
                            maxDate={thirtyDaysFromNow}
                            dateFormat="MMMM d, yyyy"
                            customInput={<StyledDateInput />}
                            filterDate={isNotSunday}
                            popperModifiers={[
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 0],
                                    },
                                },
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        mainAxis: false,
                                        altAxis: true,
                                    },
                                },
                            ]}
                            popperPlacement="left-start"
                        />
                    </Box>
                    <FormControl sx={{ minWidth: 150 }}>
                        <StyledSelect
                            value={endSession}
                            onChange={handleEndSessionChange}
                            size="small"
                        >
                            <MenuItem value="forenoon">Forenoon</MenuItem>
                            <MenuItem value="afternoon">Afternoon</MenuItem>
                            <MenuItem value="fullday">Full Day</MenuItem>
                        </StyledSelect>
                    </FormControl>
                </DateTimeGroup>
            </Box>
        </StyledDatePickerContainer>
    );
}
