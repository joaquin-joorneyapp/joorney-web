import { AddRounded, RemoveRounded } from '@mui/icons-material'
import { Container, IconButton, Typography } from '@mui/material'
import { useState } from 'react'

interface Props {
  initialValue?: number
  label: string
  minValue: number
  maxValue: number
  onValueChange?: Function
  my?: number
}

export default function NumericalButtonInput({
  initialValue,
  onValueChange,
  minValue = 0,
  maxValue = 1000,
  label = '',
  my = 0,
}: Props) {
  const [currentValue, setCurrentValue] = useState(initialValue || minValue)
  const incrementValue = (value: number) => {
    if (value < 0 && currentValue <= minValue) return
    if (value > 0 && currentValue >= maxValue) return
    setCurrentValue(currentValue + value)
    onValueChange?.(currentValue)
  }
  return (
    <Container
      style={{
        display: 'flex',
      }}
      sx={{ my }}
    >
      <div style={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mr: '1rem' }}>
          {label}
        </Typography>
      </div>
      <div
        style={{
          display: 'flex',
          width: '200px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <IconButton
          disabled={currentValue <= minValue}
          size="small"
          sx={{ border: 1 }}
          aria-label="Substract one"
          onClick={() => incrementValue(-1)}
        >
          <RemoveRounded />
        </IconButton>
        <Typography variant="subtitle1" sx={{ mx: '0.7rem' }}>
          {currentValue}
        </Typography>
        <IconButton
          disabled={currentValue >= maxValue}
          size="small"
          sx={{ border: 1 }}
          onClick={() => incrementValue(+1)}
          aria-label="Add one"
        >
          <AddRounded />
        </IconButton>
      </div>
    </Container>
  )
}
