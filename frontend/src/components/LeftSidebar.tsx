import Link from "next/link";
import { Button } from "@mui/material";
import { PlusCircle } from "lucide-react";

const ChatSidebar = () => {
  return (
    <div className="flex-none max-w-xs">
      <div className="w-full h-screen p-4 text-gray-200 bg-symbiont-background">
        <Link href="/">
          <Button variant="contained">
            <PlusCircle className="mr-2 w-4 h-4" />
            Create a new chat
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ChatSidebar;
