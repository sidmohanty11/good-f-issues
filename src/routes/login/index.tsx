import { $, component$, useStyles$ } from "@builder.io/qwik";
import styles from './styles.css?inline';

import { supabase } from "~/supabase";

const Login = component$(() => {
  useStyles$(styles);

  const handleLogin = $(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
    if (error) {
      console.log(error)
      return
    }
  });

  return (
    <div class="container mx-auto h-screen flex flex-col items-center justify-center">
      <div class="space-y-8 flex flex-col justify-center items-center">
        <h1 class="heading pill">good first issue</h1>
        <p class="tagline">Find org wide "good first issues"</p>
        <button class="login-button" onClick$={handleLogin}>
          <img height={24} width={24} src={'/github-icon.svg'} alt="GitHub Icon" class="github-icon" />
          Login with GitHub
        </button>
      </div>
      <footer class="footer fixed bottom-10">
        Made with <span>&#x2764;</span> by Sidharth Mohanty.
      </footer>
    </div>
  );
});

export default Login;
