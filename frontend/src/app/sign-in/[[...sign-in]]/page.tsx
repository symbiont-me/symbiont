import {SignIn} from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">

          <div className="w-full mt-4">
            <SignIn path="/sign-in" routing="path" />
          </div>
        </div>
      </div>
    </div>
  );
}
