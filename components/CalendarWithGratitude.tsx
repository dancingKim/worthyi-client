// components/CalendarWithGratitude.tsx
import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { FontFamily } from '@/constants/Fonts';

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
    const todayStr = new Date().toISOString().split('T')[0];

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        
        // 오늘 날짜에만 파란 점 표시
        marks[todayStr] = { marked: true, dotColor: 'blue' };

        // 선택된 날짜 초록색으로 강조
        marks[selectedDateStr] = {
            ...marks[selectedDateStr],
            selected: true,
            selectedColor: 'green'
        };

        return marks;
    }, [selectedDateStr, todayStr]);

    return (
        <Calendar
            current={selectedDateStr}
            onDayPress={(day: DayObject) => {
                const newDate = new Date(day.timestamp);
                onDateChange(newDate);
            }}
            markedDates={markedDates}
            theme={{
                textDayFontFamily: FontFamily.regular,
                textMonthFontFamily: FontFamily.medium,
                textDayHeaderFontFamily: FontFamily.medium,
            }}
        />
    );
}