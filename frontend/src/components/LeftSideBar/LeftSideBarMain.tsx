// import "@/components/LeftSideBar/leftSideBar.css";
// import OverLayGradient from "@/components/ui/OverLayGradient";
// import { useQuery } from "@tanstack/react-query";
// import { UserAuth } from "@/app/context/AuthContext";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Study } from "@/types";
// import Link from "next/link";
// import NavItem from "./NavItem";
// import { faHouse, faBook } from "@fortawesome/free-solid-svg-icons";
// import { usePathname } from "next/navigation";
// import "@/app/globals.css";

// const fetchUserStudies = async (userToken: string) => {
//   const response = await axios.get("http://127.0.0.1:8000/get-user-studies", {
//     headers: {
//       Authorization: `Bearer ${userToken}`,
//     },
//   });
//   return response.data;
// };

// const LeftSideBarMain = () => {
//   const authContext = UserAuth();
//   const userTokenPromise = authContext?.user?.getIdToken();
//   const [studies, setStudies] = useState<Study[]>([]);
//   const pathname = usePathname();
//   const studyId = pathname.split("/")[2];

//   // TODO remove conditional
//   // see: https://stackoverflow.com/questions/57620799/react-hook-useeffect-is-called-conditionally
//   // TODO explain this a little
//   const fetchStudiesQuery = useQuery({
//     queryKey: ["get-studies", userTokenPromise],
//     queryFn: () =>
//       userTokenPromise
//         ? userTokenPromise.then((token) => fetchUserStudies(token))
//         : Promise.reject("No token"),
//     enabled: !!userTokenPromise, // This will ensure the query does not run until the token is available
//   });

//   useEffect(() => {
//     if (fetchStudiesQuery.data) {
//       setStudies(fetchStudiesQuery.data.studies);
//     }
//   }, [fetchStudiesQuery.data]);

//   if (fetchStudiesQuery.isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (fetchStudiesQuery.isError) {
//     return <div>Error: {fetchStudiesQuery.error.message}</div>;
//   }

//   return (
//     <div className="left-sidebar-container h-screen bg-symbiont-foreground m-2 rounded-2xl ">
//       <div
//         className="mt-10 logo flex flex-col items-center"
//         style={{ borderBottom: "2px solid #292927" }}
//       >
//         <p className="text-xs uppercase font-semibold  tracking-widest">
//           Symbiont
//         </p>
//       </div>
//       <div
//         className="navigation flex"
//         style={{ borderBottom: "2px solid #292927" }}
//       >
//         <div className="flex flex-col p-6">
//           <NavItem icon={faHouse} text="Home" iconColor="#46CDAF" />
//           <NavItem icon={faBook} text="Library" iconColor="#363A3D" />
//         </div>
//       </div>

//       <div className="projects-list border-symbiont-800">
//         <h3 className="text-xs text-symbiont-textUnSelected uppercase m-4">
//           Projects
//         </h3>
//         {studies.map((study) => (
//           <Link
//             href={`studies/${study.id}`}
//             key={study.id}
//             className="flex flex-col items-start p-4 cursor-pointer bg-symbiont-foreground hover:bg-symbiont-800 rounded-2xl m-2"
//           >
//             {study.id?.toString() === studyId ? (
//               <div>
//                 <p className="text-xs ml-2 capitalize">{study.name}</p>
//                 <div
//                   className="h-2 w-full selected-gradient rounded-full"
//                   style={{ margin: "5px" }}
//                 ></div>
//               </div>
//             ) : (
//               <p className="text-xs ml-2 capitalize">{study.name}</p>
//             )}
//           </Link>
//         ))}
//       </div>
//       <div className="settings p-2 flex flex-col justify-end">
//         <OverLayGradient />
//       </div>
//     </div>
//   );
// };

// export default LeftSideBarMain;

import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Image from "next/image";
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {["Home", "Library"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {index % 2 === 0 ? <HomeIcon /> : <LibraryBooksIcon />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Chrome Extension", "Discord", "Settings"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {index % 2 === 0 ? (
                    <Image
                      src="https://www.svgrepo.com/show/475640/chrome-color.svg"
                      width={24}
                      height={24}
                      alt="chrome"
                    />
                  ) : (
                    <Image
                      src="https://www.svgrepo.com/show/353655/discord-icon.svg"
                      width={24}
                      height={24}
                      alt="discord"
                    />
                  )}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
          {/* TODO add LLM Settings */}
        </List>
      </Drawer>
    </Box>
  );
}
