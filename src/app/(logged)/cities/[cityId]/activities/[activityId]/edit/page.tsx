'use client';

import TableSkeleton from '@/components/skeletons/GenericTable';
import TitleSkeleton from '@/components/skeletons/GenericTitle';
import { editActivity, getActivity } from '@/fetchs/activity';
import { getCategories } from '@/fetchs/category';
import { ActivityBase } from '@/types/fetchs/responses/activity';
import { parseHTTPErrors } from '@/utils/http';
import { buildImageUrl } from '@/utils/image';
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
  ImageList,
  ImageListItem,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EditFormActivity extends ActivityBase {
  categories: number[];
}

export default function SavedPlansPage({}) {
  const router = useRouter();
  const params = useParams<{ cityName: string; activityName: string }>();
  const { data: activity, isLoading: isLoadingActivity } = getActivity(
    params.cityName,
    params.activityName
  );

  const { data: categories, isLoading: isLoadingCategories } = getCategories();

  const [formData, setFormData] = useState<EditFormActivity>(
    {} as any as EditFormActivity
  );
  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isLoadingActivity && activity) {
      const categories = activity.categories.map((c) => c.id);
      setFormData({ ...activity, categories });
    }
  }, [activity]);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setErrors({});
    setProcessing(true);

    editActivity({ ...formData })
      .then(() => router.push(`/cities/${activity?.cityId}/activities`))
      .catch((err) => {
        const errors = parseHTTPErrors(err);
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
        {isLoadingActivity ? (
          <TitleSkeleton />
        ) : (
          <Typography
            variant="h4"
            component="div"
            marginTop={2}
            marginBottom={4}
          >
            {activity?.city.title} / {activity?.name}
          </Typography>
        )}

        {isLoadingActivity || isLoadingCategories ? (
          <TableSkeleton rows={10} cols={1} />
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={
                              categories?.find((c) => c.id === value)?.title
                            }
                          />
                        ))}
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
              <Grid size={12}>
                {activity?.pictures.length ? (
                  <ImageList cols={3}>
                    {activity.pictures.map((item) => (
                      <ImageListItem key={item.url}>
                        <Image
                          src={buildImageUrl(item.url)}
                          loading="lazy"
                          alt={item.url}
                          width={500}
                          height={500}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <div>No images</div>
                )}
              </Grid>
              <Grid size={12} sx={{ mb: 5 }}>
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
                  Edit
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
