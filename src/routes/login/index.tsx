import {
  $,
  component$,
  useStyles$,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import styles from "./styles.css?inline";

import { supabase } from "~/supabase";
import { DocumentHead } from "@builder.io/qwik-city";

const Login = component$(() => {
  useStyles$(styles);
  const toast = useSignal<string>("Session expired. Please login again.");

  useVisibleTask$(() => {
    if (window.location.search.includes("error=session_expired")) {
      toast.value = "Session expired. Please login again.";
    }

    setTimeout(() => {
      toast.value = "";
    }, 5000);
  });

  const handleLogin = $(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      console.log(error);
      return;
    }
  });

  return (
    <div class="container mx-auto h-screen flex flex-col items-center justify-center">
      <div class="space-y-8 flex flex-col justify-center items-center">
        <h1 class="heading pill">good first issue</h1>
        <p class="tagline">Find org wide "good first issues"</p>
        <button class="login-button" onClick$={handleLogin}>
          <img
            height={24}
            width={24}
            src={"/github-icon.svg"}
            alt="GitHub Icon"
            class="github-icon"
          />
          Login with GitHub
        </button>
      </div>
      <footer class="footer fixed bottom-10">
        Made with <span>&#x2764;</span> by Sidharth Mohanty.
      </footer>
      {toast.value && (
        <div
          id="toast-warning"
          class="absolute top-4 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 transition duration-100"
          role="alert"
        >
          <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
            </svg>
            <span class="sr-only">Warning icon</span>
          </div>
          <div class="ml-3 text-sm font-normal">
            {toast.value}
          </div>
        </div>
      )}
    </div>
  );
});

export default Login;

export const head: DocumentHead = {
  title: "good-f-issues | Login",
  meta: [
    {
      name: "description",
      content: "An app to find good first issues across your orgs",
    },
  ],
};
