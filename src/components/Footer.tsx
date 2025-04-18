import { Video } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Video className="text-white text-xl" />
              <h2 className="font-semibold text-xl bg-gradient-to-r from-primary/90 to-blue-500 bg-clip-text text-transparent">
                FSBOVideoMaker
              </h2>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Create professional For Sale By Owner videos in minutes
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-300 hover:text-white transition">
              Help
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition">
              Privacy
            </a>
            <Link
              href="/terms"
              className="text-slate-300 hover:text-white transition"
            >
              Terms
            </Link>
            <a href="#" className="text-slate-300 hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} FSBOVideoMaker. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
