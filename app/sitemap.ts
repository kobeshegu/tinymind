import { MetadataRoute } from 'next'
import { Octokit } from '@octokit/rest'

const BASE_URL = 'https://tinymind.me'
const PUBLIC_REPO = 'tinymind-blog'

/** Search returns at most 1000 results, so stop there rather than loop forever. */
const MAX_PAGES = 10
const PER_PAGE = 100

interface DiscoveredUser {
  login: string
  updatedAt: string
}

/**
 * Find the users who have a TinyMind blog.
 *
 * There is no user table — GitHub is the database — so the only way to
 * enumerate authors is to ask GitHub which accounts have the repository. The
 * previous version hardcoded a single username, which meant every other user's
 * blog was absent from the sitemap entirely.
 */
async function discoverUsers(): Promise<DiscoveredUser[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN
  const octokit = token ? new Octokit({ auth: token }) : new Octokit()
  const users = new Map<string, DiscoveredUser>()

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await octokit.search.repos({
      q: `${PUBLIC_REPO} in:name`,
      per_page: PER_PAGE,
      page,
    })

    for (const repo of data.items) {
      // `in:name` is a substring match, so require the exact repository name.
      if (repo.name !== PUBLIC_REPO || repo.private || !repo.owner?.login) {
        continue
      }
      const login = repo.owner.login
      if (!users.has(login)) {
        users.set(login, { login, updatedAt: repo.pushed_at || repo.updated_at })
      }
    }

    if (data.items.length < PER_PAGE) {
      break
    }
  }

  return Array.from(users.values())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  let users: DiscoveredUser[] = []
  try {
    users = await discoverUsers()
  } catch (error) {
    // A degraded sitemap beats a failed build or an empty response.
    console.error('Sitemap: user discovery failed, emitting static pages only:', error)
    return staticPages
  }

  // Profile pages only. Listing every post would cost one content request per
  // user, and crawlers reach the posts by following the blog index anyway.
  const userPages: MetadataRoute.Sitemap = users.flatMap(({ login, updatedAt }) => {
    const lastModified = new Date(updatedAt)
    return [
      { url: `${BASE_URL}/${login}`, lastModified, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${BASE_URL}/${login}/blog`, lastModified, changeFrequency: 'weekly' as const, priority: 0.7 },
      { url: `${BASE_URL}/${login}/thoughts`, lastModified, changeFrequency: 'weekly' as const, priority: 0.6 },
      { url: `${BASE_URL}/${login}/about`, lastModified, changeFrequency: 'monthly' as const, priority: 0.5 },
    ]
  })

  console.log(`Sitemap: ${users.length} users discovered, ${staticPages.length + userPages.length} URLs`)
  return [...staticPages, ...userPages]
}
