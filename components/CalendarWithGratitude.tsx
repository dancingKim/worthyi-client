// components/CalendarWithGratitude.tsx
import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';

interface DayObject {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
}

interface Props {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    gratitudeDates: string[]; // 'YYYY-MM-DD'
}

export default function CalendarWithGratitude({ selectedDate, onDateChange, gratitudeDates }: Props) {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        gratitudeDates.forEach(d => {
            marks[d] = { marked: true, dotColor: 'blue' };
        });
        // 선택한 날짜 강조
        if (marks[selectedDateStr]) {
            marks[selectedDateStr].selected = true;
            marks[selectedDateStr].selectedColor = 'green';
        } else {
            marks[selectedDateStr] = { selected: true, selectedColor: 'green' };
        }
        return marks;
    }, [gratitudeDates, selectedDateStr]);

    return (
        <Calendar
            onDayPress={(day: DayObject) => {
                const newDate = new Date(day.year, day.month - 1, day.day);
                onDateChange(newDate);
            }}
            markedDates={markedDates}
        />
    );
}