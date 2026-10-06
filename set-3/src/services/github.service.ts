import { GithubClient } from "../clients/github.client";
import { getCache, setCache } from "../utils/cache";

const CACHE_TTL_SECONDS = 600;

// only the fields we use - github sends a lot more
type GithubUser = {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    html_url: string;
};

type GithubRepo = {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    html_url: string;
    updated_at: string;
};

export class GithubService {
    constructor(private githubClient: GithubClient) {}

    async getUser(username: string) {
        const cacheKey = `github:user:${username.toLowerCase()}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return cached;
        }

        const user = await this.githubClient.get<GithubUser>(`/users/${encodeURIComponent(username)}`);
        const result = {
            username: user.login,
            name: user.name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            publicRepos: user.public_repos,
            followers: user.followers,
            profileUrl: user.html_url,
        };

        await setCache(cacheKey, result, CACHE_TTL_SECONDS);
        return result;
    }

    async getRepos(username: string) {
        const cacheKey = `github:repos:${username.toLowerCase()}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return cached;
        }

        const repos = await this.githubClient.get<GithubRepo[]>(
            `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`,
        );
        const result = repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            url: repo.html_url,
            updatedAt: repo.updated_at,
        }));

        await setCache(cacheKey, result, CACHE_TTL_SECONDS);
        return result;
    }
}
