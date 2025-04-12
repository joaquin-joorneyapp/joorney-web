import { Activity } from '@/types/fetchs/responses/activity';
import { City } from '@/types/fetchs/responses/city';
import { DailySchedule } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import { Schedule } from '@mui/icons-material';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { addMinutes, format, set } from 'date-fns';
import { useState } from 'react';
import CategoryIcon from './CategoryIcon';
import LabeledIcon from './LabeledIcon';
import DisplayActivity from './plan/DisplayActivity';

export default function DailyPlanTimeline({
  city,
  schedule,
  onHoverActivity,
}: {
  city: City;
  schedule: DailySchedule;
  onHoverActivity: Function;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  let currentDate = set(schedule.startAt || new Date(), {
    hours: 9,
    minutes: 0,
  });
  const hours: Date[] = [];
  const activities = schedule.activities;
  for (const a of activities) {
    hours.push(new Date(currentDate.getTime()));
    currentDate = addMinutes(currentDate, a.duration);
  }

  return (
    <Timeline
      position="right"
      sx={{
        pl: 0,
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0.1,
        },
        pr: 0,
      }}
    >
      {schedule.activities.map((activity, i) => (
        <TimelineItem
          key={i}
          sx={{
            ':hover': {
              color: 'black',
              borderRadius: 2,
              backgroundColor: 'seashell',
              cursor: 'pointer',
            },
          }}
          onClick={() => {
            setViewDetails(true);
            setSelectedActivity(activity);
          }}
          onMouseEnter={() => onHoverActivity(activity.id)}
          onMouseLeave={() => onHoverActivity(null)}
        >
          <TimelineOppositeContent
            sx={{ m: '0', mt: 1.5, display: { xs: 'none', md: 'flex' } }}
            align="right"
            variant="body2"
            color="text.secondary"
          >
            {format(hours[i], 'h:mm a')}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="primary" variant="outlined">
              <CategoryIcon
                category={activity.categories[0]?.name}
                color="secondary"
              />
            </TimelineDot>
            {i + 1 < schedule.activities.length && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent
            sx={{
              py: '12px',
              pl: 2,
              pr: 0,
            }}
          >
            <Typography variant="h6" component="span">
              {activity.title}
            </Typography>
            <Typography variant="body1">
              {activity.description?.split('.')[0] + '.'}
            </Typography>
            <ImageList
              sx={{
                width: 'auto',
                height: 'auto',
                my: 1,
              }}
              cols={isMobile ? 2 : 3}
              rowHeight={134}
            >
              {activity.pictures?.slice(0, isMobile ? 2 : 3).map((item) => (
                <ImageListItem
                  key={item.url}
                  sx={{
                    borderRadius: 2,
                    mx: 0.2,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    srcSet={buildImageUrl(item.url)}
                    src={buildImageUrl(item.url)}
                    alt={item.url}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <LabeledIcon
              icon={Schedule}
              fontVariant="body2"
              label={`${activity.duration} min`}
              color="text.secondary"
            />
          </TimelineContent>
        </TimelineItem>
      ))}

      <Dialog
        scroll={isMobile ? 'paper' : 'body'}
        fullWidth={!isMobile}
        fullScreen={isMobile}
        maxWidth={'xl'}
        open={viewDetails}
        onClose={() => setViewDetails(false)}
      >
        <DialogContent
          dividers
          sx={{ pt: { xs: 1.5, md: 3 }, px: { xs: 1.5, md: 6 } }}
        >
          {selectedActivity && (
            <DisplayActivity
              activityName={selectedActivity?.name}
              cityName={city.name}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Timeline>
  );
}
