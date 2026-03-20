import React from 'react';
const Link = ({ href, children, prefetch: _prefetch, replace: _replace, ...props }: any) => (
  <a href={href} {...props}>{children}</a>
);
export default Link;
