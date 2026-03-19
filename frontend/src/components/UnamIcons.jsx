import React from 'react';

export const HillAvalanche = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 20h20" />
        <path d="m11 16-4-4 4-4" />
        <path d="m3 16 4-4-4-4" />
        <path d="M19 12h-8" />
    </svg>
);

export const ShieldHalfway = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M12 22V2" />
    </svg>
);
