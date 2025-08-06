import { useCallback } from 'react'

export const useAppointmentUtils = () => {
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow'
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            })
        }
    }, [])

    const formatTime = useCallback((timeString: string) => {
        return timeString
    }, [])

    const getAppointmentDate = useCallback((date: string, time: string): Date => {
        const [timePart, meridian] = time.split(' ')
        let [hour, minute] = timePart.split(':').map(Number)
        if (meridian === 'PM' && hour !== 12) hour += 12
        if (meridian === 'AM' && hour === 12) hour = 0

        const dt = new Date(date)
        dt.setHours(hour, minute, 0, 0)
        return dt
    }, [])

    return { formatDate, formatTime, getAppointmentDate }
};