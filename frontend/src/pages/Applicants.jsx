import React, { useEffect, useState } from 'react';
import {
  getCompanyApplicants,
  updateApplicationStatus
} from '../services/api';

import './Applicants.css';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const data = await getCompanyApplicants();

      setApplicants(data);
      setFilteredApplicants(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = applicants.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredApplicants(filtered);
  }, [search, applicants]);

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    try {
      await updateApplicationStatus(
        applicationId,
        status
      );

      setApplicants((prev) =>
        prev.map((item) =>
          item.application_id === applicationId
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.log(error);
      alert('Failed to update status');
    }
  };

  const totalApplications = applicants.length;

  const shortlistedCount = applicants.filter(
    (item) => item.status === 'shortlisted'
  ).length;

  const selectedCount = applicants.filter(
    (item) => item.status === 'selected'
  ).length;

  const rejectedCount = applicants.filter(
    (item) => item.status === 'rejected'
  ).length;

  if (loading) {
    return (
      <div className="applicants-loading">
        Loading applicants...
      </div>
    );
  }

  return (
    <div className="applicants-container">

      {/* HEADER */}

      <div className="applicants-header">
        <div>
          <p className="breadcrumb">
            Recruitment Suite / Application Status
          </p>

          <h1>Application Overview</h1>
        </div>
      </div>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon green">
            👥
          </div>

          <p>Total Applications</p>

          <h2>{totalApplications}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            📄
          </div>

          <p>Under Review</p>

          <h2>
            {
              applicants.filter(
                (item) =>
                  item.status === 'pending'
              ).length
            }
          </h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            ✅
          </div>

          <p>Selected</p>

          <h2>{selectedCount}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            ❌
          </div>

          <p>Rejected</p>

          <h2>{rejectedCount}</h2>
        </div>

      </div>

      {/* SEARCH */}

      <div className="search-section">

        <input
          type="text"
          placeholder="Find by candidate name..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* TABLE */}

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position Applied</th>
              <th>Branch</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredApplicants.map((item) => (

              <tr key={item.application_id}>

                <td>
                  <div className="candidate-cell">
                    <div className="candidate-avatar">
                      {item.name?.charAt(0)}
                    </div>

                    <div>
                      <h4>{item.name}</h4>
                      <p>{item.email}</p>
                    </div>
                  </div>
                </td>

                <td>
                  <div>
                    <h4>{item.job_title}</h4>
                    <p>{item.year}</p>
                  </div>
                </td>

                <td>{item.branch}</td>

                <td>
                  {new Date(
                    item.applied_at
                  ).toLocaleDateString()}
                </td>

                <td>

                  <span
                    className={`status-badge ${item.status}`}
                  >
                    {item.status}
                  </span>

                </td>

                <td>

                  <select
                    className="status-select"
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.application_id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="shortlisted">
                      Shortlisted
                    </option>

                    <option value="selected">
                      Selected
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>

                  </select>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Applicants;