import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search,
  TrendingDown,
  Minus,
  MessageSquare,
  PieChart,
  Tags,
  Cloud,
  Lightbulb,
  FileText,
  Smartphone,
  Apple,
  Moon,
  Sun,
  Star,
  BarChart3,
  Zap,
  TrendingUp as TrendIcon,
  Mail
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// v1.0.1 - Build fix applied
// Mock data - replace with actual API calls
const mockData = {
  totalReviews: 6792,
  androidReviews: 5234,
  iosReviews: 1558,
  categorized: 590,
  pending: 6202,
  nps: 78,
  avgRating: 4.5,
  promoters: 0,
  passives: 0,
  detractors: 0,
  ratingDistribution: [
    { rating: 5, count: 799, percentage: 79.9 },
    { rating: 4, count: 82, percentage: 8.2 },
    { rating: 3, count: 22, percentage: 2.2 },
    { rating: 2, count: 10, percentage: 1.0 },
    { rating: 1, count: 87, percentage: 8.7 }
  ],
  sentimentSplit: {
    positive: 0,
    negative: 0,
    neutral: 0
  },
  themes: [
    { label: 'App Performance', count: 234, sentiment: 'negative' },
    { label: 'Customer Support', count: 189, sentiment: 'mixed' },
    { label: 'UI/UX Design', count: 156, sentiment: 'positive' },
    { label: 'Features Request', count: 134, sentiment: 'positive' },
    { label: 'Login Issues', count: 98, sentiment: 'negative' }
  ]
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [platform, setPlatform] = useState('all');
  const [timePeriod] = useState('last30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReviewsCount, setNewReviewsCount] = useState(0);

  // Theme colors
  const colors = {
    primary: '#10b981', // emerald-500
    secondary: '#3b82f6', // blue-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    background: darkMode ? '#0f172a' : '#f8fafc', // slate-900 : slate-50
    card: darkMode ? '#1e293b' : '#ffffff', // slate-800 : white
    text: darkMode ? '#f8fafc' : '#1e293b', // slate-50 : slate-800
    textMuted: darkMode ? '#94a3b8' : '#64748b', // slate-400 : slate-500
    border: darkMode ? '#334155' : '#e2e8f0' // slate-700 : slate-200
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch reviews data from GitHub
      const reviewsResponse = await fetch(
        'https://raw.githubusercontent.com/pbehuray/m3-weeklyPulseReport/master/phase8/data/processed_reviews_with_sentiment_and_themes.json'
      );
      
      // Fetch pulse data from GitHub
      const pulseResponse = await fetch(
        'https://raw.githubusercontent.com/pbehuray/m3-weeklyPulseReport/master/phase8/data/weekly_pulse/weekly_pulse.json'
      );
      
      let freshReviews = [];
      let pulseData = {};
      
      if (reviewsResponse.ok) {
        freshReviews = await reviewsResponse.json();
        setReviews(freshReviews);
        
        // Calculate new reviews since last sync
        const previousCount = reviews.length;
        const newCount = freshReviews.length - previousCount;
        if (newCount > 0) {
          setNewReviewsCount(newCount);
        }
      }
      
      if (pulseResponse.ok) {
        pulseData = await pulseResponse.json();
      }
      
      // Calculate actual metrics from reviews data
      const totalReviews = freshReviews.length || 2390;
      const androidReviews = freshReviews.filter(r => r.platform === 'android' || r.source === 'play_store').length || 1800;
      const iosReviews = freshReviews.filter(r => r.platform === 'ios' || r.source === 'app_store').length || 590;
      
      // Calculate rating distribution
      const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
      freshReviews.forEach(r => {
        const rating = Math.round(r.score || r.rating || 0);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      });
      
      const totalWithRating = freshReviews.length || 1;
      const ratingDistribution = [
        { rating: 5, count: ratingCounts[5], percentage: ((ratingCounts[5] / totalWithRating) * 100).toFixed(1) },
        { rating: 4, count: ratingCounts[4], percentage: ((ratingCounts[4] / totalWithRating) * 100).toFixed(1) },
        { rating: 3, count: ratingCounts[3], percentage: ((ratingCounts[3] / totalWithRating) * 100).toFixed(1) },
        { rating: 2, count: ratingCounts[2], percentage: ((ratingCounts[2] / totalWithRating) * 100).toFixed(1) },
        { rating: 1, count: ratingCounts[1], percentage: ((ratingCounts[1] / totalWithRating) * 100).toFixed(1) }
      ];
      
      // Calculate sentiment split
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      freshReviews.forEach(r => {
        const sentiment = (r.sentiment || '').toLowerCase();
        if (sentiment.includes('positive')) sentimentCounts.positive++;
        else if (sentiment.includes('negative')) sentimentCounts.negative++;
        else sentimentCounts.neutral++;
      });
      
      const totalWithSentiment = freshReviews.length || 1;
      const sentimentSplit = {
        positive: Math.round((sentimentCounts.positive / totalWithSentiment) * 100),
        negative: Math.round((sentimentCounts.negative / totalWithSentiment) * 100),
        neutral: Math.round((sentimentCounts.neutral / totalWithSentiment) * 100)
      };
      
      // Transform pulse data to dashboard format
      const transformedData = {
        totalReviews,
        androidReviews,
        iosReviews,
        categorized: pulseData.top_themes?.length * 50 || 150,
        pending: 0,
        nps: pulseData.nps || 72,
        avgRating: pulseData.avg_rating || 4.2,
        promoters: pulseData.promoters || 1800,
        passives: pulseData.passives || 400,
        detractors: pulseData.detractors || 190,
        ratingDistribution,
        sentimentSplit,
        themes: pulseData.top_themes?.map((theme, idx) => ({
          label: theme.label || `Theme ${idx + 1}`,
          count: theme.review_count || [234, 189, 156, 134, 98][idx] || 100,
          sentiment: theme.sentiment || ['negative', 'mixed', 'positive', 'positive', 'negative'][idx] || 'mixed'
        })) || mockData.themes,
        headline: pulseData.headline || mockData.headline,
        quotes: pulseData.quotes || [],
        actions: pulseData.actions || []
      };
      
      setData(transformedData);
      setLastSynced(new Date());
      
      console.log('Sync completed:', {
        totalReviews: freshReviews.length,
        previousCount: reviews.length,
        newCount: freshReviews.length - reviews.length
      });
      
      // Show notification if new reviews found
      if (freshReviews.length > reviews.length && reviews.length > 0) {
        const newCount = freshReviews.length - reviews.length;
        alert(`${newCount} new review${newCount > 1 ? 's' : ''} synced!`);
      } else if (freshReviews.length > 0) {
        alert(`Synced ${freshReviews.length} reviews successfully!`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Sync failed: ' + error.message);
      // Fallback to mock data if fetch fails
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, timePeriod]);

  const navItems = [
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'wordcloud', label: 'Word Cloud', icon: Cloud },
    { id: 'ideation', label: 'Ideation', icon: Lightbulb },
    { id: 'reporting', label: 'Reporting', icon: FileText }
  ];


  const getRatingColor = (rating) => {
    switch(rating) {
      case 5: return '#10b981';
      case 4: return '#34d399';
      case 3: return '#f59e0b';
      case 2: return '#f97316';
      case 1: return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: colors.card, 
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            G
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Support PM Pulsator</h1>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>AI-Powered Review Intelligence</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: colors.border,
              color: colors.text,
              cursor: 'pointer'
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setPlatform('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: platform === 'all' ? '#10b981' : colors.border,
                color: platform === 'all' ? 'white' : colors.text,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              All
            </button>
            <button 
              onClick={() => setPlatform('android')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: platform === 'android' ? '#10b981' : colors.border,
                color: platform === 'android' ? 'white' : colors.text,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={14} /> Android
            </button>
            <button 
              onClick={() => setPlatform('ios')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: platform === 'ios' ? '#10b981' : colors.border,
                color: platform === 'ios' ? 'white' : colors.text,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Apple size={14} /> iOS
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.text,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px'
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Sync {platform === 'android' ? 'Android' : platform === 'ios' ? 'iOS' : 'All'}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ 
        backgroundColor: colors.card, 
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === item.id ? '#10b981' : colors.textMuted,
                  borderBottom: `2px solid ${activeTab === item.id ? '#10b981' : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        {activeTab === 'reviews' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>Reviews</h2>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: '14px' }}>Triage and analyze Groww app store reviews</p>
              </div>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px'
                }}
              >
                <RefreshCw size={14} />
                Import CSV
              </button>
            </div>

            {/* Reviews Summary Card */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  6,792 reviews
                </span>
                <span style={{ color: '#10b981', fontSize: '13px' }}>
                  ● Android: 8h ago
                </span>
                <span style={{ color: '#10b981', fontSize: '13px' }}>
                  ● iOS: 8h ago
                </span>
              </div>
              <button
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* AI Categorization */}
            <div style={{ 
              backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#8b5cf6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PieChart size={18} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>AI Categorization</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.textMuted }}>
                    590 of 6792 categorized • <span style={{ color: '#f59e0b' }}>6202 pending</span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '120px', 
                  height: '6px', 
                  backgroundColor: colors.border,
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: '9%',
                    height: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: '3px'
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>9%</span>
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Categorize
                </button>
              </div>
            </div>

            {/* Platform & Time Filters */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600', letterSpacing: '0.5px' }}>Platform</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['All', 'Android', 'iOS'].map(p => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p.toLowerCase())}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: (p === 'All' ? platform === 'all' : platform === p.toLowerCase()) ? '#10b981' : colors.border,
                            color: (p === 'All' ? platform === 'all' : platform === p.toLowerCase()) ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600', letterSpacing: '0.5px' }}>Time Period</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Today', 'Yesterday', 'Last 7 Days', 'Last 15 Days', 'Last 30 Days'].map(period => (
                        <button
                          key={period}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: period === 'Last 30 Days' ? '#10b981' : colors.border,
                            color: period === 'Last 30 Days' ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button style={{ color: colors.textMuted, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>

            {/* Rating Distribution & Health Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Rating Distribution */}
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '13px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { rating: 5, count: 799, percentage: 79.9 },
                    { rating: 4, count: 82, percentage: 8.2 },
                    { rating: 3, count: 22, percentage: 2.2 },
                    { rating: 2, count: 10, percentage: 1.0 },
                    { rating: 1, count: 87, percentage: 8.7 }
                  ].map((item) => (
                    <div key={item.rating} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: getRatingColor(item.rating), fontSize: '13px', minWidth: '20px', fontWeight: 600 }}>{item.rating}★</span>
                      <div style={{ flex: 1, height: '10px', backgroundColor: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: getRatingColor(item.rating), borderRadius: '5px' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: colors.text, minWidth: '28px', textAlign: 'right' }}>{item.count}</span>
                      <span style={{ fontSize: '12px', color: colors.textMuted, minWidth: '36px', textAlign: 'right' }}>{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Metrics */}
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '13px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Health Metrics</h3>
                
                {/* NPS Card */}
                <div style={{ backgroundColor: darkMode ? '#064e3b' : '#f0fdf4', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase' }}>NPS</p>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#10b981' }}>+78</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#10b981' }}>Excellent</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', justifyContent: 'flex-end' }}>
                        <span style={{ color: '#10b981' }}>●</span>
                        <span style={{ color: colors.textMuted }}>Promoters (4-5):</span>
                        <span style={{ color: colors.text }}>0</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', justifyContent: 'flex-end' }}>
                        <span style={{ color: '#f59e0b' }}>●</span>
                        <span style={{ color: colors.textMuted }}>Passives (3):</span>
                        <span style={{ color: colors.text }}>0</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <span style={{ color: '#ef4444' }}>●</span>
                        <span style={{ color: colors.textMuted }}>Detractors (1-2):</span>
                        <span style={{ color: colors.text }}>0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', padding: '14px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Reviews</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>1,000</p>
                  </div>
                  <div style={{ backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', padding: '14px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Rating</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>4.5<span style={{ color: '#f59e0b', marginLeft: '4px' }}>★</span></p>
                  </div>
                </div>

                {/* Sentiment Split */}
                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sentiment Split</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '6px' }}>
                      <TrendIcon size={14} style={{ color: '#10b981', marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>0%</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#1e293b' : '#fefce8', borderRadius: '6px' }}>
                      <Minus size={14} style={{ color: '#eab308', marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>0%</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#1e293b' : '#fef2f2', borderRadius: '6px' }}>
                      <TrendingDown size={14} style={{ color: '#ef4444', marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>SENTIMENT</span>
                {['all', 'positive', 'negative', 'neutral'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSentimentFilter(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: sentimentFilter === s ? '#10b981' : colors.border,
                      color: sentimentFilter === s ? 'white' : colors.text,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Review Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { 
                  user: 'Hi good game for my son', 
                  platform: 'iOS', 
                  date: '15 May 2026', 
                  text: 'Groww is best app for trading',
                  rating: 5,
                  sentiment: 'Neutral'
                },
                { 
                  user: 'banabasi', 
                  platform: 'iOS', 
                  date: '15 May 2026', 
                  text: 'Most informative and easy to operate app',
                  rating: 5,
                  sentiment: 'Neutral'
                },
                { 
                  user: 'trader_pro', 
                  platform: 'Android', 
                  date: '14 May 2026', 
                  text: 'App is good but customer care needs improvement. Response time is very slow.',
                  rating: 3,
                  sentiment: 'Negative'
                },
                { 
                  user: 'investor_2024', 
                  platform: 'iOS', 
                  date: '13 May 2026', 
                  text: 'Excellent app for beginners. Very simple interface and easy to understand.',
                  rating: 5,
                  sentiment: 'Positive'
                },
                { 
                  user: 'stockmaster', 
                  platform: 'Android', 
                  date: '12 May 2026', 
                  text: 'Good app overall but charges are not transparent. Hidden fees are a problem.',
                  rating: 4,
                  sentiment: 'Mixed'
                }
              ].map((review, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: colors.border,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>{review.user.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{review.user}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>{review.platform}</span>
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>•</span>
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? '#f59e0b' : 'transparent'} color={i < review.rating ? '#f59e0b' : colors.border} />
                        ))}
                      </div>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        backgroundColor: review.sentiment === 'Positive' ? '#d4edda' : review.sentiment === 'Negative' ? '#f8d7da' : '#fff3cd',
                        color: review.sentiment === 'Positive' ? '#155724' : review.sentiment === 'Negative' ? '#721c24' : '#856404',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {review.sentiment}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: colors.text, lineHeight: 1.5 }}>
                    {review.text}
                  </p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <MessageSquare size={14} />
                      Reply
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Search size={14} />
                      Find Similar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {/* Analytics Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Analytics</h2>
              <p style={{ margin: 0, color: colors.textMuted }}>Grow app metrics, sentiment analysis, and trend insights</p>
            </div>

            {/* Filters */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Platform</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'android', 'ios'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: platform === p ? '#10b981' : colors.border,
                          color: platform === p ? 'white' : colors.text,
                          cursor: 'pointer',
                          fontSize: '13px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Time Period</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 15 Days', 'Last 30 Days'].map(period => (
                      <button
                        key={period}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: period === 'Last 30 Days' ? '#10b981' : colors.border,
                          color: period === 'Last 30 Days' ? 'white' : colors.text,
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button style={{ color: colors.textMuted, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
            </div>

            {/* Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageSquare size={16} color={colors.textMuted} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Total Reviews</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>1,000</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Star size={16} color="#f59e0b" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Avg Rating</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>4.5</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.textMuted }}>out of 5.0</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendIcon size={16} color="#10b981" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Positive</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#10b981' }}>0%</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingDown size={16} color="#ef4444" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Negative</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>0%</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Minus size={16} color="#eab308" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Neutral</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#eab308' }}>0%</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Sentiment Analysis */}
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Sentiment Analysis</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Positive', value: 750, fill: '#10b981' },
                      { name: 'Neutral', value: 150, fill: '#f59e0b' },
                      { name: 'Negative', value: 100, fill: '#ef4444' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.card, 
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.text
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rating Distribution */}
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Rating Distribution</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.card, 
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.text
                        }}
                        formatter={(value, name, props) => [`${value} reviews`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              marginTop: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Trend Analysis</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '12px' }}>Sentiment</button>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: colors.border, color: colors.text, fontSize: '12px' }}>Categories</button>
                </div>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                <p>Trend data will appear here</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            {/* Categories Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Categories</h2>
              <p style={{ margin: 0, color: colors.textMuted }}>AI-identified themes and category distribution across Groww reviews</p>
            </div>

            {/* Filters */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Platform</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['all', 'android', 'ios'].map(p => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: platform === p ? '#10b981' : colors.border,
                            color: platform === p ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Time Period</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Today', 'Yesterday', 'Last 7 Days', 'Last 15 Days', 'Last 30 Days'].map(period => (
                        <button
                          key={period}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: period === 'Last 30 Days' ? '#10b981' : colors.border,
                            color: period === 'Last 30 Days' ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button style={{ color: colors.textMuted, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>

            {/* Category Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Sentiment Analysis</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Positive', value: 0 },
                      { name: 'Neutral', value: 0 },
                      { name: 'Negative', value: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.textMuted }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textMuted }} />
                      <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Rating Distribution</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} axisLine={false} tickLine={false} tick={{ fill: colors.textMuted }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textMuted }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              marginTop: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Trend Analysis</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: colors.border, color: colors.text, fontSize: '12px' }}>Sentiment</button>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '12px' }}>Categories</button>
                </div>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                <p>Trend data will appear here</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'wordcloud' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Word Cloud</h2>
              <p style={{ margin: 0, color: colors.textMuted }}>Most used words, top keywords, and top upvoted reviews</p>
            </div>

            {/* Filters */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Platform</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['all', 'android', 'ios'].map(p => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: platform === p ? '#10b981' : colors.border,
                            color: platform === p ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>Time Period</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Today', 'Yesterday', 'Last 7 Days', 'Last 15 Days', 'Last 30 Days'].map(period => (
                        <button
                          key={period}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: period === 'Last 30 Days' ? '#10b981' : colors.border,
                            color: period === 'Last 30 Days' ? 'white' : colors.text,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button style={{ color: colors.textMuted, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageSquare size={16} color={colors.textMuted} />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Reviews Analyzed</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>945</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <BarChart3 size={16} color="#8b5cf6" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Total Words</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>4,367</p>
              </div>

              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <PieChart size={16} color="#f59e0b" />
                  <span style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>Unique Words</span>
                </div>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>1,234</p>
              </div>
            </div>

            {/* Word Cloud Visualization */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '40px',
              border: `1px solid ${colors.border}`,
              minHeight: '400px'
            }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Word Cloud</h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '12px',
                lineHeight: 1.4
              }}>
                {[
                  { word: 'app', size: 48, color: '#10b981' },
                  { word: 'good', size: 42, color: '#3b82f6' },
                  { word: 'easy', size: 38, color: '#f59e0b' },
                  { word: 'user', size: 32, color: '#8b5cf6' },
                  { word: 'nice', size: 28, color: '#10b981' },
                  { word: 'excellent', size: 26, color: '#06b6d4' },
                  { word: 'trade', size: 24, color: '#64748b' },
                  { word: 'experience', size: 22, color: '#8b5cf6' },
                  { word: 'charges', size: 22, color: '#64748b' },
                  { word: 'mutual', size: 20, color: '#64748b' },
                  { word: 'platform', size: 20, color: '#64748b' },
                  { word: 'interface', size: 20, color: '#64748b' },
                  { word: 'friendly', size: 20, color: '#f59e0b' },
                  { word: 'smooth', size: 18, color: '#64748b' },
                  { word: 'money', size: 18, color: '#64748b' },
                  { word: 'groww', size: 18, color: '#10b981' },
                  { word: 'simple', size: 18, color: '#64748b' },
                  { word: 'stocks', size: 18, color: '#64748b' },
                  { word: 'UI', size: 16, color: '#3b82f6' },
                  { word: 'investment', size: 16, color: '#64748b' },
                  { word: 'funds', size: 16, color: '#64748b' },
                  { word: 'grow', size: 16, color: '#64748b' },
                  { word: 'great', size: 16, color: '#f59e0b' },
                  { word: 'best', size: 16, color: '#ef4444' },
                  { word: 'invest', size: 16, color: '#64748b' },
                  { word: 'investing', size: 16, color: '#64748b' },
                  { word: 'application', size: 14, color: '#64748b' },
                  { word: 'trading', size: 14, color: '#64748b' },
                  { word: 'beginners', size: 14, color: '#64748b' },
                  { word: 'stock', size: 14, color: '#64748b' },
                  { word: 'market', size: 14, color: '#64748b' },
                ].map((item, idx) => (
                  <span 
                    key={idx}
                    style={{ 
                      fontSize: item.size,
                      color: item.color,
                      fontWeight: item.size > 24 ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      ':hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'ideation' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Ideation</h2>
              <p style={{ margin: 0, color: colors.textMuted }}>AI-generated feature ideas and improvement suggestions</p>
            </div>

            {data.actions && data.actions.length > 0 && (
              <div style={{ 
                backgroundColor: colors.card,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>💡 Recommended Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.actions.map((action, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '20px',
                        backgroundColor: darkMode ? '#1e293b' : '#f0fdf4',
                        borderRadius: '12px',
                        borderLeft: '4px solid #10b981'
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <p style={{ margin: 0, color: colors.text, fontSize: '16px', lineHeight: 1.5 }}>{action}</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: colors.textMuted }}>AI-generated from review analysis</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              marginTop: '24px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Feature Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.themes?.map((theme, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '16px',
                      backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>{theme.label}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>{theme.count} mentions</p>
                    </div>
                    <Zap size={20} color="#f59e0b" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'reporting' && (
          <>
            {/* Header with Sync */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Weekly Pulse</h2>
                <p style={{ margin: 0, color: colors.textMuted }}>
                  AI-powered App Review Pulse Dashboard
                  {lastSynced && (
                    <span style={{ marginLeft: '12px', fontSize: '12px' }}>
                      • Last synced: {lastSynced.toLocaleTimeString()}
                    </span>
                  )}
                </p>
                {newReviewsCount > 0 && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#10b981' }}>
                    {newReviewsCount} new review{newReviewsCount > 1 ? 's' : ''} available
                  </p>
                )}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'Syncing...' : 'Sync Reviews'}
              </button>
            </div>

            {/* Filters */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600', letterSpacing: '0.5px' }}>Platform</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'android', 'ios'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: platform === p ? '#10b981' : colors.border,
                          color: platform === p ? 'white' : colors.text,
                          cursor: 'pointer',
                          fontSize: '13px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600', letterSpacing: '0.5px' }}>Time Range</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Today', '7 Days', '30 Days', '8-12 Weeks'].map(range => (
                      <button
                        key={range}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: range === '8-12 Weeks' ? '#10b981' : colors.border,
                          color: range === '8-12 Weeks' ? 'white' : colors.text,
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Pulse Note */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Zap size={20} color="#10b981" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Weekly Pulse Note</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>Executive one-pager · LIP limit ≤250 words</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '12px', color: colors.textMuted }}>2026-W21</span>
                  <span style={{ padding: '4px 10px', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', fontSize: '12px', color: colors.textMuted }}>146 words</span>
                </div>
              </div>

              <div style={{ color: colors.text, fontSize: '14px', lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 16px 0' }}>
                  Groww Play Store pulse (2026-W21): sentiment skews negative. Support, fees, and reliability dominate.
                </p>

                <h4 style={{ margin: '20px 0 12px 0', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted }}>Top 3 Themes</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li><strong>High brokerage charges</strong> — sell-side fees exceed expectations; transparency gaps drive 1★ reviews.</li>
                  <li><strong>Poor customer support</strong> — slow or missing responses on Demat, investments, and payouts.</li>
                  <li><strong>Withdrawal issues</strong> — delays and failures spiked +28% WoW; trust risk for money movement.</li>
                </ol>

                <p style={{ margin: '16px 0 0 0', color: colors.textMuted }}>
                  Also tracked: technical glitches (crashes at market open) and order execution problems (stuck sells, charge confusion).
                </p>

                <h4 style={{ margin: '20px 0 12px 0', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted }}>User Quotes</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8, color: colors.textMuted }}>
                  <li>"They cut more charges than what they said — ₹30 instead of ₹7–8 on a sell."</li>
                  <li>"Support never responds when withdrawals fail for days."</li>
                  <li>"App crashes during trading sessions on market open."</li>
                </ul>

                <h4 style={{ margin: '20px 0 12px 0', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted }}>Action Ideas</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li>Review brokerage and fee transparency in-app before order placement.</li>
                  <li>Stabilize withdrawals and order execution with proactive status updates.</li>
                  <li>Improve support SLAs and escalation paths for payout and trading tickets.</li>
                </ol>
              </div>
            </div>

            {/* Email Draft Preview */}
            <div style={{ 
              backgroundColor: colors.card,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '600', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Draft Preview</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: colors.textMuted }}>
                  <span style={{ color: colors.textMuted }}>To: </span>
                  <span style={{ color: colors.text }}>purbashabehuray@gmail.com</span>
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: colors.textMuted }}>
                  <span style={{ color: colors.textMuted }}>Subject: </span>
                  <span style={{ color: colors.text, fontWeight: '500' }}>Groww Weekly Review Pulse</span>
                </p>
              </div>

              <div style={{ 
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                fontSize: '14px',
                lineHeight: 1.7,
                color: colors.text
              }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  Groww Play Store pulse (2026-W21): sentiment skews negative. Support, fees, and reliability dominate.
                </p>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>TOP 3 THEMES</p>
                <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
                  <li>High brokerage charges — sell-side fees exceed expectations; transparency gaps drive 1★ reviews.</li>
                  <li>Poor customer support — slow or missing responses on Demat, investments, and payouts.</li>
                  <li>Withdrawal issues — delays and failures spiked +28% WoW; trust risk for money movement.</li>
                </ol>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>USER QUOTES</p>
                <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: colors.textMuted }}>
                  <li>"They cut more charges than what they said — ₹30 instead of ₹7–8 on a sell."</li>
                  <li>"Support never responds when withdrawals fail for days."</li>
                </ul>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>ACTION IDEAS</p>
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Review brokerage and fee transparency in-app before order placement.</li>
                  <li>Stabilize withdrawals and order execution with proactive status updates.</li>
                  <li>Improve support SLAs and escalation paths for payout and trading tickets.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    const subject = 'Groww Weekly Review Pulse';
                    const body = `Groww Play Store pulse (2026-W21): sentiment skews negative. Support, fees, and reliability dominate.

TOP 3 THEMES
1. High brokerage charges — sell-side fees exceed expectations; transparency gaps drive 1★ reviews.
2. Poor customer support — slow or missing responses on Demat, investments, and payouts.
3. Withdrawal issues — delays and failures spiked +28% WoW; trust risk for money movement.

USER QUOTES
• "They cut more charges than what they said — ₹30 instead of ₹7–8 on a sell."
• "Support never responds when withdrawals fail for days."

ACTION IDEAS
1. Review brokerage and fee transparency in-app before order placement.
2. Stabilize withdrawals and order execution with proactive status updates.
3. Improve support SLAs and escalation paths for payout and trading tickets.`;
                    window.location.href = `mailto:purbashabehuray@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Mail size={16} />
                  Draft Email
                </button>
                <button
                  onClick={() => {
                    const content = `Groww Weekly Review Pulse (2026-W21)

Groww Play Store pulse (2026-W21): sentiment skews negative. Support, fees, and reliability dominate.

TOP 3 THEMES
1. High brokerage charges — sell-side fees exceed expectations; transparency gaps drive 1★ reviews.
2. Poor customer support — slow or missing responses on Demat, investments, and payouts.
3. Withdrawal issues — delays and failures spiked +28% WoW; trust risk for money movement.

USER QUOTES
• "They cut more charges than what they said — ₹30 instead of ₹7–8 on a sell."
• "Support never responds when withdrawals fail for days."

ACTION IDEAS
1. Review brokerage and fee transparency in-app before order placement.
2. Stabilize withdrawals and order execution with proactive status updates.
3. Improve support SLAs and escalation paths for payout and trading tickets.`;
                    navigator.clipboard.writeText(content).then(() => {
                      alert('Content copied to clipboard! Opening Google Docs...');
                      window.open('https://docs.google.com/document/create', '_blank');
                    });
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.card,
                    color: colors.text,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={16} />
                  Append to Docs
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
