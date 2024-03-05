'use client';

import TableSkeleton from '@/components/skeletons/GenericTable';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { createActivity } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { getCity } from '@/fetchs/city';
import { ActivityBase } from '@/types/fetchs/responses/activity';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface EditFormActivity extends ActivityBase {
  categories: number[];
}

export default function SavedPlansPage({}) {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();

  const { data: categories, isLoading: isLoadingCategories } = getCategories();
  const { data: city, isLoading: isLoadingCity } = getCity(+params.cityId);

  const [formData, setFormData] = useState<EditFormActivity>(
    {name: '', cityId: params.cityId} as any as EditFormActivity
  );
  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setProcessing] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    const data = { ...formData, [name]: value };
    if (name === 'title') {
      data.name = (value || '').replaceAll(' ', '-').toLowerCase();
    }
    setFormData(data);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setErrors({});
    setProcessing(true);

    createActivity({ ...formData })
      .then(() => router.push(`/cities/${params.cityId}/activities`))
      .catch((err) => {
        const { errors } = err?.response?.data || [];
        const errorsAsMap = errors.reduce((map: any, error: any) => {
          map[error.field] = error.message;
          return map;
        }, {});
        setErrors(errorsAsMap);
      })
      .finally(() => setProcessing(false));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <div>
        {isLoadingCity ? (
          <TitleSkeleton />
        ) : (
          <Typography
            variant="h4"
            component="div"
            marginTop={2}
            marginBottom={4}
          >
            {city?.title} / New activity
          </Typography>
        )}

        {isLoadingCity || isLoadingCategories ? (
          <TableSkeleton rows={10} cols={1} />
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Name (read only - Complete Title) "
                  error={errors['name']}
                  helperText={errors['name']}
                  value={formData.name}
                  disabled
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="title"
                  name="title"
                  label="Title"
                  error={errors['title']}
                  helperText={errors['title']}
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  multiline
                  required
                  id="description"
                  name="description"
                  label="Description"
                  error={errors['description']}
                  helperText={errors['description']}
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="address"
                  name="address"
                  label="Address"
                  error={errors['address']}
                  helperText={errors['address']}
                  value={formData.address}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  required
                  id="duration"
                  name="duration"
                  label="Duration"
                  error={errors['duration']}
                  helperText={errors['duration']}
                  value={formData.duration}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  required
                  id="latitude"
                  name="latitude"
                  label="Latitude"
                  error={errors['latitude']}
                  helperText={errors['latitude']}
                  value={formData.latitude}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  required
                  id="longitude"
                  name="longitude"
                  label="Longitude"
                  error={errors['longitude']}
                  helperText={errors['longitude']}
                  value={formData.longitude}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  error={!!errors['categories']}
                  required
                  sx={{ width: '100%' }}
                >
                  <InputLabel id="categories-label">Categories</InputLabel>
                  <Select
                    id="categories"
                    labelId="categories-label"
                    name="categories"
                    label="Categories"
                    error={errors['categories']}
                    multiple
                    fullWidth
                    value={formData?.categories || []}
                    onChange={handleChange}
                    input={<OutlinedInput id="category" label="Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          console.log('value', value);
                          return (
                            <Chip
                              key={value}
                              label={
                                categories?.find((c) => c.id === value)?.title
                              }
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5 + 8,
                          width: 250,
                        },
                      },
                    }}
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['categories'] && (
                    <FormHelperText>{errors['categories']}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ mb: 5 }}>
                {!isProcessing && Object.keys(errors).length > 0 && (
                  <Alert severity="error" sx={{ mt: 2, mb: 5 }}>
                    <AlertTitle>Error</AlertTitle>
                    Something went wrong.
                  </Alert>
                )}
                <LoadingButton
                  loading={isProcessing}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create
                </LoadingButton>
                <Button
                  variant="contained"
                  color="inherit"
                  disabled={isProcessing}
                  onClick={() => router.back()}
                  style={{ marginLeft: '1rem' }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </div>
    </Box>
  );
}
