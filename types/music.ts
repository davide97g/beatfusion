export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  waveformData?: number[]
  sections?: SongSection[]
}

export interface SongSection {
  id: string
  songId: string
  type: SectionType
  startTime: number
  endTime: number
  duration: number
  toneAttributes: ToneAttributes
}

export type SectionType = "intro" | "verse" | "chorus" | "bridge" | "outro" | "instrumental" | "breakdown"

export interface ToneAttributes {
  energy: number // 0-100
  strongStart: boolean
  buildingUp: boolean
  slowingDown: boolean
  intensity: number // 0-100
  mood: "uplifting" | "melancholic" | "energetic" | "calm" | "dramatic"
}

export interface MixSection {
  id: string
  song: Song
  section: SongSection
  startTime: number
  endTime: number
  customInterval?: {
    start: number
    end: number
  }
}

export interface Mix {
  id: string
  name: string
  description?: string
  sections: MixSection[]
  createdAt: string
  updatedAt: string
  totalDuration?: number
}
