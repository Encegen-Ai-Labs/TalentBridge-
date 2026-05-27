import React from 'react';
import './ContactUs.css';

export default function ContactUs() {
  return (
    <div className="contact-page">
      <div className="contact-container">

        {/* HEADER */}
        <h1 className="contact-title">Contact us</h1>

        {/* TOP CARDS */}
        <div className="contact-top-grid">

          {/* STUDENT JOBS */}
          <div className="contact-card">
            <h2>Students - Internships & Jobs</h2>

            <p>
              For internships and jobs related queries,
              visit Student Help Center
            </p>

            <button className="contact-btn">
              Visit student help center →
            </button>
          </div>

          {/* TRAININGS */}
          <div className="contact-card">
            <h2>Student - Trainings</h2>

            <p>
              For trainings related queries,
              visit Trainings Help Center
            </p>

            <button className="contact-btn">
              Visit trainings help center →
            </button>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="contact-bottom-grid">

          {/* LEFT */}
          <div className="contact-info">

            <h2>For others</h2>

            <div className="info-group">
              <h4>University/college associations</h4>
              <p>
                Email us:
                <span> university.relations@internshala.com</span>
              </p>
            </div>

            <div className="info-group">
              <h4>Media queries</h4>
              <p>
                Email us:
                <span> pr@internshala.com</span>
              </p>
            </div>

            <div className="info-group">
              <h4>Fest sponsorships</h4>
              <p>
                Email us:
                <span> pr@internshala.com</span>
              </p>
            </div>

            <div className="info-group">
              <h4>For everything else</h4>
              <p>
                Email us:
                <span> sarvesh@internshala.com</span>
              </p>
            </div>

          </div>

          {/* RIGHT */}
          <div className="contact-address">

            <h2>Address</h2>

            <p>
              Scholiverse Educare Pvt. Ltd.
              901A/B, Iris Tech Park,
              Sector 48, Gurugram,
              Haryana, India - 122018
            </p>

            <div className="working-hours">
              <strong>Working Hours:</strong>
              <p>Monday to Friday, 10:00 AM – 6:00 PM</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}