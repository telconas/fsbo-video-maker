import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Video className="text-primary text-2xl" />
          <h1 className="font-semibold text-xl sm:text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            FSBO Video Maker
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Contact Support
          </Button>
        </div>
      </div>
    </header>
  );
}
