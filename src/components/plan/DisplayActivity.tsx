import ChipSkeleton from '@/components/skeletons/Chip';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { getActivity } from '@/fetchs/activity';
import { buildImageUrl } from '@/utils/image';
import { Navigation, Place, Schedule } from '@mui/icons-material';
import {
  Box,
  Chip,
  Container,
  ImageList,
  ImageListItem,
  Skeleton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CategoryIcon from '../CategoryIcon';
import LabeledIcon from '../LabeledIcon';
import LocationMap from '../maps/LocationMap';

export default ({
  cityName,
  activityName,
}: {
  cityName: string;
  activityName: string;
}) => {
  const { data: activity, isLoading: isLoadingActivity } = getActivity(
    cityName,
    activityName
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box marginTop={2} marginBottom={1} display="flex" alignItems="center">
        <Typography variant="h3" color="secondary" display={'inline'}>
          {isLoadingActivity ? <TitleSkeleton /> : activity?.title}
        </Typography>
      </Box>

      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid md={6} xs={12}>
          <Container sx={{ mb: 2.5 }} style={{ paddingLeft: 0 }}>
            <Box display="flex" alignItems="center">
              {isLoadingActivity ? (
                Array.from({ length: 3 }, (_, i) => <ChipSkeleton key={i} />)
              ) : (
                <>
                  <LabeledIcon
                    icon={Place}
                    label={activity?.city.title || ''}
                    color="text.secondary"
                    spaceBetween={0.2}
                    sx={{ mr: 1.5, mb: 0.5 }}
                  />
                  <LabeledIcon
                    icon={Schedule}
                    label={`${activity?.duration} min`}
                    color="text.secondary"
                    spaceBetween={0.4}
                    sx={{ mr: 1.5, mb: 0.5 }}
                  />
                  {activity?.categories.map((c, i) => (
                    <Chip
                      key={i}
                      label={c.title}
                      sx={{ mr: 0.5, mb: 0.5 }}
                      icon={<CategoryIcon category={c.name} />}
                    />
                  ))}
                </>
              )}
            </Box>
          </Container>
          <Container sx={{ mb: 2 }} style={{ paddingLeft: '0.5rem' }}>
            <Typography variant="body1" paragraph gutterBottom>
              {isLoadingActivity ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                activity?.description
              )}
            </Typography>
          </Container>
          <Container sx={{ mb: 2 }} style={{ paddingLeft: '0.5rem' }}>
            <Typography variant="h5" gutterBottom color="secondary">
              {isLoadingActivity ? <Skeleton /> : 'Location'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {isLoadingActivity ? (
                <Skeleton />
              ) : (
                <LabeledIcon
                  icon={Navigation}
                  label={activity?.address || ''}
                  color="text.primary"
                  spaceBetween={0.6}
                  fontVariant='body1'
                  sx={{ mr: 1.5, mb: 0.5 }}
                />
              )}
            </Typography>
            {!isLoadingActivity && (
              <Box
                sx={{ mt: 2 }}
                style={{ borderRadius: 15, overflow: 'hidden' }}
              >
                <LocationMap
                  latitude={activity?.latitude}
                  longitude={activity?.longitude}
                />
              </Box>
            )}
          </Container>
        </Grid>
        <Grid md={6} xs={12}>
          <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ImageList
              sx={{ width: '100%' }}
              rowHeight={200}
              gap={3}
              style={{
                borderRadius: 25,
                overflow: 'hidden',
              }}
            >
              {isLoadingActivity
                ? Array.from({ length: 5 }, (_, i) => (
                    <ImageListItem
                      key={i}
                      cols={i % 5 ? 1 : 2}
                      rows={i % 5 ? 1 : 2}
                    >
                      <Skeleton variant="rectangular" height={400} />
                    </ImageListItem>
                  ))
                : activity!.pictures.map((item, i) => (
                    <ImageListItem
                      key={i}
                      cols={i % 5 ? 1 : 2}
                      rows={i % 5 ? 1 : 2}
                      style={{
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={buildImageUrl(item.url)}
                        alt={item.url}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
            </ImageList>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};
