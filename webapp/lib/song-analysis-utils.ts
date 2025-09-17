import type { AudioAnalysis, SongSection, ToneAttributes } from "@/types/music";

export function generateSectionsFromAnalysis(
  analysis: AudioAnalysis,
  songId: string
): SongSection[] {
  const sections: SongSection[] = [];

  // Use segments_sec to create sections
  const segmentTimes = analysis.segments_sec;

  for (let i = 0; i < segmentTimes.length - 1; i++) {
    const startTime = segmentTimes[i];
    const endTime = segmentTimes[i + 1];
    const duration = endTime - startTime;

    // Determine section type based on position and duration
    const sectionType = determineSectionType(
      i,
      segmentTimes.length,
      duration,
      analysis
    );

    // Calculate tone attributes based on analysis data
    const toneAttributes = calculateToneAttributes(
      analysis,
      startTime,
      endTime,
      i,
      segmentTimes.length
    );

    const section: SongSection = {
      id: `${songId}-section-${i}`,
      songId,
      type: sectionType,
      startTime,
      endTime,
      duration,
      toneAttributes,
    };

    sections.push(section);
  }

  return sections;
}

function determineSectionType(
  index: number,
  totalSegments: number,
  duration: number,
  analysis: AudioAnalysis
): SongSection["type"] {
  // First segment is usually intro
  if (index === 0) return "intro";

  // Last segment is usually outro
  // With the backend change, we now have totalSegments boundaries (including song end)
  // and create totalSegments - 1 sections, so the last section is at index totalSegments - 2
  if (index === totalSegments - 2) return "outro";

  // Middle segments - determine based on energy and duration
  const avgEnergy = calculateAverageEnergy(analysis, index);
  const avgDuration = analysis.duration_sec / totalSegments;

  // High energy and longer duration suggests chorus
  if (avgEnergy > 0.3 && duration > avgDuration * 1.2) {
    return "chorus";
  }

  // Very high energy suggests breakdown
  if (avgEnergy > 0.5) {
    return "breakdown";
  }

  // Medium energy suggests verse
  if (avgEnergy > 0.15) {
    return "verse";
  }

  // Low energy suggests bridge or instrumental
  if (duration < avgDuration * 0.8) {
    return "bridge";
  }

  return "instrumental";
}

function calculateToneAttributes(
  analysis: AudioAnalysis,
  startTime: number,
  endTime: number,
  index: number,
  totalSegments: number
): ToneAttributes {
  // Calculate energy for this segment
  const energy = calculateAverageEnergy(analysis, index);

  // Calculate intensity based on energy and spectral centroid
  const intensity = Math.min(100, energy * 200);

  // Determine mood based on tempo and spectral characteristics
  const mood = determineMood(analysis, energy);

  // Determine if it's building up or slowing down
  const buildingUp = index < totalSegments / 2;
  const slowingDown = index > totalSegments * 0.7;

  // Strong start if it's the beginning or has high energy
  const strongStart = index === 0 || energy > 0.4;

  return {
    energy: Math.round(energy * 100),
    strongStart,
    buildingUp,
    slowingDown,
    intensity: Math.round(intensity),
    mood,
  };
}

function calculateAverageEnergy(
  analysis: AudioAnalysis,
  segmentIndex: number
): number {
  // This is a simplified calculation - in a real implementation,
  // you'd want to map the segment time to the RMS energy array
  const segmentCount = analysis.segments_sec.length - 1;
  const energyPerSegment = analysis.energy_rms.length / segmentCount;

  const startIdx = Math.floor(segmentIndex * energyPerSegment);
  const endIdx = Math.floor((segmentIndex + 1) * energyPerSegment);

  const segmentEnergies = analysis.energy_rms.slice(startIdx, endIdx);
  return (
    segmentEnergies.reduce((sum, energy) => sum + energy, 0) /
    segmentEnergies.length
  );
}

function determineMood(
  analysis: AudioAnalysis,
  energy: number
): ToneAttributes["mood"] {
  const tempo = analysis.tempo_bpm;

  // High tempo and high energy = energetic
  if (tempo > 120 && energy > 0.3) {
    return "energetic";
  }

  // Low tempo and low energy = calm
  if (tempo < 80 && energy < 0.2) {
    return "calm";
  }

  // Medium tempo with high energy = uplifting
  if (tempo >= 100 && tempo <= 140 && energy > 0.25) {
    return "uplifting";
  }

  // Very low tempo = melancholic
  if (tempo < 70) {
    return "melancholic";
  }

  // High tempo with dramatic changes = dramatic
  if (tempo > 140) {
    return "dramatic";
  }

  return "uplifting"; // default
}
