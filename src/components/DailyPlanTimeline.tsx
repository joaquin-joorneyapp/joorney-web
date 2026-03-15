import { Activity } from '@/types/fetchs/responses/activity';
import { City } from '@/types/fetchs/responses/city';
import { DailySchedule } from '@/types/fetchs/responses/plan';
import { buildImageUrl } from '@/utils/image';
import { ArrowDownward, ArrowUpward, Delete, DragIndicator, MoreVert, Schedule, SwapHoriz } from '@mui/icons-material';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
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
  DialogContent,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { addMinutes, format, set } from 'date-fns';
import { useState } from 'react';
import CategoryIcon from './CategoryIcon';
import LabeledIcon from './LabeledIcon';
import DisplayActivity from './plan/DisplayActivity';

function MoveToDayMenu({
  activityIndex,
  currentDayIndex,
  totalDays,
  onMoveToDay,
}: {
  activityIndex: number;
  currentDayIndex: number;
  totalDays: number;
  onMoveToDay: (activityIndex: number, targetDay: number) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton
        size="small"
        title="Move to another day"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        <SwapHoriz fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Array.from({ length: totalDays }, (_, i) => i)
          .filter((d) => d !== currentDayIndex)
          .map((d) => (
            <MenuItem
              key={d}
              onClick={() => {
                onMoveToDay(activityIndex, d);
                setAnchorEl(null);
              }}
            >
              Day {d + 1}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
}

function MobileActivityMenu({
  activityIndex,
  totalActivities,
  currentDayIndex,
  totalDays,
  onReorder,
  onRemove,
  onMoveToDay,
}: {
  activityIndex: number;
  totalActivities: number;
  currentDayIndex: number;
  totalDays: number;
  onReorder?: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  onMoveToDay?: (index: number, targetDay: number) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const close = () => setAnchorEl(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        {onReorder && activityIndex > 0 && (
          <MenuItem onClick={() => { onReorder(activityIndex, activityIndex - 1); close(); }}>
            <ArrowUpward fontSize="small" sx={{ mr: 1 }} /> Move up
          </MenuItem>
        )}
        {onReorder && activityIndex < totalActivities - 1 && (
          <MenuItem onClick={() => { onReorder(activityIndex, activityIndex + 1); close(); }}>
            <ArrowDownward fontSize="small" sx={{ mr: 1 }} /> Move down
          </MenuItem>
        )}
        {totalDays > 1 && onMoveToDay &&
          Array.from({ length: totalDays }, (_, i) => i)
            .filter((d) => d !== currentDayIndex)
            .map((d) => (
              <MenuItem key={d} onClick={() => { onMoveToDay(activityIndex, d); close(); }}>
                <SwapHoriz fontSize="small" sx={{ mr: 1 }} /> Move to Day {d + 1}
              </MenuItem>
            ))
        }
        {onRemove && <Divider />}
        {onRemove && (
          <MenuItem onClick={() => { onRemove(activityIndex); close(); }} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Remove
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default function DailyPlanTimeline({
  city,
  schedule,
  onHoverActivity,
  currentDayIndex = 0,
  totalDays = 1,
  compact = false,
  onReorder,
  onRemove,
  onMoveToDay,
}: {
  city: City;
  schedule: DailySchedule;
  onHoverActivity: Function;
  currentDayIndex?: number;
  totalDays?: number;
  compact?: boolean;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  onRemove?: (index: number) => void;
  onMoveToDay?: (index: number, targetDay: number) => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const isEditable = !!(onReorder || onRemove || onMoveToDay);

  let currentDate = set(schedule.startAt || new Date(), { hours: 9, minutes: 0 });
  const hours: Date[] = [];
  for (const a of schedule.activities) {
    hours.push(new Date(currentDate.getTime()));
    currentDate = addMinutes(currentDate, a.duration);
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    onReorder?.(result.source.index, result.destination.index);
  };

  // Renders the inner content of one activity row, used by both draggable and static paths
  const renderActivityItem = (
    activity: (typeof schedule.activities)[number],
    i: number,
    isDragging: boolean,
    dragHandleProps: Record<string, any> | null
  ) => (
    <TimelineItem
      sx={{
        ':hover': {
          color: 'black',
          borderRadius: 2,
          backgroundColor: isDragging ? 'transparent' : 'seashell',
          cursor: 'pointer',
        },
        ...(isEditable && { ':hover .activity-actions': { opacity: 1 } }),
        ...(isDragging && {
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: theme.shadows[4],
        }),
      }}
      onClick={() => {
        if (isDragging) return;
        setViewDetails(true);
        setSelectedActivity(activity);
      }}
      onMouseEnter={() => !isDragging && onHoverActivity(activity.id)}
      onMouseLeave={() => onHoverActivity(null)}
    >
      <TimelineOppositeContent
        sx={{ m: '0', mt: 1.5, display: 'flex' }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
          {format(hours[i], 'h:mm a')}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color="primary" variant="outlined">
          <CategoryIcon category={activity.categories?.[0]?.name} color="secondary" />
        </TimelineDot>
        {i + 1 < schedule.activities.length && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', pl: 2, pr: isEditable ? 1 : 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="span">
              {activity.title}
            </Typography>
            <Typography variant="body1">
              {activity.description?.split('.')[0] + '.'}
            </Typography>
            {/* Hide images while dragging or in compact mode */}
            {!isDragging && !compact && (
              <ImageList sx={{ width: 'auto', height: 'auto', my: 1 }} cols={isMobile ? 2 : 3} rowHeight={134}>
                {activity.pictures?.slice(0, isMobile ? 2 : 3).map((item) => (
                  <ImageListItem key={item.url} sx={{ borderRadius: 2, mx: 0.2, overflow: 'hidden' }}>
                    <img
                      srcSet={buildImageUrl(item.url)}
                      src={buildImageUrl(item.url)}
                      alt={item.url}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
            <LabeledIcon
              icon={Schedule}
              fontVariant="body2"
              label={`${activity.duration} min`}
              color="text.secondary"
            />
          </Box>

          {/* Desktop edit actions */}
          {isEditable && (
            <Box
              className="activity-actions"
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                opacity: 0,
                transition: 'opacity 0.15s',
                flexShrink: 0,
                pt: 0.5,
                alignItems: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {dragHandleProps && (
                <Box
                  {...dragHandleProps}
                  sx={{ cursor: 'grab', color: 'text.secondary', display: 'flex', alignItems: 'center', py: 0.5 }}
                  title="Drag to reorder"
                >
                  <DragIndicator fontSize="small" />
                </Box>
              )}
              {totalDays > 1 && onMoveToDay && (
                <MoveToDayMenu
                  activityIndex={i}
                  currentDayIndex={currentDayIndex}
                  totalDays={totalDays}
                  onMoveToDay={onMoveToDay}
                />
              )}
              <IconButton size="small" title="Remove" color="error" onClick={() => onRemove?.(i)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Mobile edit actions */}
          {isEditable && (
            <Box
              sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0, alignItems: 'flex-start', pt: 0.5, gap: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {dragHandleProps && (
                <Box
                  {...dragHandleProps}
                  sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled', cursor: 'grab', px: 0.5, pt: 0.5 }}
                  title="Hold to drag"
                >
                  <DragIndicator fontSize="small" />
                </Box>
              )}
              <MobileActivityMenu
                activityIndex={i}
                totalActivities={schedule.activities.length}
                currentDayIndex={currentDayIndex}
                totalDays={totalDays}
                onReorder={onReorder}
                onRemove={onRemove}
                onMoveToDay={onMoveToDay}
              />
            </Box>
          )}
        </Box>
      </TimelineContent>
    </TimelineItem>
  );

  const timeline = (
    <Timeline
      position="right"
      sx={{ pl: 0, [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.1 }, pr: 0 }}
    >
      {schedule.activities.map((activity, i) =>
        onReorder ? (
          <Draggable key={activity.id} draggableId={String(activity.id)} index={i}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.draggableProps} style={provided.draggableProps.style}>
                {renderActivityItem(activity, i, snapshot.isDragging, provided.dragHandleProps)}
              </div>
            )}
          </Draggable>
        ) : (
          <div key={activity.id}>
            {renderActivityItem(activity, i, false, null)}
          </div>
        )
      )}
    </Timeline>
  );

  return (
    <>
      {onReorder ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="daily-plan">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {timeline}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        timeline
      )}

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
    </>
  );
}
