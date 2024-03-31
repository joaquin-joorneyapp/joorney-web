import { AddRounded, RemoveRounded } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { useState } from 'react';

interface Props {
  initialValue?: number;
  minValue: number;
  maxValue: number;
  onValueChange?: Function;
  my?: number;
}

export default function NumericalButtonInput({
  initialValue,
  onValueChange,
  minValue = 0,
  maxValue = 1000,
}: Props) {
  const [currentValue, setCurrentValue] = useState(initialValue || minValue);
  const incrementValue = (value: number) => {
    if (value < 0 && currentValue <= minValue) return;
    if (value > 0 && currentValue >= maxValue) return;
    setCurrentValue(currentValue + value);
    onValueChange?.(currentValue + value);
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <IconButton
        disabled={currentValue <= minValue}
        size="large"
        sx={{ border: 1 }}
        aria-label="Subtract one"
        onClick={() => incrementValue(-1)}
      >
        <RemoveRounded />
      </IconButton>
      <Typography variant="subtitle1" sx={{ mx: '1.3rem' }}>
        {currentValue}
      </Typography>
      <IconButton
        disabled={currentValue >= maxValue}
        size="large"
        sx={{ border: 1 }}
        onClick={() => incrementValue(+1)}
        aria-label="Add one"
      >
        <AddRounded />
      </IconButton>
    </div>
  );
}
