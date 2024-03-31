import { Plan } from "@/types/fetchs/responses/plan";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Image from "next/image";

interface Props {
  plan: Plan;
}

export default function PlanCard({ plan }: Props) {
  return (
    <Card>
      <Image
        alt={plan.city}
        src={plan.pictures[0]}
        width={640}
        height={480}
        style={{
          maxWidth: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {plan.duration} days
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {plan.city}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">View</Button>
      </CardActions>
    </Card>
  );
}
