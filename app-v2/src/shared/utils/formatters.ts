import { getTranslatedField, translateGeneralStore, toBengaliNumerals } from "./translation";

export const formatAppointmentDate = (date: string, time: string, language: string = 'en') => {
    try {
        let timeIn24Hour = time;

        if (time.includes('PM') || time.includes('AM')) {
            const [timePart, meridian] = time.split(' ');
            let [hoursStr, minutes] = timePart.split(':');
            let hours = parseInt(hoursStr);

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

        const isBengali = language === 'bn' || language.startsWith('bn-');

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        let formatted = dateObj.toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', options);

        if (isBengali) {
            // Manual fallbacks for common parts if toLocaleDateString fails
            const monthMap: { [key: string]: string } = {
                'Jan': 'জানুয়ারি', 'Feb': 'ফেব্রুয়ারি', 'Mar': 'মার্চ',
                'Apr': 'এপ্রিল', 'May': 'মে', 'Jun': 'জুন',
                'Jul': 'জুলাই', 'Aug': 'আগস্ট', 'Sep': 'সেপ্টেম্বর',
                'Oct': 'অক্টোবর', 'Nov': 'নভেম্বর', 'Dec': 'ডিসেম্বর'
            };

            // If the output still contains English month names, replace them
            Object.entries(monthMap).forEach(([en, bn]) => {
                const regex = new RegExp(en, 'gi');
                formatted = formatted.replace(regex, bn);
            });

            // Ensure numerals are converted
            formatted = toBengaliNumerals(formatted);
            // Translate AM/PM
            formatted = formatted.replace(/AM/gi, 'পূর্বাহ্ণ').replace(/PM/gi, 'অপরাহ্ণ');
        }

        return formatted;
    } catch (error) {
        console.error('Error formatting date:', error, 'Date:', date, 'Time:', time);
        return 'Invalid Date';
    }
};

export const transformAppointmentToDoctorType = (appointment: any, index: number, language: string = 'en') => ({
    id: index + 1,
    name: getTranslatedField(appointment, 'doctor_name', language) ||
        getTranslatedField(appointment.doctorId, 'name', language) ||
        appointment.doctorName || 'Dr. Unknown',
    specialization: getTranslatedField(appointment, 'specialty', language) ||
        getTranslatedField(appointment.doctorId, 'specialty', language) ||
        appointment.doctorSpecialty || 'Specializes in general medicine',
    image: appointment.doctorId?.image || appointment.doctorImage || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
    location: translateGeneralStore(appointment.location || "Hope Hospital", language),
    time: formatAppointmentDate(appointment.date, appointment.time, language),
    bgColor: "bg-blue-600"
});
