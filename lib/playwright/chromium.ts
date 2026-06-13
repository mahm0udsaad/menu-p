import serverlessChromium from "@sparticuz/chromium"

const isServerlessRuntime = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV
)

export async function getChromiumExecutablePath(): Promise<string | undefined> {
  const configuredPath =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    process.env.POSTER_CHROMIUM_PATH ||
    process.env.CHROMIUM_PATH

  if (configuredPath) return configuredPath
  if (!isServerlessRuntime) return undefined

  return serverlessChromium.executablePath()
}

export function getChromiumArgs(args: string[]): string[] {
  if (!isServerlessRuntime) return args
  return Array.from(new Set([...serverlessChromium.args, ...args]))
}
