/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a GitHub Card component.
 * Supports both repositories and user profiles.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} [properties.repo] - "owner/repo" format.
 * @param {string} [properties.user] - "username" format.
 */
export function GithubCardComponent(properties, children) {
    const repo = properties.repo;
    const user = properties.user;

    if (!repo && !user) {
        return h("div", { class: "hidden" }, 'Invalid directive. Must provide "repo" or "user".');
    }

    const cardUuid = `GC${Math.random().toString(36).slice(-6)}`;
    const isUser = !!user && !repo;
    const target = isUser ? user : repo;
    const apiUrl = isUser ? `https://api.github.com/users/${user}` : `https://api.github.com/repos/${repo}`;

    const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });
    const nLanguage = h(`span#${cardUuid}-language`, { class: "gc-language" }, "Waiting...");

    const nTitle = h("div", { class: "gc-titlebar" }, [
        h("div", { class: "gc-titlebar-left" }, [
            h("div", { class: "gc-owner" }, [
                nAvatar,
                h("div", { class: "gc-user" }, isUser ? target : repo.split("/")[0]),
            ]),
            !isUser ? h("div", { class: "gc-divider" }, "/") : null,
            !isUser ? h("div", { class: "gc-repo" }, repo.split("/")[1]) : null,
        ].filter(Boolean)),
        h("div", { class: "github-logo" }),
    ]);

    const nDescription = h(`div#${cardUuid}-description`, { class: "gc-description" }, "Fetching GitHub data...");
    const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "0");
    const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "0");
    const nLicense = h(`div#${cardUuid}-license`, { class: "gc-license" }, "N/A");

    const nScript = h(
        `script#${cardUuid}-script`,
        { type: "text/javascript", defer: true },
        `
      fetch('${apiUrl}', { referrerPolicy: "no-referrer" }).then(response => response.json()).then(data => {
        const descEl = document.getElementById('${cardUuid}-description');
        const langEl = document.getElementById('${cardUuid}-language');
        const starsEl = document.getElementById('${cardUuid}-stars');
        const forksEl = document.getElementById('${cardUuid}-forks');
        const licenseEl = document.getElementById('${cardUuid}-license');
        const avatarEl = document.getElementById('${cardUuid}-avatar');

        if (${isUser}) {
            descEl.innerText = data.bio || "This user prefers to keep their bio a mystery.";
            langEl.innerText = "Location: " + (data.location || "Cyber Space");
            starsEl.innerText = "Repos: " + data.public_repos;
            forksEl.innerText = "Followers: " + data.followers;
            licenseEl.innerText = "Following: " + data.following;
        } else {
            descEl.innerText = data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "No description provided.";
            langEl.innerText = data.language || "Unknown";
            forksEl.innerText = Intl.NumberFormat('en-us', { notation: "compact" }).format(data.forks);
            starsEl.innerText = Intl.NumberFormat('en-us', { notation: "compact" }).format(data.stargazers_count);
            licenseEl.innerText = data.license?.spdx_id || "no-license";
        }
        
        avatarEl.style.backgroundImage = 'url(' + (data.avatar_url || data.owner?.avatar_url) + '&s=32' + ')';
        avatarEl.style.backgroundColor = 'transparent';
        document.getElementById('${cardUuid}-card').classList.remove("fetch-waiting");
      }).catch(err => {
        console.error("[GITHUB-CARD] Error:", err);
        document.getElementById('${cardUuid}-card').classList.add("fetch-error");
      })
    `
    );

    return h(
        `a#${cardUuid}-card`,
        {
            class: "card-github fetch-waiting no-styling",
            href: `https://github.com/${target}`,
            target: "_blank",
        },
        [nTitle, nDescription, h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]), nScript]
    );
}
