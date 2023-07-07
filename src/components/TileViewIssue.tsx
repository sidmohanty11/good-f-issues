import { component$ } from "@builder.io/qwik";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formatTimeToNow } from "~/utils";

type TileIssueProps = {
  issue: any;
  orgName?: string;
};

const TileIssue = component$<TileIssueProps>(({ issue, orgName = "" }) => {
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
    <article class="p-4 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700">
      <p class="text-gray-400 text-sm">
        {org}/{repo}
      </p>
      <div class="flex items-center space-x-2">
        <h2 class="mb-2 text-xl font-bold tracking-tight text-emerald-500 hover:text-emerald-600">
          <a target="_blank" rel="noopener noreferrer" href={issue.html_url}>
            {issue.title}
          </a>
        </h2>
      </div>
      <div class="flex items-center space-x-2">
        {issue.labels &&
          issue.labels.length > 0 &&
          issue.labels.splice(0, 3).map((label: any) => (
            <span
              class="flex items-center border p-1 truncate text-xs"
            >
              <svg
                class="mr-1 w-2 h-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
              </svg>
              {label.name}
            </span>
          ))}
      </div>
      <p
        class="relative text-sm mt-2 text-gray-300 font-light h-14 max-w-md overflow-clip"
        dangerouslySetInnerHTML={DOMPurify.sanitize(marked.parse(issue.body))}
      ></p>
      <div class="flex justify-between items-center mt-2">
        <div class="flex items-center space-x-4">
          <span class="text-xs dark:text-white">
            #{issue.number} opened by {issue.user.login}{" "}
            {formatTimeToNow(issue.created_at)}
          </span>
        </div>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center font-medium text-primary-600 dark:text-primary-500 hover:underline"
        >
          Go to Issue
          <svg
            class="ml-2 w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </a>
      </div>
    </article>
  );
});

export default TileIssue;
