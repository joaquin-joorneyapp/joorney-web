import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

function ScrollRowSkeleton() {
  return (
    <Box>
      <Skeleton width={160} height={32} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ flexShrink: 0 }}>
            <Skeleton variant="rounded" width={180} height={120} />
            <Skeleton width={120} sx={{ mt: 1 }} />
            <Skeleton width={80} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function HomePageSkeleton() {
  return (
    <Box sx={{ width: '100%', mt: { xs: 1, md: 0 } }}>
      {/* Hero card skeleton */}
      <Skeleton
        variant="rounded"
        sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 220, md: 320 }, mb: 1 }}
      />
      <Skeleton width={120} sx={{ mb: 5 }} />

      {/* Time-based activities */}
      <Box sx={{ mx: -1, px: 1, py: 3, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <ScrollRowSkeleton />
      </Box>

      {/* Upcoming trips */}
      <Box sx={{ mb: 2 }}>
        <ScrollRowSkeleton />
      </Box>
    </Box>
  );
}
