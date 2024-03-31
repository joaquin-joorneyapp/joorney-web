import { Skeleton } from '@mui/material';

export default function TitleSkeleton() {
  return (
    <Skeleton
      width={70}
      height={40}
      style={{
        borderRadius: '25px',
      }}
      sx={{mr: 1}}
    />
  );
}
