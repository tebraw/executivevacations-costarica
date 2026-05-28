import React, { useState } from 'react';

const WeddingContactFormSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    guestCount: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear existing error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.weddingDate) {
      newErrors.weddingDate = 'Wedding date is required';
    }

    if (!formData.guestCount) {
      newErrors.guestCount = 'Expected guest count is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please share some details about your wedding';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObject = {
        'form-name': 'wedding-contact',
        'name': formData.name,
        'email': formData.email,
        'phone': formData.phone,
        'weddingDate': formData.weddingDate,
        'guestCount': formData.guestCount,
        'message': formData.message,
      };

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formDataObject).toString()
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your inquiry. Please try again or contact us directly at propertieswithmeritt@yahoo.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      weddingDate: '',
      guestCount: '',
      message: ''
    });
  };

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

        {isSubmitted ? (
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="heading-3 text-dark mb-4">Thank You!</h3>
            <p className="body-regular text-gray mb-6">
              We've received your inquiry and will contact you within 24 hours to discuss your wedding plans and answer any questions.
            </p>
            <button onClick={resetForm} className="btn btn-primary">
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-lg">
            <form 
              name="wedding-contact" 
              method="POST" 
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Netlify Forms required fields */}
              <input type="hidden" name="form-name" value="wedding-contact" />
              <input type="hidden" name="bot-field" />
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block body-regular font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block body-regular font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block body-regular font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Wedding Date & Guest Count Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="weddingDate" className="block body-regular font-semibold mb-2">
                    Wedding Date *
                  </label>
                  <input
                    type="date"
                    id="weddingDate"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.weddingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.weddingDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.weddingDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="guestCount" className="block body-regular font-semibold mb-2">
                    Expected Guest Count *
                  </label>
                  <select
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.guestCount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select guest count</option>
                    <option value="25">Up to 25 guests</option>
                    <option value="50">25 - 50 guests</option>
                    <option value="75">50 - 75 guests</option>
                    <option value="100">75 - 100 guests</option>
                    <option value="125">100 - 125 guests</option>
                    <option value="150">125 - 150 guests</option>
                  </select>
                  {errors.guestCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block body-regular font-semibold mb-2">
                  Tell Us About Your Wedding *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Share your vision, special requests, questions you have, or anything else about your wedding..."
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-luxury w-full py-4 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Submit Wedding Inquiry'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeddingContactFormSection;