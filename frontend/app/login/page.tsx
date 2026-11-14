import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="login" next={searchParams.next} />;
}
