import { Activity } from '@/types/fetchs/responses/activity';
import { City } from '@/types/fetchs/responses/city';
import { DailySchedule } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import { Schedule } from '@mui/icons-material';
import HotelIcon from '@mui/icons-material/Hotel';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import RepeatIcon from '@mui/icons-material/Repeat';
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
  Box,
  Button,
  Dialog,
  DialogActions,
  ImageList,
  ImageListItem,
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
            sx={{ m: '0', mt: 1.5 }}
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
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent
            sx={{
              py: '12px',
              px: 2,
            }}
          >
            <Typography variant="h6" component="span">
              {activity.title}
            </Typography>
            <Typography variant="body1">
              {activity.description?.split('.')[0] + '.'}
            </Typography>
            <ImageList
              sx={{ width: 'auto', height: 'auto', my: 1 }}
              cols={3}
              rowHeight={134}
            >
              {activity.pictures?.slice(0, 3).map((item) => (
                <ImageListItem
                  key={item.url}
                  sx={{ borderRadius: 2, overflow: 'hidden', mx: 0.2 }}
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
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: '0', mt: 1.5 }}
          align="right"
          variant="body2"
          color="text.secondary"
        >
          9:30 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot>
            <CategoryIcon category="food" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            Eat
          </Typography>
          <Typography variant="body1">
            Because you need strength. Because you need strength. Because you
            need strength. Because you need strength.
          </Typography>
          <ImageList
            sx={{ width: 'auto', height: 'auto', my: 1 }}
            cols={3}
            rowHeight={134}
          >
            {itemData.map((item, i) => (
              <ImageListItem
                key={i}
                sx={{ borderRadius: 2, overflow: 'hidden', mx: 0.2 }}
              >
                <img
                  srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                  alt={item.title}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          10:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary">
            <LaptopMacIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            Code
          </Typography>
          <Typography>Because it&apos;s awesome!</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          11:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color="primary" variant="outlined">
            <HotelIcon />
          </TimelineDot>
          <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            Sleep
          </Typography>
          <Typography>Because you need rest</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent
          sx={{ m: 'auto 0' }}
          variant="body2"
          color="text.secondary"
        >
          12:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
          <TimelineDot color="secondary">
            <RepeatIcon />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            Repeat
          </Typography>
          <Typography>Because this is the life you love!</Typography>
        </TimelineContent>
      </TimelineItem>
      <Dialog
        scroll={'body'}
        fullWidth={true}
        maxWidth={'xl'}
        open={viewDetails}
        onClose={() => setViewDetails(false)}
      >
        <Box sx={{ pt: 3, pl: 6, pr: 6 }}>
          {selectedActivity && (
            <DisplayActivity
              activityName={selectedActivity?.name}
              cityName={city.name}
            />
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => setViewDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Timeline>
  );
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
];
