from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "Nessun file audio fornito"}), 400

    file = request.files["file"]

    # Salva il file in una cartella temporanea
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        file.save(tmp.name)
        filepath = tmp.name

    try:
        # Carica il file audio
        y, sr = librosa.load(filepath, sr=None)

        # --- Estrazione feature ---
        # 1. Energia RMS
        rms = librosa.feature.rms(y=y)[0].tolist()

        # 2. Spettrogramma (convertito in dB)
        S = np.abs(librosa.stft(y))
        S_db = librosa.amplitude_to_db(S, ref=np.max)
        spectrogram = S_db.tolist()

        # 3. MFCC (Mel-Frequency Cepstral Coefficients)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = mfcc.mean(axis=1).tolist()

        # 4. Beat tracking (BPM)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beats, sr=sr).tolist()

        # 5. Segmentazione (Novelty-based segmentation)
        # Chromagram + onset strength + segmentation
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        boundaries = librosa.segment.agglomerative(chroma.T, k=4)
        bound_times = librosa.frames_to_time(boundaries, sr=sr).tolist()

        # 6. Centroide spettrale (per "luminosità" del suono)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0].tolist()

        # 7. Waveform data for visualization
        # Downsample the audio for waveform visualization (max 1000 points)
        target_length = 1000
        if len(y) > target_length:
            # Downsample by taking every nth sample
            step = len(y) // target_length
            waveform_data = np.abs(y[::step]).tolist()
        else:
            waveform_data = np.abs(y).tolist()

        # Ensure we have exactly target_length points
        if len(waveform_data) < target_length:
            # Interpolate to reach target length
            from scipy import interpolate
            x_old = np.linspace(0, 1, len(waveform_data))
            x_new = np.linspace(0, 1, target_length)
            f = interpolate.interp1d(x_old, waveform_data, kind='linear')
            waveform_data = f(x_new).tolist()
        elif len(waveform_data) > target_length:
            waveform_data = waveform_data[:target_length]

        result = {
            "sample_rate": sr,
            "duration_sec": librosa.get_duration(y=y, sr=sr),
            "energy_rms": rms,
            "spectrogram_db": spectrogram,
            "mfcc_mean": mfcc_mean,
            "tempo_bpm": float(tempo),
            "beat_times": beat_times,
            "segments_sec": bound_times,
            "spectral_centroid": spectral_centroid,
            "waveform_data": waveform_data
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        os.remove(filepath)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001)
