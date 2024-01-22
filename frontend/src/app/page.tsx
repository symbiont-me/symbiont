import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
export default function Home() {
  const {  userId } = auth();
  console.log("userId", userId);
  if (userId) {
    console.log("signed in");
  }
  const isSignedIn = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">
              Mistah Kurtz - he dead.
            </h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isSignedIn && <Button>Go to Chats</Button>}
          </div>
          <div className="w-full mt-4">
            {" "}
            {isSignedIn ? (
              <h1>File Upload</h1>
            ) : (
              <Link href="/sign-in">
                <Button>
                  {" "}
                  Login to get started
                  <LogIn className="w-4 h-4 ml-2 " />
                </Button>
              </Link>
            )}
          </div>
          {isSignedIn && <FileUpload />}
        </div>
      </div>
    </div>
  );
}
