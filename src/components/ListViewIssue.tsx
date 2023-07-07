import { component$ } from "@builder.io/qwik";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formatTimeToNow } from "~/utils";

type ListViewProps = {
  issue: any;
  orgName?: string;
};

const ListView = component$<ListViewProps>(({ issue, orgName = "" }) => {
  const htmlUrl = issue.html_url;
  const regex = /github\.com\/([^/]+)\/([^/]+)\//;
  const match = htmlUrl.match(regex);

  let org = orgName;
  let repo = "";
  if (match && match.length > 2) {
    org = match[1];
    repo = match[2];
  }
  return (
    <article class="p-2 pl-4 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700">
      <p class="text-gray-400 text-sm">
        {org}/{repo}
      </p>
      <div class="flex items-center">
        <h2 class="text-xl font-bold tracking-tight text-emerald-400 hover:text-emerald-600">
          <a target="_blank" rel="noopener noreferrer" href={issue.html_url}>
            {issue.title}
          </a>
        </h2>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4 mt-2">
          <span class="text-xs dark:text-white">
            #{issue.number} opened by {issue.user.login}{" "}
            {formatTimeToNow(issue.created_at)}
          </span>
        </div>
      </div>
    </article>
  );
});

export default ListView;
