import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90 transition-all text-sm",
            card: "shadow-xl border border-gray-100 rounded-2xl"
          }
        }}
      />
    </div>
  );
}
