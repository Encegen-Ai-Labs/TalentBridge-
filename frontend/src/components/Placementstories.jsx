import React, { useEffect, useMemo, useState } from 'react';
import './PlacementStories.css';

const STANDARD_QUOTE =
    'I am excited to begin my professional journey as a fresher. Joining this organization marks an important milestone in my career, where I aim to apply my academic knowledge, learn new skills, and grow in a real-world work environment. I look forward to contributing to the team and gaining valuable industry experience.';

// Mock/dummy data — swap "avatar" for a real photo URL whenever you have one,
// it falls back to an initial-in-a-circle automatically when left blank.
const PLACEMENT_STORIES = [
    { id: 1, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Flipkart', avatar: null },
    { id: 2, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Cogent', avatar: null },
    { id: 3, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Flipkart', avatar: null },
    { id: 4, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Flipkart', avatar: null },
    { id: 5, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogita Singh', company: 'Placed in Flipkart', avatar: null },
    { id: 6, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Flipkart', avatar: null },
    { id: 7, tag: 'Got my dream job at Amazon!', quote: STANDARD_QUOTE, name: 'Yogesh Singh', company: 'Placed in Amazon', avatar: null },
    { id: 8, tag: 'Go-to platform for students and freshers', quote: STANDARD_QUOTE, name: 'Yogeti Singh', company: 'Placed in Flipkart', avatar: null },
];

// 4 columns on desktop, 2 on tablet, 1 on mobile — always 2 rows per page.
function getColumns() {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w >= 1024) return 4;
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

export default function PlacementStories({ placementCount = '28,48,723 +', stories = PLACEMENT_STORIES }) {
    const columns = useColumns();
    const itemsPerPage = columns * 2;
    const totalPages = Math.max(1, Math.ceil(stories.length / itemsPerPage));
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (page > totalPages - 1) setPage(0);
    }, [totalPages, page]);

    const visibleStories = useMemo(() => {
        const start = page * itemsPerPage;
        return stories.slice(start, start + itemsPerPage);
    }, [page, itemsPerPage, stories]);

    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    return (
        <section
            className="placement-stories-outer"
            style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}
        >
            <div className="placement-stories-card">
                <h2 className="placement-stories-heading">
                    <span className="heading-highlight">{placementCount}</span> placements - read their stories
                </h2>

                <div className="placement-stories-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {visibleStories.map((story, index) => (
                        <div className="story-card" key={story.id}>
                            <p className="story-tag">{story.tag}</p>
                            <p className="story-quote">{story.quote}</p>
                            <div className="story-footer">
                                <div className={`story-avatar avatar-bg-${index % 4}`}>
                                    {story.avatar ? <img src={story.avatar} alt={story.name} /> : story.name.charAt(0)}
                                </div>
                                <div className="story-person">
                                    <p className="story-name">{story.name}</p>
                                    <p className="story-placed">{story.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="placement-pagination">
                        <button className="carousel-arrow" onClick={goPrev} disabled={page === 0} aria-label="Previous stories">
                            ‹
                        </button>
                        <div className="carousel-dots">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`dot ${page === i ? 'active' : ''}`}
                                    onClick={() => setPage(i)}
                                    aria-label={`Go to page ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button className="carousel-arrow" onClick={goNext} disabled={page === totalPages - 1} aria-label="Next stories">
                            ›
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}