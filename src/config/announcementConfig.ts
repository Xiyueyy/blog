import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "观测站运行中",

	// 公告内容
	content: "欢迎来到汐月观测站。这里是我记录碎碎念的小小窗口，如果你也刚好路过，不如在留言板留下一点痕迹？要是能带上好吃的草莓流心作为投喂，我就更开心啦~",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "去留言板",
		// 链接 URL
		url: "/guestbook/",
		// 内部链接
		external: false,
	},
};
