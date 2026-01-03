// src/pages/Home/HomeLand.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

// NovaKit components
import { GlassCard, StatCard, GradientText, Chip, PageHeader } from '../../components/ratings/NovaKitComponents';

// Icons
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  BellAlertIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Service
import ratingsService from '../../lib/ratingsService';
import { format, subDays } from 'date-fns';

const HomeLand = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Helper functions
  const pct = (num, den) => den > 0 ? (num / den) : 0;

  // Fetch ratings data
  const fetchRatings = useCallback(async () => {
    if (!authData?.access_token || !authData?.org_id) {
      setDataLoading(false);
      return;
    }

    try {
      const today = new Date();
      const dateFrom = format(subDays(today, 30), 'yyyy-MM-dd');
      const dateTo = format(today, 'yyyy-MM-dd');

      const res = await ratingsService.fetchRatings(
        authData.org_id,
        {
          page: 1,
          per_page: 5000,
          sort: '-date_created',
          start_date: dateFrom,
          end_date: dateTo,
        },
        authData.access_token
      );
      setRatings(res?.data || []);
    } catch (e) {
      console.error('Failed to fetch ratings:', e);
      setRatings([]);
    } finally {
      setDataLoading(false);
    }
  }, [authData]);

  // Permissions
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('home.no_permission'));
      setLoading(false);
      return;
    }

    if ((authData?.privilege_ids || []).length > 0) {
      setHasPrivilege(true);
      setError('');
      fetchRatings();
    } else {
      setHasPrivilege(false);
      setError(t('home.no_permission'));
    }
    setLoading(false);
  }, [authData, authLoading, t, fetchRatings]);

  const orgName = useMemo(() => authData?.org_name_en || t('home.org_default'), [authData, t]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const tallies = { happy: 0, medium: 0, sad: 0, total: 0 };
    ratings.forEach(r => {
      if (r.rating === 'happy') tallies.happy++;
      else if (r.rating === 'medium') tallies.medium++;
      else if (r.rating === 'sad') tallies.sad++;
    });
    tallies.total = tallies.happy + tallies.medium + tallies.sad;

    // Calculate NPS (weighted)
    const orgPctHappy = pct(tallies.happy, tallies.total);
    const orgPctSad = pct(tallies.sad, tallies.total);
    const orgNPS = (orgPctHappy - orgPctSad) * 100;

    // Find top branch by NPS
    const branchMap = new Map();
    ratings.forEach(r => {
      const branch = r.location_id || 'Unknown';
      if (!branchMap.has(branch)) {
        branchMap.set(branch, { happy: 0, medium: 0, sad: 0, total: 0 });
      }
      const stats = branchMap.get(branch);
      if (r.rating === 'happy') stats.happy++;
      else if (r.rating === 'medium') stats.medium++;
      else if (r.rating === 'sad') stats.sad++;
      stats.total++;
    });

    let topBranch = null;
    let topBranchNPS = -Infinity;
    branchMap.forEach((stats, branch) => {
      const branchPctHappy = pct(stats.happy, stats.total);
      const branchPctSad = pct(stats.sad, stats.total);
      const branchNPS = (branchPctHappy - branchPctSad) * 100;
      if (branchNPS > topBranchNPS && stats.total >= 5) { // minimum 5 responses
        topBranchNPS = branchNPS;
        topBranch = branch;
      }
    });

    return {
      orgNPS: isNaN(orgNPS) ? null : Math.round(orgNPS),
      totalResponses: tallies.total,
      topBranch: topBranch || null,
      topBranchNPS: topBranch ? Math.round(topBranchNPS) : null,
      alerts: 0, // TODO: implement alerts logic
    };
  }, [ratings]);

  if (authLoading || !authData) return <LoadingSpinner />;

  // Format KPI values
  const formatNPS = (nps) => {
    if (nps === null || nps === undefined) return '—';
    return nps >= 0 ? `+${nps}` : `${nps}`;
  };

  const formatTotal = (total) => {
    if (total === 0) return '0';
    return total.toLocaleString();
  };

  const formatTopBranch = () => {
    if (!kpis.topBranch) return '—';
    const display = kpis.topBranch.length > 20 ? `${kpis.topBranch.substring(0, 20)}...` : kpis.topBranch;
    return display;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Page Header */}
            <PageHeader
              title={<GradientText>{t('home.title')}</GradientText>}
              subtitle={t('home.subtitle', { org: orgName })}
              actions={
                <>
                  <LanguageToggle />
                  <ModalSearch />
                  <ThemeToggle />
                </>
              }
            />

            {/* Errors */}
            {error && (
              <GlassCard className="p-4 mb-6 border-red-500/50 bg-red-50/50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                  <button
                    onClick={() => setError('')}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                    aria-label={t('common.dismiss_error')}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </GlassCard>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : hasPrivilege ? (
              <div className="space-y-8">

                {/* Quick KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label={t('home.kpi_org_nps')}
                    value={dataLoading ? '...' : formatNPS(kpis.orgNPS)}
                    delta={kpis.orgNPS !== null && kpis.orgNPS >= 0 ? `+${kpis.orgNPS}` : kpis.orgNPS !== null ? `${kpis.orgNPS}` : undefined}
                    icon={ChartBarIcon}
                    onClick={() => navigate('/rating_nps_dash')}
                    className="h-full"
                  />
                  <StatCard
                    label={t('home.kpi_total_responses')}
                    value={dataLoading ? '...' : formatTotal(kpis.totalResponses)}
                    icon={UserGroupIcon}
                    onClick={() => navigate('/rating_dash')}
                    className="h-full"
                  />
                  <StatCard
                    label={t('home.kpi_top_branch')}
                    value={dataLoading ? '...' : formatTopBranch()}
                    delta={kpis.topBranchNPS !== null ? (kpis.topBranchNPS >= 0 ? `+${kpis.topBranchNPS}` : `${kpis.topBranchNPS}`) : undefined}
                    icon={TrophyIcon}
                    onClick={() => navigate('/rating_nps_dash')}
                    className="h-full"
                  />
                  <StatCard
                    label={t('home.kpi_alerts')}
                    value={dataLoading ? '...' : String(kpis.alerts)}
                    icon={BellAlertIcon}
                    onClick={() => navigate('/rating_nps_dash')}
                    className="h-full"
                  />
                </div>

                {/* NPS explainer */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      <GradientText>{t('home.nps_title')}</GradientText>
                    </h2>
                    <Chip variant="default">{t('home.nps_pill')}</Chip>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {t('home.nps_intro')}
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                    <li>{t('home.nps_step1')}</li>
                    <li>{t('home.nps_step2')}</li>
                    <li>{t('home.nps_step3')}</li>
                  </ol>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-fuchsia-50 dark:from-indigo-900/30 dark:to-fuchsia-900/30 text-sm text-indigo-800 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-700/50">
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{t('home.nps_note_proxy')}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Examples block */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('home.examples_title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <GlassCard className="p-4">
                      <div className="font-semibold mb-2 text-gray-900 dark:text-white">{t('home.example_a_title')}</div>
                      <div className="text-gray-600 dark:text-gray-400">{t('home.example_a_body')}</div>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="font-semibold mb-2 text-gray-900 dark:text-white">{t('home.example_b_title')}</div>
                      <div className="text-gray-600 dark:text-gray-400">{t('home.example_b_body')}</div>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="font-semibold mb-2 text-gray-900 dark:text-white">{t('home.example_c_title')}</div>
                      <div className="text-gray-600 dark:text-gray-400">{t('home.example_c_body')}</div>
                    </GlassCard>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    {t('home.examples_footer')}
                  </div>
                </GlassCard>

                {/* Collection methods */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('home.collect_title')}</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>{t('home.collect_qr')}</li>
                    <li>{t('home.collect_kiosk')}</li>
                    <li>{t('home.collect_whatsapp')}</li>
                    <li>{t('home.collect_after_ticket')}</li>
                  </ul>
                </GlassCard>

                {/* Guardrails & targets */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('home.guard_title')}</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>{t('home.guard_sample')}</li>
                    <li>{t('home.guard_targets')}</li>
                    <li>{t('home.guard_trend')}</li>
                  </ul>
                </GlassCard>

                {/* Quick navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link 
                    to="/rating_dash" 
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-center font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowTrendingUpIcon className="h-5 w-5" />
                    {t('home.link_dashboard')}
                  </Link>
                  <Link 
                    to="/rating_nps_dash" 
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white text-center font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    {t('home.link_nps')}
                  </Link>
                  <Link 
                    to="/ratings" 
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-center font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    {t('home.link_submit')}
                  </Link>
                </div>

                {/* Announcements */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('home.announcements_title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('home.announcements_coming_soon')}</p>
                </GlassCard>

              </div>
            ) : (
              <GlassCard className="p-6 border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/20">
                <div className="flex items-center gap-3">
                  <InformationCircleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200">{t('home.no_permission')}</p>
                </div>
              </GlassCard>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeLand;
