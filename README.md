# 📼 Local Video Course Parser

A lightweight tool to scan any directory for video files (`.mp4`, `.mkv`, etc.) and generate a structured JSON file — ideal for tracking your progress in downloaded courses or local video playlists.

---

## ✨ Features

- Detects `.mp4`, `.mkv`, `.avi`, and more
- Outputs `parsed_videos.json` in the selected folder
- Built with Python + Tkinter (runs locally)
- Comes with standalone executables for Windows and Mac
- 100% offline — no data collection

---

## 🔍 How to Use

1. Run the app (may require security permission on Mac).
2. Choose a folder containing your video files.
3. A `parsed_videos.json` file will be created with all video filenames.

---

## 🔓 Transparency & Source Code

Worried about running binaries? We get it.

This project is fully open-source. You can inspect or run the script manually:

## 🛠️ Build It Yourself

Want to build the binary from source? Here's how:

### 🧰 Prerequisites
- Python 3.x
- pyinstaller (Install using: pip install pyinstaller)

### 🪟 For Windows

```bash
pyinstaller --noconsole --onefile --name "PlaylistGenerator" --add-binary "binaries/win/ffprobe.exe;./binaries/win" playlist_generator_gui.py
```

### 🍎 For macOS

```bash
pyinstaller --windowed --onefile --name "PlaylistGenerator" --add-binary "binaries/mac/ffprobe:./binaries/mac" playlist_generator_gui.py
```

Make sure ffprobe is placed in the correct path as mentioned above before running the command.
