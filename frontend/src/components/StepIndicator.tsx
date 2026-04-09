interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const PRIMARY = '#00285c';

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  // progress for N steps (3 steps -> 0, 50, 100)
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex justify-center w-full mb-10">
      <div className="relative w-full max-w-xl px-4">
        
        {/* The Line Track (Centers of circles are at 16px from each edge of the 'ol') */}
        <div className="absolute top-4 left-4 right-4 h-0.5">
          <div className="relative w-full h-full">
            {/* Background line (gray) */}
            <div 
              className="absolute inset-y-0 bg-stone-100 rounded-full"
              style={{ left: '16px', right: '16px' }}
            />
            
            {/* Progress line (navy) */}
            <div 
              className="absolute inset-y-0 transition-all duration-700 ease-in-out"
              style={{ 
                background: PRIMARY, 
                left: '16px', 
                width: `calc(${progress}% - ${progress === 0 ? '0%' : '0px'})`,
                // We use a container to crop the line so it stops exactly at circle center
              }}
            >
              <div 
                className="h-full w-full"
                style={{ 
                  width: `calc(100% * 1)` // Placeholder for complex math if needed
                }}
              />
            </div>

            {/* Simpler, Bulletproof Line: using a nested div to handle the width of the active part */}
            <div className="absolute inset-y-0" style={{ left: '16px', right: '16px' }}>
              <div 
                className="h-full transition-all duration-700 ease-in-out bg-stone-200"
                style={{ width: '100%', position: 'absolute' }}
              />
              <div 
                className="h-full transition-all duration-700 ease-in-out"
                style={{ 
                  background: PRIMARY, 
                  width: `${progress}%`, 
                  position: 'absolute' 
                }}
              />
            </div>
          </div>
        </div>

        <ol className="relative z-10 flex justify-between items-start">
          {steps.map((label, index) => {
            const stepNum     = index + 1;
            const isActive    = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <li key={label} className="flex flex-col items-center w-8">
                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative bg-white border-2"
                  style={
                    isCompleted
                      ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY }
                      : isActive
                      ? { 
                          background: PRIMARY, 
                          color: '#fff', 
                          borderColor: PRIMARY,
                          boxShadow: `0 0 0 4px rgba(0,40,92,0.15)` 
                        }
                      : { background: '#fff', color: '#a8a29e', borderColor: '#f1f0ee' }
                  }
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="leading-none select-none">{stepNum}</span>
                  )}
                </div>

                {/* Label */}
                <div className="absolute top-10 flex justify-center w-24 pointer-events-none">
                  <span
                    className="text-[11px] font-bold tracking-tight text-center transition-colors duration-300"
                    style={isActive ? { color: PRIMARY } : isCompleted ? { color: '#78716c' } : { color: '#d6d3d1' }}
                  >
                    {label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
