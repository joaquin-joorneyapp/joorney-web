import { Box, Skeleton } from "@mui/material";

export default function PlanCardSkeleton() {
  return (
    <div>
      <Skeleton
        variant="rectangular"
        width={640}
        height={480}
       style={{ height: "200px", width: "100%" }}
      />
      <Box sx={{ pt: 0.5 }}>
        <Skeleton width="30%" />
        <Skeleton width="40%" />
      </Box>
    </div>
  );
}
