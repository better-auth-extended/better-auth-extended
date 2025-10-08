"use client";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Prism } from "@/components/ui/prism";
import {
	BentoGrid,
	BentoGridItem,
	BentoGridItemDescription,
	BentoGridItemTitle,
} from "../../components/ui/bento-grid";
import { WaitlistOffer } from "./_components/offers/waitlist";
import {
	DoorOpenIcon,
	ScaleIcon,
	Settings2Icon,
	UserPlusIcon,
} from "lucide-react";
import { LegalConsentOffer } from "./_components/offers/legal-consent";
import { AppInviteOffer } from "./_components/offers/app-invite";
import { PreferencesOffer } from "./_components/offers/preferences";
import { OnboardingOffer } from "./_components/offers/onboarding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion, stagger, useReducedMotion, type Variants } from "motion/react";

const MotionLogo = motion.create(Logo);
const MotionLink = motion.create(Link);
const MotionBentoGrid = motion.create(BentoGrid);
const MotionBentoGridItem = motion.create(BentoGridItem);
const bentoGridItemVariants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
	},
} satisfies Variants;

export default function HomePage() {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className="flex-1">
			<div className="z-[2] -mt-(--fd-nav-height) h-[calc(80dvh+var(--fd-nav-height))] relative">
				<div className="h-full grid place-items-center max-w-7xl mx-auto">
					<motion.div
						variants={{
							hidden: {},
							visible: {
								transition: {
									delayChildren: stagger(0.03),
								},
							},
						}}
						viewport={{ once: true, amount: 0.4 }}
						initial="hidden"
						whileInView="visible"
						exit="hidden"
						className="flex flex-col items-center gap-4 max-w-sm text-center"
					>
						<MotionLogo
							variants={!shouldReduceMotion ? {
								hidden: {
									opacity: 0,
									scale: 0.9,
								},
								visible: {
									opacity: 1,
									scale: 1,
								},
							} : undefined}
							className="size-16 will-change-transform"
						/>
						<motion.h1
							variants={!shouldReduceMotion ? {
								hidden: {
									opacity: 0,
									y: 10,
								},
								visible: {
									opacity: 1,
									y: 0,
								},
							} : undefined}
							className="text-4xl font-semibold"
						>
							better-auth-extended
						</motion.h1>
						<motion.p
							variants={!shouldReduceMotion ? {
								hidden: {
									opacity: 0,
									y: 10,
								},
								visible: {
									opacity: 1,
									y: 0,
								},
							} : undefined}
							className="text-xl font-medium text-muted-foreground"
						>
							A curated set of plugins, tools, and libraries for Better-Auth.
						</motion.p>
						<motion.div
							variants={!shouldReduceMotion ? {
								hidden: {
									opacity: 0,
									y: 10,
								},
								visible: {
									opacity: 1,
									y: 0,
								},
							} : undefined}
							className="grid grid-cols-2 mt-4 gap-2"
						>
							<Link
								href="/docs"
								className={buttonVariants({
									size: "lg",
								})}
							>
								Get Started
							</Link>
							<Link
								href="/marketplace"
								className={buttonVariants({
									size: "lg",
									variant: "ghost",
								})}
							>
								Visit Marketplace
							</Link>
						</motion.div>
					</motion.div>
				</div>
				<div className="-z-[1] absolute inset-0 mask-t-from-92% mask-b-from-80%">
					<Prism
						animationType="rotate"
						timeScale={0.314159}
						height={3.5}
						baseWidth={6}
						scale={2.8}
						hueShift={0}
						colorFrequency={1}
						noise={0.05}
						glow={0.8}
					/>
				</div>
			</div>
			<div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
				<MotionBentoGrid
					variants={{
						hidden: {},
						visible: {
							transition: {
								delayChildren: stagger(0.15, {
									startDelay: 0.15,
								}),
							},
						},
					}}
					initial="hidden"
					viewport={{ once: true, amount: 0.2 }}
					whileInView="visible"
					exit="hidden"
				>
					<MotionBentoGridItem
						onClick={() => {
							router.push("/docs/plugins/app-invite");
						}}
						variants={!shouldReduceMotion ? bentoGridItemVariants : undefined}
					>
						<div className="h-full group-hover/bento:mask-t-from-80% transition-all">
							<div className="h-full mask-b-from-80% group-hover/bento:mask-none transition-all">
								<AppInviteOffer />
							</div>
						</div>
						<BentoGridItemTitle icon={UserPlusIcon}>
							App Invite
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Invite users to your application and allow them to sign up.
						</BentoGridItemDescription>
					</MotionBentoGridItem>
					<MotionBentoGridItem
						className="md:col-span-2"
						onClick={() => {
							router.push("/docs/plugins/onboarding");
						}}
						variants={!shouldReduceMotion ? bentoGridItemVariants : undefined}
					>
						<div className="h-full mask-b-from-80% transition-all">
							<OnboardingOffer />
						</div>
						<BentoGridItemTitle icon={DoorOpenIcon}>
							Onboarding
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Easily add onboarding to your authentication flow.
						</BentoGridItemDescription>
					</MotionBentoGridItem>
					<MotionBentoGridItem
						onClick={() => {
							router.push("/docs/plugins/waitlist");
						}}
						variants={!shouldReduceMotion ? bentoGridItemVariants : undefined}
					>
						<div className="h-full mask-r-from-80% mask-b-from-80%">
							<WaitlistOffer />
						</div>
						<BentoGridItemTitle icon={DoorOpenIcon}>
							Waitlist <Badge variant="outline">Soon</Badge>
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Manage and prioritize user sign-ups with a customizable waitlist
							system.
						</BentoGridItemDescription>
					</MotionBentoGridItem>
					<MotionBentoGridItem
						onClick={() => {
							router.push("/docs/plugins/legal-consent");
						}}
						variants={!shouldReduceMotion ? bentoGridItemVariants : undefined}
					>
						<div className="h-full group-hover/bento:mask-t-from-80% transition-all">
							<LegalConsentOffer />
						</div>
						<BentoGridItemTitle icon={ScaleIcon}>
							Legal Consent <Badge variant="outline">Soon</Badge>
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Collect and manage user legal consents efficiently for compliance
							purposes.
						</BentoGridItemDescription>
					</MotionBentoGridItem>
					<MotionBentoGridItem
						onClick={() => {
							router.push("/docs/plugins/preferences");
						}}
						variants={!shouldReduceMotion ? bentoGridItemVariants : undefined}
					>
						<div className="h-full mask-b-from-60% transition-all">
							<PreferencesOffer />
						</div>
						<BentoGridItemTitle icon={Settings2Icon}>
							Preferences
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Define and manage preferences with scoped settings.
						</BentoGridItemDescription>
					</MotionBentoGridItem>
				</MotionBentoGrid>
			</div>
		</div>
	);
}
