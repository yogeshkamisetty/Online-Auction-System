import React, { useState, useEffect } from 'react';

const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return "Closed";
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const CountdownTimer = ({ endTime, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(() => new Date(endTime).getTime() - new Date().getTime());

    useEffect(() => {
        const targetDate = new Date(endTime).getTime();
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = targetDate - now;
            setTimeLeft(diff);

            if (diff <= 0) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 60000); // Update every minute to save resources since we only show minutes

        return () => clearInterval(interval);
    }, [endTime, onComplete]);

    return (
        <>{formatTimeLeft(timeLeft)}</>
    );
};

export default CountdownTimer;
