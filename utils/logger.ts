
export const Logger = {
  logs: [] as string[],

  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[INFO] [${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}`;
    console.log(`%c[INFO] ${message}`, 'color: blue; font-weight: bold;', data || '');
    Logger.logs.push(logEntry);
  },

  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[WARN] [${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}`;
    console.warn(`[WARN] ${message}`, data || '');
    Logger.logs.push(logEntry);
  },

  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    // Handle error objects specifically to capture stack traces or messages
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    const logEntry = `[ERROR] [${timestamp}] ${message} ${JSON.stringify(errorDetails)}`;
    console.error(`%c[ERROR] ${message}`, 'color: red; font-weight: bold;', error || '');
    Logger.logs.push(logEntry);
  },

  downloadLogs: () => {
    if (Logger.logs.length === 0) {
      alert("暂无日志可下载");
      return;
    }
    const blob = new Blob([Logger.logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `puppy_judge_debug_${new Date().getTime()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
