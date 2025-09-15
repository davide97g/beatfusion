import type { Song, SongSection, Mix } from "@/types/music"

// Demo songs with hosted URLs (using placeholder audio for demo)
export const demoSongs: Song[] = [
  {
    id: "1",
    title: "Electric Dreams",
    artist: "Synthwave Artist",
    duration: 240, // 4 minutes
    url: "/placeholder.mp3?duration=240&genre=synthwave",
    waveformData: generateWaveformData(240),
  },
  {
    id: "2",
    title: "Midnight Journey",
    artist: "Ambient Collective",
    duration: 300, // 5 minutes
    url: "/placeholder.mp3?duration=300&genre=ambient",
    waveformData: generateWaveformData(300),
  },
  {
    id: "3",
    title: "Urban Pulse",
    artist: "Electronic Beats",
    duration: 210, // 3.5 minutes
    url: "/placeholder.mp3?duration=210&genre=electronic",
    waveformData: generateWaveformData(210),
  },
]

// Generate mock waveform data
function generateWaveformData(duration: number): number[] {
  const samples = Math.floor(duration * 10) // 10 samples per second
  return Array.from({ length: samples }, () => Math.random() * 100)
}

// Demo song sections with analysis
export const demoSections: Record<string, SongSection[]> = {
  "1": [
    {
      id: "s1-1",
      songId: "1",
      type: "intro",
      startTime: 0,
      endTime: 30,
      duration: 30,
      toneAttributes: {
        energy: 40,
        strongStart: true,
        buildingUp: true,
        slowingDown: false,
        intensity: 50,
        mood: "uplifting",
      },
    },
    {
      id: "s1-2",
      songId: "1",
      type: "verse",
      startTime: 30,
      endTime: 90,
      duration: 60,
      toneAttributes: {
        energy: 60,
        strongStart: false,
        buildingUp: false,
        slowingDown: false,
        intensity: 65,
        mood: "energetic",
      },
    },
    {
      id: "s1-3",
      songId: "1",
      type: "chorus",
      startTime: 90,
      endTime: 150,
      duration: 60,
      toneAttributes: {
        energy: 85,
        strongStart: true,
        buildingUp: false,
        slowingDown: false,
        intensity: 90,
        mood: "uplifting",
      },
    },
    {
      id: "s1-4",
      songId: "1",
      type: "bridge",
      startTime: 150,
      endTime: 180,
      duration: 30,
      toneAttributes: {
        energy: 30,
        strongStart: false,
        buildingUp: true,
        slowingDown: false,
        intensity: 40,
        mood: "dramatic",
      },
    },
    {
      id: "s1-5",
      songId: "1",
      type: "outro",
      startTime: 180,
      endTime: 240,
      duration: 60,
      toneAttributes: {
        energy: 20,
        strongStart: false,
        buildingUp: false,
        slowingDown: true,
        intensity: 25,
        mood: "calm",
      },
    },
  ],
  "2": [
    {
      id: "s2-1",
      songId: "2",
      type: "intro",
      startTime: 0,
      endTime: 45,
      duration: 45,
      toneAttributes: {
        energy: 25,
        strongStart: false,
        buildingUp: true,
        slowingDown: false,
        intensity: 30,
        mood: "calm",
      },
    },
    {
      id: "s2-2",
      songId: "2",
      type: "verse",
      startTime: 45,
      endTime: 120,
      duration: 75,
      toneAttributes: {
        energy: 45,
        strongStart: false,
        buildingUp: false,
        slowingDown: false,
        intensity: 50,
        mood: "melancholic",
      },
    },
    {
      id: "s2-3",
      songId: "2",
      type: "instrumental",
      startTime: 120,
      endTime: 200,
      duration: 80,
      toneAttributes: {
        energy: 60,
        strongStart: false,
        buildingUp: true,
        slowingDown: false,
        intensity: 70,
        mood: "uplifting",
      },
    },
    {
      id: "s2-4",
      songId: "2",
      type: "outro",
      startTime: 200,
      endTime: 300,
      duration: 100,
      toneAttributes: {
        energy: 15,
        strongStart: false,
        buildingUp: false,
        slowingDown: true,
        intensity: 20,
        mood: "calm",
      },
    },
  ],
  "3": [
    {
      id: "s3-1",
      songId: "3",
      type: "intro",
      startTime: 0,
      endTime: 20,
      duration: 20,
      toneAttributes: {
        energy: 70,
        strongStart: true,
        buildingUp: false,
        slowingDown: false,
        intensity: 75,
        mood: "energetic",
      },
    },
    {
      id: "s3-2",
      songId: "3",
      type: "verse",
      startTime: 20,
      endTime: 80,
      duration: 60,
      toneAttributes: {
        energy: 80,
        strongStart: false,
        buildingUp: false,
        slowingDown: false,
        intensity: 85,
        mood: "energetic",
      },
    },
    {
      id: "s3-3",
      songId: "3",
      type: "breakdown",
      startTime: 80,
      endTime: 120,
      duration: 40,
      toneAttributes: {
        energy: 95,
        strongStart: true,
        buildingUp: false,
        slowingDown: false,
        intensity: 100,
        mood: "dramatic",
      },
    },
    {
      id: "s3-4",
      songId: "3",
      type: "outro",
      startTime: 120,
      endTime: 210,
      duration: 90,
      toneAttributes: {
        energy: 40,
        strongStart: false,
        buildingUp: false,
        slowingDown: true,
        intensity: 45,
        mood: "calm",
      },
    },
  ],
}

// Populate songs with their sections
demoSongs.forEach((song) => {
  song.sections = demoSections[song.id] || []
})

export const demoMix: Mix = {
  id: "demo-mix-1",
  name: "Electronic Journey",
  description: "A curated mix showcasing the best sections from our demo tracks",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "mix-section-1",
      song: demoSongs[0], // Electric Dreams
      section: demoSections["1"][0], // intro
      startTime: 0,
      endTime: 30,
      customInterval: { start: 0, end: 30 },
    },
    {
      id: "mix-section-2",
      song: demoSongs[2], // Urban Pulse
      section: demoSections["3"][1], // verse
      startTime: 20,
      endTime: 80,
      customInterval: { start: 20, end: 60 }, // shortened for better flow
    },
    {
      id: "mix-section-3",
      song: demoSongs[0], // Electric Dreams
      section: demoSections["1"][2], // chorus
      startTime: 90,
      endTime: 150,
      customInterval: { start: 90, end: 150 },
    },
    {
      id: "mix-section-4",
      song: demoSongs[1], // Midnight Journey
      section: demoSections["2"][2], // instrumental
      startTime: 120,
      endTime: 200,
      customInterval: { start: 140, end: 180 }, // shortened instrumental break
    },
    {
      id: "mix-section-5",
      song: demoSongs[2], // Urban Pulse
      section: demoSections["3"][2], // breakdown
      startTime: 80,
      endTime: 120,
      customInterval: { start: 80, end: 120 },
    },
    {
      id: "mix-section-6",
      song: demoSongs[1], // Midnight Journey
      section: demoSections["2"][3], // outro
      startTime: 200,
      endTime: 300,
      customInterval: { start: 250, end: 300 }, // final 50 seconds for smooth ending
    },
  ],
  totalDuration: 30 + 40 + 60 + 40 + 40 + 50, // 260 seconds total
}
