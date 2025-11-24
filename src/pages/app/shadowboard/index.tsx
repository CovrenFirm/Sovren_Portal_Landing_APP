import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import ShadowBoardPanel from '@/components/shadowboard/ShadowBoardPanel';

/**
 * Shadow Board Main Route
 *
 * Production-grade page with:
 * - Auth protection via getServerSideProps
 * - Real portal layout integration
 * - Static executive grid (21 executives)
 * - Scene store sync for 3D Antigravity Core
 * - Empty thought stream shell (no fakes)
 * - Links to Scenario Simulation
 *
 * NO mock data
 * NO fake backend calls
 * NO simulated behavior
 */
export default function ShadowBoardPage() {
  return (
    <>
      <Head>
        <title>Shadow Board - Sovren AI</title>
        <meta name="description" content="AI-powered executive intelligence network" />
      </Head>

      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Shadow Board</h1>
              <p className="text-gray-400">AI-powered executive intelligence network</p>
            </div>
            <Link
              href="/app/shadowboard/scenarios"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Scenario Simulation
            </Link>
          </div>
          <ShadowBoardPanel />
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
