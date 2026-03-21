'use client';
import { CalendarToday } from '@mui/icons-material';
import { Add, Remove } from '@mui/icons-material';
import {
  Alert,
  Box,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SectionHeader from './SectionHeader';

export default function DurationPicker({
  days,
  onDaysChange,
  startDate,
  onStartDateChange,
  today,
  attempted,
  noPaper = false,
}: {
  days: number;
  onDaysChange: (days: number) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  today: string;
  attempted?: boolean;
  /** Strip the outer Paper wrapper (e.g. when used inside a Dialog) */
  noPaper?: boolean;
}) {
  const inner = (
    <>
      <SectionHeader
        icon={<CalendarToday sx={{ fontSize: 20 }} />}
        title="Trip duration & start date"
        subtitle="How long are you staying? Pick a start date if you know it."
      />

      <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'flex-start' }}>
        <Grid xs={12} md={6}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ mb: 1.5 }}
          >
            Number of days
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              py: 3,
              px: 2,
              bgcolor: '#FFF3E0',
              borderRadius: 4,
            }}
          >
            <IconButton
              onClick={() => onDaysChange(Math.max(1, days - 1))}
              disabled={days <= 1}
              sx={{
                bgcolor: 'white',
                boxShadow: 1,
                flexShrink: 0,
                width: 44,
                height: 44,
                '&:hover': { bgcolor: 'white', boxShadow: 2 },
                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <Remove />
            </IconButton>
            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
              <Typography
                variant="h2"
                fontWeight={700}
                color="primary.main"
                sx={{ lineHeight: 1 }}
              >
                {days}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {days === 1 ? 'day' : 'days'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => onDaysChange(Math.min(30, days + 1))}
              disabled={days >= 30}
              sx={{
                bgcolor: 'white',
                boxShadow: 1,
                flexShrink: 0,
                width: 44,
                height: 44,
                '&:hover': { bgcolor: 'white', boxShadow: 2 },
                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <Add />
            </IconButton>
          </Box>
          {attempted && (days < 1 || days > 30) && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
              Duration must be between 1 and 30 days.
            </Alert>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ mb: 1.5 }}
          >
            Start date{' '}
            <Typography component="span" variant="caption" color="text.disabled">
              (optional)
            </Typography>
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            inputProps={{ min: today }}
            helperText="Leave blank if you haven't decided yet"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          {attempted && startDate && startDate < today && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
              Start date must be today or in the future.
            </Alert>
          )}
        </Grid>
      </Grid>
    </>
  );

  if (noPaper) return <Box sx={{ mb: 2 }}>{inner}</Box>;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white',
      }}
    >
      {inner}
    </Paper>
  );
}
