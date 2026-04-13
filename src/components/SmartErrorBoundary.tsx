import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_AUTO_RETRY = 1;
const ERROR_LOG_KEY = 'pt_error_log';

function logError(error: Error) {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    const logs: Array<{ msg: string; ts: string; url: string }> = raw ? JSON.parse(raw) : [];
    logs.push({
      msg: error.message?.slice(0, 200) || 'Unknown',
      ts: new Date().toISOString(),
      url: window.location.pathname,
    });
    // Keep last 20 errors
    if (logs.length > 20) logs.splice(0, logs.length - 20);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
  } catch {}
}

class SmartErrorBoundaryInner extends Component<Props & { t: (k: string, o?: any) => string }, State> {
  state: State = { hasError: false, error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    logError(error);

    // Auto-retry once for transient errors (chunk load failures)
    const isChunkError =
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkError && this.state.retryCount < MAX_AUTO_RETRY) {
      setTimeout(() => {
        this.setState(prev => ({ hasError: false, error: null, retryCount: prev.retryCount + 1 }));
      }, 1500);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-sm space-y-4">
            <div className="text-5xl">😔</div>
            <h2 className="text-lg font-bold text-foreground">
              {t('error.title', { defaultValue: 'حدث خطأ غير متوقع' })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('error.description', { defaultValue: 'لا تقلقي، بياناتك آمنة. جربي إعادة المحاولة.' })}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                {t('error.retry', { defaultValue: 'إعادة المحاولة' })}
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium"
              >
                {t('error.goHome', { defaultValue: 'الصفحة الرئيسية' })}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper to inject useTranslation
export function SmartErrorBoundary({ children, fallbackRoute }: Props) {
  const { t } = useTranslation();
  return (
    <SmartErrorBoundaryInner t={t} fallbackRoute={fallbackRoute}>
      {children}
    </SmartErrorBoundaryInner>
  );
}

export default SmartErrorBoundary;
