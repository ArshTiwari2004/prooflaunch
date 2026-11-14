import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account", robots: { index: false } };

export default function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="register" next={searchParams.next} />;
}
