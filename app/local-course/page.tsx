// app/local-course/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useToast } from "@/components/Toast"; // Corrected import path
import {
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

export default function LocalCoursePage() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { createPlaylist } = usePlaylists();
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the JSON structure
      if (!data.name || !Array.isArray(data.videos) || !data.totalDuration) {
        throw new Error("Invalid playlist.json format. Please regenerate the file.");
      }

      // Use the createPlaylist function from your hook
      await createPlaylist({
        name: data.name,
        description: `${data.videos.length} local videos from file.`,
        playlistUrl: "local-json", // Identifier for this type of playlist
        videos: data.videos,
        thumbnailUrl: "",
        totalDuration: data.totalDuration,
        totalVideos: data.totalVideos,
        completedDuration: 0,
        // You can add default categories/tags here if needed
        categories: [],
        tags: [],
      });

      showToast("Local course added successfully!", "success");
      // Redirect back to the home page after success
      router.push("/");

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to process JSON file.";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-8">
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back to All Playlists</span>
        </Link>
      
      <div className="text-center mb-12">
        <ComputerDesktopIcon className="w-16 h-16 mx-auto text-purple-400 mb-4" />
        <h1 className="text-4xl font-bold text-neutral-100">Track a Local Course</h1>
        <p className="text-lg text-neutral-400 mt-2">
          Use our generator to create a `playlist.json` from your video files, then upload it here.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Step 1: Download Generator */}
        <div className="glass-panel p-8 flex flex-col">
          <div className="mb-4">
            <span className="text-sm font-semibold bg-blue-500/20 text-blue-300 py-1 px-3 rounded-full">Step 1</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-200 mb-2">Generate the Playlist File</h2>
          <p className="text-neutral-400 mb-6 flex-grow">
            If you haven't already, download our simple tool. Run it, enter your course folder to instantly create the `playlist.json` file.
          </p>
          <div className="space-y-4">
            <a 
              href="https://github.com/imankush10/achievo/releases/download/tool-v1.0.0/PlaylistGenerator_Windows.exe"
              download
              className="w-full flex items-center justify-center gap-3 bg-neutral-700 hover:bg-neutral-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
            >
              Download for Windows (.exe)
            </a>
            <a 
              href="https://github.com/imankush10/achievo/releases/download/tool-v1.0.0/playlistgenerator_mac.app.zip"
              download
              className="w-full flex items-center justify-center gap-3 bg-neutral-700 hover:bg-neutral-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
            >
              Download for macOS (.zip)
            </a>
            <div className="text-center pt-2">
              <a 
                href="https://github.com/imankush10/achievo/tree/video-parser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 hover:text-neutral-300 underline transition-colors duration-200"
              >
                Don't trust? It's open source - check the code
              </a>
            </div>
          </div>
        </div>

        {/* Step 2: Upload JSON */}
        <div className="glass-panel p-8 flex flex-col">
          <div className="mb-4">
            <span className="text-sm font-semibold bg-purple-500/20 text-purple-300 py-1 px-3 rounded-full">Step 2</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-200 mb-2">Upload `playlist.json`</h2>
          <p className="text-neutral-400 mb-6 flex-grow">
            Once you have the file, click the button below to select it and add your course.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white py-4 px-6 rounded-xl font-semibold disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className="w-6 h-6"/>
                <span>Upload playlist.json File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
