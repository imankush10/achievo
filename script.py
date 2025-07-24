import os
import subprocess
import json
import re
import sys
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext


# --- FFPROBE/FFMPEG PATH CONFIGURATION ---
def get_ffmpeg_path(executable_name):
    """
    Determines the path to ffprobe.
    If the script is running as a bundled executable (created by PyInstaller),
    it looks for the executable in a subdirectory based on the OS.
    Otherwise, it assumes it's in the system's PATH for development.
    """
    if getattr(sys, 'frozen', False):
        # Running in a bundle (e.g., from PyInstaller)
        base_path = sys._MEIPASS
        
        # Determine subdirectory based on OS
        if sys.platform == 'win32':
            platform_dir = 'win'
        elif sys.platform == 'darwin': # darwin is the name for macOS
            platform_dir = 'mac'
        else:
            # Fallback for other systems (e.g., Linux), though not explicitly requested
            platform_dir = ''

        # Construct the full path to the bundled executable
        exe_path = os.path.join(base_path, 'binaries', platform_dir, executable_name)
        
        # On macOS/Linux, ensure the binary is executable
        if sys.platform != 'win32' and not os.access(exe_path, os.X_OK):
             os.chmod(exe_path, 0o755)

        return exe_path
        
    # Running as a normal script, assume ffprobe is in PATH
    return executable_name


# Determine the correct executable name based on OS
FFPROBE_EXECUTABLE = 'ffprobe.exe' if sys.platform == 'win32' else 'ffprobe'
FFPROBE_PATH = get_ffmpeg_path(FFPROBE_EXECUTABLE)


# --- CORE LOGIC ---
def get_video_metadata(filepath):
    try:
        command = [
            FFPROBE_PATH,
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            filepath
        ]
        # Hide console window on Windows when running subprocess
        creation_flags = subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            check=True, 
            creationflags=creation_flags,
            encoding='utf-8' # Explicitly set encoding
        )
        metadata = json.loads(result.stdout)
        duration_seconds = float(metadata['format']['duration'])
        title = os.path.splitext(os.path.basename(filepath))[0]
        
        return {
            'id': f"{title}-{os.path.getmtime(filepath)}",
            'title': title,
            'durationInSeconds': round(duration_seconds),
            'completed': False, 'thumbnailUrl': '', 'videoUrl': '#'
        }
    except FileNotFoundError:
        # This error is critical and means ffprobe was not found
        messagebox.showerror(
            "Fatal Error",
            f"ffprobe executable not found!\n\nThe application cannot function without it. "
            f"Expected at path: {FFPROBE_PATH}"
        )
        # Exit the app if ffprobe is missing
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        # ffprobe ran but returned an error (e.g., corrupted video file)
        return f"Error processing {os.path.basename(filepath)}: ffprobe failed. stderr: {e.stderr}"
    except Exception as e:
        return f"An unexpected error occurred with {os.path.basename(filepath)}: {e}"


