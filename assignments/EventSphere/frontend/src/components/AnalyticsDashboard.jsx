import React, { useEffect, useState } from 'react';
import { getDemandTrends, getPricingRecommendations, getFlaggedRegistrations } from '../api/aiApi';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [demandTrends, setDemandTrends] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demand');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [demand, pricing, fraud] = await Promise.all([
        getDemandTrends(30),
        getPricingRecommendations(),
        getFlaggedRegistrations().catch(() => [])
      ]);
      setDemandTrends(demand);
      setPricingData(pricing);
      setFlagged(fraud);
    } catch (error) {
      console.error('Analytics load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  const getDemandColor = (demand) => {
    if (demand > 70) return '#e74c3c';
    if (demand > 40) return '#f39c12';
    return '#27ae60';
  };

  const getPricingAction = (rec) => {
    if (rec.pricingRecommendation === 'increase') return { text: 'Increase Price', color: '#e74c3c' };
    if (rec.pricingRecommendation === 'decrease') return { text: 'Discount', color: '#27ae60' };
    return { text: 'Maintain', color: '#3498db' };
  };

  return (
    <div className="analytics-dashboard">
      <h2>AI-Powered Analytics Dashboard</h2>
      
      <div className="analytics-tabs">
        <button 
          className={activeTab === 'demand' ? 'active' : ''} 
          onClick={() => setActiveTab('demand')}
        >
          Demand Trends
        </button>
        <button 
          className={activeTab === 'pricing' ? 'active' : ''} 
          onClick={() => setActiveTab('pricing')}
        >
          Dynamic Pricing
        </button>
        <button 
          className={activeTab === 'fraud' ? 'active' : ''} 
          onClick={() => setActiveTab('fraud')}
        >
          Fraud Detection {flagged.length > 0 && <span className="badge">{flagged.length}</span>}
        </button>
      </div>

      {activeTab === 'demand' && (
        <div className="analytics-content">
          <div className="analytics-card">
            <h3>Event Demand Analysis</h3>
            <div className="demand-list">
              {demandTrends.length === 0 ? (
                <p>No demand data available</p>
              ) : (
                demandTrends.map((item, index) => (
                  <div key={index} className="demand-item">
                    <div className="demand-info">
                      <span className="demand-title">{item.title}</span>
                      <span className="demand-date">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="demand-bar-container">
                      <div 
                        className="demand-bar" 
                        style={{ 
                          width: `${item.demand}%`,
                          backgroundColor: getDemandColor(item.demand)
                        }}
                      />
                    </div>
                    <span className="demand-percentage">{item.demand}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="analytics-content">
          <div className="analytics-card">
            <h3>Pricing Recommendations</h3>
            <div className="pricing-list">
              {pricingData.length === 0 ? (
                <p>No pricing data available</p>
              ) : (
                pricingData.slice(0, 10).map((item, index) => {
                  const action = getPricingAction(item);
                  return (
                    <div key={index} className="pricing-item">
                      <div className="pricing-info">
                        <span className="pricing-title">{item.eventId?.title || 'Event'}</span>
                        <div className="pricing-prices">
                          <span className="base-price">₹{item.basePrice}</span>
                          <span className="arrow">→</span>
                          <span className="current-price">₹{item.currentPrice}</span>
                        </div>
                      </div>
                      <div 
                        className="pricing-action"
                        style={{ backgroundColor: action.color }}
                      >
                        {action.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="analytics-content">
          <div className="analytics-card">
            <h3>Flagged Registrations</h3>
            {flagged.length === 0 ? (
              <p className="no-flagged">No suspicious activity detected ✓</p>
            ) : (
              <div className="fraud-list">
                {flagged.map((item, index) => (
                  <div key={index} className="fraud-item">
                    <div className="fraud-info">
                      <span className="fraud-booking">{item.registration?.bookingId}</span>
                      <span className="fraud-user">{item.registration?.userId?.name || 'User'}</span>
                    </div>
                    <div className="fraud-level">
                      <span className={`risk-badge ${item.analysis?.riskLevel}`}>
                        {item.analysis?.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                    <div className="fraud-factors">
                      {item.analysis?.factors?.slice(0, 2).map((factor, i) => (
                        <span key={i} className="factor-tag">{factor}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
