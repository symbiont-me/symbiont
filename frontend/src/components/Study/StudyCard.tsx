import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useStudyContext } from "@/app/context/StudyContext";

// const StudyCard = ({ study }: { study: Study }) => {
//   const studyContext = useStudyContext();

//   const handleDelete = () => {
//     if (studyContext && study.id) {
//       studyContext.deleteStudy(study.id.toString());
//     }
//   };
//   return (
//     <div className="container bg-symbiont-background w-60 m-4 h-60 rounded-xl p-0 border border-gray-500">
//       <div className="cursor-pointer" onClick={handleDelete}>
//         {" "}
//         <FontAwesomeIcon icon={faTrash} />{" "}
//       </div>
//       <div className="card-title">
//         <Link href={`studies/${study.id}`} className="">
//           <h1 className="text-sm p-4">{study.name}</h1>
//         </Link>
//       </div>
//       <div className="card-image p-4">
//         <img className="h-20 w-20 object-cover rounded-xl" src={study.image} />
//       </div>
//       <div className="card-description p-4">
//         <p className="text-xs">{study.description}</p>
//       </div>
//     </div>
//   );
// };

// export default StudyCard;

import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

const placeholderImage = "https://mui.com/static/images/cards/paella.jpg";

export default function StudyCard({ study }: { study: Study }) {
  const [expanded, setExpanded] = React.useState(false);
  const studyContext = useStudyContext();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <Link href={`studies/${study.id}`}>
        <CardHeader
          // action={
          //   <IconButton aria-label="settings">
          //     <MoreVertIcon />
          //   </IconButton>
          // }

          title={study.name}
          subheader={study?.createdAt?.toString()}
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
            study.id && studyContext?.deleteStudy(study.id.toString())
          }
        >
          <FontAwesomeIcon icon={faTrash} />
        </IconButton>
      </CardActions>
    </Card>
  );
}
