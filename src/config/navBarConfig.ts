import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: (NavBarLink | LinkPreset)[] = [
		LinkPreset.Home,
		LinkPreset.Archive,
	];

	links.push(LinkPreset.Friends);

	if (siteConfig.pages.guestbook) {
		links.push(LinkPreset.Guestbook);
	}

	links.push({
		name: "我的",
		url: "/my/",
		icon: "material-symbols:person",
		children: [
			...(siteConfig.pages.gallery
				? [{ name: "相册", url: "/gallery/", icon: "material-symbols:photo-library" }]
				: []),
			...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
		],
	});

	links.push({
		name: "关于",
		url: "/content/",
		icon: "material-symbols:info",
		children: [
			...(siteConfig.pages.sponsor ? [LinkPreset.Sponsor] : []),
			LinkPreset.About,
		],
	});

	links.push({
		name: "链接",
		url: "/links/",
		icon: "material-symbols:link",
		children: [
			{
				name: "GitHub",
				url: "https://github.com/Xiyueyy",
				external: true,
				icon: "fa7-brands:github",
			},
			{
				name: "Bilibili",
				url: "https://space.bilibili.com/478883397",
				external: true,
				icon: "fa7-brands:bilibili",
			},
		],
	});

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
