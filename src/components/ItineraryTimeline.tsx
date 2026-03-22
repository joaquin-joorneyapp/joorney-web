import { Activity } from '@/types/fetchs/responses/activity';
import { getPictureUrl } from '@/utils/image';
import { trimDescription } from '@/utils/trimDescription';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  activities: Activity[];
  cityId: string;
}

export default function ItineraryTimeline({ activities, cityId }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {activities.map((activity, index) => {
        const image = getPictureUrl(activity.pictures[0]);
        const isLast = index === activities.length - 1;
        return (
          <Box
            key={activity.id}
            sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', position: 'relative' }}
          >
            {/* Vertical connecting line */}
            {!isLast && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 15,
                  top: 32,
                  bottom: -24,
                  width: 2,
                  bgcolor: 'divider',
                }}
              />
            )}

            {/* Numbered circle */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 700,
                zIndex: 1,
              }}
            >
              {index + 1}
            </Box>

            {/* Activity content */}
            <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 0 }}>
              {image && (
                <Box
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 64,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={image}
                    alt={activity.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                </Box>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component={Link}
                  href={`/cities/${cityId}/activities/${activity.name}`}
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {activity.title}
                </Typography>
                {activity.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {trimDescription(activity.description, 100)}
                  </Typography>
                )}
                {(activity.duration || activity.address) && (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {activity.duration ? `${activity.duration} min` : null}
                    {activity.duration && activity.address ? ' · ' : null}
                    {activity.address ?? null}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
