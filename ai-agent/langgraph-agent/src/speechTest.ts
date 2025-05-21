import { SpeechConfig, AudioConfig, SpeechRecognizer, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

const speechKey = process.env.SPEECH_KEY!;
const serviceRegion = process.env.SERVICE_REGION!;

// STT - Speech to Text
async function recognizeSpeech(): Promise<string> {
  const speechConfig = SpeechConfig.fromSubscription(speechKey, serviceRegion);
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          reject(new Error("Speech not recognized."));
        }
      },
      (err) => reject(err)
    );
  });
}

// TTS - Text to Speech
async function speakText(text: string) {
  const speechConfig = SpeechConfig.fromSubscription(speechKey, serviceRegion);
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; // Pick a cool voice!

  const synthesizer = new SpeechSynthesizer(speechConfig);
  return new Promise<void>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          console.log("🎧 Speech synthesized!");
          resolve();
        } else {
          reject(new Error("Speech synthesis failed."));
        }
      },
      (err) => reject(err)
    );
  });
}
