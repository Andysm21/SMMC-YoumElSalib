# Video Assets

Add your MP4 video files here for the About page video embeds.

## Expected Files

- `event-highlights.mp4` - Main event highlights video
- `behind-scenes.mp4` - Behind-the-scenes footage

These videos will be displayed in the "Watch Highlights" section of the About page using the VideoEmbed component.

## Video Guidelines

- Format: MP4 (h.264 codec recommended)
- Resolution: 1920x1080 (Full HD) or 1280x720 (HD) recommended
- Duration: 30 seconds to 5 minutes
- File size: Keep under 50MB for optimal performance

## Integration

Videos are automatically loaded from:
- `/assets/videos/event-highlights.mp4`
- `/assets/videos/behind-scenes.mp4`

The VideoEmbed component will display:
- Play button overlay when video hasn't started
- Full controls (play, pause, volume, fullscreen)
- Responsive container that maintains aspect ratio
- Touch-friendly on mobile devices
