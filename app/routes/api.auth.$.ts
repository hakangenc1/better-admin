import { type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "react-router";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    return await auth.handler(request);
  } catch (error) {
    // If setup is incomplete, redirect to setup page
    if (error instanceof Error && error.name === 'SetupIncompleteError') {
      throw redirect("/setup");
    }
    // Re-throw other errors
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await auth.handler(request);
  } catch (error) {
    // If setup is incomplete, redirect to setup page
    if (error instanceof Error && error.name === 'SetupIncompleteError') {
      throw redirect("/setup");
    }
    // Re-throw other errors
    throw error;
  }
}
