import React, { useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import { Box, Typography, InputBase, Paper, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

export default function DateTimePicker({ onStartDateChange, onEndDateChange }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startSession, setStartSession] = useState('forenoon');
    const [endSession, setEndSession] = useState('forenoon');

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
        <>
            <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div>
                    <label style={{ fontFamily: "Arial" }}>Start Date: </label>
                    <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        maxDate={new Date()}
                        minDate={new Date().setMonth(new Date().getMonth() - 1)}
                        dateFormat="MMMM d, yyyy"
                        customInput={<input style={{ width: "200px", padding: "3px", fontSize: "14px" }} />}
                        filterDate={isNotSunday}
                    />
                </div>
                <FormControl style={{ minWidth: 120 }}>
                    <Select
                        value={startSession}
                        onChange={handleStartSessionChange}
                        size="small"
                    >
                        <MenuItem value="forenoon">Forenoon</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
                        <MenuItem value="fullday">Full Day</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div>
                    <label style={{ fontFamily: "Arial" }}>End Date: </label>
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        maxDate={new Date()}
                        minDate={new Date().setMonth(new Date().getMonth() - 1)}
                        dateFormat="MMMM d, yyyy"
                        customInput={<input style={{ width: "200px", padding: "3px", fontSize: "14px" }} />}
                        filterDate={isNotSunday}
                    />
                </div>
                <FormControl style={{ minWidth: 120 }}>
                    <Select
                        value={endSession}
                        onChange={handleEndSessionChange}
                        size="small"
                    >
                        <MenuItem value="forenoon">Forenoon</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
                        <MenuItem value="fullday">Full Day</MenuItem>
                    </Select>
                </FormControl>
            </div>
        </>
    );
}
