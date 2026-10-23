import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * JsonLd component renders structured data (Schema.org) in a script tag.
 * This is crucial for SEO and helping search engines understand the page content.
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default JsonLd;
