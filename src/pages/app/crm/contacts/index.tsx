import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getContacts, CRMContact } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function ContactsPage() {
  const { tokens } = useAuth();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadContacts() {
      if (!tokens?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getContacts(tokens.access_token);
        setContacts(data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [tokens]);

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.company_name?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Head>
        <title>Contacts - Sovren AI</title>
      </Head>

      <PortalLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Contacts</h1>
              <p className="mt-2 text-gray-400">
                Manage your customer contacts and leads
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">
                Failed to load contacts: {error}
              </p>
            </div>
          )}

          {/* Contacts Table */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">
                  {searchQuery ? 'No contacts match your search' : 'No contacts found'}
                </p>
                <p className="text-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Contacts will appear here once added to the CRM'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.contact_id}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/app/crm/contacts/${contact.contact_id}`}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            {contact.name}
                          </Link>
                          {contact.title && (
                            <div className="text-sm text-gray-500">{contact.title}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {contact.company_name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              getStageColor(contact.lifecycle_stage)
                            )}
                          >
                            {contact.lifecycle_stage || 'Lead'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {contact.lead_score !== null && contact.lead_score !== undefined ? (
                            <span className="text-indigo-400 font-medium">
                              {contact.lead_score}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {!loading && filteredContacts.length > 0 && (
            <div className="text-sm text-gray-400 text-center">
              Showing {filteredContacts.length} of {contacts.length} contacts
            </div>
          )}
        </div>
      </PortalLayout>
    </>
  );
}

function getStageColor(stage?: string): string {
  const stageColors: Record<string, string> = {
    lead: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    prospect: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/50',
    customer: 'bg-green-900/30 text-green-400 border border-green-700/50',
    partner: 'bg-purple-900/30 text-purple-400 border border-purple-700/50',
  };

  return stageColors[stage?.toLowerCase() || 'lead'] || stageColors.lead;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
