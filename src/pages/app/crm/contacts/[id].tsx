import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getContactById, CRMContact } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import ShadowBoardInsights from '@/components/shadowboard/ShadowBoardInsights';
import FileIntakePanel from '@/components/multimodal/FileIntakePanel';
import AttachmentList from '@/components/multimodal/AttachmentList';

export default function ContactDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useAuth();
  const [contact, setContact] = useState<CRMContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshAttachments, setRefreshAttachments] = useState(0);

  useEffect(() => {
    async function loadContact() {
      if (!id || typeof id !== 'string' || !tokens?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getContactById(id, tokens.access_token);
        setContact(data);
      } catch (err) {
        console.error('Failed to load contact:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    }

    loadContact();
  }, [id, tokens]);

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading contact...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error || !contact) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/app/crm/contacts" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Contacts
            </Link>
          </div>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load contact</p>
            <p className="text-gray-400">{error || 'Contact not found'}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{contact.name} - Contacts - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/app/crm/contacts" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Contacts
            </Link>
          </div>
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
            {contact.title && <p className="text-lg text-gray-300">{contact.title}</p>}
            {contact.company_name && <p className="text-gray-400">at {contact.company_name}</p>}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-indigo-400 hover:text-indigo-300">{contact.email}</a>
                </div>
                {contact.phone && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Phone</span>
                    <a href={`tel:${contact.phone}`} className="text-indigo-400 hover:text-indigo-300">{contact.phone}</a>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Contact ID</div>
                  <div className="text-gray-300 font-mono text-xs">{contact.contact_id}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="text-gray-300">{new Date(contact.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Board Intelligence */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Shadow Board Intelligence</h2>
              <Link
                href={`/app/shadowboard/deliberation/contact/${contact.contact_id}`}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Deep Deliberation →
              </Link>
            </div>
            <ShadowBoardInsights entityType="contact" entityId={contact.contact_id} />
          </div>

          {/* Files & Artifacts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Files & Artifacts</h2>
            <FileIntakePanel
              entityType="contact"
              entityId={contact.contact_id}
              onUploadComplete={() => setRefreshAttachments(prev => prev + 1)}
            />
            <AttachmentList
              entityType="contact"
              entityId={contact.contact_id}
              refreshTrigger={refreshAttachments}
            />
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
