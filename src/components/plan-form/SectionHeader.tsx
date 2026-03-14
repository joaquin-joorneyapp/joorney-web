import { Box, Chip, Typography } from '@mui/material';

export default function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {badge && (
          <Chip label={badge} size="small" color="primary" sx={{ fontWeight: 600, ml: 0.5 }} />
        )}
        {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ pl: '54px', fontWeight: 300 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
