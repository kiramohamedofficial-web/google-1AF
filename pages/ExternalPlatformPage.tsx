import React from 'react';

const ExternalPlatformPage: React.FC = () => {
    const platformUrl = "https://google-122357k.vercel.app/";

    return (
        <iframe
            src={platformUrl}
            title="المنصة التعليمية"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};

export default ExternalPlatformPage;
