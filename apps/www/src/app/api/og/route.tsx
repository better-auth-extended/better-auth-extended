import { Logo } from "@/components/logo";
import { owner, repo } from "@/lib/github";
import { ImageResponse } from "@vercel/og";
import { z } from "zod";
import { categories } from "~/categories";

export const runtime = "edge";

const ogSchema = z.object({
	heading: z.string(),
	packageName: z.string().optional(),
	category: z.string().optional(),
	description: z.string().optional(),
	mode: z.string(),
	type: z.string(),
});

export const GET = async (req: Request) => {
	try {
		const geist = await fetch(
			new URL("../../../assets/Geist.ttf", import.meta.url),
		).then((res) => res.arrayBuffer());

		const geistMono = await fetch(
			new URL("../../../assets/GeistMono.ttf", import.meta.url),
		).then((res) => res.arrayBuffer());
		const url = new URL(req.url);
		const urlParamsValues = Object.fromEntries(url.searchParams);
		const validParams = ogSchema.parse(urlParamsValues);
		const {
			heading,
			type,
			packageName,
			category: categoryName,
			description,
		} = validParams;
		const category = categoryName
			? categories[categoryName as keyof typeof categories]
			: undefined;
		const trueHeading =
			heading.length > 140 ? `${heading.substring(0, 140)}...` : heading;
		const trueDescription =
			description?.length && description.length > 256
				? `${description.substring(0, 256)}...`
				: description;
		const paint = "#fff";
		const fontSize = trueHeading.length > 100 ? "30px" : "60px";

		return new ImageResponse(
			<div
				tw="flex w-full relative flex-col p-9"
				style={{
					color: paint,
					border: "1px solid rgba(255, 255, 255, 0.1)",
					background:
						"linear-gradient(to bottom left, #171717 15%, #0a0a0a 85%)",
					backgroundColor: "#0a0a0a",
					fontFamily: "Geist",
				}}
			>
				<div tw="flex items-center absolute bottom-8 right-8">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="1.2em"
						height="1.2em"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
						></path>
					</svg>
					<span tw="ml-2 font-medium">
						github.com/{owner}/{repo}
					</span>
				</div>
				<div tw={"relative flex flex-col w-full h-full p-8"}>
					<div tw="flex items-center">
						<div tw="flex items-center">
							<Logo width="2.5em" height="2.5em" />
							<span tw="ml-1.5 text-xl tracking-tight">
								better-auth-extended
							</span>
						</div>
						{!!category && (
							<span tw="ml-auto">
								<span tw="px-4 py-1.5 text-lg bg-neutral-900/50 rounded-md border border-neutral-800 text-neutral-400">
									{category.name}
								</span>
							</span>
						)}
					</div>

					<div tw="flex flex-col my-auto">
						<h1
							style={{
								fontSize: fontSize,
							}}
						>
							{trueHeading}
						</h1>

						{!!trueDescription && (
							<p tw="text-3xl text-neutral-400 max-w-[65%]">
								{trueDescription}
							</p>
						)}

						{!!packageName && (
							<div tw="flex mt-6">
								<div tw="flex rounded-lg pl-4 pr-3 py-3 items-center border border-neutral-800 bg-neutral-900/50">
									<span
										tw="flex items-center"
										style={{
											fontFamily: "GeistMono",
										}}
									>
										<span tw="mr-0.5 text-sm text-[#4498c8]">git:</span>
										<span tw="mr-1 text-sm text-[#F07178]">(main)</span>
										<span tw="mr-2 text-sm text-amber-600 italic">x</span>
										<span>npm add {packageName}</span>
									</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1.2em"
										height="1.2em"
										viewBox="0 0 128 128"
										// @ts-expect-error
										tw="ml-3"
									>
										<path
											fill="#cb3837"
											d="M0 7.062C0 3.225 3.225 0 7.062 0h113.88c3.838 0 7.063 3.225 7.063 7.062v113.88c0 3.838-3.225 7.063-7.063 7.063H7.062c-3.837 0-7.062-3.225-7.062-7.063zm23.69 97.518h40.395l.05-58.532h19.494l-.05 58.581h19.543l.05-78.075l-78.075-.1l-.1 78.126z"
										></path>
										<path
											fill="#fff"
											d="M25.105 65.52V26.512H40.96c8.72 0 26.274.034 39.008.075l23.153.075v77.866H83.645v-58.54H64.057v58.54H25.105z"
										></path>
									</svg>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1.2em"
										height="1.2em"
										viewBox="0 0 256 256"
										// @ts-expect-error
										tw="ml-2"
									>
										<g fill="none">
											<rect
												width="256"
												height="256"
												fill="#242938"
												rx="60"
											></rect>
											<path
												fill="#fff"
												d="M128.001 30C72.779 30 28 74.77 28 130.001c0 44.183 28.653 81.667 68.387 94.89c4.997.926 6.832-2.169 6.832-4.81c0-2.385-.093-10.262-.136-18.618c-27.82 6.049-33.69-11.799-33.69-11.799c-4.55-11.559-11.104-14.632-11.104-14.632c-9.073-6.207.684-6.079.684-6.079c10.042.705 15.33 10.305 15.33 10.305c8.919 15.288 23.394 10.868 29.1 8.313c.898-6.464 3.489-10.875 6.349-13.372c-22.211-2.529-45.56-11.104-45.56-49.421c0-10.918 3.906-19.839 10.303-26.842c-1.039-2.519-4.462-12.69.968-26.464c0 0 8.398-2.687 27.508 10.25c7.977-2.215 16.531-3.326 25.03-3.364c8.498.038 17.06 1.149 25.051 3.365c19.087-12.939 27.473-10.25 27.473-10.25c5.443 13.773 2.019 23.945.98 26.463c6.412 7.003 10.292 15.924 10.292 26.842c0 38.409-23.394 46.866-45.662 49.341c3.587 3.104 6.783 9.189 6.783 18.519c0 13.38-.116 24.149-.116 27.443c0 2.661 1.8 5.779 6.869 4.797C199.383 211.64 228 174.169 228 130.001C228 74.771 183.227 30 128.001 30M65.454 172.453c-.22.497-1.002.646-1.714.305c-.726-.326-1.133-1.004-.898-1.502c.215-.512.999-.654 1.722-.311c.727.326 1.141 1.01.89 1.508m4.919 4.389c-.477.443-1.41.237-2.042-.462c-.654-.697-.777-1.629-.293-2.078c.491-.442 1.396-.235 2.051.462c.654.706.782 1.631.284 2.078m3.374 5.616c-.613.426-1.615.027-2.234-.863c-.613-.889-.613-1.955.013-2.383c.621-.427 1.608-.043 2.236.84c.611.904.611 1.971-.015 2.406m5.707 6.504c-.548.604-1.715.442-2.57-.383c-.874-.806-1.118-1.95-.568-2.555c.555-.606 1.729-.435 2.59.383c.868.804 1.133 1.957.548 2.555m7.376 2.195c-.242.784-1.366 1.14-2.499.807c-1.13-.343-1.871-1.26-1.642-2.052c.235-.788 1.364-1.159 2.505-.803c1.13.341 1.871 1.252 1.636 2.048m8.394.932c.028.824-.932 1.508-2.121 1.523c-1.196.027-2.163-.641-2.176-1.452c0-.833.939-1.51 2.134-1.53c1.19-.023 2.163.639 2.163 1.459m8.246-.316c.143.804-.683 1.631-1.864 1.851c-1.161.212-2.236-.285-2.383-1.083c-.144-.825.697-1.651 1.856-1.865c1.183-.205 2.241.279 2.391 1.097"
											></path>
										</g>
									</svg>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Geist",
						data: geist,
						weight: 400,
						style: "normal",
					},
					{
						name: "GeistMono",
						data: geistMono,
						weight: 700,
						style: "normal",
					},
				],
			},
		);
	} catch (err) {
		console.error(err);
		return new Response("Failed to generate the opengraph image", {
			status: 500,
		});
	}
};
