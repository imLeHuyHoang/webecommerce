// NewsletterSection.js
import React from "react";

function NewsletterSection() {
  return (
    <section className="newsletter-section py-5 bg-light">
      <div className="container text-center">
        <h2 className="mb-4">Stay Updated</h2>
        <p className="mb-4">
          Subscribe to our newsletter to get the latest news and offers.
        </p>
        <form className="form-inline justify-content-center">
          <div className="form-group mb-2">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="btn btn-primary mb-2 ml-2">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