# --- GUI APPLICATION CLASS (Your existing class, no changes needed) ---
class PlaylistGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Local Course Playlist Generator")
        self.root.geometry("600x450")
        self.root.configure(bg='#2E2E2E')

        self.folder_path = tk.StringVar()

        # --- UI ELEMENTS ---
        main_frame = tk.Frame(root, padx=20, pady=20, bg='#2E2E2E')
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Folder Selection
        tk.Label(main_frame, text="1. Select your course video folder:", fg="white", bg='#2E2E2E', font=("Helvetica", 12)).pack(anchor='w')
        
        folder_frame = tk.Frame(main_frame, bg='#2E2E2E')
        folder_frame.pack(fill=tk.X, pady=5)
        
        entry = tk.Entry(folder_frame, textvariable=self.folder_path, state='readonly', width=60, bg='#4A4A4A', fg='white', relief=tk.FLAT)
        entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=5)
        
        browse_btn = tk.Button(folder_frame, text="Browse...", command=self.select_folder, bg='#4A90E2', fg='white', relief=tk.FLAT, padx=10)
        browse_btn.pack(side=tk.LEFT, padx=(5, 0))

        # Generate Button
        tk.Label(main_frame, text="2. Generate the playlist file:", fg="white", bg='#2E2E2E', font=("Helvetica", 12)).pack(anchor='w', pady=(15, 0))
        generate_btn = tk.Button(main_frame, text="Generate playlist.json", command=self.generate_playlist, bg='#50E3C2', fg='black', font=("Helvetica", 12, "bold"), relief=tk.FLAT, pady=10)
        generate_btn.pack(fill=tk.X, pady=5)
        
        # Status/Log Area
        self.log_area = scrolledtext.ScrolledText(main_frame, height=10, bg='#1C1C1C', fg='#CCCCCC', relief=tk.FLAT, state='disabled')
        self.log_area.pack(fill=tk.BOTH, expand=True, pady=(15, 0))
        self.log_message("Welcome! Select a folder and click generate.")


    def log_message(self, message):
        self.log_area.config(state='normal')
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.config(state='disabled')
        self.log_area.see(tk.END)


    def select_folder(self):
        path = filedialog.askdirectory(title="Select Video Folder")
        if path:
            self.folder_path.set(path)
            self.log_message(f"Selected folder: {path}")


    def generate_playlist(self):
        directory = self.folder_path.get()
        if not directory:
            messagebox.showerror("Error", "Please select a folder first.")
            return

        video_extensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.ts']
        video_files = [f for f in os.listdir(directory) if os.path.splitext(f)[1].lower() in video_extensions]
        
        if not video_files:
            self.log_message("No video files found in the selected directory.")
            messagebox.showinfo("No Videos", "No video files found in the selected directory.")
            return
        
        # Natural sort for file names like '2' before '10'
        video_files.sort(key=lambda f: [int(t) if t.isdigit() else t.lower() for t in re.split('([0-9]+)', f)])
        
        self.log_message(f"Found {len(video_files)} video files. Processing...")
        self.root.update_idletasks() # Refresh UI

        playlist_videos = []
        for filename in video_files:
            filepath = os.path.join(directory, filename)
            metadata = get_video_metadata(filepath)
            if isinstance(metadata, dict):
                playlist_videos.append(metadata)
                self.log_message(f"  ✓ Processed: {filename}")
            else:
                self.log_message(f"  ✗ {metadata}") # Log error message
            self.root.update_idletasks()

        # Only proceed if we have successfully processed videos
        if not playlist_videos:
            self.log_message("\nProcessing failed for all videos. No playlist generated.")
            messagebox.showerror("Error", "Could not process any of the video files. Please check the log for details.")
            return

        playlist_name = os.path.basename(os.path.normpath(directory))
        playlist_data = {
            'name': playlist_name,
            'videos': playlist_videos,
            'totalDuration': sum(v['durationInSeconds'] for v in playlist_videos),
            'totalVideos': len(playlist_videos),
        }

        output_path = os.path.join(directory, 'playlist.json')
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(playlist_data, f, indent=2)
            self.log_message(f"\nSUCCESS! 'playlist.json' saved in the course folder.")
            messagebox.showinfo("Success", f"playlist.json has been created in:\n{directory}")
        except Exception as e:
            self.log_message(f"\nERROR: Failed to save file. {e}")
            messagebox.showerror("Error", f"Could not save the playlist file.\n{e}")


if __name__ == '__main__':
    # Check for ffprobe existence at startup
    if not os.path.exists(FFPROBE_PATH) and not getattr(sys, 'frozen', False):
         messagebox.showwarning("Developer Warning", "ffprobe not found in PATH. The bundled app will still work if configured correctly.")

    root = tk.Tk()
    app = PlaylistGeneratorApp(root)
    root.mainloop()

