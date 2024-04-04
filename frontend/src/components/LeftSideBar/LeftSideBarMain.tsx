import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Image from "next/image";
import Link from "next/link";
import LLMSettings from "../Settings/LLMSettings";

// TODO separate the Drawer component into its own file

const drawerWidth = 150;

function openedMixin(theme: Theme): CSSObject {
  return {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  };
}

function closedMixin(theme: Theme): CSSObject {
  return {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  };
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
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

const LeftSideBar = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  function handleSettingsOpen() {
    setSettingsOpen(true);
  }

  function handleSettingsClose() {
    setSettingsOpen(false);
  }

  if (settingsOpen) {
    return (
      <LLMSettings
        settingsOpen={settingsOpen}
        handleSettingsClose={handleSettingsClose}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CssBaseline />

      <Drawer variant="permanent" open={drawerOpen}>
        <DrawerHeader>
          {drawerOpen ? (
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: "4px",
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />
        <List>
          {["Home", "Library"].map((text, index) => (
            <Link key={text} href={index % 2 === 0 ? "/" : "/library"} passHref>
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: drawerOpen ? "initial" : "center",
                    px: 2,
                    "& .MuiListItemText-primary": {
                      fontSize: "0.85rem", // Update font size of the text in the list item
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 3 : "auto",
                      justifyContent: "center",
                      "& svg": {
                        width: 20,
                        height: 20,
                      },
                    }}
                  >
                    {index % 2 === 0 ? <HomeIcon /> : <LibraryBooksIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{ opacity: drawerOpen ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {["Extension", "Discord"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? "initial" : "center",
                  px: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {text === "Extension" && (
                    <Image
                      src="https://www.svgrepo.com/show/475640/chrome-color.svg"
                      width={20}
                      height={20}
                      alt="chrome"
                    />
                  )}
                  {text === "Discord" && (
                    <Image
                      src="https://www.svgrepo.com/show/353655/discord-icon.svg"
                      width={20}
                      height={20}
                      alt="discord"
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{
                    opacity: drawerOpen ? 1 : 0,

                    "& .MuiListItemText-primary": {
                      fontSize: "0.75rem", // Updated font size
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />

        <List>
          {["Settings"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? "initial" : "center",
                  px: 2,
                  "& .MuiListItemText-primary": {
                    fontSize: "0.75rem", // Updated font size
                  },
                }}
                onClick={handleSettingsOpen}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {text === "Settings" && (
                    <Image
                      src="https://www.svgrepo.com/show/491639/gear.svg"
                      width={20}
                      height={20}
                      alt="settings"
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{ opacity: drawerOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default LeftSideBar;
