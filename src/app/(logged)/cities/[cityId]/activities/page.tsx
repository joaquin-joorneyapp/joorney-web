'use client';

import TableSkeleton from '@/components/skeletons/GenericTable';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { getActivities } from '@/fetchs/activity';
import { getCity } from '@/fetchs/city';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

export default function SavedPlansPage({}) {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const { data: activities, isLoading: isLoadingActivities } = getActivities(
    parseInt(params.cityId)
  );
  const { data: city, isLoading: isLoadingCity } = getCity(
    parseInt(params.cityId)
  );
  return (
    <Box sx={{ width: '100%' }}>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {isLoadingCity ? (
            <TitleSkeleton />
          ) : (
            <Typography
              variant="h4"
              component="div"
              marginTop={2}
              marginBottom={4}
            >
              {city?.title} / Activities
            </Typography>
          )}
          <Button
            variant="outlined"
            size="large"
            color="primary"
            disableElevation
            href={`/cities/${params.cityId}/activities/create`}
          >
            New Activity
          </Button>
        </div>

        {isLoadingActivities ? (
          <TableSkeleton rows={2} cols={6} />
        ) : (
          <>
            {!isLoadingActivities && !isLoadingCity && !activities?.length ? (
              <Alert severity="info" sx={{ mt: 2, mb: 5 }}>
                <AlertTitle>Oops!</AlertTitle>
                No activities for {city?.title} yet.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell align="right">Duration</TableCell>
                      <TableCell align="right">Latitude</TableCell>
                      <TableCell align="right">Longitude</TableCell>
                      <TableCell align="center">Options</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities?.map((activity) => (
                      <TableRow
                        key={activity.name}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {activity.name}
                        </TableCell>
                        <TableCell>{activity.title}</TableCell>
                        <TableCell align="right">
                          {activity.duration} min
                        </TableCell>
                        <TableCell align="right">{activity.latitude}</TableCell>
                        <TableCell align="right">
                          {activity.longitude}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Activity" placement="top">
                            <IconButton
                              onClick={() =>
                                router.push(
                                  `/cities/${activity.cityId}/activities/${activity.id}/edit`
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </div>
    </Box>
  );
}
