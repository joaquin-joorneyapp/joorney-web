'use client'
import DailyPlanTimeline from '@/components/DailyPlanTimeline'
import RouteMap from '@/components/maps/RouteMap'
import { Box, Container, Tab, Tabs, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { useState } from 'react'

export default () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="div" marginTop={2} marginBottom={6}>
        Trip Details
      </Typography>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid md={6} xs={12}>
          <Container
            sx={{
              maxWidth: '100%',
              bgcolor: 'background.paper',
              px: { xs: 0.5, md: 3 },
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Day 1" />
              <Tab label="Day 2" />
              <Tab label="Day 3" />
              <Tab label="Day 4" />
              <Tab label="Day 5" />
              <Tab label="Day 6" />
              <Tab label="Day 7" />
            </Tabs>
            <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
              <DailyPlanTimeline />
            </Container>
          </Container>
        </Grid>
        <Grid md={6} xs={12}>
          <Container>
            <Box style={{ borderRadius: 25, overflow: 'hidden' }}>
              <RouteMap />
            </Box>
          </Container>
        </Grid>
      </Grid>
    </Box>
  )
}
