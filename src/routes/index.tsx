import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { supabase } from "~/supabase";
import { marked } from "marked";
import DOMPurify from "dompurify";

const issuesPerPage = 100;

export default component$(() => {
  const user = useSignal<any>();
  const orgName = useSignal<string>("");
  const issues = useSignal<any[]>([]);
  const page = useSignal(1);

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
          placeholder="Search"
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
      <div>
        {issues.value.map((issue: any) => (
          <div
            key={issue.id}
            class="flex flex-col items-center mt-4 p-4 border bg-zinc-800"
          >
            <a
              class="text-blue-500 text-2xl"
              href={issue.html_url}
              target="_blank"
            >
              {issue.title}
            </a>
            <div class="flex space-x-2">
              {issue.labels &&
                issue.labels.length > 0 &&
                issue.labels.map((label: any) => (
                  <span class="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-sm mr-2">
                    {label.name}
                  </span>
                ))}
            </div>
            <p class="text-sm text-gray-500">
              {new Date(issue.created_at).toLocaleString()}
            </p>
            <p
              class="text-sm text-gray-200 p-4 bg-zinc-600"
              dangerouslySetInnerHTML={DOMPurify.sanitize(
                marked.parse(issue.body)
              )}
            ></p>
          </div>
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
