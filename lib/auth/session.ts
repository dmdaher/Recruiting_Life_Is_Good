import { auth } from "./config";

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  return {
    id: (session.user as { id?: string }).id ?? "",
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as { role?: string }).role ?? "",
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }
  return user;
}
