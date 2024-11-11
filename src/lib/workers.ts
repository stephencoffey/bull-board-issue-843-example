type UpdateProgressFn = (progress: number) => Promise<void>;
type LogFn = (message: string) => Promise<void>;

const defaultLog: LogFn = async (message) => console.log(message);
const defaultProgress: UpdateProgressFn = async (progress) => console.log(`Progress: ${progress}%`);

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t * 1000));

export const exampleProcessor = async (
  jobId: string | null | undefined,
  data: any,
  log: (msg: string) => Promise<void>,
  progress: (n: number) => void
) => {
  const logger = log || defaultLog;
  const updateProgress = progress || defaultProgress;
  const id = jobId || 'unknown';
  const n = data?.n || 100

  for (let i = 0; i <= n; i++) {
    await sleep(Math.random());
    const percentage = Math.round((i / n) * 100);
    await updateProgress(percentage);
    await logger(`Processing job at interval ${i}`);

    if (Math.random() * 200 < 1) {
      throw new Error(`Random error ${i}`);
    }
  }

  return { jobId: `Example job completed: ${id}` };
} 