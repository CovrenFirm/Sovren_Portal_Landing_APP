import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import ConstitutionViewer from '@/components/governance/ConstitutionViewer';
import SlacMatrix from '@/components/governance/SlacMatrix';
import SealVerificationForm from '@/components/governance/SealVerificationForm';
import SealHistoryTable from '@/components/governance/SealHistoryTable';

/**
 * Governance Portal - Main UI
 *
 * The Three Pillars of Sovereign AI Governance:
 * 1. Constitution Viewer - The foundational rules
 * 2. SLAC Matrix - Authorization engine
 * 3. Cryptographic Audit - Seal verification and history
 *
 * NO mocks. NO fake data. Production-grade only.
 */

type Tab = 'constitution' | 'slac' | 'audit';

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('constitution');

  return (
    <>
      <Head>
        <title>Governance - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-800/50 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-white mb-2">AI Governance System</h1>
            <p className="text-gray-300">
              Constitutional AI governance with cryptographic verification
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('constitution')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'constitution'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                📜 Constitution
              </button>
              <button
                onClick={() => setActiveTab('slac')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'slac'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                🔐 Authorization Matrix
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                🔏 Cryptographic Audit
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'constitution' && <ConstitutionViewer />}
            {activeTab === 'slac' && <SlacMatrix />}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <SealVerificationForm />
                <SealHistoryTable />
              </div>
            )}
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
