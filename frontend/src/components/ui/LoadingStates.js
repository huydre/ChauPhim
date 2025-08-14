'use client';

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-600 border-t-yellow-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export const LoadingGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-[2/3] bg-gray-600"></div>
            <div className="p-2 space-y-2">
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingCarousel = () => {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-700 rounded w-48 animate-pulse"></div>
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-64 animate-pulse">
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="aspect-[16/9] bg-gray-600"></div>
              <div className="p-2 space-y-2">
                <div className="h-4 bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-400 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-gray-300 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({ title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🎬</div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      {action}
    </div>
  );
};
