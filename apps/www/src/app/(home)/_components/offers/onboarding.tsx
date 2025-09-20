"use client";

import { useBentoGridItem } from "@/components/ui/bento-grid";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { cn } from "@/lib/utils";
import { MinusIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const STEPS = 4;

export const OnboardingOffer = () => {
	const { hovering } = useBentoGridItem();
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		if (!hovering) {
			setCurrentStep(0);
			return;
		}

		let step = 1;
		setCurrentStep(1);
		const interval = setInterval(() => {
			step++;
			setCurrentStep(step);
			if (step >= STEPS) clearInterval(interval);
		}, 1000);

		return () => clearInterval(interval);
	}, [hovering]);

	return (
		<div
			className={cn(
				"w-full h-full p-5 select-none transition-opacity duration-150 ease-in-out overflow-hidden relative",
				!hovering ? "opacity-90" : "",
			)}
		>
			<motion.div
				className={cn(
					"w-full p-5 h-[200px] rounded-2xl bg-card border border-border pb-5 absolute inset-0 drop-shadow-lg",
				)}
				animate={hovering ? { y: 0, scale: 0.92 } : { y: 20, scale: 0.9 }}
			>
				<div className="mt-2 flex items-center justify-between gap-4">
					{Array.from({ length: STEPS })
						.fill(null)
						.map((_, i) => {
							const step = i + 1;

							return (
								<div
									key={step}
									className={cn(
										"w-full text-muted-foreground flex flex-col gap-1 transition-opacity",
										step > currentStep ? "opacity-20" : "",
									)}
								>
									<div className="w-full h-2 bg-muted-foreground rounded-sm" />
									<div className="relative flex items-center gap-1">
										{currentStep >= step ? null : (
											<MinusIcon className="absolute size-4" />
										)}
										<motion.svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="3.5"
											stroke="currentColor"
											className="h-3.5 w-3.5"
											initial={false}
											animate={currentStep >= step ? "checked" : "unchecked"}
											transition={{
												duration: 0.5,
												delay: 1,
											}}
										>
											<motion.path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
												variants={{
													checked: {
														pathLength: 1,
													},
													unchecked: {
														pathLength: 0,
													},
												}}
											/>
										</motion.svg>
										<p>Step {step}</p>
									</div>
								</div>
							);
						})}
				</div>

				<div className="text-muted-foreground flex flex-col gap-1 mt-6">
					<span className="text-sm font-medium">Onboarding</span>
					<div className="text-xl font-bold">
						<span>Step </span>
						<SlidingNumber value={currentStep === 0 ? 1 : currentStep} />
					</div>
				</div>
			</motion.div>
		</div>
	);
};
OnboardingOffer.displayName = "OnboardingOffer";
