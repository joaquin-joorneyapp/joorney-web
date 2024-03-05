"use client";

import PlanCard from "@/components/PlanCard";
import { getSavedPlans } from "@/fetchs/plan";
import Grid from "@mui/material/Unstable_Grid2";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import PlanListSkeleton from "@/components/skeletons/PlanList";

export default function SavedPlansPage({}) {
  const { data: plans, isLoading, error } = getSavedPlans();
  return (
    <Box sx={{ width: "100%" }}>
      <div>
        <Typography variant="h4" component="div" marginTop={2} marginBottom={4}>
          Saved Plans
        </Typography>
        {!isLoading && !plans?.length && (
          <Alert severity="info" sx={{ mt: 2, mb: 5 }}>
            <AlertTitle>Title 👋</AlertTitle>
            Message
          </Alert>
        )}
        {isLoading ? (
          <PlanListSkeleton />
        ) : (
          <Grid container rowSpacing={3} columnSpacing={3}>
            {plans?.map((plan, i) => (
              <Grid key={i} md={3} xs={6}>
                <PlanCard plan={plan} />
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </Box>
  );
}
