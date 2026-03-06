type OnboardingProgressProps = {
  step: number;
  total: number;
};

export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i < step ? "w-6 bg-emerald-500" : "w-2 bg-zinc-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">
        Paso {step} de {total}
      </span>
    </div>
  );
}
