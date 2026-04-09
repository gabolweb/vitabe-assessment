interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

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
              className="absolute inset-y-0 left-4 right-4 bg-stone-100 rounded-full"
            />

            {/* Progress line (navy) — first pass */}
            <div
              className="absolute inset-y-0 left-4 transition-all duration-700 ease-in-out bg-brand"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full" />
            </div>

            {/* Simpler, Bulletproof Line */}
            <div className="absolute inset-y-0 left-4 right-4">
              <div className="h-full w-full absolute transition-all duration-700 ease-in-out bg-stone-200" />
              <div
                className="h-full absolute transition-all duration-700 ease-in-out bg-brand"
                style={{ width: `${progress}%` }}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative border-2 ${
                    isCompleted
                      ? 'bg-brand text-white border-brand'
                      : isActive
                      ? 'bg-brand text-white border-brand shadow-[0_0_0_4px_rgba(0,40,92,0.15)]'
                      : 'bg-white text-stone-400 border-stone-100'
                  }`}
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
                    className={`text-[11px] font-bold tracking-tight text-center transition-colors duration-300 ${
                      isActive ? 'text-brand' : isCompleted ? 'text-stone-500' : 'text-stone-300'
                    }`}
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
