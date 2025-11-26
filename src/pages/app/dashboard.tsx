import { GetServerSideProps } from 'next';
import Head from 'next/head';
import CommandDeck from '@/components/dashboard/CommandDeck';
import { requireAuth } from '@/utils/auth-helpers';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Command Deck - Sovren AI</title>
        <meta name="description" content="Sovren AI Executive Command Deck" />
      </Head>
      <CommandDeck />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context, (user) => {
    return {
      props: {
        user,
      },
    };
  });
};
