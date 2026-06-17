import React, { useEffect } from 'react';

const WeddingContactFormSection = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.delpriorehospitality.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="wedding-contact" className="py-20 bg-light">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="heading-2 text-dark mb-4">
            Let's Talk About Your Wedding
          </h2>
          <p className="body-large text-gray max-w-2xl mx-auto">
            Share your vision and we'll create the perfect celebration for your big day
          </p>
        </div>

        <div style={{ minHeight: '711px' }}>
          <iframe
            src="https://api.delpriorehospitality.com/widget/form/1Ap3yYchLMQYfBgcxuRp"
            style={{ width: '100%', height: '711px', border: 'none', borderRadius: '3px' }}
            id="inline-1Ap3yYchLMQYfBgcxuRp"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Contact Us Form"
            data-height="711"
            data-layout-iframe-id="inline-1Ap3yYchLMQYfBgcxuRp"
            data-form-id="1Ap3yYchLMQYfBgcxuRp"
            title="Contact Us Form"
          />
        </div>
      </div>
    </section>
  );
};

export default WeddingContactFormSection;
