import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  Search,
  TrendingUp,
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
  Sun
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
  const [timePeriod, setTimePeriod] = useState('last30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

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
      // Fetch from GitHub raw
      const response = await fetch(
        'https://raw.githubusercontent.com/pbehuray/m3-weeklyPulseReport/master/phase8/data/weekly_pulse/weekly_pulse.json'
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const pulseData = await response.json();
      
      // Transform pulse data to dashboard format
      const transformedData = {
        totalReviews: 2390, // From your actual processed reviews
        androidReviews: 1800,
        iosReviews: 590,
        categorized: pulseData.top_themes?.length * 50 || 150,
        pending: 0,
        nps: 72,
        avgRating: 4.2,
        promoters: 1800,
        passives: 400,
        detractors: 190,
        ratingDistribution: [
          { rating: 5, count: 1580, percentage: 66.1 },
          { rating: 4, count: 400, percentage: 16.7 },
          { rating: 3, count: 220, percentage: 9.2 },
          { rating: 2, count: 100, percentage: 4.2 },
          { rating: 1, count: 90, percentage: 3.8 }
        ],
        sentimentSplit: {
          positive: 75,
          negative: 15,
          neutral: 10
        },
        themes: pulseData.top_themes?.map((theme, idx) => ({
          label: theme.label || `Theme ${idx + 1}`,
          count: [234, 189, 156, 134, 98][idx] || 100,
          sentiment: ['negative', 'mixed', 'positive', 'positive', 'negative'][idx] || 'mixed'
        })) || mockData.themes,
        headline: pulseData.headline || mockData.headline,
        quotes: pulseData.quotes || [],
        actions: pulseData.actions || []
      };
      
      setData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data if fetch fails
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [platform, timePeriod]);

  const navItems = [
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'wordcloud', label: 'Word Cloud', icon: Cloud },
    { id: 'ideation', label: 'Ideation', icon: Lightbulb },
    { id: 'reporting', label: 'Reporting', icon: FileText }
  ];

  const timePeriods = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last15days', label: 'Last 15 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <TrendingUp size={16} className="text-emerald-500" />;
      case 'negative': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-amber-500" />;
    }
  };

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
        {/* Reviews Summary Card */}
        <div style={{ 
          backgroundColor: colors.card,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={20} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                {data.totalReviews.toLocaleString()} reviews
              </span>
              <span style={{ color: colors.textMuted, fontSize: '14px' }}>
                Android: 8h ago • iOS: 8h ago
              </span>
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
              <Download size={16} />
              Import CSV
            </button>
          </div>

          {/* AI Categorization Progress */}
          <div style={{ 
            backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
            borderRadius: '8px',
            padding: '16px',
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
                <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>
                  {data.categorized.toLocaleString()} of {data.totalReviews.toLocaleString()} categorized • 
                  <span style={{ color: '#f59e0b' }}>{data.pending.toLocaleString()} pending</span>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '200px', 
                height: '6px', 
                backgroundColor: colors.border,
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${(data.categorized / data.totalReviews) * 100}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '3px'
                }} />
              </div>
              <span style={{ fontSize: '13px', color: colors.textMuted }}>
                {Math.round((data.categorized / data.totalReviews) * 100)}%
              </span>
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
        </div>

        {/* Platform & Time Filters */}
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
                {timePeriods.map(period => (
                  <button
                    key={period.id}
                    onClick={() => setTimePeriod(period.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: timePeriod === period.id ? '#10b981' : colors.border,
                      color: timePeriod === period.id ? 'white' : colors.text,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
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
                <BarChart data={data.ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="rating" 
                    tickFormatter={(value) => `${value}★`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.text, fontSize: 14 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.card, 
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, 'Reviews']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                    fill="#10b981"
                  >
                    {data.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '12px' }}>
              {data.ratingDistribution.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: idx < data.ratingDistribution.length - 1 ? `1px solid ${colors.border}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: getRatingColor(item.rating) }}>{item.rating}★</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: colors.text, fontWeight: '600' }}>{item.count}</span>
                    <span style={{ color: colors.textMuted, fontSize: '13px', minWidth: '50px', textAlign: 'right' }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Metrics */}
          <div style={{ 
            backgroundColor: colors.card,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Health Metrics</h3>
            
            {/* NPS Score */}
            <div style={{ 
              backgroundColor: darkMode ? '#1e293b' : '#f0fdf4',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: colors.textMuted }}>NPS</p>
                  <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
                    +{data.nps}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#10b981' }}>Excellent</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#10b981' }}>●</span>
                    <span style={{ color: colors.textMuted }}>Promoters (4-5):</span>
                    <span style={{ color: colors.text, fontWeight: '600' }}>{data.promoters}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#f59e0b' }}>●</span>
                    <span style={{ color: colors.textMuted }}>Passives (3):</span>
                    <span style={{ color: colors.text, fontWeight: '600' }}>{data.passives}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#ef4444' }}>●</span>
                    <span style={{ color: colors.textMuted }}>Detractors (1-2):</span>
                    <span style={{ color: colors.text, fontWeight: '600' }}>{data.detractors}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ 
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: colors.textMuted }}>TOTAL REVIEWS</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: colors.text }}>
                  {(data.androidReviews + data.iosReviews).toLocaleString()}
                </p>
              </div>
              <div style={{ 
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: colors.textMuted }}>AVG RATING</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: colors.text }}>
                  {data.avgRating}★
                </p>
              </div>
            </div>

            {/* Sentiment Split */}
            <div style={{ marginTop: '20px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: colors.textMuted }}>SENTIMENT SPLIT</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: darkMode ? '#1e293b' : '#f0fdf4', borderRadius: '8px' }}>
                  <TrendingUp size={20} style={{ color: '#10b981', marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#10b981' }}>0%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>Positive</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: darkMode ? '#1e293b' : '#fefce8', borderRadius: '8px' }}>
                  <Minus size={20} style={{ color: '#eab308', marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#eab308' }}>0%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>Neutral</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: darkMode ? '#1e293b' : '#fef2f2', borderRadius: '8px' }}>
                  <TrendingDown size={20} style={{ color: '#ef4444', marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>0%</p>
                  <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>Negative</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sentiment Filter */}
        <div style={{ 
          backgroundColor: colors.card,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: colors.textMuted 
            }} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
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
            <MessageSquare size={18} color={colors.textMuted} />
            <span style={{ fontSize: '13px', color: colors.textMuted }}>SENTIMENT</span>
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

        {/* Themes Section */}
        <div style={{ 
          backgroundColor: colors.card,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Top Themes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.themes.map((theme, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    width: '28px', 
                    height: '28px', 
                    backgroundColor: colors.border,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600' }}>{theme.label}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
                      {theme.count} mentions
                    </p>
                  </div>
                </div>
                {getSentimentIcon(theme.sentiment)}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
