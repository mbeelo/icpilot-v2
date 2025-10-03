import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign In | ICP Pilot</title>
        <meta name="description" content="Sign in to your ICP Pilot account and access AI-powered sales enablement tools." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}