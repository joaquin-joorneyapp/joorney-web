'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import NumericalButtonInput from '@/components/input/NumericalButtonInput'
import { FormGroup } from '@mui/material'

export default function HorizontalLinearAlternativeLabelStepper() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="div" marginTop={2} marginBottom={4}>
        New Trip
      </Typography>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid md={4} xs={12}>
            <NumericalButtonInput
              my={2}
              label="Adults"
              minValue={0}
              initialValue={2}
              maxValue={10}
              onValueChange={() => {}}
            />
            <NumericalButtonInput
              my={2}
              label="Children"
              minValue={0}
              initialValue={2}
              maxValue={10}
              onValueChange={() => {}}
            />
            <NumericalButtonInput
              my={2}
              label="Babies"
              minValue={0}
              initialValue={2}
              maxValue={10}
              onValueChange={() => {}}
            />
        </Grid>
      </Grid>
    </Box>
  )
}
