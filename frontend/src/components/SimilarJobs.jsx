import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs } from '../services/api';
import './SimilarJobs.css';

// Same description-parsing pattern used in StudentOpportunities.jsx, kept local
// so this component has no dependency on the parent page.
function parseSimilarJobInfo(job) {
    let salaryMin = job.salary_min || '';
    let salaryMax = job.salary_max || '';
    let duration = job.duration || '';

    try {
        if (job.description && typeof job.description === 'string' && job.description.startsWith('{')) {
            const parsed = JSON.parse(job.description);
            salaryMin = parsed.salary_min || salaryMin;
            salaryMax = parsed.salary_max || salaryMax;
            duration = parsed.duration || duration;
        }
    } catch (err) {
        console.error('JSON parsing error', err);
    }

    return { salaryMin, salaryMax, duration };
}

// 3 cards per page on desktop, 2 on tablet, 1 on mobile.
function getColumns() {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
}

function useColumns() {
    const [columns, setColumns] = useState(getColumns());
    useEffect(() => {
        const handler = () => setColumns(getColumns());
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return columns;
}

/**
 * Props:
 * - jobs: optional array. If the parent page already has a fetched job list,
 *   pass it in and this component skips its own API call.
 * - excludeId: optional id to exclude (e.g. the job currently being viewed).
 * - limit: total jobs to paginate through across all pages (default 9 = 3 pages of 3).
 */
export default function SimilarJobs({ jobs, excludeId, limit = 9, title = 'Similar jobs you can apply to' }) {
    const navigate = useNavigate();
    const [fetchedJobs, setFetchedJobs] = useState([]);
    const [loading, setLoading] = useState(!jobs);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (jobs) return; // parent already supplied data, no fetch needed
        let active = true;

        const load = async () => {
            try {
                const data = await getAllJobs();
                if (active) setFetchedJobs(data || []);
            } catch (err) {
                console.error('Failed to load similar jobs', err);
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [jobs]);

    const sourceJobs = jobs && jobs.length ? jobs : fetchedJobs;

    const allJobs = useMemo(
        () => sourceJobs.filter((j) => String(j.job_id || j.id || j._id) !== String(excludeId)).slice(0, limit),
        [sourceJobs, excludeId, limit]
    );

    const columns = useColumns();
    const itemsPerPage = columns;
    const totalPages = Math.max(1, Math.ceil(allJobs.length / itemsPerPage));

    useEffect(() => {
        if (page > totalPages - 1) setPage(0);
    }, [totalPages, page]);

    const visibleJobs = useMemo(() => {
        const start = page * itemsPerPage;
        return allJobs.slice(start, start + itemsPerPage);
    }, [allJobs, page, itemsPerPage]);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    const handleViewDetails = (job) => {
        const id = job.job_id || job.id || job._id;
        navigate(`/jobs/${id}`);
    };

    if (!jobs && loading) {
        return (
            <section className="similar-jobs-outer">
                <div className="similar-jobs-diagonal-bg" />
                <div className="similar-jobs-content">
                    <h2 className="similar-jobs-title">{title}</h2>
                    <div className="similar-jobs-loading">Loading opportunities...</div>
                </div>
            </section>
        );
    }

    if (error || allJobs.length === 0) return null;

    return (
        <section
            className="similar-jobs-outer"
            style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}
        >
            <div className="similar-jobs-diagonal-bg" />

            <div className="similar-jobs-content">
                <h2 className="similar-jobs-title">{title}</h2>

                <div className="similar-jobs-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {visibleJobs.map((job, index) => {
                        const info = parseSimilarJobInfo(job);
                        const id = job.job_id || job.id || job._id || index;
                        const firstLetter = job.company_name?.charAt(0) || 'C';
                        const jobType = job.type === 'internship' ? 'Internship' : 'Job';

                        return (
                            <div className="similar-job-card" key={id}>
                                <div className="similar-job-top">
                                    <span className="similar-job-badge">Actively Hiring</span>
                                    <div className={`similar-job-logo logo-bg-${index % 3}`}>
                                        {job.company_logo ? <img src={job.company_logo} alt={job.company_name} /> : firstLetter}
                                    </div>
                                </div>

                                <h3 className="similar-job-role">{job.title || 'Job Opening'}</h3>
                                <p className="similar-job-company">{job.company_name || 'Company'}</p>

                                <div className="similar-job-meta">
                                    <span className="similar-job-meta-item">
                                        <span className="icon">📍</span> {job.location || 'Remote'}
                                    </span>
                                    <span className="similar-job-meta-item">
                                        <span className="icon">₹</span>
                                        {info.salaryMin ? `${info.salaryMin} - ${info.salaryMax} / month` : 'Not disclosed'}
                                    </span>
                                    {info.duration && (
                                        <span className="similar-job-meta-item">
                                            <span className="icon">🗓️</span> {info.duration}
                                        </span>
                                    )}
                                </div>

                                <div className="similar-job-footer">
                                    <span className="similar-job-type-tag">{jobType}</span>
                                    <button className="similar-job-view-btn" onClick={() => handleViewDetails(job)}>
                                        View details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="similar-pagination">
                        <button className="similar-arrow" onClick={goPrev} disabled={page === 0} aria-label="Previous jobs">
                            ‹
                        </button>
                        <div className="similar-dots">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`similar-dot ${page === i ? 'active' : ''}`}
                                    onClick={() => setPage(i)}
                                    aria-label={`Go to page ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button className="similar-arrow" onClick={goNext} disabled={page === totalPages - 1} aria-label="Next jobs">
                            ›
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}