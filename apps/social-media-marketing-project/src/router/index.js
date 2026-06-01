import { createRouter, createWebHistory } from "vue-router";

import {
  SignInView as SignIn,
  SignUpView as SignUp,
  EmailValidationView as EmailValidation,
  PasswordView as Password,
  ForgotPasswordView as ForgotPassword,
  ResetLinkView as ResetLink,
  ResetPasswordView as ResetPassword,
  PasswordUpdationView as PasswordUpdation,
  AccountDeletedView as AccountDeleted,
} from "@ai-suite/shared-ui";
import { DashboardView as Dashboard } from "@ai-suite/shared-ui";;

const TOKEN_KEY = "access_token";
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/email-validation",
  "/password",
  "/forgot-password",
  "/reset-link",
  "/reset-password",
  "/password-updation",
  "/deleted-message",
];

const routes = [
  { path: "/signup", name: "SignUp", component: SignUp, },
  { path: "/signin", name: "SignIn", component: SignIn, },
  { path: "/email-validation", name: "EmailValidation", component: EmailValidation, },  
  { path: "/password", name: "Password", component: Password, },  
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword, },
  { path: "/reset-link", name: "ResetLink", component: ResetLink, },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword, },
  { path: "/password-updation", name: "PasswordUpdation", component: PasswordUpdation, },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, redirect: "/chat" },
  { path: "/chat", name: "Chat", component: Dashboard },
  { path: "/calendar", name: "Calendar", component: Dashboard,
    meta: {
      title: "calender | My App",
      description: "View insights and analytics."
    }
   },
  { path: "/analytics", name: "Analytics", component: Dashboard },
  { path: "/products", name: "Products", component: Dashboard },
  { path: "/settings", name: "Settings", component: Dashboard },
  { path: "/automations", name: "Automations", component: Dashboard },
  { path: "/deleted-message", name: "AccountDeleted", component: AccountDeleted,},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const normalizedPath = to.path.replace(/\/+$/, "") || "/";
  const authOnlyPaths = ["/signin", "/signup"];
  const normalizedPublicPaths = PUBLIC_PATHS.map((path) => path.replace(/\/+$/, "") || "/");

  if (normalizedPath === "/signin") {
    const tokenQuery = to.query.token;
    const tokenValue = Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery;

    if (typeof tokenValue === "string" && tokenValue.trim()) {
      const normalizedToken = tokenValue.replace(/^"+|"+$/g, "").trim();

      if (normalizedToken) {
        localStorage.setItem(TOKEN_KEY, normalizedToken);
        console.log("Google login token:", normalizedToken);
        return "/chat";
      }
    }
  }

  const isSignedIn = Boolean(localStorage.getItem(TOKEN_KEY));

  if (normalizedPath === "/" && isSignedIn) {
    return "/chat";
  }

  if (normalizedPath === "/" && !isSignedIn) {
    return "/signin";
  }

  if (isSignedIn && authOnlyPaths.includes(normalizedPath)) {
    return "/chat";
  }

  if (!isSignedIn && !normalizedPublicPaths.includes(normalizedPath)) {
    return "/signin";
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title || "My App";

  let description = document.querySelector('meta[name="description"]');

  if (!description) {
    description = document.createElement("meta");
    description.setAttribute("name", "description");
    document.head.appendChild(description);
  }

  description.setAttribute(
    "content",
    to.meta.description || "Default app description"
  );
});


export default router;