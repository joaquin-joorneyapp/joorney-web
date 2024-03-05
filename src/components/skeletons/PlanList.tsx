import { Grid } from "@mui/material";
import React from "react";
import PlanCardSkeleton from "./PlanCard";

export default function PlanListSkeleton() {
  return (
    <Grid container rowSpacing={3} columnSpacing={3}>
      {Array.from(Array(3)).map((_, i) => (
        <Grid key={i} xs={6} md={4} item={true}>
          <PlanCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
