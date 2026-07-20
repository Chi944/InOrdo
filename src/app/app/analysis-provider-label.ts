const maximumRecordedModelLength = 120;
const safeRecordedModelPattern = /^[A-Za-z0-9][A-Za-z0-9._:/+-]*$/;
const knownRecordingModelPattern =
  /^gpt-5\.6-luna(?:-[0-9]{4}-[0-9]{2}-[0-9]{2})?$/;

export function analysisProviderLabel(modelName: string): string {
  if (knownRecordingModelPattern.test(modelName)) {
    return "OpenAI · GPT-5.6";
  }
  if (modelName === "openai/gpt-oss-20b") {
    return "Vercel AI Gateway · GPT-OSS 20B";
  }
  if (
    modelName.length > 0 &&
    modelName.length <= maximumRecordedModelLength &&
    safeRecordedModelPattern.test(modelName)
  ) {
    return `Recorded model · ${modelName}`;
  }
  return "Recorded model";
}
