import { GetInitialPlanForm } from '@/types/fetchs/requests/plan';
import { Category } from '@/types/fetchs/responses/category';
import { Add } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CategoryIcon from '../CategoryIcon';
import NumericalButtonInput from '../input/NumericalButtonInput';

export default ({
  days,
  selectedCategories,
  categories,
  handleSubmit,
  handleCancel,
  onDataChange,
}: GetInitialPlanForm & {
  categories: Category[];
  handleCancel: () => any;
  handleSubmit: (_: any) => any;
  onDataChange?: (_: any) => any;
}) => {
  const [data, setData] = useState<{
    selectedCategories: number[];
    days: number;
  }>({
    days,
    selectedCategories,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    onDataChange && onDataChange(data);
  }, [data]);

  const addOrRemoveCategory = (id: number) => {
    const isSelected =
      data.selectedCategories.length === 0 ||
      data.selectedCategories.includes(id);
    const selectedCategories = isSelected
      ? data.selectedCategories.filter((c) => c !== id)
      : [...data.selectedCategories, id];
    setData({ selectedCategories, days: data.days });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <Grid container spacing={9}>
        <Grid item xs={12} md={4}>
          <Box display={'block'} sx={{ mb: { xs: 4, md: 1.5 } }}>
            <Alert
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
              severity="info"
            >
              By now, only New York is available. Other amazing cities are
              coming soon!
            </Alert>
          </Box>
          <Box display="flex" alignItems="center" sx={{ mb: { xs: 4, md: 7 } }}>
            <Typography
              variant="body1"
              sx={{ mb: 0, mr: 2 }}
              display={'inline'}
            >
              Select a city:
            </Typography>
            <Autocomplete
              value={{ code: 'US', label: 'New York' } as any}
              sx={{ flexGrow: 1 }}
              options={[{ code: 'US', label: 'New York' }]}
              autoHighlight
              autoComplete
              disableClearable
              disableCloseOnSelect
              getOptionLabel={(option) => option.label}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                  {...props}
                >
                  <img
                    loading="lazy"
                    width="20"
                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                    alt=""
                  />
                  {option.label}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password', // disable autocomplete and autofill
                  }}
                />
              )}
            />
          </Box>

          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              sx={{ mb: 0, mr: 4 }}
              display={'inline'}
            >
              How many days?
            </Typography>
            <NumericalButtonInput
              my={2}
              minValue={3}
              initialValue={days || 3}
              maxValue={15}
              onValueChange={(days: number) => setData({ ...data, days })}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          style={{ ...(isMobile && { paddingTop: 20 }) }}
        >
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Select your interests:
          </Typography>
          {categories.map((c: Category, i) => {
            const isSelected =
              data.selectedCategories.length === 0 ||
              data.selectedCategories.includes(c.id);
            return (
              <Chip
                key={i}
                variant={isSelected ? 'filled' : 'outlined'}
                onDelete={() => addOrRemoveCategory(c.id)}
                label={c.title}
                icon={<CategoryIcon category={c.name} />}
                deleteIcon={isSelected ? undefined : <Add />}
                sx={{ mr: 1, mb: 1 }}
              />
            );
          })}
        </Grid>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto', mt: 5 }}>
          <Button
            onClick={() => handleCancel!()}
            color="secondary"
            sx={{ mr: 1, mt: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit!(data)}
            sx={{ color: 'white' }}
          >
            Generate plan
          </Button>
        </Box>
      </Grid>
    </form>
  );
};
