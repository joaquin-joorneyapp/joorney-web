'use client';

import TableSkeleton from '@/components/skeletons/GenericTable';
import { getCities } from '@/fetchs/city';
import ListIcon from '@mui/icons-material/List';
import {
  Alert,
  AlertTitle,
  Box,
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
import { useRouter } from 'next/navigation';

export default function ListCities({}) {
  const { data: cities, isLoading } = getCities();
  const router = useRouter();
  return (
    <Box sx={{ width: '100%' }}>
      <div>
        <Typography variant="h4" component="div" marginTop={2} marginBottom={4}>
          Cities
        </Typography>
        {!isLoading && !cities?.length && (
          <Alert severity="info" sx={{ mt: 2, mb: 5 }}>
            <AlertTitle>Oops!</AlertTitle>
            No cities yet.
          </Alert>
        )}
        {isLoading ? (
          <TableContainer component={Paper}>
            <TableSkeleton rows={2} cols={5} />
          </TableContainer>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Latitude</TableCell>
                  <TableCell align="right">Longitude</TableCell>
                  <TableCell align="center">Options</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities?.map((city) => (
                  <TableRow
                    key={city.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {city.name}
                    </TableCell>
                    <TableCell>{city.title}</TableCell>
                    <TableCell align="right">{city.latitude}</TableCell>
                    <TableCell align="right">{city.longitude}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Manage Activities" placement="top">
                        <IconButton
                          onClick={() =>
                            router.push(`/cities/${city.id}/activities/manage`)
                          }
                        >
                          <ListIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </Box>
  );
}
