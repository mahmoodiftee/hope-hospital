import { useState, useEffect, useCallback, useRef } from 'react';
import {
    OTP_RESEND_COUNTDOWN_SECONDS,
    OTP_DEMO_CODE
} from '@/shared/constants';

/**
 * useOtp hook encapsulates the logic for OTP verification.
 * It manages the countdown timer, resending OTP, and validation.
 */
export const useOtp = (onVerifySuccess: (otp: string) => void) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
    const [canResend, setCanResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        setTimer(OTP_RESEND_COUNTDOWN_SECONDS);
        setCanResend(false);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        startTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTimer]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(null);
    };

    const resendOtp = async (sendFunc: () => Promise<void>) => {
        if (!canResend) return;

        setIsLoading(true);
        setError(null);
        try {
            await sendFunc();
            startTimer();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (verifyFunc: (otpString: string) => Promise<boolean>) => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('Please enter the full 6-digit code');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Demo mode support
            if (otpString === OTP_DEMO_CODE) {
                onVerifySuccess(otpString);
                return;
            }

            const isValid = await verifyFunc(otpString);
            if (isValid) {
                onVerifySuccess(otpString);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        otp,
        timer,
        canResend,
        isLoading,
        error,
        handleOtpChange,
        resendOtp,
        verifyOtp,
        setOtp,
    };
};
