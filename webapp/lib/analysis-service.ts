export interface AudioAnalysis {
  sample_rate: number;
  duration_sec: number;
  energy_rms: number[];
  spectrogram_db: number[][];
  mfcc_mean: number[];
  tempo_bpm: number;
  beat_times: number[];
  segments_sec: number[];
  spectral_centroid: number[];
}

export interface AnalysisError {
  error: string;
}

export class AnalysisService {
  private static readonly API_BASE_URL = "http://localhost:3001";

  static async analyzeAudio(file: File): Promise<AudioAnalysis> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${this.API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData: AnalysisError = await response.json();
        throw new Error(`Analysis failed: ${errorData.error}`);
      }

      const analysis: AudioAnalysis = await response.json();
      console.log(analysis.beat_times, analysis.segments_sec);
      return analysis;
    } catch (error) {
      console.error("Audio analysis error:", error);
      throw new Error(
        `Failed to analyze audio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async isServerAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/analyze`, {
        method: "OPTIONS",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
