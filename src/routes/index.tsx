import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { supabase } from "~/supabase";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formatTimeToNow } from "~/utils";

const issuesPerPage = 20;

export default component$(() => {
  const user = useSignal<any>();
  const orgName = useSignal<string>("");
  const issues = useSignal<any[]>([]);
  const page = useSignal(1);
  const pRef = useSignal<HTMLElement>();

  const fetchIssues = $(async () => {
    const { data } = await supabase.auth.getSession();
    const auth_token = data.session?.provider_token;

    try {
      const fetchIssuesPage = await fetch(
        `https://api.github.com/search/issues?q=org:${orgName.value}+label:"good first issue"+state:open&per_page=${issuesPerPage}&page=${page.value}`,
        {
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
            Authorization: `Bearer ${auth_token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      const issuesPage = await fetchIssuesPage.json();
      // html_url -> github.com/<org>/<repo>/issues/<issue_id> we need org, repo and issue_id
      // need to sort them by created_at
      // user.login, user.html_url
      issues.value = [...issues.value, ...issuesPage.items];
    } catch (error) {
      console.log(error);
    }
  });

  useVisibleTask$(async () => {
    try {
      const userData = localStorage.getItem("gfi_user");

      if (userData && userData !== "undefined" && userData !== "null") {
        user.value = JSON.parse(userData);
      } else {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          window.location.href = "/login";
        }
        if (data) {
          user.value = data.user?.user_metadata;
          // cache user data for faster load and less API calls
          localStorage.setItem(
            "gfi_user",
            JSON.stringify(data.user?.user_metadata)
          );
        }
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  });

  return (
    <div class="container mx-auto mt-10">
      {user.value ? (
        <div class="flex flex-col justify-center items-center">
          <img
            class="rounded-full w-20 h-20"
            src={user.value.avatar_url}
            alt="avatar"
          />
          <h1 class="text-3xl mt-4">Hello, @{user.value.user_name}</h1>
        </div>
      ) : (
        <div class="flex flex-col justify-center items-center">
          <svg
            class="w-20 h-20 rounded-sm text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          </svg>
          <div class="h-2.5 mt-4 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        </div>
      )}
      <div class="flex items-center mt-4">
        <input
          class="w-full p-2 rounded bg-gray-800 border border-gray-200"
          type="text"
          placeholder="Enter an organization name to find their good first issues"
          value={orgName.value}
          onChange$={(event) => {
            orgName.value = event.target.value;
          }}
        />
        <button
          class="bg-gray-800 p-2 border border-gray-300"
          onClick$={fetchIssues}
        >
          Find
        </button>
      </div>
      <div class="my-4">
        {issues.value.map((issue: any) => (
          <article class="p-4 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <div class="flex items-center space-x-2">
              <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={issue.html_url}
                >
                  {issue.title}
                </a>
              </h2>
              {issue.labels &&
                issue.labels.length > 0 &&
                issue.labels.splice(0, 3).map((label: any) => (
                  <span class="flex items-center border p-1 truncate" style={{
                    fontSize: "0.5rem",
                  }}>
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
              class="relative text-sm text-gray-500 font-light max-h-40 max-w-md overflow-clip"
              ref={pRef}
              dangerouslySetInnerHTML={DOMPurify.sanitize(
                marked.parse(issue.body)
              )}>
            </p>
            <div class="flex justify-between items-center">
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
        ))}
        {issues.value.length > 0 &&
          issues.value.length % issuesPerPage === 0 && (
            <button
              class="bg-gray-800 p-2 border border-gray-300 my-4"
              onClick$={() => {
                page.value = page.value + 1;
                fetchIssues();
              }}
            >
              Load more
            </button>
          )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "good-f-issues",
  meta: [
    {
      name: "description",
      content: "An app to find good first issues across your orgs",
    },
  ],
};
