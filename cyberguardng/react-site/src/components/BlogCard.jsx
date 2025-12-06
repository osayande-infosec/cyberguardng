import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ title, excerpt, slug }) {
  return (
    <article className="card blog-card">
      <h3>{title}</h3>
      <p>{excerpt}</p>
      <Link to={`/blog/${slug}`} className="btn btn-outline">
        Read More
      </Link>
    </article>
  );
}