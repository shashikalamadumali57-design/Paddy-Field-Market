import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FieldCard from '../../components/FieldCard/FieldCard';
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import './BrowseFields.css';

const BrowseFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 });
  const [filters, setFilters] = useState({
    district: '', province: '', minPrice: '', maxPrice: '',
    shape: '', soilType: '', sort: 'newest'
  });

  useEffect(() => {
    fetchFields();
    // eslint-disable-next-line
  }, [pagination.currentPage]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      params.append('page', pagination.currentPage);
      params.append('limit', 12);

      const res = await api.get(`/fields?${params.toString()}`);
      setFields(res.data.fields);
      setPagination({
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
        total: res.data.total
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, currentPage: 1 }));
    fetchFields();
  };

  const clearFilters = () => {
    setFilters({ district: '', province: '', minPrice: '', maxPrice: '', shape: '', soilType: '', sort: 'newest' });
    setPagination(p => ({ ...p, currentPage: 1 }));
    setTimeout(fetchFields, 100);
  };

  return (
    <div className="browse-page">
      <div className="browse-hero">
        <div className="container">
          <h1 className="animate-fade-in-up">Browse Paddy Fields</h1>
          <p className="animate-fade-in-up delay-1">Find the perfect paddy field that matches your requirements</p>
          
          <form onSubmit={handleSearch} className="browse-search animate-fade-in-up delay-2">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by district..."
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div className="container browse-content">
        <div className="browse-toolbar">
          <div className="toolbar-left">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters
            </button>
            <span className="results-count">{pagination.total} fields found</span>
          </div>
          <div className="toolbar-right">
            <select
              value={filters.sort}
              onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); setTimeout(fetchFields, 100); }}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FiGrid /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FiList /></button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel animate-fade-in-down">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Province</label>
                <select value={filters.province} onChange={(e) => setFilters({ ...filters, province: e.target.value })}>
                  <option value="">All Provinces</option>
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Eastern">Eastern</option>
                  <option value="North Western">North Western</option>
                  <option value="North Central">North Central</option>
                  <option value="Uva">Uva</option>
                  <option value="Sabaragamuwa">Sabaragamuwa</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Min Price (Rs.)</label>
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
              </div>
              <div className="filter-group">
                <label>Max Price (Rs.)</label>
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
              </div>
              <div className="filter-group">
                <label>Shape</label>
                <select value={filters.shape} onChange={(e) => setFilters({ ...filters, shape: e.target.value })}>
                  <option value="">All Shapes</option>
                  <option value="rectangular">Rectangular</option>
                  <option value="square">Square</option>
                  <option value="irregular">Irregular</option>
                  <option value="l_shaped">L-Shaped</option>
                  <option value="triangular">Triangular</option>
                  <option value="circular">Circular</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Soil Type</label>
                <select value={filters.soilType} onChange={(e) => setFilters({ ...filters, soilType: e.target.value })}>
                  <option value="">All Types</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="silt">Silt</option>
                  <option value="peat">Peat</option>
                </select>
              </div>
            </div>
            <div className="filters-actions">
              <button onClick={handleSearch} className="btn-apply">Apply Filters</button>
              <button onClick={clearFilters} className="btn-clear"><FiX /> Clear</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="browse-loading">
            <div className="loading-spinner"></div>
            <p>Loading fields...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🌾</span>
            <h3>No fields found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <div className={`fields-${viewMode}`}>
              {fields.map(field => (
                <FieldCard key={field._id} field={field} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={pagination.currentPage === i + 1 ? 'active' : ''}
                    onClick={() => setPagination(p => ({ ...p, currentPage: i + 1 }))}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseFields;
