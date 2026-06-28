import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

const xiyueWallpapers = Array.from(
	{ length: 52 },
	(_, index) => `/gallery/firefly-2026/bg_${index + 1}.webp`,
);

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	mode: "banner",
	switchable: true,
	playerEnable: false,
	src: {
		desktop: xiyueWallpapers,
		mobile: xiyueWallpapers,
	},
	common: {
		dimOpacity: 0.2,
		playerMode: "random",
		homeText: {
			enable: true,
			switchable: true,
			title: "Lovely Xiyue!",
			titleSize: "3.8rem",
			subtitle: [
				"欢迎来到汐月的专属领域 ~",
				"在草莓流心的甜味里，寻找生活的真谛",
				"薰衣草茶的温热，是最安静的陪伴",
				"比起繁杂的代码，我更在乎当下的风景",
				"不准盯着我看太久哦，真是的",
				"在这个光影的缝隙里，私藏属于我们的温柔",
			],
			subtitleSize: "1.5rem",
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
		},
		navbar: {
			transparentMode: "semifull",
			enableBlur: true,
			blur: 3,
		},
		waves: {
			enable: { desktop: true, mobile: true },
			switchable: true,
		},
		gradient: {
			enable: { desktop: true, mobile: true },
			height: "10%",
			switchable: true,
		},
		carousel: {
			enable: true,
			interval: 5000,
			transitionEffect: "fade",
			switchable: true,
		},
	},
	banner: {
		position: "center",
	},
	overlay: {
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
		zIndex: -1,
		opacity: 0.8,
		blur: 10,
		cardOpacity: 0.5,
	},
	fullscreen: {
		position: "center",
	},
};
