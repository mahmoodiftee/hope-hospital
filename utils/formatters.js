export const formatAppointmentDate = (date, time) => {
    try {
        let timeIn24Hour = time;

        if (time.includes('PM') || time.includes('AM')) {
            const [timePart, meridian] = time.split(' ');
            let [hours, minutes] = timePart.split(':');
            hours = parseInt(hours);

            if (meridian === 'PM' && hours !== 12) {
                hours += 12;
            } else if (meridian === 'AM' && hours === 12) {
                hours = 0;
            }

            timeIn24Hour = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }

        const combinedDateTime = `${date}T${timeIn24Hour}:00`;
        const dateObj = new Date(combinedDateTime);

        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date:', combinedDateTime);
            return 'Invalid Date';
        }

        const options = {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        return dateObj.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error, 'Date:', date, 'Time:', time);
        return 'Invalid Date';
    }
};

export const transformAppointmentToDoctorType = (appointment, index) => ({
    id: index + 1,
    name: appointment.doctorId?.name || appointment.doctorName || appointment.doctor_name || 'Dr. Unknown',
    specialization: appointment.doctorId?.specialty || appointment.doctorSpecialty || appointment.specialty || 'Specializes in general medicine',
    image: appointment.doctorId?.image || appointment.doctorImage || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
    location: appointment.location || "Hope Hospital",
    time: formatAppointmentDate(appointment.date, appointment.time),
    bgColor: "bg-blue/90"
});
