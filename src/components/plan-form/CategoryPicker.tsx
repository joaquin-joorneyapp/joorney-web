'use client';
import CategoryIcon from '@/components/CategoryIcon';
import { Category } from '@/types/fetchs/responses/category';
import { Check, FavoriteBorder } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import SectionHeader from './SectionHeader';

export default function CategoryPicker({
  categories,
  isLoading,
  selectedCategories,
  onCategoriesChange,
  attempted,
}: {
  categories: Category[] | undefined;
  isLoading: boolean;
  selectedCategories: number[];
  onCategoriesChange: (ids: number[]) => void;
  attempted?: boolean;
}) {
  const toggle = (id: number) => {
    onCategoriesChange(
      selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id]
    );
  };

  const allSelected =
    !!categories?.length && categories.every((c) => selectedCategories.includes(c.id));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white',
      }}
    >
      <SectionHeader
        icon={<FavoriteBorder sx={{ fontSize: 22 }} />}
        title="What do you love?"
        subtitle="Select at least 3 interests to personalise your itinerary."
        badge={selectedCategories.length > 0 ? `${selectedCategories.length} selected` : undefined}
        action={
          categories && categories.length > 0 ? (
            <Button
              size="small"
              variant="text"
              color="primary"
              onClick={() =>
                onCategoriesChange(allSelected ? [] : categories.map((c) => c.id))
              }
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={90 + (i % 3) * 20}
              height={40}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {categories?.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <Box
                key={cat.id}
                onClick={() => toggle(cat.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.25,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  color: isSelected ? 'white' : 'text.primary',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: isSelected ? 'primary.dark' : '#FFF3E0',
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& svg': {
                      color: isSelected ? 'white' : 'text.secondary',
                      fontSize: '1.15rem',
                      transition: 'color 0.2s',
                    },
                  }}
                >
                  <CategoryIcon category={cat.name} />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={isSelected ? 600 : 400}
                  sx={{ color: 'inherit', whiteSpace: 'nowrap' }}
                >
                  {cat.title}
                </Typography>
                {isSelected && (
                  <Check sx={{ fontSize: '1rem', color: 'white', ml: 0.25 }} />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {selectedCategories.length} selected
        </Typography>
        {selectedCategories.length < 3 && (
          <Typography variant="caption" color="warning.main" fontWeight={600}>
            · {3 - selectedCategories.length} more needed
          </Typography>
        )}
        {selectedCategories.length >= 3 && (
          <Typography variant="caption" color="success.main" fontWeight={600}>
            · Great choice!
          </Typography>
        )}
      </Box>

      {attempted && selectedCategories.length < 3 && (
        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
          Please select at least 3 interests to personalise your trip.
        </Alert>
      )}
    </Paper>
  );
}
