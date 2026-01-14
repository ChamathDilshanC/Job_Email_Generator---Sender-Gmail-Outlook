interface LoaderProps {
  /**
   * If true, the loader will overlay the entire screen with a backdrop blur.
   * Default: false
   */
  fullScreen?: boolean;
  /**
   * The size of the spinner.
   * Default: 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional text to display below the spinner.
   */
  text?: string;
}

export function Loader({
  fullScreen = false,
  size = 'medium',
  text,
}: LoaderProps) {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-[#3b3be3] rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-gray-600 font-medium text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}
