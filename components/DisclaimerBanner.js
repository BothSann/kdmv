import { Megaphone, MoveRight } from "lucide-react";
import Link from "next/link";

export default function DisclaimerBanner() {
  return (
    <div className="h-auto w-full bg-chart-5 text-chart-5-foreground lg:py-6 py-5 lg:px-6 px-4.5 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs lg:text-sm text-center">
          <Megaphone className="size-4 inline-block mr-1" />
          <span>
            This is not the official KDMV website. To visit the official site,
            please go to
          </span>
          <Link
            href="https://www.kdmv.io"
            className="group font-bold text-chart-5-foreground transition-all duration-300 inline-flex items-center gap-1 px-2 underline hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>kdmv.io</span>
            <MoveRight
              size={18}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            />
          </Link>
        </span>
      </div>
    </div>
  );
}
