import React from 'react';
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };
const Image = ({ src, alt, width: _w, height: _h, style, ...props }: ImageProps) => (
  <img src={src} alt={alt} style={style} {...props} />
);
export default Image;
