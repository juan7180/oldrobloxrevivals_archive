export interface SubredditRule {
  title: string;
  body: string;
}
// pooooooooooo, are you pooping?
export const SUBREDDIT_RULES: SubredditRule[] = [
  {
    title:
      "All content posted to the subreddit must not contain any form of bigoted, sexual, or racist content.",
    body: "This is not a subreddit for mature content, nor is it a great place to discuss your “politics.” Disallowing bigoted content from revivals allows for less toxic, and more open communities.",
  },
  {
    title:
      "All content posted to the subreddit must be creative or constructive in some form or manner.",
    body: "Creation of revivals, discussion of what you’ve made in revivals, or just general creative works come to mind. Let’s be constructive and build a community, rather than tear one down.",
  },
  {
    title:
      "Any promotions of projects to the subreddit must follow the 10-year-rule.",
    body: "Revivals must only be based on versions of Roblox that are at LEAST 10 years old. Starting in 2027, Revivals based on 2017 will be allowed, and so on.",
  },
  {
    title: "Spam and Low quality content will be removed without warning or reason.",
    body: "Continued posting of this content will see a ban. “Low quality” refers to posts that are irrelevant, or non-constructive to the community.\n\nMaking multiple posts because your post is held under manual review by our filters falls under this rule as well, and repeat offenders will be punished accordingly.",
  },
  {
    title:
      "Project leads and staff members of said projects will be held to a higher standard.",
    body: "Promotions and discussions of revivals which contain staff teams who are deemed nonconstructive to the community will not be allowed, unless it is for security concerns.",
  },
  {
    title:
      "Projects with a bad history and reputation will be denied promotions on the subreddit.",
    body: "If you believe this is in error, please send the team a modmail message, and we will try to sort it out.",
  },
  {
    title:
      "Projects based on anothers work must have some amount of effort to improve and add to the original.",
    body: "You cannot promote a revival that is based on illegally obtained or stolen source code. The work must have some amount of improvements added for it to be permissible, including security patches and feature additions. This rule exists to help push for more innovation in the community. Blatant re-hosts of projects with none of these will be removed without warning.",
  },
  {
    title:
      "Subreddit moderators reserve the right to remove you from the subreddit for any reason.",
    body: "In extreme circumstances, some people may have to be removed for reasons beyond the rules.",
  },
  {
    title: "Posts must be in English.",
    body: "In order to keep a level of consistency with understanding and communication, English is the only language allowed in posts and comments.",
  },
];
