# Playlist Tracker: The Ultimate To-Do App for Learners

Transform video playlists from YouTube or your local files into interactive and trackable to-do lists. This isn't just a to-do app; it's a comprehensive platform to manage your learning, track your progress, and stay motivated with gamified features.

## Key Features

### Effortless Playlist Management
- **YouTube Playlist Import**: Instantly convert any YouTube playlist into a trackable task list. The app automatically fetches all videos, calculates the total duration, and sets up a progress bar.
- **Manual Playlists**: Create your own custom playlists from scratch. Add tasks with or without YouTube links, complete with titles and estimated durations.
- **Local Course Tracking**: Import courses directly from your computer. A simple desktop app scans your local video files, generates a JSON file, and you can upload it to create a new playlist.
- **Bulk Actions**: Select multiple playlists to reset progress, mark all as complete, or delete them with a single click.
- **Interactive Playlist View**: Each playlist displays its name, progress bar, total duration, and video completion count. Expand any playlist to see a detailed list of videos with thumbnails, durations, and individual checkboxes. Click a thumbnail to open the video in an embedded player.

### Advanced Organization & Search
- **Tags & Filtering**: Organize your playlists with default or custom tags (e.g., "Music," "Computer," "Beginner").
- **Debounced Search**: Find any playlist or video instantly with a fast, debounced search bar. Refine your search with powerful filters for completion status, duration, or creation date.

### Analytics & Gamification
- **Personal Analytics**: A dedicated dashboard visualizes your learning habits. Track total time spent vs. total time available, overall completion percentage, number of completed playlists, and a breakdown by category.
- **Daily Streaks**: Stay consistent and watch your learning streak grow for each day you complete a video.
- **Learning Goals**: Set custom weekly or monthly goals with specific target hours to stay focused and accountable.
- **Achievements**: Unlock badges for milestones like completing your first video ("First Steps"), finishing a whole playlist ("Playlist Pioneer"), maintaining streaks, and hitting learning time targets.

### Social & Community Features
- **Public/Private Profiles**: Your profile at `/profile/[username]` showcases your stats, including total playlists, completion data, current streak, and recent achievements. You can change your username and set your profile to private.
- **Friends System**: Connect with other learners by searching for users and sending friend requests.
- **Leaderboards**: Compete with others and see where you rank! View weekly, monthly, and all-time leaderboards based on points earned.

## Project Todos

### Core Functionality & UI/UX
- [x] **In-App Video Playback**: Allow users to watch videos directly within the app through an embedded player.

### Community & Content Discovery
- [x] **Custom Playlist Creation**: Users can create their own manual playlists with custom videos and tasks.
- [ ] **Public Playlist Sharing**: Implement a feature for users to publish their custom playlists for the community to discover.
- [ ] **Community Feedback System**: For public playlists, add:
    - [ ] An upvote and downvote system to rank community content.
    - [ ] A review and comment section for user feedback and discussion.
- [ ] **Curated Learning Paths**: Introduce a section of officially curated, skill-based playlists for users who are unsure where to start.
- [ ] **Homepage Playlist Showcase**: Feature top-rated and trending playlists on the homepage to improve content discovery.

### Collaborative & Social Features
- [ ] **Learning Partner System**:
    - [ ] **Automatic Partner Matching**: Develop an algorithm to automatically pair users based on intersecting goals, categories, and desired completion timelines.
    - [ ] **Shared Goal Timer**: Allow partners to mutually agree on a timer for completing a shared playlist or goal.
    - [ ] **Gamified Partner Rewards**: Award points and leaderboard rankings to partners who successfully complete their goals within the established time.
    - [ ] **Partner Chat**: Integrate a private chat system for partners to communicate and collaborate.
