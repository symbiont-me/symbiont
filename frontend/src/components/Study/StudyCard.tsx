import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";
import { useStudyContext } from "@/app/context/StudyContext";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const placeholderImage =
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8";

export default function StudyCard({ study }: { study: Study }) {
  const [expanded, setExpanded] = React.useState(false);
  const studyContext = useStudyContext();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 245, maxHeight: 345 }}>
      <Link href={`studies/${study._id}`}>
        <CardHeader
          title={
            <Typography variant="h6" style={{ fontSize: 14 }}>
              {study.name}
            </Typography>
          }
          subheader={
            <Typography variant="subtitle2" style={{ fontSize: 8 }}>
              {study?.createdAt?.toString()}
            </Typography>
          }
          sx={{ cursor: "pointer" }}
        />
      </Link>
      <CardMedia
        component="img"
        height="194"
        image={study.image || placeholderImage}
        alt={study.name}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {study.description}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        {/* <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton> */}
        <IconButton
          aria-label="delete"
          onClick={() =>
            study._id && studyContext?.deleteStudy(study._id.toString())
          }
          sx={{ marginLeft: "auto", height: 20, width: 20 }}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
