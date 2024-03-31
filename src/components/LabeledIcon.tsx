import {
  Box,
  Typography,
  TypographyPropsVariantOverrides,
} from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { OverridableStringUnion } from '@mui/types';

type TypographyVariant = OverridableStringUnion<
  Variant | 'inherit',
  TypographyPropsVariantOverrides
>;

export default function CategoryIcon({
  icon,
  color,
  label,
  spaceBetween,
  fontVariant,
  fontIcon,
  ...props
}: {
  icon: any;
  label: string;
  color?: string;
  spaceBetween?: number;
  fontVariant?: TypographyVariant;
  fontIcon?: string;
  sx?: any;
}) {
  const Icon = icon;
  return (
    <Box display="flex" alignItems="center" {...props}>
      <Icon fontSize={fontIcon || 'small'} htmlColor={color} />{' '}
      <Typography
        variant={fontVariant}
        color={color}
        display="inline"
        sx={{ ml: spaceBetween || 0.2, mt: 0.3 }}
      >
        {label}
      </Typography>
    </Box>
  );
}
