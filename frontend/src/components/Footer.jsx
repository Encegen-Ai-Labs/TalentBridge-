import "../styles/Footer.css";
import {
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Top Section */}
        <div className="footer-top">

          <div className="footer-column">
            <h3>ABOUT US</h3>
            <a href="/">We're hiring</a>
            <a href="/">Hire interns for your company</a>
            <a href="/">Post a Job</a>
          </div>

          <div className="footer-column">
            <h3>TEAM DIARY</h3>
            <a href="/">Blog</a>
            <a href="/">Our Services</a>
          </div>

          <div className="footer-column">
            <h3>TERMS & CONDITIONS</h3>
            <a href="/">Privacy</a>
            <a href="/">Contact us</a>
            <a href="/">Annual Returns</a>
          </div>

          <div className="footer-column">
            <h3>SITEMAP</h3>
            <a href="/">List of Companies</a>
          </div>

        </div>

        <hr className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">

          <div className="footer-left">

            <div className="store-buttons">

              <button className="store-btn">
                <div className="store-small">
                  GET IT ON
                </div>
                <div className="store-big">
                  Google Play
                </div>
              </button>

              <button className="store-btn">
                <div className="store-small">
                  DOWNLOAD ON THE
                </div>
                <div className="store-big">
                  App Store
                </div>
              </button>

            </div>

            <div className="social-icons">
              <FaInstagram />
              <FaTwitter />
              <FaLinkedinIn />
            </div>

          </div>

          <div className="footer-right">
            © Copyright 2026
            <br />
            (TalentBridge by Encegen. All rights reserved.)
          </div>

        </div>

      </div>
    </footer>
  );
}