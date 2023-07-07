import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import TileIssue from "~/components/TileViewIssue";
import FullWidthIssue from "~/components/ListViewIssue";
import { supabase } from "~/supabase";

const issuesPerPage = 20;

export default component$(() => {
  const user = useSignal<any>();
  const orgName = useSignal<string>("");
  const issues = useSignal<any[]>([]);
  const pageNumber = useSignal(1);
  const isTileView = useSignal(true);
  const isLoading = useSignal(false);
  const errorMessage = useSignal("");

  const fetchIssues = $(async (org: string, page: number, reset: boolean) => {
    isLoading.value = true;
    errorMessage.value = "";

    if (reset) {
      issues.value = [];
    }

    const { data, error } = await supabase.auth.getSession();

    if (!org) {
      errorMessage.value = "Please enter an organization name.";
      isLoading.value = false;
      return;
    }

    if (org.includes("https")) {
      // its a URL, then do this
      const regex = /(?<=github\.com\/)[^\/]+/;
      const match = org.match(regex);

      if (match && match.length === 1) {
        org = match[0];
      } else {
        errorMessage.value = "Please enter a valid organization name.";
        isLoading.value = false;
        return;
      }
    }

    if (error || !data.session?.provider_token) {
      window.location.href = "/login?error=session_expired";
    }

    const auth_token = data.session?.provider_token;

    try {
      const fetchIssuesPage = await fetch(
        `https://api.github.com/search/issues?q=org:${org}+label:"good first issue"+state:open&per_page=${issuesPerPage}&page=${page}`,
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
      console.log("Error fetching issues:", error);
      errorMessage.value = "Error fetching issues. Please try again.";
    } finally {
      isLoading.value = false;
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
          window.location.href = "/login?error=session_expired";
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
      window.location.href = "/login?error=session_expired";
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
        <div class="flex flex-col justify-center items-center animate-pulse">
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
      <div class="flex items-center justify-center mt-4">
        <input
          class="w-full p-2 rounded bg-gray-800 border border-gray-200"
          type="text"
          placeholder="Enter an organization name or URL to find their good first issues"
          value={orgName.value}
          onChange$={(event) => {
            orgName.value = event.target.value;
          }}
          onKeyDown$={(event) => {
            if (event.key === "Enter") {
              const input = event.target as HTMLInputElement;
              fetchIssues(input.value, 1, true);
            }
          }}
        />
        <button
          class="bg-gray-800 p-2 border border-gray-300"
          onClick$={() => fetchIssues(orgName.value, 1, true)}
        >
          Find
        </button>
      </div>
      <div>
        {errorMessage.value && (
          <p class="text-red-500 text-center mt-4">{errorMessage.value}</p>
        )}
      </div>
      <div class="flex items-center justify-center mt-4">
        <button
          class={`p-2 border border-gray-300 flex items-center ${
            isTileView.value === false ? "bg-blue-800" : ""
          }`}
          onClick$={() => {
            isTileView.value = false;
          }}
        >
          <svg
            fill="#fff"
            width="16px"
            height="16px"
            viewBox="0 0 52 52"
            data-name="Layer 1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2"
          >
            <path d="M50,15.52H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0H50a2,2,0,0,1,2,2V13.52A2,2,0,0,1,50,15.52Zm-46-4H48V4H4Z" />
            <path d="M50,33.76H2a2,2,0,0,1-2-2V20.24a2,2,0,0,1,2-2H50a2,2,0,0,1,2,2V31.76A2,2,0,0,1,50,33.76Zm-46-4H48V22.24H4Z" />
            <path d="M50,52H2a2,2,0,0,1-2-2V38.48a2,2,0,0,1,2-2H50a2,2,0,0,1,2,2V50A2,2,0,0,1,50,52ZM4,48H48V40.48H4Z" />
          </svg>
          List view
        </button>
        <button
          class={`p-2 border border-gray-300 flex items-center ${
            isTileView.value === true ? "bg-blue-800" : ""
          }`}
          onClick$={() => {
            isTileView.value = true;
          }}
        >
          <svg
            fill="#fff"
            width="16px"
            height="16px"
            viewBox="0 0 14 14"
            role="img"
            focusable="false"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2"
          >
            <path
              style="fill-rule:evenodd"
              d="M 1,1 6.4,1 6.4,6.4 1,6.4 1,1 Z m 1.2,1.2 3,0 0,3 -3,0 0,-3 z M 1,7.6 6.4,7.6 6.4,13 1,13 1,7.6 Z m 1.2,1.2 3,0 0,3 -3,0 0,-3 z M 7.6,1 13,1 13,6.4 7.6,6.4 7.6,1 Z m 1.2,1.2 3,0 0,3 -3,0 0,-3 z m -1.2,5.4 5.4,0 0,5.4 -5.4,0 0,-5.4 z m 1.2,1.2 3,0 0,3 -3,0 0,-3 z"
            />
          </svg>
          Tile view
        </button>
      </div>
      <div
        class={`my-4 ${
          isTileView.value
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : ""
        }`}
      >
        {issues.value.map((issue: any) => (
          <div>
            {isTileView.value ? (
              <TileIssue issue={issue} />
            ) : (
              <FullWidthIssue issue={issue} />
            )}
          </div>
        ))}
        {issues.value.length > 0 &&
          issues.value.length % issuesPerPage === 0 && (
            <button
              class="bg-gray-800 p-2 border border-gray-300 my-4"
              onClick$={() => {
                pageNumber.value = pageNumber.value + 1;
                fetchIssues(orgName.value, pageNumber.value, false);
              }}
            >
              Load more
            </button>
          )}
        {isLoading.value && (
          <>
            {new Array(20).fill(null).map((_, idx) => (
              <div
                key={idx}
                class="mt-4 p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700 w-full"
              >
                <div class="flex items-center justify-between pt-4">
                  <div>
                    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
              </div>
            ))}
          </>
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
