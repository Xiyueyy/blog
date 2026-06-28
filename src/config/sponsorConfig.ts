import type { SponsorConfig } from "../types/sponsorConfig";

export const sponsorConfig: SponsorConfig = {
	title: "",
	description: "",
	usage:
		"您的赞助将用于服务器维护、内容创作和功能开发，帮助我持续提供优质内容。",
	showSponsorsList: true,
	showComment: true,
	showButtonInPost: true,
	methods: [
		{
			name: "支付宝",
			icon: "fa7-brands:alipay",
			qrCode: "/assets/images/sponsor/alipay.jpg",
			link: "",
			description: "使用 支付宝 扫码赞助",
			enabled: true,
		},
		{
			name: "微信",
			icon: "fa7-brands:weixin",
			qrCode: "/assets/images/sponsor/wechat.jpg",
			link: "",
			description: "使用 微信 扫码赞助",
			enabled: true,
		},
	],
	sponsors: [
		{
			name: "那个笨蛋",
			amount: "¥100",
			date: "2026-02-15",
			message: "笨蛋，这是给你的草莓流心大餐基金！",
		},
	],
};
