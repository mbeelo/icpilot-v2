import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';
import Head from 'next/head';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Create Account | ICP Pilot</title>
        <meta name="description" content="Create your ICP Pilot account and start building ideal customer profiles with AI-powered sales tools." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-6">
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}