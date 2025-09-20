"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
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

export default function HomePage() {
	return (
		<div>
			<div className="z-[2] -mt-(--fd-nav-height) h-[calc(80dvh+var(--fd-nav-height))] relative">
				<div className="h-full grid place-items-center max-w-7xl mx-auto">
					<div className="flex flex-col items-center gap-4 max-w-sm text-center">
						<Logo className="size-16" />
						<h1 className="text-4xl font-semibold">better-auth-extended</h1>
						<p className="text-xl font-medium text-muted-foreground">
							A curated set of plugins, tools, and libraries for Better-Auth.
						</p>
						<div className="grid grid-cols-2 mt-4 gap-2">
							<Button size="lg">Get Started</Button>
							<Button size="lg" variant="ghost">
								Visit Marketplace
							</Button>
						</div>
					</div>
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
						glow={1}
					/>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
				<BentoGrid>
					<BentoGridItem>
						<div className="h-full group-hover/bento:mask-t-from-80% transition-all">
							<div className="h-full mask-b-from-80% group-hover/bento:mask-none transition-all">
								<AppInviteOffer />
							</div>
						</div>
						<BentoGridItemTitle icon={UserPlusIcon}>
							App Invite
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Dolor exercitation exercitation proident sint ad ad nulla dolor.
						</BentoGridItemDescription>
					</BentoGridItem>
					<BentoGridItem className="md:col-span-2">
						<div className="h-full mask-b-from-80% transition-all">
							<OnboardingOffer />
						</div>
						<BentoGridItemTitle icon={DoorOpenIcon}>
							Onboarding
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Labore excepteur in ex minim consectetur consectetur cupidatat
							aliquip elit magna.
						</BentoGridItemDescription>
					</BentoGridItem>
					<BentoGridItem>
						<div className="h-full mask-r-from-80% mask-b-from-80%">
							<WaitlistOffer />
						</div>
						<BentoGridItemTitle icon={DoorOpenIcon}>
							Waitlist
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Proident deserunt pariatur non reprehenderit aliquip nisi occaecat
							consectetur cupidatat id anim.
						</BentoGridItemDescription>
					</BentoGridItem>
					<BentoGridItem>
						<div className="h-full group-hover/bento:mask-t-from-80% transition-all">
							<LegalConsentOffer />
						</div>
						<BentoGridItemTitle icon={ScaleIcon}>
							Legal Consent
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Cupidatat voluptate dolore sint fugiat elit dolore.
						</BentoGridItemDescription>
					</BentoGridItem>
					<BentoGridItem>
						<div className="h-full mask-b-from-60% transition-all">
							<PreferencesOffer />
						</div>
						<BentoGridItemTitle icon={Settings2Icon}>
							Preferences
						</BentoGridItemTitle>
						<BentoGridItemDescription>
							Minim culpa fugiat laboris reprehenderit et velit.
						</BentoGridItemDescription>
					</BentoGridItem>
				</BentoGrid>
			</div>
		</div>
	);
}
