import { useState } from "react";

// Shows a pulsing skeleton while the image loads, then fades the real image in.
const ArtImage = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && <div className={`skeleton absolute inset-0 ${className}`} />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${className} ${loaded ? "img-fade-in" : "opacity-0"}`}
      />
    </div>
  );
};

export default ArtImage;
