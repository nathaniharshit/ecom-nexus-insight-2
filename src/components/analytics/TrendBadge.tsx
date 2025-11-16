import React from 'react';

interface TrendBadgeProps {
  value: number;
  suffix?: string;
}

export const TrendBadge = ({ value, suffix = '%' }: TrendBadgeProps) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}
      {suffix}
    </span>
  );
};
